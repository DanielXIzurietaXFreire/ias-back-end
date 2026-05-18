# 🏗️ ARQUITECTURA DEL PROYECTO IAS BACKEND

## 📊 Visión General

IAS Backend es un sistema de videovigilancia inteligente construido con **NestJS**, siguiendo principios de arquitectura limpia y modular. El sistema integra inteligencia artificial (YOLOv8) con monitoreo en tiempo real via WebSockets.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (FLUTTER/WEB)                     │
│                  (Monitoreo en Tiempo Real)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    REST API            WebSocket (Socket.IO)
    (HTTP)              (Bidireccional)
        │                     │
└──────────┴──────────────────┴──────────────────────────────┐
│                                                             │
│              NestJS Application Layer                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  CONTROLLERS (APIs REST + WebSocket)                │ │
│  │  ├─ auth.controller.ts      (Login/Register)       │ │
│  │  ├─ users.controller.ts     (Gestión usuarios)     │ │
│  │  ├─ cameras.controller.ts   (Gestión cámaras)      │ │
│  │  ├─ events.controller.ts    (Eventos de IA)        │ │
│  │  └─ alerts.controller.ts    (Alertas)              │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  SERVICES (Lógica de Negocio)                        │ │
│  │  ├─ auth.service.ts        (JWT, Bcrypt)            │ │
│  │  ├─ users.service.ts       (CRUD usuarios)          │ │
│  │  ├─ cameras.service.ts     (CRUD cámaras)           │ │
│  │  ├─ events.service.ts      (Procesamiento eventos)  │ │
│  │  └─ alerts.service.ts      (Lógica alertas)         │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  GATEWAY (WebSocket en Tiempo Real)                  │ │
│  │  ├─ events.gateway.ts (Emisión de eventos)          │ │
│  │  ├─ Emite: new-event, event-updated                 │ │
│  │  ├─ Emite: camera-status, alert-triggered           │ │
│  │  └─ Soporte para 1000+ conexiones simultáneas        │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  DATABASE LAYER (Prisma ORM)                         │ │
│  │  ├─ prisma.service.ts      (Conexión BD)            │ │
│  │  └─ Schema: User, Camera, Event, Alert              │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────────┐
│                                                             │
│              PostgreSQL Database (Supabase)               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Tables:                                             │ │
│  │  ├─ users        (Autenticación y roles)            │ │
│  │  ├─ cameras      (Dispositivos de vigilancia)       │ │
│  │  ├─ events       (Eventos detectados por IA)        │ │
│  │  └─ alerts       (Alertas generadas)                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estructura de Carpetas

```
src/
├── modules/                          # Módulos de negocio
│   ├── auth/
│   │   ├── dto/
│   │   │   └── index.ts             # DTOs de Auth
│   │   ├── auth.service.ts          # Lógica JWT, Bcrypt
│   │   ├── auth.controller.ts       # Endpoints /auth
│   │   ├── jwt.strategy.ts          # Estrategia Passport JWT
│   │   ├── jwt-auth.guard.ts        # Guard para rutas protegidas
│   │   └── auth.module.ts           # Módulo Auth
│   │
│   ├── users/
│   │   ├── dto/
│   │   ├── users.service.ts         # CRUD de usuarios
│   │   ├── users.controller.ts      # Endpoints /users
│   │   └── users.module.ts
│   │
│   ├── cameras/
│   │   ├── dto/
│   │   ├── cameras.service.ts       # Gestión de cámaras
│   │   ├── cameras.controller.ts    # Endpoints /cameras
│   │   └── cameras.module.ts
│   │
│   ├── events/
│   │   ├── dto/
│   │   ├── events.service.ts        # Procesamiento de eventos IA
│   │   ├── events.controller.ts     # Endpoints /events
│   │   └── events.module.ts
│   │
│   └── alerts/
│       ├── dto/
│       ├── alerts.service.ts        # Lógica de alertas
│       ├── alerts.controller.ts     # Endpoints /alerts
│       └── alerts.module.ts
│
├── gateways/                         # WebSocket
│   └── events.gateway.ts            # Emisión en tiempo real
│
├── common/                           # Utilidades compartidas
│   ├── decorators/                  # Decoradores personalizados
│   ├── filters/                     # Filtros de excepciones
│   ├── guards/                      # Guards personalizados
│   ├── interceptors/                # Interceptores globales
│   └── pipes/                       # Pipes personalizados
│
├── config/                           # Configuración
│   ├── environment.ts               # Variables de entorno
│   ├── swagger.config.ts            # Documentación
│   └── database.config.ts           # Configuración BD
│
├── database/                         # Capa de persistencia
│   ├── prisma.service.ts            # Servicio Prisma
│   └── seed.ts                      # Datos iniciales
│
├── app.module.ts                    # Módulo raíz
└── main.ts                          # Punto de entrada
```

