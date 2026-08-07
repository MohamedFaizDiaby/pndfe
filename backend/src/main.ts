import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Origines autorisees pour le frontend. En production, definir
  // FRONTEND_URL (ex: https://pndfe.gouv.ci) plutot que de refleter
  // n'importe quelle origine (ancien comportement, trop permissif).
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = frontendUrl
    ? [frontendUrl]
    : ['http://localhost:5190', 'http://127.0.0.1:5190'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4300;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`PNDFE API demarree sur http://localhost:${port}`);
}
bootstrap();
