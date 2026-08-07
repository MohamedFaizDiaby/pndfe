import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContratDto } from './dto/create-contrat.dto';
import { SignerContratDto } from './dto/signer-contrat.dto';
import { RefuserContratDto } from './dto/refuser-contrat.dto';
import { StatutAgrement, StatutContrat, Role } from '../common/enums';
import { generateContratPdf } from '../common/pdf';
import { AuditService } from '../common/audit.service';

const CONTRAT_INCLUDE = {
  agence: { select: { id: true, raisonSociale: true, telephone: true, adresse: true, registreCommerce: true } },
  travailleur: { select: { id: true, nom: true, prenoms: true, metier: true, photoUrl: true, telephone: true, numeroPieceIdentite: true } },
  declaration: true,
} as const;

function genererNumero(prefixe: string): string {
  const annee = new Date().getFullYear();
  const court = uuidv4().split('-')[0].toUpperCase();
  return `${prefixe}-${annee}-${court}`;
}

@Injectable()
export class ContratsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createForAgence(agenceUserId: string, dto: CreateContratDto) {
    const agence = await this.prisma.agence.findUnique({
      where: { userId: agenceUserId },
      include: { demandeAgrement: true },
    });
    if (!agence) throw new NotFoundException('Profil agence introuvable');

    if (agence.demandeAgrement?.statut !== StatutAgrement.APPROUVE) {
      throw new ForbiddenException(
        "Votre agence doit d'abord etre agreee par le Ministere avant de creer des contrats",
      );
    }

    const travailleur = await this.prisma.travailleur.findUnique({
      where: { qrCodeToken: dto.travailleurQrToken },
    });
    if (!travailleur) {
      throw new NotFoundException("Travailleur introuvable pour ce code. Verifiez le QR Code scanne.");
    }

    const contrat = await this.prisma.contrat.create({
      data: {
        agenceId: agence.id,
        travailleurId: travailleur.id,
        typeContrat: dto.typeContrat,
        poste: dto.poste,
        lieuTravail: dto.lieuTravail,
        salaireBrut: dto.salaireBrut,
        dateDebut: new Date(dto.dateDebut),
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        statut: StatutContrat.ENVOYE,
      },
      include: CONTRAT_INCLUDE,
    });

    await this.audit.log({
      userId: agenceUserId,
      role: Role.AGENCE,
      action: 'CONTRAT_CREE',
      entite: 'Contrat',
      entiteId: contrat.id,
      details: { travailleurId: travailleur.id },
    });

    return contrat;
  }

  async listForAgence(agenceUserId: string) {
    const agence = await this.prisma.agence.findUnique({ where: { userId: agenceUserId } });
    if (!agence) throw new NotFoundException('Profil agence introuvable');

    return this.prisma.contrat.findMany({
      where: { agenceId: agence.id },
      include: CONTRAT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForTravailleur(travailleurUserId: string) {
    const travailleur = await this.prisma.travailleur.findUnique({ where: { userId: travailleurUserId } });
    if (!travailleur) throw new NotFoundException('Profil travailleur introuvable');

    return this.prisma.contrat.findMany({
      where: { travailleurId: travailleur.id },
      include: CONTRAT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verifie la propriete du contrat via une requete minimale (userId uniquement,
   * jamais le passwordHash), puis renvoie le contrat complet via CONTRAT_INCLUDE.
   */
  private async getOwnedContrat(id: string, userId: string, role: string) {
    const ownership = await this.prisma.contrat.findUnique({
      where: { id },
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

    return this.prisma.contrat.findUniqueOrThrow({ where: { id }, include: CONTRAT_INCLUDE });
  }

  async getById(id: string, userId: string, role: string) {
    return this.getOwnedContrat(id, userId, role);
  }

  async sign(id: string, travailleurUserId: string, dto: SignerContratDto) {
    const contrat = await this.getOwnedContrat(id, travailleurUserId, 'TRAVAILLEUR');
    if (contrat.statut !== StatutContrat.ENVOYE) {
      throw new BadRequestException('Ce contrat a deja ete traite');
    }

    const numeroCnps = genererNumero('CNPS');
    const numeroCmu = genererNumero('CMU');
    const signatureAt = new Date();

    const pdfUrl = await generateContratPdf({
      contratId: contrat.id,
      typeContrat: contrat.typeContrat,
      poste: contrat.poste,
      lieuTravail: contrat.lieuTravail,
      salaireBrut: contrat.salaireBrut,
      dateDebut: contrat.dateDebut,
      dateFin: contrat.dateFin,
      agence: contrat.agence,
      travailleur: contrat.travailleur,
      signatureNom: dto.signatureNom,
      signatureAt,
      numeroCnps,
      numeroCmu,
    });

    const resultat = await this.prisma.contrat.update({
      where: { id },
      data: {
        statut: StatutContrat.SIGNE,
        signatureTravailleurNom: dto.signatureNom,
        signatureTravailleurAt: signatureAt,
        pdfUrl,
        declaration: {
          create: { numeroCnps, numeroCmu },
        },
      },
      include: CONTRAT_INCLUDE,
    });

    await this.audit.log({
      userId: travailleurUserId,
      role: Role.TRAVAILLEUR,
      action: 'CONTRAT_SIGNE',
      entite: 'Contrat',
      entiteId: id,
      details: { numeroCnps, numeroCmu },
    });

    return resultat;
  }

  async refuse(id: string, travailleurUserId: string, dto: RefuserContratDto) {
    const contrat = await this.getOwnedContrat(id, travailleurUserId, 'TRAVAILLEUR');
    if (contrat.statut !== StatutContrat.ENVOYE) {
      throw new BadRequestException('Ce contrat a deja ete traite');
    }

    const resultat = await this.prisma.contrat.update({
      where: { id },
      data: { statut: StatutContrat.REFUSE, motifRefus: dto.motif },
      include: CONTRAT_INCLUDE,
    });

    await this.audit.log({
      userId: travailleurUserId,
      role: Role.TRAVAILLEUR,
      action: 'CONTRAT_REFUSE',
      entite: 'Contrat',
      entiteId: id,
      details: { motif: dto.motif },
    });

    return resultat;
  }
}
