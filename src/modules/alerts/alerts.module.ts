import { Module, forwardRef } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaService } from '@database/prisma.service';
import { EventsModule } from '@modules/events/events.module';

/**
 * AlertsModule - Módulo de alertas
 *
 * @module
 */
@Module({
  imports: [forwardRef(() => EventsModule)],
  providers: [AlertsService, PrismaService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
