import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common'; 
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/', 
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, 
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Tienda') 
    .setDescription('Sistema de Ventas y Gestión de Inventario')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3006;
  await app.listen(port);

  logger.log(`🚀 Servidor corriendo en: \x1b[32mhttp://localhost:${port}/api/v1\x1b[0m`);
  logger.log(`📑 Swagger disponible en: \x1b[32mhttp://localhost:${port}/docs\x1b[0m`);
}
bootstrap();