---

## 🔄 Flujo de Datos

### 1. Autenticación JWT

```
Usuario
  ↓
[POST /auth/login]
  ↓
auth.controller → auth.service
  ↓
[Bcrypt: validar contraseña]
  ↓
[JWT.sign: generar token]
  ↓
Retorna: { accessToken, user }
  ↓
Cliente guarda token en localStorage
```

### 2. Crear Evento (desde sistema IA)

```
Sistema IA (YOLOv8)
  ↓
[POST /events]
  ↓
JwtAuthGuard (valida token)
  ↓
events.controller → events.service
  ↓
[Validar: cámara existe]
  ↓
[Prisma.event.create]
  ↓
EventsGateway.emitNewEvent()
  ↓
Socket.IO broadcast "new-event"
  ↓
Todos los clientes reciben en tiempo real
```

### 3. Cambiar Estado de Evento (operador)

```
Operador (Frontend)
  ↓
[PATCH /events/:id]
  ↓
JwtAuthGuard (valida token)
  ↓
events.controller → events.service
  ↓
[Prisma.event.update]
  ↓
EventsGateway.emitEventUpdated()
  ↓
Socket.IO broadcast "event-updated"
  ↓
Dashboard actualiza estado automáticamente
```

### 4. Crear Alerta

```
Sistema o Operador
  ↓
[POST /alerts]
  ↓
alerts.controller → alerts.service
  ↓
[Validar: evento existe]
  ↓
[Prisma.alert.create]
  ↓
Si priority === "CRITICA"
  ├─ EventsGateway.emitAlertTriggered()
  └─ Socket.IO broadcast "alert-triggered"
  ↓
Clientes muestran alerta urgente
```

---

## 🔐 Capas de Seguridad

### 1. **Validación de Entrada**
```typescript
// DTOs con class-validator
@IsEmail()
@MinLength(8)
@Matches(/regex/)
```

### 2. **Autenticación**
```typescript
JwtAuthGuard → Passport Strategy → Payload validado
```

### 3. **Encriptación de Contraseñas**
```typescript
await bcrypt.hash(password, 10)  // 2^10 = 1024 iteraciones
```

### 4. **CORS Restrictivo**
```typescript
origin: ['http://localhost:3000', 'http://localhost:8100']
```

### 5. **Helmet para Headers HTTP**
```typescript
app.use(helmet())  // Protege contra vulnerabilidades comunes
```

---

## 📡 Eventos WebSocket

### Tabla de Eventos

| Evento | Emitido Por | Datos | Uso |
|--------|------------|-------|-----|
| `new-event` | EventsService | `{ id, cameraId, type, priority, description, imageUrl, createdAt }` | Notificar nuevo evento detectado |
| `event-updated` | EventsService | `{ id, status, reviewedBy, reviewedAt }` | Actualizar estado en tiempo real |
| `camera-status` | CamerasService | `{ cameraId, status, timestamp }` | Cambio de estado cámara (ACTIVA/INACTIVA/ERROR) |
| `alert-triggered` | AlertsService | `{ id, eventId, message, priority, createdAt }` | Alertas críticas inmediatas |
| `system-status` | Gateway | `{ events, alerts, cameras, connectedClients }` | Estadísticas del sistema |

### Ejemplo: Recibir Evento en Tiempo Real

```typescript
socket.on('new-event', (event) => {
  console.log(`Evento ${event.type} en cámara ${event.cameraId}`);
  
  // Actualizar lista de eventos pendientes
  pendingEvents.push(event);
  
  // Si es crítico, mostrar alerta
  if (event.priority === 'CRITICA') {
    showCriticalAlert(event);
  }
});
```

---

## 🏛️ Principios de Arquitectura

### 1. **Modularidad**
- Cada dominio es un módulo independiente
- Fácil de testear y escalar
- Bajo acoplamiento

### 2. **Separación de Responsabilidades**
```
Controller → Maneja HTTP
Service    → Lógica de negocio
Gateway    → WebSocket
DTO        → Validación de entrada
```

### 3. **Inyección de Dependencias**
```typescript
constructor(
  private prisma: PrismaService,
  private auth: AuthService
) {}
```

### 4. **Configuración Centralizada**
```typescript
ConfigService.get('JWT_SECRET')
ConfigService.get('DATABASE_URL')
```

