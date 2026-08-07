import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterAgenceDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  raisonSociale: string;

  @IsString()
  registreCommerce: string;

  @IsString()
  telephone: string;

  @IsString()
  adresse: string;

  // Chaine separee par des virgules, ex: "BTP,GARDIENNAGE"
  @IsString()
  secteurs: string;
}
