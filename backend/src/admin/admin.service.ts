import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatutAgrement, Role } from '../common/enums';
import { TraiterAgrementDto } from './dto/traiter-agrement.dto';
import { AuditService } from '../common/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async listAgences(statut?: StatutAgrement) {
    const agences = await this.prisma.agence.findMany({
      where: statut ? { demandeAgrement: { statut } } : undefined,
      include: { documents: true, demandeAgrement: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return agences.map((a) => ({ ...a, secteurs: a.secteurs.split(',').filter(Boolean) }));
  }

  async traiterAgrement(agenceId: string, dto: TraiterAgrementDto, adminUserId: string) {
    const demande = await this.prisma.demandeAgrement.findUnique({ where: { agenceId } });
    if (!demande) throw new NotFoundException("Demande d'agrement introuvable");

    const resultat = await this.prisma.demandeAgrement.update({
      where: { agenceId },
      data: {
        statut: dto.statut,
        commentaireAdmin: dto.commentaire,
        traiteParUserId: adminUserId,
        dateTraitement: new Date(),
      },
    });

    await this.audit.log({
      userId: adminUserId,
      role: Role.ADMIN,
      action: 'AGREMENT_TRAITE',
      entite: 'DemandeAgrement',
      entiteId: resultat.id,
      details: { agenceId, statut: dto.statut },
    });

    return resultat;
  }

  async statsTravailleurs() {
    const total = await this.prisma.travailleur.count();
    const parMetier = await this.prisma.travailleur.groupBy({
      by: ['metier'],
      _count: { _all: true },
    });
    const totalContratsSignes = await this.prisma.contrat.count({ where: { statut: 'SIGNE' } });
    const totalDeclarations = await this.prisma.declarationCnps.count();

    const paiements = await this.prisma.paiement.findMany({
      where: { statut: 'REUSSI' },
      select: { cotisationCnps: true, cotisationCmu: true },
    });
    const totalCotisationsCollectees = paiements.reduce((sum, p) => sum + p.cotisationCnps + p.cotisationCmu, 0);

    return {
      totalTravailleurs: total,
      parMetier: parMetier.map((m) => ({ metier: m.metier, count: m._count._all })),
      totalContratsSignes,
      totalDeclarations,
      totalPaiements: paiements.length,
      totalCotisationsCollectees,
    };
  }

  async listDeclarations() {
    const declarations = await this.prisma.declarationCnps.findMany({
      include: {
        contrat: {
          include: {
            agence: { select: { raisonSociale: true } },
            travailleur: { select: { nom: true, prenoms: true, metier: true } },
          },
        },
      },
      orderBy: { dateDeclaration: 'desc' },
    });
    return declarations;
  }

  async listJournal(action?: string, limit = 100) {
    const entries = await this.prisma.journalAudit.findMany({
      where: action ? { action } : undefined,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
    });

    const userIds = [...new Set(entries.map((e) => e.userId).filter((id): id is string => !!id))];
    const users = userIds.length
      ? await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })
      : [];
    const emailParId = new Map(users.map((u) => [u.id, u.email]));

    return entries.map((e) => ({
      ...e,
      details: e.details ? JSON.parse(e.details) : null,
      userEmail: e.userId ? emailParId.get(e.userId) ?? null : null,
    }));
  }
}
