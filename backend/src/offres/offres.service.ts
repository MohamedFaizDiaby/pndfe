import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { AccepterCandidatureDto } from './dto/accepter-candidature.dto';
import { StatutAgrement, StatutCandidature, StatutContrat, StatutOffre, Role } from '../common/enums';
import { AuditService } from '../common/audit.service';

const OFFRE_PUBLIC_INCLUDE = {
  agence: { select: { raisonSociale: true } },
  _count: { select: { candidatures: true } },
} as const;

const CANDIDATURE_INCLUDE = {
  offre: { select: { id: true, titre: true, typeContrat: true, lieuTravail: true, salaireBrut: true } },
  travailleur: {
    select: { id: true, nom: true, prenoms: true, metier: true, photoUrl: true, statutVerification: true },
  },
} as const;

@Injectable()
export class OffresService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createForAgence(agenceUserId: string, dto: CreateOffreDto) {
    const agence = await this.prisma.agence.findUnique({
      where: { userId: agenceUserId },
      include: { demandeAgrement: true },
    });
    if (!agence) throw new NotFoundException('Profil agence introuvable');
    if (agence.demandeAgrement?.statut !== StatutAgrement.APPROUVE) {
      throw new ForbiddenException(
        "Votre agence doit d'abord etre agreee par le Ministere avant de publier une offre",
      );
    }

    const offre = await this.prisma.offreEmploi.create({
      data: {
        agenceId: agence.id,
        titre: dto.titre,
        typeContrat: dto.typeContrat,
        description: dto.description,
        lieuTravail: dto.lieuTravail,
        salaireBrut: dto.salaireBrut,
        nombrePostes: dto.nombrePostes ?? 1,
        statut: StatutOffre.OUVERTE,
      },
    });

    await this.audit.log({
      userId: agenceUserId,
      role: Role.AGENCE,
      action: 'OFFRE_CREEE',
      entite: 'OffreEmploi',
      entiteId: offre.id,
    });

