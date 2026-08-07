import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateContratDto {
  @IsString()
  travailleurQrToken: string;

  @IsString()
  typeContrat: string;

  @IsString()
  poste: string;

  @IsString()
  lieuTravail: string;

  @IsNumber()
  @IsPositive()
  salaireBrut: number;

  @IsDateString()
  dateDebut: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;
}
