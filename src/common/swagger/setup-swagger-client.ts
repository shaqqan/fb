import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ClientModule, clientModules } from 'src/modules/client/client.module';

export const setupSwaggerClient = (app: INestApplication): void => {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Client API Documentation')
        .setDescription(
            'Public endpoints for client-facing services. This documentation covers all public APIs including matches, clubs, news, personal information, and partner services that are accessible without authentication.',
        )
        .setVersion('1.0.0')
        .setContact('Football Board Support Team', 'https://kkfa.uz', 'support@kkfa.uz')
        .setLicense('Proprietary License', 'https://kkfa.uz')
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

    const clientDocument = SwaggerModule.createDocument(app, swaggerConfig, {
        include: clientModules,
        deepScanRoutes: true,
    });

    SwaggerModule.setup('/client/api-docs', app, clientDocument, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        explorer: true,
        jsonDocumentUrl: '/client/api-docs-json/',
        yamlDocumentUrl: '/client/api-docs-yaml/',
        swaggerUiEnabled: true,
        ui: true,
        raw: ['json', 'yaml'],
        swaggerUrl: '/client/api-docs-json/',
        customSiteTitle: 'Football Board Client API',
        customCss:
            '.swagger-container .swagger-ui { max-width: 900px; margin: 0 auto; }',
    });
};
