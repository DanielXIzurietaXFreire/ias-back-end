# 📋 GUÍA DE INSTALACIÓN Y CONFIGURACIÓN - IAS Backend

## 🚀 Inicio Rápido (5 minutos)

### Requisitos Previos

- **Node.js**: v18+ (descargar desde https://nodejs.org)
- **npm**: v9+ (incluido con Node.js)
- **PostgreSQL**: v14+ local o en Supabase
- **Git**: para clonar repositorio

### Paso 1: Verificar Node.js

```bash
node --version    # Debe ser v18 o superior
npm --version     # Debe ser v9 o superior
```

### Paso 2: Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd Back-end

# Instalar todas las dependencias
npm install

# Esto puede tomar 2-3 minutos la primera vez
```

### Paso 3: Configurar Variables de Entorno

```bash
# Ya existe .env con valores por defecto
# Para Supabase, actualizar DATABASE_URL:

# Opción A: Usar PostgreSQL local (Docker Compose)
# Ver sección "Docker Compose" abajo

# Opción B: Usar Supabase
# 1. Ir a https://supabase.com y crear proyecto
# 2. Copiar CONNECTION STRING
# 3. Actualizar en .env:
#    DATABASE_URL=postgresql://usuario:contraseña@host:5432/base_datos
```

### Paso 4: Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones (crea tablas)
npm run prisma:migrate

# (Opcional) Llenar con datos de prueba
npm run prisma:seed
```

### Paso 5: Ejecutar el Servidor

```bash
# Modo desarrollo (con hot reload)
npm run start:dev

# Verás algo como:
# ✅ Base de datos conectada exitosamente
# 🚀 Servidor ejecutándose en puerto: 3000
# 📚 Documentación: http://localhost:3000/api/docs
# 🔌 WebSocket: ws://localhost:3000/events
```

### ¡Listo! 🎉

El servidor está corriendo en `http://localhost:3000`

---

## 🐳 Opción: Docker Compose (Base de Datos)

Si quieres usar PostgreSQL en Docker sin Supabase:

```bash
# Crear y ejecutar contenedores
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Ver logs
docker-compose logs -f postgres
```

Luego actualizar `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ias_db
```

Para detener:
```bash
docker-compose down
```

---

## 🔐 Pruebas de Autenticación

### Registrar Nuevo Usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@cooperativa.com",
    "password": "SecurePass123!",
    "name": "Juan",
    "lastname": "Pérez"
  }'
```

**Respuesta (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "operador@cooperativa.com",
    "name": "Juan",
    "lastname": "Pérez",
    "role": "usuario"
  }
}
```

### Hacer Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@cooperativa.com",
    "password": "SecurePass123!"
  }'
```

Guardar el `accessToken` para usar en requests posteriores.

---

## 📡 Endpoints Principales

### 🔓 Sin Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Login

### 🔐 Con JWT (Bearer Token)

Incluir en header:
```
Authorization: Bearer <tu-token-jwt>
```

#### Users
- `GET /api/v1/users` - Obtener todos los usuarios
- `GET /api/v1/users/:id` - Obtener usuario por ID
- `PATCH /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario

#### Cameras
- `POST /api/v1/cameras` - Crear cámara
- `GET /api/v1/cameras` - Listar cámaras
- `GET /api/v1/cameras/:id` - Obtener cámara
- `PATCH /api/v1/cameras/:id` - Actualizar cámara
- `DELETE /api/v1/cameras/:id` - Eliminar cámara

#### Events
- `POST /api/v1/events` - Crear evento (desde IA)
- `GET /api/v1/events` - Listar eventos
- `GET /api/v1/events/pending` - Eventos pendientes
- `GET /api/v1/events/:id` - Obtener evento
- `PATCH /api/v1/events/:id` - Actualizar estado
- `DELETE /api/v1/events/:id` - Eliminar evento

#### Alerts
- `POST /api/v1/alerts` - Crear alerta
- `GET /api/v1/alerts` - Listar alertas
- `GET /api/v1/alerts/critical` - Alertas críticas (24h)
- `DELETE /api/v1/alerts/:id` - Eliminar alerta

---

## 🔌 WebSocket - Tiempo Real

### Conectarse desde JavaScript/Flutter

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/events', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Eventos recibidos
socket.on('connect', () => {
  console.log('✅ Conectado');
});

socket.on('new-event', (data) => {
  console.log('Nuevo evento:', data);
  // { id, cameraId, type, priority, emittedAt }
});

socket.on('event-updated', (data) => {
  console.log('Evento actualizado:', data);
  // { id, status, reviewedBy, emittedAt }
});

socket.on('camera-status', (data) => {
  console.log('Estado cámara:', data);
  // { cameraId, status, timestamp }
});

