import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertPriority } from '@prisma/client';

/**
 * DTO para crear alerta
 */
export class CreateAlertDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del evento asociado',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    example: 'Comportamiento anormal detectado',
    description: 'Mensaje de la alerta',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: 'ALTA',
    enum: AlertPriority,
    description: 'Prioridad de la alerta',
  })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;
}

/**
 * DTO para respuesta de alerta
 */
export class AlertResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  priority: string;

  @ApiProperty()
  createdAt: Date;
}
