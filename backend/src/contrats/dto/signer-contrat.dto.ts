import { Equals, IsString, MinLength } from 'class-validator';

export class SignerContratDto {
  @IsString()
  @MinLength(3)
  signatureNom: string;

  @Equals(true, { message: 'Vous devez accepter les conditions du contrat pour signer' })
  accepteConditions: boolean;
}
