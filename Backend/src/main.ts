import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/user-images',
  });

  app.enableCors({
    origin: ['http://localhost:9000', 'http://localhost:9001','https://coffee-shop-management-system-ten.vercel.app'], // ระบุ origin ของ Frontend
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // อนุญาตเฉพาะ method ที่ต้องการ
    allowedHeaders: ['Content-Type', 'Authorization'], // อนุญาต headers ที่ต้องการ
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('D-Coffee Backoffice ☕💼')
    .setDescription('The ultimate backend for coffee shop ❗❗❗')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
