import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard - Guard para proteger rutas con autenticación JWT
 *
 * Se usa con @UseGuards(JwtAuthGuard) en controladores.
 * Valida automáticamente el JWT antes de ejecutar el endpoint.
 *
 * Ejemplo de uso:
 * @Get('protected-route')
 * @UseGuards(JwtAuthGuard)
 * getProtectedData(@Request() req) {
 *   console.log(req.user); // { sub: 'userId', email: '...', role: '...' }
 * }
 *
 * @extends AuthGuard Hereda de guard de Passport
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
