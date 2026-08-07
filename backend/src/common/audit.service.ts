import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  userId?: string | null;
  role?: string | null;
  action: string;
  entite?: string;
  entiteId?: string;
  details?: Record<string, unknown>;
  adresseIp?: string;
}

/**
 * Journal d'audit centralise : enregistre les actions sensibles de la
 * plateforme (authentification, contrats, paiements, agrements...) pour
 * repondre a l'exigence de tracabilite du cahier des charges (Etape 4).
 *
 * L'ecriture du journal ne doit jamais faire echouer l'action metier qui
 * l'a declenchee : toute erreur est capturee et journalisee localement.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.journalAudit.create({
        data: {
          userId: entry.userId ?? null,
          role: entry.role ?? null,
          action: entry.action,
          entite: entry.entite,
          entiteId: entry.entiteId,
          details: entry.details ? JSON.stringify(entry.details) : undefined,
          adresseIp: entry.adresseIp,
        },
      });
    } catch (err) {
      this.logger.error(`Echec d'ecriture du journal d'audit (${entry.action})`, err as Error);
    }
  }
}
