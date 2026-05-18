import { registerAs } from '@nestjs/config';

/**
 * Configuración de variables de entorno para JWT
 * Se centraliza aquí para fácil gestión y tipado
 */
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'dev-secret-key',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
}));

/**
 * Configuración de variables de entorno generales
 */
export const environmentConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
}));

/**
 * Configuración de CORS
 */
export const corsConfig = {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:8100,http://10.0.2.2:3000')
    .split(',')
    .map((origin) => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Configuración de WebSocket
 */
export const wsConfig = {
  namespace: process.env.WEBSOCKET_NAMESPACE || '/events',
  cors: {
    origin: (process.env.WEBSOCKET_CORS || 'http://localhost:3000,http://localhost:8100')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  },
};

/**
 * Configuración de seguridad
 */
export const securityConfig = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
};
