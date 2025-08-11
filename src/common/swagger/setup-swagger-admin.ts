import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
export const setupSwaggerAdmin = (app: INestApplication): void => {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Football Board Admin API')
        .setDescription(
            'This documentation provides a comprehensive overview of the Football Board API, including available endpoints, request formats, and response structures.',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .setContact('Football Board Support Team', 'https://footballboard.uz', 'support@footballboard.uz')
        .setLicense('Proprietary License', 'https://footballboard.uz')
        .addServer('https://api.kkfa.uz', 'Production Server')
        .addServer('http://127.0.0.1:' + process.env.PORT, 'Local Development Server')
        .addGlobalParameters({
            name: 'x-lang',
            in: 'header',
            required: false,
            description:
                'Language preference header. Supported values: uz, ru, en, kaa.',
            schema: {
                type: 'string',
                example: 'kaa',
            },
        })
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        // include: [AdminModule],
    });

    SwaggerModule.setup('/admin/api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        explorer: true,
        jsonDocumentUrl: '/admin/api-docs-json/',
        yamlDocumentUrl: '/admin/api-docs-yaml/',
        swaggerUiEnabled: true,
        ui: true,
        raw: ['json', 'yaml'],
        swaggerUrl: '/admin/api-docs-json/',
        customSiteTitle: 'Football Board API',
        customCss:
            '.swagger-container .swagger-ui { max-width: 900px; margin: 0 auto; }',
    });
};
