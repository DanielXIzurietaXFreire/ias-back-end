import { IsString, IsIP, IsUrl, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CameraStatus } from '@prisma/client';

/**
 * DTO para crear cámara
 */
export class CreateCameraDto {
  @ApiProperty({
    example: 'Cámara Entrada Principal',
    description: 'Nombre descriptivo de la cámara',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Entrada frontal - Sucursal Centro',
    description: 'Ubicación física de la cámara',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  location: string;

  @ApiProperty({
    example: '192.168.1.10',
    description: 'Dirección IP de la cámara',
  })
  @IsIP()
  ip: string;

  @ApiProperty({
    example: 'rtsp://192.168.1.10/live',
    description: 'URL del stream de video (RTSP)',
  })
  @IsUrl()
  streamUrl: string;
}

/**
 * DTO para actualizar cámara
 */
export class UpdateCameraDto {
  @ApiProperty({ required: false, example: 'Cámara Entrada Principal' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false, example: 'Entrada frontal - Sucursal Centro' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  location?: string;

  @ApiProperty({ required: false, example: '192.168.1.10' })
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiProperty({ required: false, example: 'rtsp://192.168.1.10/live' })
  @IsOptional()
  @IsUrl()
  streamUrl?: string;

  @ApiProperty({ required: false, enum: CameraStatus })
  @IsOptional()
  @IsEnum(CameraStatus)
  status?: CameraStatus;
}

/**
 * DTO para respuesta de cámara
 */
export class CameraResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  ip: string;

  @ApiProperty()
  streamUrl: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;
}
