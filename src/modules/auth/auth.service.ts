import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@database/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, JwtPayload } from './dto';

/**
 * AuthService - Servicio de autenticación
 *
 * Responsable de:
 * - Registro de nuevos usuarios
 * - Autenticación y login
 * - Generación de JWT tokens
 * - Validación de contraseñas
 *
 * @injectable
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   *
   * @param registerDto Datos de registro (email, password, name, lastname)
   * @returns Promise<AuthResponseDto> Token JWT y datos del usuario creado
   * @throws BadRequestException Si los datos no son válidos
   * @throws ConflictException Si el email ya existe
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, lastname } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado en el sistema');
    }

    // Hash de la contraseña
    let bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS') || '10', 10);
    if (Number.isNaN(bcryptRounds) || bcryptRounds <= 0) {
      bcryptRounds = 10;
    }

    const salt = await bcrypt.genSalt(bcryptRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario en base de datos
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        lastname,
        role: 'USUARIO', // Rol por defecto para nuevos usuarios
      },
    });

    // Generar token JWT
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: user.role,
      },
    };
  }

  /**
   * Autentica un usuario existente
   *
   * @param loginDto Datos de login (email, password)
   * @returns Promise<AuthResponseDto> Token JWT y datos del usuario
   * @throws UnauthorizedException Si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Generar token JWT
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: user.role,
      },
    };
  }

  /**
   * Valida un token JWT y retorna el payload
   *
   * @param token Token JWT a validar
   * @returns Promise<JwtPayload> Payload decodificado del token
   * @throws UnauthorizedException Si el token es inválido
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Genera un token JWT para un usuario
   *
   * @param userId ID del usuario
   * @param email Email del usuario
   * @param role Rol del usuario
   * @returns string Token JWT codificado
   *
   * @private
   */
  private generateToken(userId: string, email: string, role: string): string {
    const jwtSecret = this.configService.get('JWT_SECRET');
    const jwtExpiration = this.configService.get('JWT_EXPIRATION') || '7d';

    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiration,
    });
  }

  /**
   * Obtiene un usuario por ID
   *
   * @param userId ID del usuario
   * @returns Promise<any> Datos del usuario (sin contraseña)
   */
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
