# 🧪 EJEMPLOS DE USO - IAS Backend

Ejemplos prácticos de cómo usar el backend IAS desde diferentes clientes.

## 📋 Tabla de Contenidos

1. [cURL/Bash](#curlbash)
2. [JavaScript/Node.js](#javascriptnode)
3. [Flutter/Dart](#flutterdart)
4. [Python](#python)

---

## cURL/Bash

### 1. Autenticación

#### Registrarse

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@cooperativa.com",
    "password": "SecurePass123!",
    "name": "Carlos",
    "lastname": "Mendez"
  }'
```

#### Hacer Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@cooperativa.com",
    "password": "SecurePass123!"
  }'
```

**Guardar token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Gestión de Cámaras

#### Crear Cámara

```bash
curl -X POST http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cámara Bóveda",
    "location": "Bóveda - Piso 2",
    "ip": "192.168.1.15",
    "streamUrl": "rtsp://192.168.1.15/live"
  }'
```

#### Listar Cámaras

```bash
curl -X GET http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer $TOKEN"
```

#### Obtener Cámara por ID

```bash
CAMERA_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET http://localhost:3000/api/v1/cameras/$CAMERA_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### Cambiar Estado de Cámara

```bash
curl -X PATCH http://localhost:3000/api/v1/cameras/$CAMERA_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ERROR"}'
```

### 3. Crear Eventos (desde IA)

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cameraId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "persona_detectada",
    "description": "Persona con comportamiento sospechoso",
    "location": "Entrada principal",
    "imageUrl": "https://cdn.example.com/frame-2026-05-08-10-30-45.jpg",
    "confidence": 0.93,
    "priority": "ALTA",
    "aiMetadata": {
      "model": "YOLOv8n",
      "timestamp": "2026-05-08T10:30:45Z",
      "detections": [
        {
          "class": "person",
          "confidence": 0.93,
          "bbox": [100, 200, 300, 400]
        }
      ]
    }
  }'
```

### 4. Gestión de Eventos

#### Obtener Eventos Pendientes

```bash
curl -X GET http://localhost:3000/api/v1/events/pending \
  -H "Authorization: Bearer $TOKEN"
```

#### Filtrar Eventos

```bash
# Por cámara
curl -X GET "http://localhost:3000/api/v1/events?cameraId=$CAMERA_ID" \
  -H "Authorization: Bearer $TOKEN"

# Por estado
curl -X GET "http://localhost:3000/api/v1/events?status=PENDIENTE" \
  -H "Authorization: Bearer $TOKEN"

# Por prioridad
curl -X GET "http://localhost:3000/api/v1/events?priority=CRITICA" \
  -H "Authorization: Bearer $TOKEN"
```

#### Actualizar Evento (Marcar como Revisado)

```bash
EVENT_ID="550e8400-e29b-41d4-a716-446655440000"
USER_ID="550e8400-e29b-41d4-a716-446655440001"

curl -X PATCH http://localhost:3000/api/v1/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"REVISADO\",
    \"reviewedBy\": \"$USER_ID\",
    \"priority\": \"ALTA\"
  }"
```

### 5. Gestión de Alertas

#### Crear Alerta

```bash
curl -X POST http://localhost:3000/api/v1/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"message\": \"Actividad sospechosa detectada en bóveda - Requiere revisión inmediata\",
    \"priority\": \"CRITICA\"
  }"
```

#### Obtener Alertas Críticas (últimas 24h)

```bash
curl -X GET http://localhost:3000/api/v1/alerts/critical \
  -H "Authorization: Bearer $TOKEN"
```

---

## JavaScript/Node.js

### Configuración Básica

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';
let token = null;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Autenticación

```javascript
async function register(email, password, name, lastname) {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      lastname,
    });
    token = response.data.accessToken;
    return response.data.user;
  } catch (error) {
    console.error('Error en registro:', error.response?.data);
  }
}

async function login(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    token = response.data.accessToken;
    return response.data.user;
  } catch (error) {
    console.error('Error en login:', error.response?.data);
  }
}

async function getProfile() {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error.response?.data);
  }
}
```

### Gestión de Cámaras

```javascript
async function createCamera(name, location, ip, streamUrl) {
  const response = await api.post('/cameras', {
    name,
    location,
    ip,
    streamUrl,
  });
  return response.data;
}

async function getCameras() {
  const response = await api.get('/cameras');
  return response.data;
}

async function getCameraById(id) {
  const response = await api.get(`/cameras/${id}`);
  return response.data;
}

async function updateCameraStatus(id, status) {
  const response = await api.patch(`/cameras/${id}/status`, {
    status,
  });
  return response.data;
}
```

### Eventos de IA

```javascript
async function createEvent(cameraId, type, description, location, imageUrl, confidence, aiMetadata) {
  const response = await api.post('/events', {
    cameraId,
    type,
    description,
    location,
    imageUrl,
    confidence,
    priority: confidence > 0.8 ? 'ALTA' : 'MEDIA',
    aiMetadata,
  });
  return response.data;
}

async function getPendingEvents() {
  const response = await api.get('/events/pending');
  return response.data;
}

async function getEventsByCamera(cameraId) {
  const response = await api.get(`/events/camera/${cameraId}`);
  return response.data;
}

async function updateEventStatus(eventId, status, reviewedBy) {
  const response = await api.patch(`/events/${eventId}`, {
    status,
    reviewedBy,
  });
  return response.data;
}
```

### WebSocket - Tiempo Real

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  path: '/events',
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('✅ Conectado a WebSocket');
});

socket.on('new-event', (event) => {
  console.log('🆕 Nuevo evento:', event);
  // event: { id, cameraId, type, priority, description, emittedAt }
  
  // Aquí puedes:
  // - Actualizar interfaz gráfica
  // - Reproducir sonido de notificación
  // - Enviar notificación push
  // - Registrar en log
});

socket.on('event-updated', (event) => {
  console.log('✏️ Evento actualizado:', event);
  // event: { id, status, reviewedBy, emittedAt }
});

socket.on('camera-status', (data) => {
  console.log('📷 Estado de cámara:', data);
  // data: { cameraId, status, timestamp }
});

socket.on('alert-triggered', (alert) => {
  console.log('🚨 ALERTA CRÍTICA:', alert);
  // alert: { id, message, priority, eventId, emittedAt }
  
  // Acciones inmediatas para alertas críticas:
  if (alert.priority === 'CRITICA') {
    // - Notificación sonora urgente
    // - Pantalla de alerta roja
    // - Notificación al operador
  }
});

socket.on('system-status', (status) => {
  console.log('📊 Estado del sistema:', status);
  // status: {
  //   events: { total, pending, byStatus, byPriority },
  //   alerts: { total, critical24h, byPriority },
  //   cameras: { total, byStatus },
  //   connectedClients: number
  // }
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado de WebSocket');
});

// Solicitar estado
socket.emit('get-status');

// Mantener vivo con ping
setInterval(() => {
  socket.emit('ping');
}, 30000);
```

### Ejemplo Completo: Dashboard

```javascript
async function initializeDashboard() {
  try {
    // 1. Autenticarse
    const user = await login('operador@cooperativa.com', 'SecurePass123!');
    console.log('Bienvenido:', user.name);

    // 2. Obtener datos iniciales
    const cameras = await getCameras();
    const pendingEvents = await getPendingEvents();
    const alerts = await getAlerts();

    // 3. Actualizar UI
    displayCameras(cameras);
    displayEvents(pendingEvents);
    displayAlerts(alerts);

    // 4. Conectar WebSocket para actualizaciones en tiempo real
    socket.on('new-event', (event) => {
      addEventToUI(event);
      if (event.priority === 'CRITICA') {
        showCriticalAlert(event);
      }
    });

    socket.on('camera-status', (data) => {
      updateCameraStatusUI(data.cameraId, data.status);
    });

    // 5. Obtener estadísticas cada minuto
    setInterval(async () => {
      const eventStats = await getEventStats();
      updateStatsUI(eventStats);
    }, 60000);
  } catch (error) {
    console.error('Error inicializando dashboard:', error);
  }
}

initializeDashboard();
```

---

## Flutter/Dart

### Dependencias (pubspec.yaml)

```yaml
dependencies:
  socket_io_client: ^2.0.1
  http: ^1.1.0
  dio: ^5.3.0
```

### Cliente HTTP

```dart
import 'package:dio/dio.dart';

class IASClient {
  final Dio _dio;
  String? _token;

  IASClient() : _dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:3000/api/v1',
      contentType: Headers.jsonContentType,
    ),
  );

  void setToken(String token) {
    _token = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  Future<dynamic> register(String email, String password, String name, String lastname) async {
    final response = await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
      'lastname': lastname,
    });
    _token = response.data['accessToken'];
    return response.data['user'];
  }

  Future<dynamic> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    _token = response.data['accessToken'];
    return response.data['user'];
  }

  Future<List<dynamic>> getCameras() async {
    final response = await _dio.get('/cameras');
    return response.data;
  }

  Future<dynamic> createEvent({
    required String cameraId,
    required String type,
    required String description,
    required String location,
    String? imageUrl,
    double? confidence,
    String priority = 'MEDIA',
    Map<String, dynamic>? aiMetadata,
  }) async {
    final response = await _dio.post('/events', data: {
      'cameraId': cameraId,
      'type': type,
      'description': description,
      'location': location,
      'imageUrl': imageUrl,
      'confidence': confidence,
      'priority': priority,
      'aiMetadata': aiMetadata,
    });
    return response.data;
  }
}
```

### WebSocket

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class IASWebSocket {
  late IO.Socket socket;
  final ValueNotifier<bool> isConnected = ValueNotifier(false);
  final StreamController<Map<String, dynamic>> eventStream = 
    StreamController.broadcast();

  void connect() {
    socket = IO.io('http://localhost:3000', IO.OptionBuilder()
      .setTransports(['websocket'])
      .setPath('/events')
      .enableAutoConnect()
      .build());

    socket.on('connect', (_) {
      print('✅ Conectado a WebSocket');
      isConnected.value = true;
    });

    socket.on('new-event', (data) {
      print('🆕 Nuevo evento: $data');
      eventStream.add({'type': 'new-event', 'data': data});
    });

    socket.on('event-updated', (data) {
      print('✏️ Evento actualizado: $data');
      eventStream.add({'type': 'event-updated', 'data': data});
    });

    socket.on('camera-status', (data) {
      print('📷 Estado cámara: $data');
      eventStream.add({'type': 'camera-status', 'data': data});
    });

    socket.on('alert-triggered', (data) {
      print('🚨 ALERTA: $data');
      eventStream.add({'type': 'alert-triggered', 'data': data});
    });

    socket.on('disconnect', (_) {
      print('❌ Desconectado');
      isConnected.value = false;
    });
  }

  void requestSystemStatus() {
    socket.emit('get-status');
  }

  void disconnect() {
    socket.disconnect();
  }
}
```

