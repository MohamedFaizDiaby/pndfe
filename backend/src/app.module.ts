import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TravailleursModule } from './travailleurs/travailleurs.module';
import { AgencesModule } from './agences/agences.module';
import { AdminModule } from './admin/admin.module';
import { ContratsModule } from './contrats/contrats.module';
import { PaiementsModule } from './paiements/paiements.module';
import { OffresModule } from './offres/offres.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Limite globale par defaut ; les endpoints d'authentification appliquent
    // une limite plus stricte via @Throttle (voir auth.controller.ts).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
