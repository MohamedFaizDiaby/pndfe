import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { StatutContrat, StatutPaiement, TAUX_COTISATION_CNPS, MONTANT_COTISATION_CMU } from '../common/enums';
import { generateBulletinPdf } from '../common/pdf';

const PAIEMENT_INCLUDE = {
  contrat: {
    select: {
      id: true,
      poste: true,
      typeContrat: true,
      agence: { select: { raisonSociale: true, registreCommerce: true } },
      travailleur: { select: { nom: true, prenoms: true, numeroPieceIdentite: true } },
    },
  },
} as const;

@Injectable()
export class PaiementsService {
  constructor(private prisma: PrismaService) {}

  private async getOwnedContrat(contratId: string, userId: string, role: string) {
    const ownership = await this.prisma.contrat.findUnique({
      where: { id: contratId },
      select: {
        agence: { select: { userId: true } },
        travailleur: { select: { userId: true } },
      },
    });
    if (!ownership) throw new NotFoundException('Contrat introuvable');

    const estAgencePropriétaire = role === 'AGENCE' && ownership.agence.userId === userId;
    const estTravailleurConcerne = role === 'TRAVAILLEUR' && ownership.travailleur.userId === userId;
    const estAdmin = role === 'ADMIN';

    if (!estAgencePropriétaire && !estTravailleurConcerne && !estAdmin) {
      throw new ForbiddenException("Vous n'avez pas acces a ce contrat");
    }

    return this.prisma.contrat.findUniqueOrThrow({
      where: { id: contratId },
      include: {
        agence: { select: { id: true, raisonSociale: true, registreCommerce: true } },
        travailleur: { select: { id: true, nom: true, prenoms: true, numeroPieceIdentite: true, telephone: true } },
        declaration: { select: { numeroCnps: true, numeroCmu: true } },
      },
    });
  }

  async createForAgence(agenceUserId: string, contratId: string, dto: CreatePaiementDto) {
    const contrat = await this.getOwnedContrat(contratId, agenceUserId, 'AGENCE');

    if (contrat.statut !== StatutContrat.SIGNE) {
      throw new BadRequestException('Seul un contrat signe peut donner lieu a un paiement');
    }
    if (!contrat.declaration) {
      throw new BadRequestException('Declaration CNPS/CMU manquante pour ce contrat');
    }

    const cotisationCnps = Math.round(contrat.salaireBrut * TAUX_COTISATION_CNPS);
    const cotisationCmu = MONTANT_COTISATION_CMU;
    const salaireNet = contrat.salaireBrut - cotisationCnps - cotisationCmu;
    const telephoneBeneficiaire = dto.telephoneBeneficiaire || contrat.travailleur.telephone;
    const referenceTransaction = `${dto.methodePaiement}-${uuidv4().split('-')[0].toUpperCase()}`;
    const datePaiement = new Date();

    let paiement;
    try {
      paiement = await this.prisma.paiement.create({
        data: {
          contratId: contrat.id,
          periode: dto.periode,
          salaireBrut: contrat.salaireBrut,
          cotisationCnps,
          cotisationCmu,
          salaireNet,
          methodePaiement: dto.methodePaiement,
          telephoneBeneficiaire,
          // Simulation : le versement Mobile Money reussit toujours dans cette demo.
          // En production, ce statut serait mis a jour de facon asynchrone via le
          // webhook de callback du prestataire Mobile Money (Orange/MTN).
          statut: StatutPaiement.REUSSI,
          referenceTransaction,
          datePaiement,
        },
        include: PAIEMENT_INCLUDE,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Un paiement existe deja pour cette periode sur ce contrat');
      }
      throw err;
    }

    const bulletinPdfUrl = await generateBulletinPdf({
      paiementId: paiement.id,
      periode: paiement.periode,
      poste: contrat.poste,
      agence: contrat.agence,
      travailleur: contrat.travailleur,
      salaireBrut: paiement.salaireBrut,
      cotisationCnps: paiement.cotisationCnps,
      cotisationCmu: paiement.cotisationCmu,
      salaireNet: paiement.salaireNet,
      methodePaiement: paiement.methodePaiement,
      telephoneBeneficiaire: paiement.telephoneBeneficiaire,
      referenceTransaction: paiement.referenceTransaction,
      datePaiement: paiement.datePaiement,
      numeroCnps: contrat.declaration.numeroCnps,
      numeroCmu: contrat.declaration.numeroCmu,
    });

    return this.prisma.paiement.update({
      where: { id: paiement.id },
      data: { bulletinPdfUrl },
      include: PAIEMENT_INCLUDE,
    });
  }

  async listForContrat(contratId: string, userId: string, role: string) {
    await this.getOwnedContrat(contratId, userId, role);
    return this.prisma.paiement.findMany({
      where: { contratId },
      include: PAIEMENT_INCLUDE,
      orderBy: { periode: 'desc' },
    });
  }

  async listForTravailleur(travailleurUserId: string) {
    const travailleur = await this.prisma.travailleur.findUnique({ where: { userId: travailleurUserId } });
    if (!travailleur) throw new NotFoundException('Profil travailleur introuvable');

    return this.prisma.paiement.findMany({
      where: { contrat: { travailleurId: travailleur.id } },
      include: PAIEMENT_INCLUDE,
      orderBy: { periode: 'desc' },
    });
  }
}
