import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateOffreDto {
  @IsString()
  titre: string;

  @IsString()
  typeContrat: string;

  @IsString()
  description: string;

  @IsString()
  lieuTravail: string;

  @IsNumber()
  @IsPositive()
  salaireBrut: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nombrePostes?: number;
}
