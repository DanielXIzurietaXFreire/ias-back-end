import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para registro de nuevo usuario
 */
export class RegisterDto {
  @ApiProperty({
    example: 'usuario@cooperativa.com',
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Contraseña con mínimo 8 caracteres, mayúsculas, números y caracteres especiales',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&)',
  })
  password: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50)
  lastname: string;
}

/**
 * DTO para login
 */
export class LoginDto {
  @ApiProperty({
    example: 'usuario@cooperativa.com',
    description: 'Correo electrónico registrado',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Contraseña de acceso',
  })
  @IsString()
  @MinLength(8)
  password: string;
}

/**
 * DTO para cambio de contraseña
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: 'CurrentPassword123!',
    description: 'Contraseña actual del usuario',
  })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'Nueva contraseña. Debe ser diferente y segura',
  })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&)',
  })
  newPassword: string;
}

/**
 * DTO para respuesta de autenticación
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT token para acceso autorizado',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token para renovar el JWT (opcional)',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Información del usuario autenticado',
  })
  user: {
    id: string;
    email: string;
    name: string;
    lastname: string;
    role: string;
  };
}

/**
 * Payload del JWT descodificado
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
