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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * UsersController - Controlador de gestión de usuarios
 *
 * Endpoints:
 * - GET /users - Obtener todos los usuarios
 * - GET /users/:id - Obtener usuario por ID
 * - PATCH /users/:id - Actualizar usuario
 * - DELETE /users/:id - Eliminar usuario
 * - GET /users/stats - Estadísticas de usuarios
 *
 * @controller
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene todos los usuarios
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description: 'Retorna lista completa de usuarios registrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de usuarios',
    description: 'Retorna estadísticas generales de usuarios por rol',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
  })
  async getStats() {
    return this.usersService.getStats();
  }

  /**
   * Obtiene un usuario específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  /**
   * Actualiza los datos de un usuario
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza nombre y apellido del usuario',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Elimina un usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Elimina permanentemente un usuario del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
