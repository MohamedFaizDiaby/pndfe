import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { TravailleursService } from './travailleurs.service';
import { Role } from '../common/enums';

@Controller('travailleurs')
export class TravailleursController {
  constructor(private travailleursService: TravailleursService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAVAILLEUR)
  getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.travailleursService.getByUserId(user.userId);
  }

  @Get('portefeuille')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAVAILLEUR)
  getPortefeuille(@CurrentUser() user: CurrentUserPayload) {
    return this.travailleursService.getPortefeuille(user.userId);
  }

  // Endpoint public : appele lors du scan d'un QR Code par une agence ou un employeur.
  @Get('verifier/:token')
  verify(@Param('token') token: string) {
    return this.travailleursService.verifyByToken(token);
  }
}
