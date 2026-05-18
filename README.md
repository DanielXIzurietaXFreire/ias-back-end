# IAS Backend - Intelligent AI Surveillance System

## 📋 Descripción del Proyecto

Sistema de videovigilancia inteligente para cooperativas financieras. Permite el monitoreo de cámaras, recepción de eventos generados por modelos IA (YOLOv8) y clasificación de incidentes en tiempo real.

## 🏗️ Stack Tecnológico

- **Framework**: NestJS 10.3.0
- **Lenguaje**: TypeScript 5.3.3
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.9.1
- **Autenticación**: JWT + Passport
- **Tiempo Real**: Socket.IO WebSockets
- **Validación**: Class-Validator + Class-Transformer
- **Documentación**: Swagger/OpenAPI
- **Seguridad**: Bcrypt, Helmet, CORS
- **Despliegue**: Docker + Railway Ready

## 📁 Estructura del Proyecto

```
src/
├── modules/                    # Módulos de negocio
│   ├── auth/                  # Autenticación y JWT
│   │   ├── dto/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── users/                 # Gestión de usuarios
│   │   ├── dto/
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── cameras/               # Gestión de cámaras
│   │   ├── dto/
│   │   ├── cameras.service.ts
│   │   ├── cameras.controller.ts
│   │   └── cameras.module.ts
│   ├── events/                # Eventos de vigilancia
│   │   ├── dto/
│   │   ├── events.service.ts
│   │   ├── events.controller.ts
│   │   └── events.module.ts
│   └── alerts/                # Alertas en tiempo real
│       ├── dto/
│       ├── alerts.service.ts
│       ├── alerts.controller.ts
│       └── alerts.module.ts
├── common/                     # Código compartido
│   ├── decorators/            # Decoradores personalizados
│   ├── filters/               # Filtros de excepciones
│   ├── guards/                # Guards personalizados
│   ├── interceptors/          # Interceptores globales
│   ├── pipes/                 # Pipes personalizados
│   └── utils/
├── config/                     # Configuración global
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── swagger.config.ts
│   └── environment.ts
├── database/                   # Prisma y migraciones
│   ├── prisma.service.ts
│   ├── seed.ts
│   └── schema.prisma
├── gateways/                   # WebSocket gateways
│   ├── events.gateway.ts
│   └── events.gateway.spec.ts
└── main.ts                     # Punto de entrada
```

## 🚀 Instalación y Configuración

### 1. Clonar y configurar el proyecto

```bash
# Navegar al directorio
cd Back-end

# Instalar dependencias
npm install

# Copiar archivo de ejemplo
cp .env.example .env
```

### 2. Configurar las variables de entorno

Editar `.env` con tus credenciales de Supabase:

```
DATABASE_URL=postgresql://usuario:contraseña@host:5432/ias_db
JWT_SECRET=tu-secreto-jwt-muy-seguro-cambiar-en-produccion
```

### 3. Configurar Prisma

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Seed de datos iniciales
npm run prisma:seed
```

### 4. Ejecutar el servidor

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de API

La documentación Swagger está disponible en:
- **URL**: `http://localhost:3000/api/docs`
- **JSON**: `http://localhost:3000/api/docs-json`

## 🔐 Autenticación

### Registro de usuario

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@cooperativa.com",
  "password": "SecurePassword123!",
  "name": "Juan",
  "lastname": "Pérez",
  "role": "usuario"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@cooperativa.com",
  "name": "Juan",
  "lastname": "Pérez",
  "role": "usuario",
  "createdAt": "2026-05-08T10:30:00Z"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@cooperativa.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@cooperativa.com",
    "name": "Juan",
    "role": "usuario"
  }
}
```

### Uso del token

Incluir en el header `Authorization`:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📡 WebSocket en Tiempo Real

### Conexión desde Flutter/Cliente

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io('http://localhost:3000', IO.OptionBuilder()
  .setTransports(['websocket'])
  .enableAutoConnect()
  .build());

socket.on('connect', (_) {
  print('Conectado al servidor');
});

socket.on('new-event', (data) {
  print('Nuevo evento: $data');
});

socket.on('event-updated', (data) {
  print('Evento actualizado: $data');
});

socket.on('camera-status', (data) {
  print('Estado de cámara: $data');
});
```

