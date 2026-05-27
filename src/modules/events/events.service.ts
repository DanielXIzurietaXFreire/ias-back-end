import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { EventPriority, EventStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { CreateEventDto, UpdateEventDto, EventResponseDto } from './dto';
import { EventsGateway } from '@gateways/events.gateway';

/**
 * EventsService - Servicio de gestión de eventos
 *
 * Responsable de:
 * - Recibir eventos de IA
 * - Gestionar eventos y alertas
 * - Filtrar y buscar eventos
 * - Cambiar estado de eventos
 *
 * @injectable
 */
@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('EventsGateway') private readonly eventsGateway: any,
  ) {}

  /**
   * Crea un nuevo evento (desde sistema IA)
   * Emite automáticamente a través de WebSocket
   *
   * @param createEventDto Datos del evento
   * @returns Promise<EventResponseDto> Evento creado
   * @throws BadRequestException Si la cámara no existe
   */
  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    // Validar que la cámara existe
    const camera = await this.prisma.camera.findUnique({
      where: { id: createEventDto.cameraId },
    });

    if (!camera) {
      throw new BadRequestException(`Cámara con ID ${createEventDto.cameraId} no existe`);
    }

    const event = await this.prisma.event.create({
      data: {
        camera: {
          connect: { id: createEventDto.cameraId },
        },
        type: createEventDto.type,
        description: createEventDto.description,
        location: createEventDto.location,
        imageUrl: createEventDto.imageUrl ?? '',
        confidence: createEventDto.confidence,
        aiMetadata: createEventDto.aiMetadata,
        status: EventStatus.PENDIENTE,
        priority: createEventDto.priority || EventPriority.MEDIA,
      },
    });

    // 🔴 EMITIR A FLUTTER VÍA WEBSOCKET
    this.eventsGateway.emitNewEvent(event);

    // 🚨 Si es crítico, emitir alerta
    if (event.priority === EventPriority.CRITICA) {
      this.eventsGateway.emitAlertTriggered({
        eventId: event.id,
        message: `¡Atención! ${event.type} detectado en ${event.location}`,
        priority: event.priority,
        timestamp: new Date().toISOString(),
      });
    }

    return event as EventResponseDto;
  }

  /**
   * Obtiene todos los eventos
   *
   * @param filters Filtros opcionales {cameraId, status, priority}
   * @returns Promise<EventResponseDto[]> Lista de eventos
   */
  async findAll(filters?: {
    cameraId?: string;
    status?: string;
    priority?: string;
  }): Promise<EventResponseDto[]> {
    const where: any = {};

    if (filters?.cameraId) {
      where.cameraId = filters.cameraId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return events as EventResponseDto[];
  }

  /**
   * Obtiene un evento por ID
   *
   * @param id ID del evento
   * @returns Promise<EventResponseDto> Datos del evento
   * @throws NotFoundException Si el evento no existe
   */
  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        camera: true,
        alerts: true,
        reviewer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return event as EventResponseDto;
  }

  /**
   * Obtiene eventos por cámara
   *
   * @param cameraId ID de la cámara
   * @returns Promise<EventResponseDto[]> Lista de eventos
   */
  async findByCamera(cameraId: string): Promise<EventResponseDto[]> {
    return this.prisma.event.findMany({
      where: { cameraId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<EventResponseDto[]>;
  }

  /**
   * Obtiene eventos pendientes de revisión
   *
   * @returns Promise<EventResponseDto[]> Eventos pendientes
   */
  async findPending(): Promise<EventResponseDto[]> {
    return this.prisma.event.findMany({
      where: { status: EventStatus.PENDIENTE },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    }) as Promise<EventResponseDto[]>;
  }

  /**
   * Actualiza estado y/o reviewer de un evento
   *
   * @param id ID del evento
   * @param updateEventDto Datos a actualizar
   * @returns Promise<EventResponseDto> Evento actualizado
   * @throws NotFoundException Si el evento no existe
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<EventResponseDto> {
    // Verificar que el evento existe
    await this.findOne(id);

    // Si se marca como revisado, agregar timestamp
    const data: any = { ...updateEventDto };
    if (updateEventDto.status === 'REVISADO' && updateEventDto.reviewedBy) {
      data.reviewedAt = new Date();
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data,
    });

    return updatedEvent as EventResponseDto;
  }

  /**
   * Elimina un evento y sus alertas asociadas
   *
   * @param id ID del evento
   * @throws NotFoundException Si el evento no existe
   */
  async remove(id: string): Promise<void> {
    // Verificar que el evento existe
    await this.findOne(id);

    // Eliminar alertas asociadas (cascada manejada por BD)
    await this.prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Obtiene estadísticas de eventos
   *
   * @returns Promise<object> Estadísticas
   */
  async getStats(): Promise<{
    total: number;
    byStatus: any;
    byPriority: any;
    pending: number;
  }> {
    const total = await this.prisma.event.count();
    const pending = await this.prisma.event.count({
      where: { status: EventStatus.PENDIENTE },
    });

    const byStatus = await this.prisma.event.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const byPriority = await this.prisma.event.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      pending,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      byPriority: byPriority.map((item) => ({
        priority: item.priority,
        count: item._count.id,
      })),
    };
  }
}