### 5. **Tipado Estricto (TypeScript)**
```typescript
async findOne(id: string): Promise<UserResponseDto>
```

---

## 🚀 Flujo de Despliegue

```
Código Local
  ↓
[npm install && npm run build]
  ↓
[docker build -t ias-backend:latest .]
  ↓
[git push origin main]
  ↓
GitHub (repositorio)
  ↓
Railway CI/CD
  ↓
[Deploy automático]
  ↓
Producción en railway.app
  ↓
HTTPS + Base de datos
```

---

## 📊 Escalabilidad

### Conexiones Simultáneas
- **HTTP**: Maneja 1000+ requests/segundo con Node.js
- **WebSocket**: 5000+ conexiones simultáneas (depende de memoria/CPU)

### Base de Datos
- **Índices**: Creados en columnas frecuentemente consultadas
- **Prisma**: Optimiza queries automáticamente
- **Connection Pooling**: Gestiona conexiones eficientemente

### Optimizaciones Implementadas
1. Índices en campos `cameraId`, `status`, `priority`, `createdAt`
2. Caché de configuración via `@nestjs/config`
3. Validación en cliente (DTOs) antes de guardar
4. Selección de campos específicos en queries Prisma

---

## 🔧 Tecnologías por Capa

### Backend
- **Framework**: NestJS (Express)
- **Lenguaje**: TypeScript
- **Validación**: class-validator
- **Seguridad**: Bcrypt, Helmet, Passport JWT
- **Documentación**: Swagger (OpenAPI)
- **WebSocket**: Socket.IO

### Base de Datos
- **DBMS**: PostgreSQL 14+
- **ORM**: Prisma
- **Host**: Supabase (o local)

### DevOps
- **Containerización**: Docker
- **Orquestación**: Docker Compose
- **CI/CD**: Railway
- **Control de versiones**: Git

---

## 🧪 Testing

### Capas de Test

```
Unit Tests
├─ auth.service.spec.ts
├─ users.service.spec.ts
├─ events.service.spec.ts
└─ alerts.service.spec.ts

Integration Tests
├─ auth.e2e.spec.ts
├─ events.e2e.spec.ts
└─ alerts.e2e.spec.ts

Performance Tests
└─ websocket.load.spec.ts
```

### Ejecutar Tests
```bash
npm run test          # Unit
npm run test:watch   # Watch mode
npm run test:cov     # Coverage
npm run test:e2e     # E2E
```

---

## 📈 Métricas de Rendimiento

### Benchmarks Esperados (desarrollo)

| Métrica | Valor | Condición |
|---------|-------|-----------|
| Latencia GET /cameras | <50ms | BD local |
| Latencia POST /events | <100ms | Con validación |
| Latencia WebSocket | <100ms | Emitir evento |
| Memoria Node | <200MB | Sin carga |
| Conexiones WS simultáneas | 5000+ | Depende de servidor |

---

## 🔒 Cumplimiento de Requerimientos

✅ **Cumplidos:**
- [x] NestJS con TypeScript
- [x] PostgreSQL (Supabase ready)
- [x] Prisma ORM
- [x] Socket.IO WebSockets
- [x] JWT Authentication
- [x] Arquitectura modular
- [x] Variables de entorno (@nestjs/config)
- [x] Validación (class-validator)
- [x] Swagger API Docs
- [x] Bcrypt para contraseñas
- [x] UUIDs para IDs
- [x] Railway-ready (Dockerfile)
- [x] Modelo Prisma completo
- [x] DTOs en todas las entidades
- [x] Services con lógica de negocio
- [x] Controllers con endpoints REST
- [x] Modules para cada dominio
- [x] Guards para protección JWT
- [x] WebSocket Gateway
- [x] Sistema de alertas
- [x] Documentación completa

---

## 📚 Referencias y Recursos

### NestJS Oficial
- Documentación: https://docs.nestjs.com
- WebSockets: https://docs.nestjs.com/websockets

### Prisma
- Documentación: https://www.prisma.io/docs
- Schema: https://www.prisma.io/docs/concepts/components/prisma-schema

### Seguridad
- OWASP: https://owasp.org/www-project-top-ten
- JWT Best Practices: https://tools.ietf.org/html/rfc7519

### Despliegue
- Railway: https://railway.app/docs
- Docker: https://docs.docker.com

---

**Versión**: 1.0.0  
**Última actualización**: 2026-05-08  
**Autor**: IAS Development Team  
**Estado**: Production-Ready Architecture ✅
