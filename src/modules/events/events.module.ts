import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '@database/prisma.service';

/**
 * EventsModule - Módulo de eventos de vigilancia
 *
 * @module
 */
@Module({
  providers: [EventsService, PrismaService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
