import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { configureSwagger } from '@config/swagger.config';
import { corsConfig } from '@config/environment';
import { SupabaseConfig } from '@config/supabase.config';
import { PrismaExceptionFilter } from '@common/filters/prisma-exception.filter';

/**
 * Bootstrap de la aplicación NestJS
 * Configura seguridad, validación, CORS, Swagger y WebSocket
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // ========================================
  // FILTROS GLOBALES DE EXCEPCIONES
  // ========================================
  app.useGlobalFilters(new PrismaExceptionFilter());
  logger.log('✅ Filtro global de excepciones Prisma configurado');

  // ========================================
  // SEGURIDAD
  // ========================================
  // Helmet protege contra vulnerabilidades comunes de HTTP
  app.use(helmet());
  logger.log('✅ Helmet habilitado');

  // ========================================
  // CORS
  // ========================================
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  const corsAllowed = nodeEnv !== 'production' ? true : corsConfig.origin;

  app.enableCors({
    origin: corsAllowed,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  logger.log(`✅ CORS habilitado para: ${corsAllowed === true ? 'todos los orígenes (desarrollo)' : corsAllowed.join(', ')}`);

  // ========================================
  // SUPABASE SESSION MIDDLEWARE
  // ========================================
  // Middleware para mantener sesiones refrescadas
  app.use(async (req, res, next) => {
    try {
      const supabase = SupabaseConfig.getClient(configService);
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Verificar token con Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
          logger.warn(`Token inválido detectado: ${error.message}`);
        } else {
          logger.debug(`Token válido para usuario: ${data.user?.email}`);
        }
      }
    } catch (error) {
      logger.error('Error en middleware de sesión Supabase:', error);
    }

    next();
  });
  logger.log('✅ Middleware de sesión Supabase configurado');

  // ========================================
  // VALIDACIÓN GLOBAL
  // ========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Rechaza si hay propiedades no permitidas
      transform: true, // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  logger.log('✅ ValidationPipe global configurado');

  // ========================================
  // SWAGGER/API DOCS
  // ========================================
  const swaggerEnabled = configService.get('SWAGGER_ENABLED') !== 'false';
  if (swaggerEnabled) {
    configureSwagger(app);
    logger.log('✅ Swagger disponible en: http://localhost:3000/api/docs');
  }

  // ========================================
  // CONFIGURACIÓN GLOBAL
  // ========================================
  const port = parseInt(process.env.PORT, 10) || configService.get('APP_PORT') || 3000;
  const apiVersion = configService.get('API_VERSION') || 'v1';
  const appUrl = `http://localhost:${port}`;

  // Prefijo global para la API
  app.setGlobalPrefix(`api/${apiVersion}`);

  // ========================================
  // INICIAR SERVIDOR
  // ========================================
  await app.listen(port, '0.0.0.0', () => {
    logger.log('');
    logger.log('╔════════════════════════════════════════════════════════╗');
    logger.log('║   IAS Backend - Intelligent AI Surveillance            ║');
    logger.log('╚════════════════════════════════════════════════════════╝');
    logger.log('');
    logger.log(`🚀 Servidor ejecutándose en puerto: ${port}`);
    logger.log(`🔧 Ambiente: ${nodeEnv}`);
    logger.log(`📡 API versión: ${apiVersion}`);
    logger.log('');
    logger.log(`📚 Documentación: ${appUrl}/api/docs`);
    logger.log(`🔌 WebSocket: ws://${appUrl.split('://')[1]}/events`);
    logger.log('');
    logger.log('Presiona CTRL+C para detener el servidor');
    logger.log('');
  });
}

bootstrap().catch((error) => {
  console.error('❌ Error durante bootstrap:', error);
  process.exit(1);
});
