import { Module } from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { CamerasController } from './cameras.controller';
import { PrismaService } from '@database/prisma.service';

/**
 * CamerasModule - Módulo de gestión de cámaras
 *
 * @module
 */
@Module({
  providers: [CamerasService, PrismaService],
  controllers: [CamerasController],
  exports: [CamerasService],
})
export class CamerasModule {}
