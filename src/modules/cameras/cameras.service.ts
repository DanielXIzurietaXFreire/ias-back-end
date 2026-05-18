import { Injectable, NotFoundException } from '@nestjs/common';
import { CameraStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { CreateCameraDto, UpdateCameraDto, CameraResponseDto } from './dto';

/**
 * CamerasService - Servicio de gestión de cámaras
 *
 * Responsable de:
 * - CRUD de cámaras
 * - Cambio de estado de cámaras
 * - Listar cámaras y filtrar
 *
 * @injectable
 */
@Injectable()
export class CamerasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva cámara
   *
   * @param createCameraDto Datos de la cámara
   * @returns Promise<CameraResponseDto> Cámara creada
   */
  async create(createCameraDto: CreateCameraDto): Promise<CameraResponseDto> {
    const camera = await this.prisma.camera.create({
      data: {
        ...createCameraDto,
        status: CameraStatus.ACTIVA,
      },
    });

    return camera;
  }

  /**
   * Obtiene todas las cámaras
   *
   * @returns Promise<CameraResponseDto[]> Lista de cámaras
   */
  async findAll(): Promise<CameraResponseDto[]> {
    const cameras = await this.prisma.camera.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return cameras;
  }

  /**
   * Obtiene una cámara por ID
   *
   * @param id ID de la cámara
   * @returns Promise<CameraResponseDto> Datos de la cámara
   * @throws NotFoundException Si la cámara no existe
   */
  async findOne(id: string): Promise<CameraResponseDto> {
    const camera = await this.prisma.camera.findUnique({
      where: { id },
    });

    if (!camera) {
      throw new NotFoundException(`Cámara con ID ${id} no encontrada`);
    }

    return camera;
  }

  /**
   * Obtiene cámaras por estado
   *
   * @param status Estado de la cámara (ACTIVA, INACTIVA, ERROR)
   * @returns Promise<CameraResponseDto[]> Lista de cámaras con ese estado
   */
  async findByStatus(status: string): Promise<CameraResponseDto[]> {
    return this.prisma.camera.findMany({
      where: { status: status as CameraStatus },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualiza los datos de una cámara
   *
   * @param id ID de la cámara
   * @param updateCameraDto Datos a actualizar
   * @returns Promise<CameraResponseDto> Cámara actualizada
   * @throws NotFoundException Si la cámara no existe
   */
  async update(id: string, updateCameraDto: UpdateCameraDto): Promise<CameraResponseDto> {
    // Verificar que la cámara existe
    await this.findOne(id);

    const dataToUpdate = Object.fromEntries(
      Object.entries(updateCameraDto).filter(([, value]) => value !== undefined),
    );

    const updatedCamera = await this.prisma.camera.update({
      where: { id },
      data: dataToUpdate,
    });

    return updatedCamera;
  }

  /**
   * Cambia el estado de una cámara
   *
   * @param id ID de la cámara
   * @param status Nuevo estado (ACTIVA, INACTIVA, ERROR)
   * @returns Promise<CameraResponseDto> Cámara con nuevo estado
   * @throws NotFoundException Si la cámara no existe
   */
  async updateStatus(id: string, status: string): Promise<CameraResponseDto> {
    // Verificar que la cámara existe
    await this.findOne(id);

    const camera = await this.prisma.camera.update({
      where: { id },
      data: { status: status as CameraStatus },
    });

    return camera;
  }

  /**
   * Elimina una cámara
   *
   * @param id ID de la cámara
   * @throws NotFoundException Si la cámara no existe
   */
  async remove(id: string): Promise<void> {
    // Verificar que la cámara existe
    await this.findOne(id);

    await this.prisma.camera.delete({
      where: { id },
    });
  }

  /**
   * Obtiene estadísticas de cámaras
   *
   * @returns Promise<object> Estadísticas generales
   */
  async getStats(): Promise<{ total: number; byStatus: any }> {
    const total = await this.prisma.camera.count();

    const byStatus = await this.prisma.camera.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
    };
  }
}