    return offre;
  }

  async listForAgence(agenceUserId: string) {
    const agence = await this.prisma.agence.findUnique({ where: { userId: agenceUserId } });
    if (!agence) throw new NotFoundException('Profil agence introuvable');

    return this.prisma.offreEmploi.findMany({
      where: { agenceId: agence.id },
      include: { _count: { select: { candidatures: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPublic(typeContrat?: string) {
    return this.prisma.offreEmploi.findMany({
      where: { statut: StatutOffre.OUVERTE, typeContrat: typeContrat || undefined },
      include: OFFRE_PUBLIC_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(offreId: string) {
    const offre = await this.prisma.offreEmploi.findUnique({
      where: { id: offreId },
      include: {
        agence: { select: { raisonSociale: true, adresse: true, telephone: true } },
        _count: { select: { candidatures: true } },
      },
    });
    if (!offre) throw new NotFoundException('Offre introuvable');
    return offre;
  }

  private async getOwnedOffre(offreId: string, agenceUserId: string) {
    const offre = await this.prisma.offreEmploi.findUnique({
      where: { id: offreId },
      include: { agence: { select: { id: true, userId: true } } },
    });
    if (!offre) throw new NotFoundException('Offre introuvable');
    if (offre.agence.userId !== agenceUserId) {
      throw new ForbiddenException("Vous n'avez pas acces a cette offre");
    }
    return offre;
  }

  async updateStatut(agenceUserId: string, offreId: string, dto: UpdateOffreDto) {
    await this.getOwnedOffre(offreId, agenceUserId);
    return this.prisma.offreEmploi.update({ where: { id: offreId }, data: { statut: dto.statut } });
  }

  async postuler(travailleurUserId: string, offreId: string, dto: CreateCandidatureDto) {
    const travailleur = await this.prisma.travailleur.findUnique({ where: { userId: travailleurUserId } });
    if (!travailleur) throw new NotFoundException('Profil travailleur introuvable');

    const offre = await this.prisma.offreEmploi.findUnique({ where: { id: offreId } });
    if (!offre) throw new NotFoundException('Offre introuvable');
    if (offre.statut !== StatutOffre.OUVERTE) {
      throw new BadRequestException("Cette offre n'est plus ouverte aux candidatures");
    }

    let candidature;
    try {
      candidature = await this.prisma.candidature.create({
        data: {
          offreId,
          travailleurId: travailleur.id,
          message: dto.message,
          statut: StatutCandidature.EN_ATTENTE,
        },
        include: CANDIDATURE_INCLUDE,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Vous avez deja postule a cette offre');
      }
      throw err;
    }

    await this.audit.log({
      userId: travailleurUserId,
      role: Role.TRAVAILLEUR,
      action: 'CANDIDATURE_CREEE',
      entite: 'Candidature',
      entiteId: candidature.id,
      details: { offreId },
    });

    return candidature;
  }

  async listMesCandidatures(travailleurUserId: string) {
    const travailleur = await this.prisma.travailleur.findUnique({ where: { userId: travailleurUserId } });
    if (!travailleur) throw new NotFoundException('Profil travailleur introuvable');

    return this.prisma.candidature.findMany({
      where: { travailleurId: travailleur.id },
      include: {
        offre: {
          select: {
            id: true,
            titre: true,
            typeContrat: true,
            lieuTravail: true,
            salaireBrut: true,
            agence: { select: { raisonSociale: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listCandidaturesForOffre(agenceUserId: string, offreId: string) {
    await this.getOwnedOffre(offreId, agenceUserId);
    return this.prisma.candidature.findMany({
      where: { offreId },
      include: CANDIDATURE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  async accepter(agenceUserId: string, offreId: string, candidatureId: string, dto: AccepterCandidatureDto) {
    const offre = await this.getOwnedOffre(offreId, agenceUserId);
    const candidature = await this.prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!candidature || candidature.offreId !== offreId) {
      throw new NotFoundException('Candidature introuvable');
    }
    if (candidature.statut !== StatutCandidature.EN_ATTENTE) {
      throw new BadRequestException('Cette candidature a deja ete traitee');
    }

    const [updatedCandidature, contrat] = await this.prisma.$transaction([
      this.prisma.candidature.update({
        where: { id: candidatureId },
        data: { statut: StatutCandidature.ACCEPTEE },
        include: CANDIDATURE_INCLUDE,
      }),
      this.prisma.contrat.create({
        data: {
          agenceId: offre.agenceId,
          travailleurId: candidature.travailleurId,
          typeContrat: offre.typeContrat,
          poste: offre.titre,
          lieuTravail: offre.lieuTravail,
          salaireBrut: offre.salaireBrut,
          dateDebut: new Date(dto.dateDebut),
          statut: StatutContrat.ENVOYE,
        },
      }),
    ]);

    await this.audit.log({
      userId: agenceUserId,
      role: Role.AGENCE,
      action: 'CANDIDATURE_ACCEPTEE',
      entite: 'Candidature',
      entiteId: candidatureId,
      details: { offreId, contratId: contrat.id },
    });

    return { candidature: updatedCandidature, contrat };
  }

  async rejeter(agenceUserId: string, offreId: string, candidatureId: string) {
    await this.getOwnedOffre(offreId, agenceUserId);
    const candidature = await this.prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!candidature || candidature.offreId !== offreId) {
      throw new NotFoundException('Candidature introuvable');
    }
    if (candidature.statut !== StatutCandidature.EN_ATTENTE) {
      throw new BadRequestException('Cette candidature a deja ete traitee');
    }

    const resultat = await this.prisma.candidature.update({
      where: { id: candidatureId },
      data: { statut: StatutCandidature.REJETEE },
      include: CANDIDATURE_INCLUDE,
    });

    await this.audit.log({
      userId: agenceUserId,
      role: Role.AGENCE,
      action: 'CANDIDATURE_REJETEE',
      entite: 'Candidature',
      entiteId: candidatureId,
      details: { offreId },
    });

    return resultat;
  }
}
