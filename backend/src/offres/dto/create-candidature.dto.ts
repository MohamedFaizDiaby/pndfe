import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCandidatureDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
