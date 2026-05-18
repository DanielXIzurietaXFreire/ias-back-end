import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { EventsService } from '@modules/events/events.service';
import { AlertsService } from '@modules/alerts/alerts.service';
import { CamerasService } from '@modules/cameras/cameras.service';

/**
 * EventsGateway - WebSocket Gateway para eventos en tiempo real
 *
 * Proporciona comunicación bidireccional via WebSocket para:
 * - Emitir nuevos eventos
 * - Emitir cambios de estado de eventos
 * - Emitir cambios de estado de cámaras
 * - Emitir alertas críticas
 *
 * Eventos emitidos:
 * - new-event: Nuevo evento detectado
 * - event-updated: Cambio en estado de evento
 * - camera-status: Cambio en estado de cámara
 * - alert-triggered: Nueva alerta crítica
 *
 * @gateway
 * @websocket
 */
@WebSocketGateway({
  namespace: '/events',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8100', 'http://localhost:3001'],
    credentials: true,
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger('EventsGateway');
  private connectedClients = new Map<string, Socket>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly alertsService: AlertsService,
    private readonly camerasService: CamerasService,
  ) {}

  /**
   * Se ejecuta cuando un cliente se conecta
   *
   * @param socket Socket del cliente conectado
   */
  handleConnection(socket: Socket): void {
    this.connectedClients.set(socket.id, socket);
    this.logger.log(`Cliente conectado: ${socket.id} (Total: ${this.connectedClients.size})`);

    // Enviar confirmación de conexión
    socket.emit('connected', {
      message: 'Conectado al servidor IAS',
      clientId: socket.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Se ejecuta cuando un cliente se desconecta
   *
   * @param socket Socket del cliente desconectado
   */
  handleDisconnect(socket: Socket): void {
    this.connectedClients.delete(socket.id);
    this.logger.log(`Cliente desconectado: ${socket.id} (Restantes: ${this.connectedClients.size})`);
  }

  /**
   * Escucha mensaje de ping (heartbeat)
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() socket: Socket): void {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Escucha solicitud de estado de sistema
   */
  @SubscribeMessage('get-status')
  async handleGetStatus(@ConnectedSocket() socket: Socket): Promise<void> {
    try {
      const [eventStats, alertStats, cameraStats] = await Promise.all([
        this.eventsService.getStats(),
        this.alertsService.getStats(),
        this.camerasService.getStats(),
      ]);

      socket.emit('system-status', {
        events: eventStats,
        alerts: alertStats,
        cameras: cameraStats,
        connectedClients: this.connectedClients.size,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error obteniendo estado del sistema:', error);
      socket.emit('error', {
        message: 'Error al obtener estado del sistema',
      });
    }
  }

  /**
   * Emite un nuevo evento a todos los clientes conectados
   * Llamado por EventsService cuando se crea un nuevo evento
   *
   * @param event Datos del evento
   */
  emitNewEvent(event: any): void {
    this.logger.debug(`Emitiendo nuevo evento: ${event.id}`);
    this.server.emit('new-event', {
      ...event,
      emittedAt: new Date().toISOString(),
    });
  }

  /**
   * Emite una actualización de evento a todos los clientes
   *
   * @param event Datos actualizados del evento
   */
  emitEventUpdated(event: any): void {
    this.logger.debug(`Emitiendo evento actualizado: ${event.id}`);
    this.server.emit('event-updated', {
      ...event,
      emittedAt: new Date().toISOString(),
    });
  }

  /**
   * Emite cambio de estado de cámara
   *
   * @param cameraId ID de la cámara
   * @param status Nuevo estado
   */
  emitCameraStatus(cameraId: string, status: string): void {
    this.logger.debug(`Emitiendo cambio de estado de cámara: ${cameraId} -> ${status}`);
    this.server.emit('camera-status', {
      cameraId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emite alerta crítica a todos los clientes
   *
   * @param alert Datos de la alerta
   */
  emitAlertTriggered(alert: any): void {
    this.logger.warn(`ALERTA CRÍTICA emitida: ${alert.id}`);
    this.server.emit('alert-triggered', {
      ...alert,
      emittedAt: new Date().toISOString(),
    });
  }

  /**
   * Obtiene número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Obtiene lista de clientes conectados
   */
  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Desconecta un cliente específico (para administración)
   */
  disconnectClient(clientId: string): boolean {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      socket.disconnect(true);
      this.connectedClients.delete(clientId);
      return true;
    }
    return false;
  }
}
