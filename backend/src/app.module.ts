import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TravailleursModule } from './travailleurs/travailleurs.module';
import { AgencesModule } from './agences/agences.module';
import { AdminModule } from './admin/admin.module';
import { ContratsModule } from './contrats/contrats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    TravailleursModule,
    AgencesModule,
    AdminModule,
    ContratsModule,
  ],
})
export class AppModule {}
