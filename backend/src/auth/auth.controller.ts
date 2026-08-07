import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterTravailleurDto } from './dto/register-travailleur.dto';
import { RegisterAgenceDto } from './dto/register-agence.dto';
import { LoginDto } from './dto/login.dto';
import { makeDiskStorage } from '../common/file-storage';

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
      { storage: makeDiskStorage('travailleurs') },
    ),
  )
  registerTravailleur(
    @Body() dto: RegisterTravailleurDto,
    @UploadedFiles()
    files: { photo?: Express.Multer.File[]; pieceIdentite?: Express.Multer.File[] },
  ) {
    return this.authService.registerTravailleur(dto, files);
  }

  @Post('register/agence')
  @UseInterceptors(
    FilesInterceptor('documents', 5, { storage: makeDiskStorage('agences') }),
  )
  registerAgence(
    @Body() dto: RegisterAgenceDto,
    @UploadedFiles() documents: Express.Multer.File[],
  ) {
    return this.authService.registerAgence(dto, documents);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
