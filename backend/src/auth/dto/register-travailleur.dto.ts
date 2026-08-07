import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterTravailleurDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nom: string;

  @IsString()
  prenoms: string;

  @IsDateString()
  dateNaissance: string;

  @IsString()
  telephone: string;

  @IsString()
  metier: string;

  @IsString()
  numeroPieceIdentite: string;
}