### Widget de Eventos

```dart
class EventsPage extends StatefulWidget {
  @override
  _EventsPageState createState() => _EventsPageState();
}

class _EventsPageState extends State<EventsPage> {
  final iasSocket = IASWebSocket();
  final events = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    iasSocket.connect();
    iasSocket.eventStream.stream.listen((event) {
      setState(() {
        if (event['type'] == 'new-event') {
          events.insert(0, event['data']);
          _showNotification(event['data']);
        }
      });
    });
  }

  void _showNotification(Map<String, dynamic> event) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${event['type']}: ${event['description']}'),
        backgroundColor: event['priority'] == 'CRITICA' ? Colors.red : Colors.orange,
        duration: Duration(seconds: 5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Eventos en Vivo'),
        actions: [
          ValueListenableBuilder<bool>(
            valueListenable: iasSocket.isConnected,
            builder: (context, isConnected, _) {
              return Padding(
                padding: EdgeInsets.all(16),
                child: Center(
                  child: CircleAvatar(
                    backgroundColor: isConnected ? Colors.green : Colors.grey,
                    radius: 8,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: events.length,
        itemBuilder: (context, index) {
          final event = events[index];
          return EventCard(event: event);
        },
      ),
    );
  }

  @override
  void dispose() {
    iasSocket.disconnect();
    super.dispose();
  }
}
```

