import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpStatus, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { join } from 'path';
import { setupSwaggerAdmin, setupSwaggerClient } from './common/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const formattedErrors = errors.reduce((acc, { property, constraints }) => {
        acc[property] = Object.values(constraints || {});
        return acc;
      }, {});
      return new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: formattedErrors,
      });
    }
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
  setupSwaggerClient(app);

  //compress response
  app.use(compression());

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0', async () => {
    console.log(`🚀 Server is running on ${await app.getUrl()}`);
    console.log(`📚 Admin Swagger documentation is available at ${await app.getUrl()}/admin/api-docs`);
    console.log(`📚 Client Swagger documentation is available at ${await app.getUrl()}/client/api-docs`);
  });
}
bootstrap();
 