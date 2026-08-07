import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { Role } from '../common/enums';
import { OffresService } from './offres.service';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { AccepterCandidatureDto } from './dto/accepter-candidature.dto';

@Controller()
export class OffresController {
  constructor(private offresService: OffresService) {}

  // --- Public / travailleur : consultation des offres ---

  @Get('offres')
  listPublic(@Query('typeContrat') typeContrat?: string) {
    return this.offresService.listPublic(typeContrat);
  }

  @Get('offres/:id')
  getById(@Param('id') id: string) {
    return this.offresService.getById(id);
  }

  @Post('offres/:id/candidatures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAVAILLEUR)
  postuler(@Param('id') offreId: string, @Body() dto: CreateCandidatureDto, @CurrentUser() user: CurrentUserPayload) {
    return this.offresService.postuler(user.userId, offreId, dto);
  }

  @Get('travailleurs/candidatures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAVAILLEUR)
  listMesCandidatures(@CurrentUser() user: CurrentUserPayload) {
    return this.offresService.listMesCandidatures(user.userId);
  }

  // --- Agence : gestion des offres et des candidatures ---

  @Post('agences/offres')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  create(@Body() dto: CreateOffreDto, @CurrentUser() user: CurrentUserPayload) {
    return this.offresService.createForAgence(user.userId, dto);
  }

  @Get('agences/offres')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  listForAgence(@CurrentUser() user: CurrentUserPayload) {
    return this.offresService.listForAgence(user.userId);
  }

  @Patch('agences/offres/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  updateStatut(@Param('id') id: string, @Body() dto: UpdateOffreDto, @CurrentUser() user: CurrentUserPayload) {
    return this.offresService.updateStatut(user.userId, id, dto);
  }

  @Get('agences/offres/:id/candidatures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  listCandidaturesForOffre(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.offresService.listCandidaturesForOffre(user.userId, id);
  }

  @Patch('agences/offres/:offreId/candidatures/:candidatureId/accepter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  accepter(
    @Param('offreId') offreId: string,
    @Param('candidatureId') candidatureId: string,
    @Body() dto: AccepterCandidatureDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.offresService.accepter(user.userId, offreId, candidatureId, dto);
  }

  @Patch('agences/offres/:offreId/candidatures/:candidatureId/rejeter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  rejeter(
    @Param('offreId') offreId: string,
    @Param('candidatureId') candidatureId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.offresService.rejeter(user.userId, offreId, candidatureId);
  }
}
