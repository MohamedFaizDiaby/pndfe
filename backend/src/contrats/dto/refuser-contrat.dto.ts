import { IsOptional, IsString } from 'class-validator';

export class RefuserContratDto {
  @IsOptional()
  @IsString()
  motif?: string;
}
