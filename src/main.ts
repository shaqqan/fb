import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { join } from 'path';
import { setupSwaggerAdmin } from './common/swagger';

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
  setupSwaggerAdmin(app);

  //compress response
  app.use(compression());

  // Serve static files
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
