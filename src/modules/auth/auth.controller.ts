import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * AuthController - Controlador de autenticación
 *
 * Endpoints:
 * - POST /auth/register - Registrar nuevo usuario
 * - POST /auth/login - Login y obtener JWT
 * - GET /auth/profile - Obtener perfil del usuario autenticado
 *
 * @controller
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra un nuevo usuario
   *
   * @param registerDto Datos de registro
   * @returns Promise<AuthResponseDto> Token y datos del usuario
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario con email y contraseña',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de registro inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Autentica un usuario y retorna JWT
   *
   * @param loginDto Credenciales (email, password)
   * @returns Promise<AuthResponseDto> Token y datos del usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuario',
    description: 'Autentica un usuario y retorna un token JWT',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   *
   * @param request Request HTTP con información del usuario
   * @returns Datos del usuario autenticado
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description: 'Retorna los datos del usuario actualmente autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async getProfile(@Request() req: any) {
    return this.authService.getUserById(req.user.sub);
  }
}
