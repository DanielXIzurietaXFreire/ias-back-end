import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, AuthError } from '@supabase/supabase-js';
import { SupabaseConfig } from '@config/supabase.config';

/**
 * Servicio de autenticación con Supabase
 * Maneja operaciones de auth usando Supabase Auth
 */
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = SupabaseConfig.getClient(configService);
  }

  /**
   * Registra un nuevo usuario con email y contraseña
   */
  async signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      this.logger.log(`Usuario registrado: ${email}`);
      return data;
    } catch (error) {
      this.logger.error(`Error al registrar usuario ${email}:`, error);
      throw error;
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.logger.log(`Usuario autenticado: ${email}`);
      return data;
    } catch (error) {
      this.logger.error(`Error al autenticar usuario ${email}:`, error);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      this.logger.log('Usuario cerró sesión');
    } catch (error) {
      this.logger.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;

      return user;
    } catch (error) {
      this.logger.error('Error al obtener usuario actual:', error);
      throw error;
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken() {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      if (error) throw error;

      return data;
    } catch (error) {
      this.logger.error('Error al refrescar token:', error);
      throw error;
    }
  }

  /**
   * Verifica si el token es válido
   */
  async verifyToken(token: string) {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      if (error) throw error;

      return data.user;
    } catch (error) {
      this.logger.error('Error al verificar token:', error);
      return null;
    }
  }
}