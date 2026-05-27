import { Module, forwardRef } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '@database/prisma.service';
import { EventsGateway } from '@gateways/events.gateway';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { CamerasModule } from '@modules/cameras/cameras.module';

/**
 * EventsModule - Módulo de eventos de vigilancia
 *
 * @module
 */
@Module({
  imports: [forwardRef(() => AlertsModule), CamerasModule],
  providers: [EventsService, PrismaService, EventsGateway],
  controllers: [EventsController],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
