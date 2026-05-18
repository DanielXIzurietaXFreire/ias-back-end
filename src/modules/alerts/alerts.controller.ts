import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, AlertResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * AlertsController - Controlador de alertas
 *
 * Endpoints:
 * - POST /alerts - Crear alerta
 * - GET /alerts - Obtener todas las alertas
 * - GET /alerts/:id - Obtener alerta por ID
 * - GET /alerts/event/:eventId - Alertas de un evento
 * - GET /alerts/priority/:priority - Alertas por prioridad
 * - GET /alerts/critical - Alertas críticas (24h)
 * - DELETE /alerts/:id - Eliminar alerta
 * - GET /alerts/stats - Estadísticas
 *
 * @controller
 */
@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * Crea una nueva alerta
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear alerta',
    description: 'Crea una nueva alerta asociada a un evento',
  })
  @ApiResponse({
    status: 201,
    description: 'Alerta creada exitosamente',
    type: AlertResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Evento no existe o datos inválidos',
  })
  async create(@Body() createAlertDto: CreateAlertDto): Promise<AlertResponseDto> {
    return this.alertsService.create(createAlertDto);
  }

  /**
   * Obtiene todas las alertas
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las alertas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas',
    type: [AlertResponseDto],
  })
  async findAll(): Promise<AlertResponseDto[]> {
    return this.alertsService.findAll();
  }

  /**
   * Obtiene estadísticas de alertas
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de alertas',
    description: 'Total de alertas y alertas críticas en últimas 24h',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
  })
  async getStats() {
    return this.alertsService.getStats();
  }

  /**
   * Obtiene alertas críticas recientes
   */
  @Get('critical')
  @ApiOperation({
    summary: 'Alertas críticas (últimas 24h)',
    description: 'Retorna solo alertas con prioridad CRÍTICA de las últimas 24 horas',
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas críticas',
    type: [AlertResponseDto],
  })
  async findCriticalRecent(): Promise<AlertResponseDto[]> {
    return this.alertsService.findCriticalRecent();
  }

  /**
   * Obtiene alertas por prioridad
   */
  @Get('priority/:priority')
  @ApiOperation({
    summary: 'Obtener alertas por prioridad',
  })
  @ApiParam({
    name: 'priority',
    enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas',
    type: [AlertResponseDto],
  })
  async findByPriority(@Param('priority') priority: string): Promise<AlertResponseDto[]> {
    return this.alertsService.findByPriority(priority);
  }

  /**
   * Obtiene alertas de un evento
   */
  @Get('event/:eventId')
  @ApiOperation({
    summary: 'Obtener alertas de un evento',
  })
  @ApiParam({
    name: 'eventId',
    description: 'UUID del evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas',
    type: [AlertResponseDto],
  })
  async findByEvent(@Param('eventId') eventId: string): Promise<AlertResponseDto[]> {
    return this.alertsService.findByEvent(eventId);
  }

  /**
   * Obtiene una alerta específica
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener alerta por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la alerta',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de la alerta',
    type: AlertResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<AlertResponseDto> {
    return this.alertsService.findOne(id);
  }

  /**
   * Elimina una alerta
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar alerta',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la alerta',
  })
  @ApiResponse({
    status: 204,
    description: 'Alerta eliminada',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.alertsService.remove(id);
  }
}
