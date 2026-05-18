import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

/**
 * UsersService - Servicio de gestión de usuarios
 *
 * Responsable de:
 * - Obtener listado de usuarios
 * - Obtener usuario por ID
 * - Actualizar datos de usuario
 * - Eliminar usuarios
 *
 * @injectable
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los usuarios del sistema
   *
   * @returns Promise<UserResponseDto[]> Lista de usuarios
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Obtiene un usuario por ID
   *
   * @param id ID del usuario
   * @returns Promise<UserResponseDto> Datos del usuario
   * @throws NotFoundException Si el usuario no existe
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Obtiene un usuario por email
   *
   * @param email Email del usuario
   * @returns Promise<UserResponseDto | null> Datos del usuario o null
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Actualiza los datos de un usuario
   *
   * @param id ID del usuario
   * @param updateUserDto Datos a actualizar
   * @returns Promise<UserResponseDto> Datos actualizados del usuario
   * @throws NotFoundException Si el usuario no existe
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Verificar que el usuario existe
    await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Elimina un usuario del sistema
   *
   * @param id ID del usuario a eliminar
   * @throws NotFoundException Si el usuario no existe
   */
  async remove(id: string): Promise<void> {
    // Verificar que el usuario existe
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Obtiene estadísticas de usuarios
   *
   * @returns Promise<object> Estadísticas generales
   */
  async getStats(): Promise<{ total: number; byRole: any }> {
    const total = await this.prisma.user.count();

    const byRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      byRole: byRole.map((item) => ({
        role: item.role,
        count: item._count.id,
      })),
    };
  }
}
