import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgencesService {
  constructor(private prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const agence = await this.prisma.agence.findUnique({
      where: { userId },
      include: { documents: true, demandeAgrement: true },
    });
    if (!agence) throw new NotFoundException('Profil agence introuvable');
    return { ...agence, secteurs: agence.secteurs.split(',').filter(Boolean) };
  }
}
