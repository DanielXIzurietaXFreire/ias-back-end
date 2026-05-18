import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configura Swagger/OpenAPI para la documentación interactiva de la API
 * Disponible en: http://localhost:3000/api/docs
 *
 * @param app Instancia de la aplicación NestJS
 */
export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('IAS Backend API')
    .setDescription(
      'Intelligent AI Surveillance - API de videovigilancia inteligente para cooperativas financieras',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'Endpoints de autenticación')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Cameras', 'Gestión de cámaras de vigilancia')
    .addTag('Events', 'Eventos de IA y vigilancia')
    .addTag('Alerts', 'Alertas en tiempo real')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token obtenido al hacer login',
      },
      'jwt',
    )
    .setContact(
      'IAS Development Team',
      'https://github.com/ias-team',
      'support@ias-surveillance.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.ias-surveillance.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customCss: `
      .swagger-ui .topbar {
        background-color: #1a1a1a;
      }
      .swagger-ui .logo__img {
        height: 40px;
      }
    `,
  });

  // Ruta alternativa para JSON del esquema
  app.use('/api/docs-json', (req, res) => {
    res.json(document);
  });
}