socket.on('alert-triggered', (data) => {
  console.log('ALERTA:', data);
  // { id, message, priority, emittedAt }
});

socket.on('system-status', (data) => {
  console.log('Estado del sistema:', data);
  // { events, alerts, cameras, connectedClients }
});

// Solicitar estado del sistema
socket.emit('get-status');

// Ping para mantener conexión viva
socket.emit('ping');
```

### Ejemplo Flutter

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io(
  'http://localhost:3000',
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .setPath('/events')
    .enableAutoConnect()
    .build(),
);

socket.on('new-event', (data) {
  print('Nuevo evento: $data');
});

socket.on('alert-triggered', (data) {
  print('¡ALERTA!: ${data['message']}');
  // Mostrar notificación
});

socket.emit('get-status');
```

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests en watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 📊 Prisma Studio (Explorar BD)

Herramienta visual para ver y editar datos:

```bash
npm run prisma:studio

# Abre http://localhost:5555
```

---

## 🚨 Troubleshooting

### Error: "Cannot connect to database"

```bash
# 1. Verificar DATABASE_URL en .env
echo $DATABASE_URL

# 2. Verificar conexión de prueba
npx ts-node src/database/test-connection.ts

# 3. Si usan Docker Compose
docker-compose logs postgres

# 4. Ver si PostgreSQL está corriendo
sudo systemctl status postgresql  # Linux
brew services list               # macOS
```

### Error: "Port 3000 already in use"

```bash
# Cambiar puerto en .env
APP_PORT=3001

# O matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error: "Migration failed"

```bash
# Resetear base de datos (⚠️ BORRA DATOS)
npx prisma migrate reset

# Aplicar migraciones manualmente
npm run prisma:push
```

### Error: "Module not found"

```bash
# Regenerar cliente Prisma
npm run prisma:generate

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Ejemplo Completo: Crear Evento desde IA

```bash
# 1. Obtener token (login)
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cooperativa.com","password":"Admin123!"}' \
  | jq -r '.accessToken')

# 2. Obtener ID de cámara
CAMERA_ID=$(curl -s -X GET http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[0].id')

# 3. Crear evento con datos de IA
curl -X POST http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"cameraId\": \"$CAMERA_ID\",
    \"type\": \"persona_detectada\",
    \"description\": \"Persona sospechosa en entrada\",
    \"location\": \"Entrada principal\",
    \"imageUrl\": \"https://cdn.example.com/frame.jpg\",
    \"confidence\": 0.95,
    \"priority\": \"ALTA\",
    \"aiMetadata\": {
      \"model\": \"YOLOv8\",
      \"detections\": [{\"class\": \"person\", \"confidence\": 0.95}]
    }
  }"
```

**Resultado:**
1. Evento se crea en BD
2. Socket.IO emite `new-event` a todos los clientes
3. Operadores reciben notificación en tiempo real
4. Dashboard actualiza automáticamente

---

## 🚀 Despliegue en Railway

### 1. Preparar repositorio

```bash
git init
git add .
git commit -m "Initial IAS Backend commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/ias-backend.git
git push -u origin main
```

### 2. Conectar con Railway

1. Ir a https://railway.app
2. Click en "New Project"
3. "Deploy from GitHub"
4. Seleccionar repositorio `ias-backend`
5. Railway detectará `Dockerfile` automáticamente

### 3. Configurar Variables de Entorno

En Railway dashboard:

```
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secret-muy-seguro-cambiar
NODE_ENV=production
```

### 4. Deploy

Railway desplegará automáticamente cuando hagas push a `main`

```bash
# Para desplegar cambios
git push origin main
```

---

## 📚 Documentación API

Swagger disponible en: `http://localhost:3000/api/docs`

Características:
- Documentación interactiva
- Prueba endpoints directamente
- Esquemas de request/response
- Autenticación JWT integrada

---

## 🔒 Seguridad en Producción

✅ **Implementado:**
- JWT con expiración
- Bcrypt para contraseñas
- CORS restrictivo
- Helmet para headers seguros
- Validación de input

⚠️ **Hacer antes de producción:**
1. Cambiar `JWT_SECRET` a valor muy fuerte
2. Usar HTTPS/TLS
3. Implementar rate limiting
4. Monitorear logs de seguridad
5. Backups automáticos de BD
6. Usar WAF (Web Application Firewall)
7. Auditar permisos de base de datos

---

## 📞 Soporte

Para problemas:
1. Verificar logs: `docker-compose logs`
2. Consultar README.md
3. Revisar código en `src/` con comentarios detallados
4. Abrir issue en GitHub

---

**Última actualización**: 2026-05-08  
**Versión**: 1.0.0  
**Estado**: Ready for Development
