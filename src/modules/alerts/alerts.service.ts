import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { AlertPriority } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { CreateAlertDto, AlertResponseDto } from './dto';
import { EventsGateway } from '@gateways/events.gateway';

/**
 * AlertsService - Servicio de gestión de alertas
 *
 * Responsable de:
 * - Crear alertas a partir de eventos
 * - Obtener y filtrar alertas
 * - Gestionar ciclo de vida de alertas
 *
 * @injectable
 */
@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => EventsGateway)) private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Crea una nueva alerta
   *
   * @param createAlertDto Datos de la alerta
   * @returns Promise<AlertResponseDto> Alerta creada
   * @throws BadRequestException Si el evento no existe
   */
  async create(createAlertDto: CreateAlertDto): Promise<AlertResponseDto> {
    // Validar que el evento existe
    const event = await this.prisma.event.findUnique({
      where: { id: createAlertDto.eventId },
    });

    if (!event) {
      throw new BadRequestException(`Evento con ID ${createAlertDto.eventId} no existe`);
    }

    const alert = await this.prisma.alert.create({
      data: {
        ...createAlertDto,
        priority: createAlertDto.priority || AlertPriority.MEDIA,
      },
    });

    // 🔴 EMITIR ALERTA A FLUTTER VÍA WEBSOCKET
    this.eventsGateway.emitAlertTriggered({
      ...alert,
      eventId: alert.eventId,
      timestamp: new Date().toISOString(),
    });

    return alert as AlertResponseDto;
  }

  /**
   * Obtiene todas las alertas
   *
   * @returns Promise<AlertResponseDto[]> Lista de alertas
   */
  async findAll(): Promise<AlertResponseDto[]> {
    const alerts = await this.prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return alerts as AlertResponseDto[];
  }

  /**
   * Obtiene una alerta por ID
   *
   * @param id ID de la alerta
   * @returns Promise<AlertResponseDto> Datos de la alerta
   * @throws NotFoundException Si la alerta no existe
   */
  async findOne(id: string): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            camera: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }

    return alert as AlertResponseDto;
  }

  /**
   * Obtiene alertas por evento
   *
   * @param eventId ID del evento
   * @returns Promise<AlertResponseDto[]> Lista de alertas del evento
   */
  async findByEvent(eventId: string): Promise<AlertResponseDto[]> {
    return this.prisma.alert.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<AlertResponseDto[]>;
  }

  /**
   * Obtiene alertas por prioridad
   *
   * @param priority Prioridad (BAJA, MEDIA, ALTA, CRITICA)
   * @returns Promise<AlertResponseDto[]> Lista de alertas
   */
  async findByPriority(priority: string): Promise<AlertResponseDto[]> {
    return this.prisma.alert.findMany({
      where: { priority: priority as AlertPriority },
      orderBy: { createdAt: 'desc' },
    }) as Promise<AlertResponseDto[]>;
  }

  /**
   * Obtiene alertas críticas (últimas 24 horas)
   *
   * @returns Promise<AlertResponseDto[]> Alertas críticas recientes
   */
  async findCriticalRecent(): Promise<AlertResponseDto[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.alert.findMany({
      where: {
        priority: AlertPriority.CRITICA,
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<AlertResponseDto[]>;
  }

  /**
   * Elimina una alerta
   *
   * @param id ID de la alerta
   * @throws NotFoundException Si la alerta no existe
   */
  async remove(id: string): Promise<void> {
    // Verificar que la alerta existe
    await this.findOne(id);

    await this.prisma.alert.delete({
      where: { id },
    });
  }

  /**
   * Obtiene estadísticas de alertas
   *
   * @returns Promise<object> Estadísticas
   */
  async getStats(): Promise<{
    total: number;
    byPriority: any;
    critical24h: number;
  }> {
    const total = await this.prisma.alert.count();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const critical24h = await this.prisma.alert.count({
      where: {
        priority: 'CRITICA',
        createdAt: { gte: oneDayAgo },
      },
    });

    const byPriority = await this.prisma.alert.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      critical24h,
      byPriority: byPriority.map((item) => ({
        priority: item.priority,
        count: item._count.id,
      })),
    };
  }
}