---

## Python

### Instalación

```bash
pip install requests websocket-client python-socketio python-engineio
```

### Cliente

```python
import requests
import json
from socketio import Client

class IASClient:
    def __init__(self, base_url='http://localhost:3000/api/v1'):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()

    def register(self, email, password, name, lastname):
        """Registrar nuevo usuario"""
        response = self.session.post(
            f'{self.base_url}/auth/register',
            json={
                'email': email,
                'password': password,
                'name': name,
                'lastname': lastname,
            }
        )
        if response.status_code == 201:
            data = response.json()
            self.token = data['accessToken']
            self.session.headers['Authorization'] = f'Bearer {self.token}'
            return data['user']
        raise Exception(f'Error: {response.text}')

    def login(self, email, password):
        """Login"""
        response = self.session.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data['accessToken']
            self.session.headers['Authorization'] = f'Bearer {self.token}'
            return data['user']
        raise Exception(f'Error: {response.text}')

    def get_cameras(self):
        """Obtener todas las cámaras"""
        response = self.session.get(f'{self.base_url}/cameras')
        return response.json()

    def create_event(self, camera_id, event_type, description, location, 
                     image_url=None, confidence=None, priority='MEDIA', ai_metadata=None):
        """Crear evento (desde sistema IA)"""
        payload = {
            'cameraId': camera_id,
            'type': event_type,
            'description': description,
            'location': location,
            'priority': priority,
        }
        if image_url:
            payload['imageUrl'] = image_url
        if confidence is not None:
            payload['confidence'] = confidence
        if ai_metadata:
            payload['aiMetadata'] = ai_metadata

        response = self.session.post(
            f'{self.base_url}/events',
            json=payload
        )
        return response.json()

    def get_pending_events(self):
        """Obtener eventos pendientes"""
        response = self.session.get(f'{self.base_url}/events/pending')
        return response.json()

    def update_event(self, event_id, status, reviewed_by=None, priority=None):
        """Actualizar estado de evento"""
        payload = {'status': status}
        if reviewed_by:
            payload['reviewedBy'] = reviewed_by
        if priority:
            payload['priority'] = priority

        response = self.session.patch(
            f'{self.base_url}/events/{event_id}',
            json=payload
        )
        return response.json()


class IASWebSocketClient:
    def __init__(self, url='http://localhost:3000'):
        self.sio = Client()
        self.url = url
        self._setup_handlers()

    def _setup_handlers(self):
        @self.sio.on('connect')
        def on_connect():
            print('✅ Conectado a WebSocket')

        @self.sio.on('new-event')
        def on_new_event(data):
            print(f'🆕 Nuevo evento: {data}')
            self.handle_new_event(data)

        @self.sio.on('event-updated')
        def on_event_updated(data):
            print(f'✏️ Evento actualizado: {data}')

        @self.sio.on('alert-triggered')
        def on_alert_triggered(data):
            print(f'🚨 ALERTA: {data}')
            self.handle_alert(data)

        @self.sio.on('disconnect')
        def on_disconnect():
            print('❌ Desconectado')

    def connect(self):
        """Conectar a WebSocket"""
        self.sio.connect(self.url, socketio_path='/events/socket.io/')

    def disconnect(self):
        """Desconectar"""
        self.sio.disconnect()

    def request_status(self):
        """Solicitar estado del sistema"""
        self.sio.emit('get-status')

    def handle_new_event(self, event):
        """Callback al recibir nuevo evento"""
        print(f"Manejando evento: {event['type']}")

    def handle_alert(self, alert):
        """Callback al recibir alerta"""
        if alert['priority'] == 'CRITICA':
            print("🚨🚨🚨 ALERTA CRÍTICA - ACCIÓN INMEDIATA REQUERIDA")


# Ejemplo de uso
if __name__ == '__main__':
    # Cliente HTTP
    client = IASClient()
    
    # Login
    user = client.login('operador@cooperativa.com', 'SecurePass123!')
    print(f'Bienvenido: {user["name"]}')

    # Obtener cámaras
    cameras = client.get_cameras()
    print(f'Cámaras: {len(cameras)}')

    # Crear evento simulado
    if cameras:
        event = client.create_event(
            camera_id=cameras[0]['id'],
            event_type='persona_detectada',
            description='Persona en entrada',
            location='Entrada principal',
            confidence=0.92,
            priority='ALTA'
        )
        print(f'Evento creado: {event["id"]}')

    # WebSocket
    ws_client = IASWebSocketClient()
    ws_client.connect()
    ws_client.request_status()

    # Esperar eventos
    try:
        import time
        time.sleep(60)
    except KeyboardInterrupt:
        ws_client.disconnect()
```

---

## 📝 Notas Importantes

1. **Reemplaza valores ficticios**: Los ejemplos usan datos de prueba (IPs, emails, etc.)
2. **Guarda tokens**: Mantén los JWT en almacenamiento seguro
3. **Reintentos**: Implementa lógica de reintentos para fallos de red
4. **Errores**: Maneja siempre excepciones y errores HTTP
5. **Notificaciones**: Las alertas críticas deben notificar inmediatamente

---

Última actualización: 2026-05-08
