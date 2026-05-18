import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear/actualizar usuario
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@cooperativa.com',
    description: 'Correo electrónico único',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Juan',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'Pérez',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastname: string;
}

/**
 * DTO para actualizar usuario
 */
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastname?: string;
}

/**
 * DTO para respuesta de usuario
 */
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
