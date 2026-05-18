import { IsString, IsOptional, IsUrl, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventPriority, EventStatus } from '@prisma/client';

/**
 * DTO para crear evento (desde IA/sistema externo)
 */
export class CreateEventDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID de la cámara que genera el evento',
  })
  @IsString()
  cameraId: string;

  @ApiProperty({
    example: 'persona_detectada',
    description: 'Tipo de evento detectado',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'Persona entrando a la sucursal',
    description: 'Descripción del evento',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Entrada frontal',
    description: 'Ubicación del evento',
  })
  @IsString()
  location: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/frame.jpg',
    description: 'URL de la imagen capturada',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 0.92,
    description: 'Confianza del modelo IA (0-1)',
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @ApiPropertyOptional({
    example: 'MEDIA',
    enum: EventPriority,
    description: 'Prioridad del evento',
  })
  @IsOptional()
  @IsEnum(EventPriority)
  priority?: EventPriority;

  @ApiPropertyOptional({
    description: 'Metadata adicional del modelo IA',
  })
  @IsOptional()
  aiMetadata?: any;
}

/**
 * DTO para actualizar evento
 */
export class UpdateEventDto {
  @ApiPropertyOptional({
    example: 'REVISADO',
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario que revisa el evento',
  })
  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @ApiPropertyOptional({
    example: 'MEDIA',
    enum: EventPriority,
  })
  @IsOptional()
  @IsEnum(EventPriority)
  priority?: EventPriority;
}

/**
 * DTO para respuesta de evento
 */
export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cameraId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  priority: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  reviewedBy?: string;

  @ApiProperty()
  reviewedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
