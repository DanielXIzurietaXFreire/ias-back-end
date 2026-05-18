import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseAuthService } from '@modules/auth/supabase-auth.service';

/**
 * Middleware para mantener sesiones de Supabase refrescadas
 * Verifica y refresca tokens automáticamente en cada request
 */
@Injectable()
export class SupabaseSessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SupabaseSessionMiddleware.name);

  constructor(private readonly supabaseAuthService: SupabaseAuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Obtener token del header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Verificar si el token necesita refresco
        const user = await this.supabaseAuthService.verifyToken(token);

        if (user) {
          // Token válido, continuar
          this.logger.debug(`Token válido para usuario: ${user.email}`);
        } else {
          // Token inválido o expirado
          this.logger.warn('Token inválido o expirado detectado');

          // Intentar refrescar (si hay refresh token en cookies o headers)
          const refreshToken = req.cookies?.refresh_token || req.headers['x-refresh-token'] as string;

          if (refreshToken) {
            try {
              const refreshed = await this.supabaseAuthService.refreshToken();
              if (refreshed.session) {
                // Actualizar el header con el nuevo token
                req.headers.authorization = `Bearer ${refreshed.session.access_token}`;

                // Opcional: enviar nuevo refresh token en respuesta
                res.setHeader('x-new-access-token', refreshed.session.access_token);

                this.logger.log('Token refrescado exitosamente');
              }
            } catch (refreshError) {
              this.logger.error('Error al refrescar token:', refreshError);
              // Continuar sin refrescar, el guard manejará la autenticación
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error en middleware de sesión:', error);
      // No bloquear el request, continuar
    }

    next();
  }
}