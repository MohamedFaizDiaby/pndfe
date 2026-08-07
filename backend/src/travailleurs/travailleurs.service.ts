import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

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
    const baseUrl = this.config.get<string>('PUBLIC_APP_URL') || 'http://localhost:5173';
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

    return {
      nom: travailleur.nom,
      prenoms: travailleur.prenoms,
      metier: travailleur.metier,
      photoUrl: travailleur.photoUrl,
      statutVerification: travailleur.statutVerification,
      membreDepuis: travailleur.createdAt,
      // L'historique des missions sera alimente a l'Etape 2 (contrats).
      historiqueMissions: [],
    };
  }
}
