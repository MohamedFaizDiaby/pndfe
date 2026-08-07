import { IsEnum } from 'class-validator';
import { StatutOffre } from '../../common/enums';

export class UpdateOffreDto {
  @IsEnum(StatutOffre)
  statut: StatutOffre;
}
