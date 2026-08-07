import { IsDateString } from 'class-validator';

export class AccepterCandidatureDto {
  @IsDateString()
  dateDebut: string;
}
