import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatutAgrement } from '../common/enums';
import { TraiterAgrementDto } from './dto/traiter-agrement.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.demandeAgrement.update({
      where: { agenceId },
      data: {
        statut: dto.statut,
        commentaireAdmin: dto.commentaire,
        traiteParUserId: adminUserId,
        dateTraitement: new Date(),
      },
    });
  }

  async statsTravailleurs() {
    const total = await this.prisma.travailleur.count();
    const parMetier = await this.prisma.travailleur.groupBy({
      by: ['metier'],
      _count: { _all: true },
    });
    return {
      totalTravailleurs: total,
      parMetier: parMetier.map((m) => ({ metier: m.metier, count: m._count._all })),
    };
  }
}
