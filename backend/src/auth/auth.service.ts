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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
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

    return {
      accessToken: this.signToken(user),
      role: user.role,
      travailleur: user.travailleur,
    };
  }

  async registerAgence(
    dto: RegisterAgenceDto,
    documentFiles: Express.Multer.File[],
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

    return {
      accessToken: this.signToken(user),
      role: user.role,
      agence: user.agence,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return {
      accessToken: this.signToken(user),
      role: user.role,
    };
  }
}
