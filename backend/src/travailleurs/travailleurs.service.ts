import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StatutContrat, StatutPaiement } from '../common/enums';

@Injectable()
export class TravailleursService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getByUserId(userId: string) {
    const travailleur = await this.prisma.travailleur.findUnique({ where: { userId } });
    if (!travailleur) throw new NotFoundException('Profil travailleur introuvable');

    const qrCodeDataUrl = await this.generateQrDataUrl(travailleur.qrCodeToken);
    return { ...travailleur, qrCodeDataUrl };
  }

  private async generateQrDataUrl(token: string): Promise<string> {
    const baseUrl = this.config.get<string>('PUBLIC_APP_URL') || 'http://localhost:5190';
    const verifyUrl = `${baseUrl}/#/verifier/${token}`;
    return QRCode.toDataURL(verifyUrl, { errorCorrectionLevel: 'M', margin: 1, width: 320 });
  }

  /**
   * Endpoint public consulte lors du scan du QR Code : renvoie uniquement les
   * informations necessaires a une agence/employeur pour verifier l'identite,
   * sans exposer de donnees sensibles (pas de piece d'identite, pas de contact prive).
   */
  async verifyByToken(token: string) {
    const travailleur = await this.prisma.travailleur.findUnique({
      where: { qrCodeToken: token },
    });
    if (!travailleur) throw new NotFoundException('QR Code invalide ou inconnu');

    const missions = await this.prisma.contrat.findMany({
      where: { travailleurId: travailleur.id, statut: StatutContrat.SIGNE },
      select: {
        poste: true,
        typeContrat: true,
        dateDebut: true,
        dateFin: true,
        agence: { select: { raisonSociale: true } },
      },
      orderBy: { dateDebut: 'desc' },
      take: 10,
    });

    return {
      nom: travailleur.nom,
      prenoms: travailleur.prenoms,
      metier: travailleur.metier,
      photoUrl: travailleur.photoUrl,
      statutVerification: travailleur.statutVerification,
      membreDepuis: travailleur.createdAt,
      historiqueMissions: missions,
    };
  }

  /**
   * Portefeuille social : droits CNPS cumules, historique des missions (contrats)
   * et des paiements du travailleur.
   */
  async getPortefeuille(userId: string) {
    const travailleur = await this.prisma.travailleur.findUnique({ where: { userId } });
    if (!travailleur) throw new NotFoundException('Profil travailleur introuvable');

    const contrats = await this.prisma.contrat.findMany({
      where: { travailleurId: travailleur.id },
      select: {
        id: true,
        poste: true,
        typeContrat: true,
        statut: true,
        dateDebut: true,
        dateFin: true,
        agence: { select: { raisonSociale: true } },
        declaration: { select: { numeroCnps: true, numeroCmu: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const paiementsReussis = await this.prisma.paiement.findMany({
      where: { contrat: { travailleurId: travailleur.id }, statut: StatutPaiement.REUSSI },
      select: { cotisationCnps: true, cotisationCmu: true, salaireNet: true },
    });

    const droitsCnpsCumules = paiementsReussis.reduce((sum, p) => sum + p.cotisationCnps, 0);
    const droitsCmuCumules = paiementsReussis.reduce((sum, p) => sum + p.cotisationCmu, 0);
    const totalNetPercu = paiementsReussis.reduce((sum, p) => sum + p.salaireNet, 0);

    return {
      droitsCnpsCumules,
      droitsCmuCumules,
      totalNetPercu,
      nombrePaiements: paiementsReussis.length,
      missions: contrats,
    };
  }
}
