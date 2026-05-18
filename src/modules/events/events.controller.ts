import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, EventResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * EventsController - Controlador de eventos de vigilancia
 *
 * Endpoints:
 * - POST /events - Crear evento (desde IA)
 * - GET /events - Obtener todos los eventos
 * - GET /events/pending - Obtener eventos pendientes
 * - GET /events/:id - Obtener evento por ID
 * - GET /events/camera/:cameraId - Eventos de una cámara
 * - PATCH /events/:id - Actualizar evento
 * - DELETE /events/:id - Eliminar evento
 * - GET /events/stats - Estadísticas
 *
 * @controller
 */
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Crea un nuevo evento (desde sistema IA)
   * Nota: En producción este endpoint debería tener autenticación especial
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear evento de IA',
    description: 'Recibe evento generado por modelo YOLOv8 o sistema externo',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento creado exitosamente',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o cámara no existe',
  })
  async create(@Body() createEventDto: CreateEventDto): Promise<EventResponseDto> {
    return this.eventsService.create(createEventDto);
  }

  /**
   * Obtiene todos los eventos con filtros opcionales
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los eventos',
    description: 'Retorna lista de eventos con filtros opcionales',
  })
  @ApiQuery({
    name: 'cameraId',
    required: false,
    description: 'Filtrar por cámara',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDIENTE', 'REVISADO', 'RESUELTO'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos',
    type: [EventResponseDto],
  })
  async findAll(
    @Query('cameraId') cameraId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.findAll({
      cameraId,
      status,
      priority,
    });
  }

  /**
   * Obtiene eventos pendientes de revisión
   */
  @Get('pending')
  @ApiOperation({
    summary: 'Obtener eventos pendientes',
    description: 'Retorna eventos que aún no han sido revisados',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos pendientes',
    type: [EventResponseDto],
  })
  async findPending(): Promise<EventResponseDto[]> {
    return this.eventsService.findPending();
  }

  /**
   * Obtiene estadísticas de eventos
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de eventos',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
  })
  async getStats() {
    return this.eventsService.getStats();
  }

  /**
   * Obtiene eventos de una cámara específica
   */
  @Get('camera/:cameraId')
  @ApiOperation({
    summary: 'Obtener eventos de una cámara',
  })
  @ApiParam({
    name: 'cameraId',
    description: 'UUID de la cámara',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos',
    type: [EventResponseDto],
  })
  async findByCamera(@Param('cameraId') cameraId: string): Promise<EventResponseDto[]> {
    return this.eventsService.findByCamera(cameraId);
  }

  /**
   * Obtiene un evento específico
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener evento por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del evento',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Evento no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  /**
   * Actualiza estado/revisión de un evento
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar evento',
    description: 'Actualiza estado, reviewer o prioridad de un evento',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento actualizado',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Evento no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * Elimina un evento
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar evento',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del evento',
  })
  @ApiResponse({
    status: 204,
    description: 'Evento eliminado',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }
}
