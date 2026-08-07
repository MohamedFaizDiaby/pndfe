import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterTravailleurDto } from './dto/register-travailleur.dto';
import { RegisterAgenceDto } from './dto/register-agence.dto';
import { LoginDto } from './dto/login.dto';
import { makeDiskStorage, imageFileFilter } from '../common/file-storage';

const UPLOAD_LIMITS = { fileSize: 5 * 1024 * 1024 }; // 5 Mo par fichier

// Limite stricte specifique a l'authentification (protection anti brute-force),
// plus restrictive que la limite globale par defaut definie dans app.module.ts.
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/travailleur')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo', maxCount: 1 },
        { name: 'pieceIdentite', maxCount: 1 },
      ],
      { storage: makeDiskStorage('travailleurs'), fileFilter: imageFileFilter, limits: UPLOAD_LIMITS },
    ),
  )
  registerTravailleur(
    @Body() dto: RegisterTravailleurDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[]; pieceIdentite?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    return this.authService.registerTravailleur(dto, files, req.ip);
  }

  @Post('register/agence')
  @UseInterceptors(
    FilesInterceptor('documents', 5, {
      storage: makeDiskStorage('agences'),
      fileFilter: imageFileFilter,
      limits: UPLOAD_LIMITS,
    }),
  )
  registerAgence(
    @Body() dto: RegisterAgenceDto,
    @UploadedFiles() documents: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return this.authService.registerAgence(dto, documents, req.ip);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip);
  }
}
