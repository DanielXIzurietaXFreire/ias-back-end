import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SupabaseAuthService } from './supabase-auth.service';
import { PrismaService } from '@database/prisma.service';

/**
 * AuthModule - Módulo de autenticación
 *
 * Proporciona:
 * - Servicio de autenticación (login, register, JWT)
 * - Controlador de endpoints de auth
 * - Estrategia JWT
 * - Guard JWT para proteger rutas
 *
 * @module
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'dev-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, SupabaseAuthService, PrismaService],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, SupabaseAuthService],
})
export class AuthModule {}
