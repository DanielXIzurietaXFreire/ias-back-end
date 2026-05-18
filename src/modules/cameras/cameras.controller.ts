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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CamerasService } from './cameras.service';
import { CreateCameraDto, UpdateCameraDto, CameraResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * CamerasController - Controlador de gestión de cámaras
 *
 * Endpoints:
 * - GET /cameras - Obtener todas las cámaras
 * - GET /cameras/:id - Obtener cámara por ID
 * - GET /cameras/status/:status - Obtener cámaras por estado
 * - POST /cameras - Crear nueva cámara
 * - PATCH /cameras/:id - Actualizar cámara
 * - PATCH /cameras/:id/status - Cambiar estado de cámara
 * - DELETE /cameras/:id - Eliminar cámara
 * - GET /cameras/stats - Estadísticas
 *
 * @controller
 */
@ApiTags('Cameras')
@Controller('cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  /**
   * Crea una nueva cámara
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva cámara',
    description: 'Registra una nueva cámara de vigilancia en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Cámara creada exitosamente',
    type: CameraResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(@Body() createCameraDto: CreateCameraDto): Promise<CameraResponseDto> {
    return this.camerasService.create(createCameraDto);
  }

  /**
   * Obtiene todas las cámaras
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las cámaras',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cámaras',
    type: [CameraResponseDto],
  })
  async findAll(): Promise<CameraResponseDto[]> {
    return this.camerasService.findAll();
  }

  /**
   * Obtiene estadísticas de cámaras
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de cámaras',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
  })
  async getStats() {
    return this.camerasService.getStats();
  }

  /**
   * Obtiene cámaras por estado
   */
  @Get('status/:status')
  @ApiOperation({
    summary: 'Obtener cámaras por estado',
  })
  @ApiParam({
    name: 'status',
    enum: ['ACTIVA', 'INACTIVA', 'ERROR'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cámaras',
    type: [CameraResponseDto],
  })
  async findByStatus(@Param('status') status: string): Promise<CameraResponseDto[]> {
    return this.camerasService.findByStatus(status);
  }

  /**
   * Obtiene una cámara específica
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cámara por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la cámara',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de la cámara',
    type: CameraResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cámara no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<CameraResponseDto> {
    return this.camerasService.findOne(id);
  }

  /**
   * Actualiza una cámara
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar cámara',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la cámara',
  })
  @ApiResponse({
    status: 200,
    description: 'Cámara actualizada',
    type: CameraResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cámara no encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCameraDto: UpdateCameraDto,
  ): Promise<CameraResponseDto> {
    return this.camerasService.update(id, updateCameraDto);
  }

  /**
   * Cambia el estado de una cámara
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar estado de cámara',
    description: 'Actualiza el estado de una cámara (ACTIVA, INACTIVA, ERROR)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la cámara',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: CameraResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<CameraResponseDto> {
    return this.camerasService.updateStatus(id, status);
  }

  /**
   * Elimina una cámara
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar cámara',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la cámara',
  })
  @ApiResponse({
    status: 204,
    description: 'Cámara eliminada',
  })
  @ApiResponse({
    status: 404,
    description: 'Cámara no encontrada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.camerasService.remove(id);
  }
}
