import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { WebSocket } from 'ws';

/**
 * Configuración del cliente Supabase para el backend
 */
export class SupabaseConfig {
  private static client: SupabaseClient;

  /**
   * Obtiene el cliente Supabase configurado
   */
  static getClient(configService: ConfigService): SupabaseClient {
    if (!this.client) {
      const supabaseUrl = configService.get<string>('SUPABASE_URL');
      const supabaseKey = configService.get<string>('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridas en las variables de entorno');
      }

      (global as any).WebSocket = WebSocket;

      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false, // En backend no persistimos sesiones
          detectSessionInUrl: false,
        },
      });
    }

    return this.client;
  }
}