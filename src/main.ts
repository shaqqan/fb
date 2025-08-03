import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Football Board API')
    .setDescription('A comprehensive API for managing football news, staff, partners, and leagues')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('news', 'News management')
    .addTag('staff', 'Staff management')
    .addTag('partner', 'Partner management')
    .addTag('leagues', 'League management')
    .addTag('club-sub-league', 'Club-SubLeague relationship management')
    .addTag('upload', 'File upload')
    .addServer('http://localhost:3002', 'Local server')
    .addServer('https://api.yoursite.com', 'Production server')
    .setContact('API Support', 'https://yoursite.com', 'support@yoursite.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Football Board API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/uploads/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0', async () => {
    console.log(`🚀 Server is running on ${await app.getUrl()}`);
    console.log(`📚 Swagger documentation is available at ${await app.getUrl()}/api/docs`);
  });
}
bootstrap();