### Eventos Socket disponibles

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `new-event` | Nuevo evento de vigilancia | `{ eventId, cameraId, type, priority }` |
| `event-updated` | Cambio de estado del evento | `{ eventId, status, reviewedBy }` |
| `camera-status` | Cambio de estado de cámara | `{ cameraId, status }` |
| `alert-triggered` | Nueva alerta generada | `{ alertId, eventId, message, priority }` |

## 🔄 Flujo de Eventos

1. **Sistema de IA** envía evento POST `/api/v1/events`
2. **Backend** guarda en BD y emite `new-event` vía WebSocket
3. **Cliente** recibe evento en tiempo real
4. **Operador** actualiza estado del evento
5. **Backend** emite `event-updated` a todos los clientes conectados

## 📊 Modelo de Base de Datos

### Tabla USERS
```sql
- uid (UUID, PK)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- name (VARCHAR)
- lastname (VARCHAR)
- role (ENUM: superadmin | usuario)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Tabla CAMERAS
```sql
- cameraId (UUID, PK)
- name (VARCHAR)
- location (VARCHAR)
- ip (VARCHAR)
- streamUrl (VARCHAR)
- status (ENUM: activa | inactiva | error)
- createdAt (TIMESTAMP)
```

### Tabla EVENTS
```sql
- eventId (UUID, PK)
- cameraId (UUID, FK -> CAMERAS)
- type (VARCHAR)
- description (TEXT)
- location (VARCHAR)
- imageUrl (VARCHAR)
- priority (ENUM: baja | media | alta | crítica)
- status (ENUM: pendiente | revisado | resuelto)
- reviewedBy (UUID, FK -> USERS, nullable)
- reviewedAt (TIMESTAMP, nullable)
- createdAt (TIMESTAMP)
```

### Tabla ALERTS
```sql
- alertId (UUID, PK)
- eventId (UUID, FK -> EVENTS)
- message (TEXT)
- priority (ENUM: baja | media | alta | crítica)
- createdAt (TIMESTAMP)
```

## 🐳 Docker

### Ejecutar con Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

Esto inicia:
- PostgreSQL en puerto 5432
- Redis en puerto 6379

### Construir imagen Docker

```bash
docker build -t ias-backend:latest .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  ias-backend:latest
```

## 🚀 Despliegue en Railway

1. Conectar repositorio GitHub
2. Configurar variables de entorno en Railway
3. Asegurar que `Dockerfile` está en raíz
4. Railway detectará y desplegará automáticamente

Variables requeridas en Railway:
```
DATABASE_URL
JWT_SECRET
NODE_ENV=production
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📝 Logs y Monitoreo

El sistema registra:
- Autenticaciones fallidas
- Cambios de estado de eventos
- Errores de cámara
- Alertas críticas

Ver logs:
```bash
docker-compose logs -f ias_postgres
```

## 🔒 Seguridad

✅ **Implementado**:
- JWT con expiración configurable
- Bcrypt para hash de contraseñas (10 rondas)
- CORS restrictivo
- Rate limiting (preparado)
- Helmet para headers HTTP seguros
- Validación de entrada con class-validator
- HTTPS ready (usar reverse proxy)

**Recomendaciones de Producción**:
1. Usar variables de entorno secretas en hosting
2. Implementar rate limiting por IP
3. Usar HTTPS/TLS
4. Monitorear logs de seguridad
5. Hacer backups automáticos de BD
6. Usar WAF (Web Application Firewall)

## 🛠️ Troubleshooting

### Error de conexión a BD
```bash
# Verificar variable DATABASE_URL
echo $DATABASE_URL

# Reintentar migraciones
npm run prisma:migrate
```

### Puerto 3000 en uso
```bash
# Cambiar en .env
APP_PORT=3001
```

### Problemas con Prisma
```bash
# Regenerar cliente
npm run prisma:generate

# Resetear base de datos (⚠️ borra datos)
npx prisma migrate reset
```

## 📧 Soporte y Contacto

Para reportar bugs o sugerencias, crear un issue en el repositorio.

## 📄 Licencia

MIT - Ver LICENSE.md

---

**Versión**: 1.0.0  
**Última actualización**: 2026-05-08  
**Estado**: Beta - Lista para desarrollo
