import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { Role } from '../common/enums';
import { ContratsService } from './contrats.service';
import { CreateContratDto } from './dto/create-contrat.dto';
import { SignerContratDto } from './dto/signer-contrat.dto';
import { RefuserContratDto } from './dto/refuser-contrat.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContratsController {
  constructor(private contratsService: ContratsService) {}

  @Post('agences/contrats')
  @Roles(Role.AGENCE)
  create(@Body() dto: CreateContratDto, @CurrentUser() user: CurrentUserPayload) {
    return this.contratsService.createForAgence(user.userId, dto);
  }

  @Get('agences/contrats')
  @Roles(Role.AGENCE)
  listForAgence(@CurrentUser() user: CurrentUserPayload) {
    return this.contratsService.listForAgence(user.userId);
  }

  @Get('travailleurs/contrats')
  @Roles(Role.TRAVAILLEUR)
  listForTravailleur(@CurrentUser() user: CurrentUserPayload) {
    return this.contratsService.listForTravailleur(user.userId);
  }

  @Get('contrats/:id')
  @Roles(Role.AGENCE, Role.TRAVAILLEUR, Role.ADMIN)
  getById(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.contratsService.getById(id, user.userId, user.role);
  }

  @Patch('contrats/:id/signer')
  @Roles(Role.TRAVAILLEUR)
  sign(@Param('id') id: string, @Body() dto: SignerContratDto, @CurrentUser() user: CurrentUserPayload) {
    return this.contratsService.sign(id, user.userId, dto);
  }

  @Patch('contrats/:id/refuser')
  @Roles(Role.TRAVAILLEUR)
  refuse(@Param('id') id: string, @Body() dto: RefuserContratDto, @CurrentUser() user: CurrentUserPayload) {
    return this.contratsService.refuse(id, user.userId, dto);
  }
}
