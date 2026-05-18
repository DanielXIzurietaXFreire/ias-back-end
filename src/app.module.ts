import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig, environmentConfig } from '@config/environment';
import { PrismaModule } from '@database/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CamerasModule } from '@modules/cameras/cameras.module';
import { EventsModule } from '@modules/events/events.module';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { EventsGateway } from '@gateways/events.gateway';
import { HealthController } from './common/health/health.controller';

/**
 * AppModule - Módulo raíz de la aplicación
 *
 * Configura:
 * - Variables de entorno desde .env
 * - Todos los módulos de negocio
 * - Servicios globales (Prisma)
 * - WebSocket Gateway
 *
 * Estructura modular:
 * - AuthModule: Autenticación JWT
 * - UsersModule: Gestión de usuarios
 * - CamerasModule: Gestión de cámaras
 * - EventsModule: Gestión de eventos IA
 * - AlertsModule: Gestión de alertas
 *
 * @module
 */
@Module({
  imports: [
    // ========================================
    // CONFIGURACIÓN GLOBAL
    // ========================================
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la aplicación
      envFilePath: '.env',
      load: [environmentConfig, jwtConfig],
      cache: true,
    }),

    // ========================================
    // BASE DE DATOS
    // ========================================
    PrismaModule, // Servicio global de Prisma

    // ========================================
    // MÓDULOS DE NEGOCIO
    // ========================================
    AuthModule,
    UsersModule,
    CamerasModule,
    EventsModule,
    AlertsModule,
  ],

  // ========================================
  // PROVEEDORES GLOBALES
  // ========================================
  controllers: [HealthController],
  providers: [
    EventsGateway, // WebSocket para eventos en tiempo real
  ],
})
export class AppModule {}
