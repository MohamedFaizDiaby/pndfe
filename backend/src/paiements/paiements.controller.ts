import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { Role } from '../common/enums';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaiementsController {
  constructor(private paiementsService: PaiementsService) {}

  @Post('contrats/:id/paiements')
  @Roles(Role.AGENCE)
  create(@Param('id') contratId: string, @Body() dto: CreatePaiementDto, @CurrentUser() user: CurrentUserPayload) {
    return this.paiementsService.createForAgence(user.userId, contratId, dto);
  }

  @Get('contrats/:id/paiements')
  @Roles(Role.AGENCE, Role.TRAVAILLEUR, Role.ADMIN)
  listForContrat(@Param('id') contratId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.paiementsService.listForContrat(contratId, user.userId, user.role);
  }

  @Get('travailleurs/paiements')
  @Roles(Role.TRAVAILLEUR)
  listForTravailleur(@CurrentUser() user: CurrentUserPayload) {
    return this.paiementsService.listForTravailleur(user.userId);
  }
}
