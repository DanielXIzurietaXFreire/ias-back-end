import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './dto';

/**
 * JwtStrategy - Estrategia de Passport para validar JWT
 *
 * Extrae el token del header Authorization y valida su firma.
 * El payload validado se asigna a request.user
 *
 * @extends PassportStrategy Hereda de estrategia de Passport
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'dev-secret-key',
    });
  }

  /**
   * Valida el payload JWT descodificado
   * Se ejecuta después de que Passport verifica la firma del token
   *
   * @param payload JwtPayload descodificado
   * @returns El payload para ser asignado a request.user
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
