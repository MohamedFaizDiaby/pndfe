import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { AdminService } from './admin.service';
import { Role, StatutAgrement } from '../common/enums';
import { TraiterAgrementDto } from './dto/traiter-agrement.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('agences')
  listAgences(@Query('statut') statut?: StatutAgrement) {
    return this.adminService.listAgences(statut);
  }

  @Patch('agences/:id/agrement')
  traiterAgrement(
    @Param('id') agenceId: string,
    @Body() dto: TraiterAgrementDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.adminService.traiterAgrement(agenceId, dto, user.userId);
  }

  @Get('stats/travailleurs')
  statsTravailleurs() {
    return this.adminService.statsTravailleurs();
  }

  @Get('declarations')
  listDeclarations() {
    return this.adminService.listDeclarations();
  }
}
