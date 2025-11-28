import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path'; 

async function bootstrap() {
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
    .addBearerAuth() // El botón del candadito para el Token
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();