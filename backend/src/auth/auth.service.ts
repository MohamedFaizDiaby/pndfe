import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTravailleurDto } from './dto/register-travailleur.dto';
import { RegisterAgenceDto } from './dto/register-agence.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums';
import { publicUrlFor } from '../common/file-storage';
import { AuditService } from '../common/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  private async ensureEmailAvailable(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Cet email est deja utilise');
    }
  }

  private signToken(user: { id: string; email: string; role: string }) {
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
  }

  async registerTravailleur(
    dto: RegisterTravailleurDto,
    files: { photo?: Express.Multer.File[]; pieceIdentite?: Express.Multer.File[] },
    ip?: string,
  ) {
    await this.ensureEmailAvailable(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const photoFile = files?.photo?.[0];
    const pieceFile = files?.pieceIdentite?.[0];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.TRAVAILLEUR,
        travailleur: {
          create: {
            nom: dto.nom,
            prenoms: dto.prenoms,
            dateNaissance: new Date(dto.dateNaissance),
            telephone: dto.telephone,
            metier: dto.metier,
            numeroPieceIdentite: dto.numeroPieceIdentite,
            photoUrl: photoFile ? publicUrlFor('travailleurs', photoFile.filename) : null,
            pieceIdentiteUrl: pieceFile ? publicUrlFor('travailleurs', pieceFile.filename) : null,
          },
        },
      },
      include: { travailleur: true },
    });

    await this.audit.log({
      userId: user.id,
      role: user.role,
      action: 'INSCRIPTION_TRAVAILLEUR',
      entite: 'Travailleur',
      entiteId: user.travailleur?.id,
      adresseIp: ip,
    });

    return {
      accessToken: this.signToken(user),
      role: user.role,
      travailleur: user.travailleur,
    };
  }

  async registerAgence(
    dto: RegisterAgenceDto,
    documentFiles: Express.Multer.File[],
    ip?: string,
  ) {
    await this.ensureEmailAvailable(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.AGENCE,
        agence: {
          create: {
            raisonSociale: dto.raisonSociale,
            registreCommerce: dto.registreCommerce,
            telephone: dto.telephone,
            adresse: dto.adresse,
            secteurs: dto.secteurs,
            documents: {
              create: (documentFiles || []).map((f) => ({
                type: 'PIECE_JUSTIFICATIVE',
                nomFichier: f.originalname,
                url: publicUrlFor('agences', f.filename),
              })),
            },
            demandeAgrement: {
              create: {},
            },
          },
        },
      },
      include: { agence: { include: { documents: true, demandeAgrement: true } } },
    });

    await this.audit.log({
      userId: user.id,
      role: user.role,
      action: 'INSCRIPTION_AGENCE',
      entite: 'Agence',
      entiteId: user.agence?.id,
      adresseIp: ip,
    });

    return {
      accessToken: this.signToken(user),
      role: user.role,
      agence: user.agence,
    };
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      await this.audit.log({
        action: 'CONNEXION_ECHOUEE',
        details: { email: dto.email },
        adresseIp: ip,
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.audit.log({
        userId: user.id,
        role: user.role,
        action: 'CONNEXION_ECHOUEE',
        adresseIp: ip,
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    await this.audit.log({
      userId: user.id,
      role: user.role,
      action: 'CONNEXION_REUSSIE',
      adresseIp: ip,
    });

    return {
      accessToken: this.signToken(user),
      role: user.role,
    };
  }
}
