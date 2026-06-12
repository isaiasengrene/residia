import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function arrancar(): Promise<void> {
  const logger = new Logger('ResidIA');
  const app = await NestFactory.create(AppModule);

  // CORS: permitir el frontend en desarrollo
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const puerto = process.env['PORT'] ?? '3001';
  await app.listen(puerto);

  logger.log(`ResidIA API iniciada en el puerto ${puerto}`);
}

arrancar();
