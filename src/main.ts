import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { runMigrations } from './database/run-migrations';

function shouldAutoMigrate(): boolean {
  if (process.env.AUTO_MIGRATE === 'false') return false;
  if (process.env.AUTO_MIGRATE === 'true') return true;
  return process.env.NODE_ENV === 'production';
}

async function bootstrap() {
  if (shouldAutoMigrate()) {
    await runMigrations();
  }

  const app = await NestFactory.create(AppModule);

  const corsOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean) as string[];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Retro API')
    .setDescription('Agile Sprint Retrospective API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  console.log(`🚀 Backend running on http://${host}:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
