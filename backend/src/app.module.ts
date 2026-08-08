import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { uploadsRoot } from './common/file-storage';
import { AuthModule } from './auth/auth.module';
import { TravailleursModule } from './travailleurs/travailleurs.module';
import { AgencesModule } from './agences/agences.module';
import { AdminModule } from './admin/admin.module';
import { ContratsModule } from './contrats/contrats.module';
import { PaiementsModule } from './paiements/paiements.module';
import { OffresModule } from './offres/offres.module';
import { HealthModule } from './health/health.module';

const staticModules = [
  ServeStaticModule.forRoot({
    rootPath: uploadsRoot(),
    serveRoot: '/uploads',
  }),
];

// Sert le frontend bundle (dist/) depuis le meme service que l'API, s'il a
// ete copie dans le conteneur au build (voir Dockerfile a la racine du
// depot). Absent en developpement local, ou le frontend tourne separement
// sur son propre serveur esbuild (port 5190) - ServeStaticModule n'est donc
// ajoute que si le dossier existe reellement, pour ne rien casser en local.
const frontendDist = resolve(process.env.FRONTEND_DIST_DIR || 'public');
if (existsSync(frontendDist)) {
  // Pas d'"exclude" : express.static() appelle next() pour toute requete ne
  // correspondant a aucun fichier statique, laissant naturellement les
  // controleurs Nest (routes API) prendre le relais. Aucun fichier du build
  // frontend ne partage de nom avec un prefixe d'API (auth, contrats...).
  staticModules.push(ServeStaticModule.forRoot({ rootPath: frontendDist }));
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Limite globale par defaut ; les endpoints d'authentification appliquent
    // une limite plus stricte via @Throttle (voir auth.controller.ts).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ...staticModules,
    PrismaModule,
    CommonModule,
    AuthModule,
    TravailleursModule,
    AgencesModule,
    AdminModule,
    ContratsModule,
    PaiementsModule,
    OffresModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
