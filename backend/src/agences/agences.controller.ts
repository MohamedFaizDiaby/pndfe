import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { AgencesService } from './agences.service';
import { Role } from '../common/enums';

@Controller('agences')
export class AgencesController {
  constructor(private agencesService: AgencesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENCE)
  getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.agencesService.getByUserId(user.userId);
  }
}
