import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { MethodePaiement } from '../../common/enums';

export class CreatePaiementDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'periode doit etre au format AAAA-MM' })
  periode: string;

  @IsEnum(MethodePaiement)
  methodePaiement: MethodePaiement;

  @IsOptional()
  @IsString()
  telephoneBeneficiaire?: string;
}
