import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - Módulo global de base de datos
 *
 * Proporciona acceso global a PrismaService en toda la aplicación.
 * Se configura como módulo global para evitar importaciones repetidas.
 *
 * Características:
 * - PrismaService disponible en todos los módulos
 * - Conexión automática al iniciar la aplicación
 * - Desconexión elegante al terminar
 * - Configuración centralizada de Prisma
 *
 * @global
 * @module
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
@Global() // Hace que PrismaService esté disponible en todos los módulos sin importar este módulo
export class PrismaModule {}