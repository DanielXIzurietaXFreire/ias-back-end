import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '@database/prisma.service';

/**
 * UsersModule - Módulo de gestión de usuarios
 *
 * Proporciona:
 * - Servicio de usuarios
 * - Controlador de endpoints de usuarios
 * - Acceso a la base de datos
 *
 * @module
 */
@Module({
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
