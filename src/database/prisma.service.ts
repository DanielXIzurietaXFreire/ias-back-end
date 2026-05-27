import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService - Administrador de conexión a la base de datos
 *
 * Proporciona acceso centralizado a todos los modelos de Prisma.
 * Se inicializa al cargar el módulo y se desconecta elegantemente al terminar.
 *
 * Características:
 * - Logging estructurado con Logger de NestJS
 * - Conexión automática con verificación
 * - Desconexión elegante
 * - Manejo de errores de conexión
 *
 * @implements {OnModuleInit} Conecta a la BD cuando el módulo se inicializa
 * @implements {OnModuleDestroy} Desconecta de la BD cuando la app termina
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL ?? '';
    const normalizedUrl = PrismaService.normalizeDatabaseUrl(databaseUrl);

    super({
      datasources: {
        db: {
          url: normalizedUrl,
        },
      },
      log: ['info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  private static normalizeDatabaseUrl(databaseUrl: string): string {
    if (!databaseUrl) {
      return databaseUrl;
    }

    try {
      const parsedUrl = new URL(databaseUrl);
      const params = parsedUrl.searchParams;

      // Si la URL apunta a un pooler de Supabase (puerto 6543 o hostname que contiene 'pooler')
      // habilitar modo transaccional (pgbouncer=true) y limitar conexiones.
      const isPoolerHost = (parsedUrl.port === '6543') || parsedUrl.hostname.includes('pooler');

      if (isPoolerHost) {
        params.set('pgbouncer', 'true');
        // Límite recomendado para servicios en Render; ajustable según necesidad
        params.set('connection_limit', '5');
      } else {
        // Para entornos locales/otros, no forzar pgBouncer. Si no existe, deje como está.
        if (!params.has('connection_limit')) {
          params.set('connection_limit', '3');
        }
      }

      parsedUrl.search = params.toString();
      return parsedUrl.toString();
    } catch (error) {
      return databaseUrl;
    }
  }

  /**
   * Ejecutado al inicializar el módulo
   * Establece conexión con la base de datos y verifica conectividad
   */
  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('🔄 Intentando conectar a la base de datos...');
      await this.$connect();
      this.logger.log('✅ Base de datos conectada exitosamente');

      // Verificación adicional de conectividad
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Conectividad de base de datos verificada');
    } catch (error) {
      this.logger.error('❌ Error al conectar con la base de datos:', error);
      throw error;
    }
  }

  /**
   * Ejecutado al destruir el módulo
   * Cierra la conexión con la base de datos
   */
  async onModuleDestroy(): Promise<void> {
    try {
      this.logger.log('🔄 Cerrando conexión con la base de datos...');
      await this.$disconnect();
      this.logger.log('✅ Base de datos desconectada correctamente');
    } catch (error) {
      this.logger.error('❌ Error al desconectar la base de datos:', error);
    }
  }
}