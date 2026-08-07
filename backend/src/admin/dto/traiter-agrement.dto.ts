import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatutAgrement } from '../../common/enums';

export class TraiterAgrementDto {
  @IsEnum(StatutAgrement)
  statut: StatutAgrement;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
