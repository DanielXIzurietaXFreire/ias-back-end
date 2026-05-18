import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * PrismaExceptionFilter - Filtro global para errores de Prisma
 *
 * Maneja errores específicos de Prisma y los convierte en respuestas HTTP apropiadas.
 * Proporciona logging detallado y respuestas consistentes para errores de base de datos.
 *
 * Errores manejados:
 * - P2002: Unique constraint violation
 * - P2025: Record not found
 * - P1001: Can't reach database server
 * - P1008: Operations timed out
 * - P1017: Server has closed the connection
 *
 * @implements {ExceptionFilter}
 * @global
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let errorCode: string;

    // Manejar diferentes tipos de errores de Prisma
    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con estos datos únicos';
        errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
        this.logger.warn(
          `Unique constraint violation: ${exception.meta?.target} - ${exception.message}`,
        );
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado';
        errorCode = 'RECORD_NOT_FOUND';
        this.logger.warn(`Record not found: ${exception.message}`);
        break;

      case 'P1001':
        // Can't reach database server
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Error de conexión con la base de datos';
        errorCode = 'DATABASE_CONNECTION_ERROR';
        this.logger.error(`Database connection error: ${exception.message}`);
        break;

      case 'P1008':
        // Operations timed out
        status = HttpStatus.REQUEST_TIMEOUT;
        message = 'La operación de base de datos excedió el tiempo límite';
        errorCode = 'DATABASE_TIMEOUT';
        this.logger.error(`Database timeout: ${exception.message}`);
        break;

      case 'P1017':
        // Server has closed the connection
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'La conexión con la base de datos se cerró inesperadamente';
        errorCode = 'DATABASE_CONNECTION_CLOSED';
        this.logger.error(`Database connection closed: ${exception.message}`);
        break;

      default:
        // Error genérico de Prisma
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error interno de base de datos';
        errorCode = 'DATABASE_ERROR';
        this.logger.error(
          `Unhandled Prisma error [${exception.code}]: ${exception.message}`,
          exception.stack,
        );
        break;
    }

    // Respuesta consistente
    const errorResponse = {
      statusCode: status,
      message,
      error: errorCode,
      timestamp: new Date().toISOString(),
      path: (request as any).url,
    };

    response.status(status).json(errorResponse);
  }
}