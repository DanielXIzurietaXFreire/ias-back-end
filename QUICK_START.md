# ⚡ QUICK START - IAS Backend

## 5 Pasos para Ejecutar en 5 Minutos

### 1️⃣ Instalar Dependencias
```bash
npm install
```

### 2️⃣ Configurar Base de Datos

**Opción A: PostgreSQL Local (Docker)**
```bash
docker-compose up -d
```

**Opción B: Supabase**
- Ir a https://supabase.com
- Crear proyecto
- Copiar `Connection String` a `.env`

### 3️⃣ Configurar Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4️⃣ Ejecutar Servidor
```bash
npm run start:dev
```

### 5️⃣ Acceder a la API
- **Swagger Docs**: http://localhost:3000/api/docs
- **API Base**: http://localhost:3000/api/v1
- **WebSocket**: ws://localhost:3000/events

---

## 🧪 Probar Autenticación (30 segundos)

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cooperativa.com","password":"Admin123!"}'

# Copiar token de respuesta y guardarlo en:
TOKEN="<paste-token-here>"

# Obtener perfil
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Documentación

- **README.md** - Descripción general del proyecto
- **INSTALLATION.md** - Guía detallada de instalación
- **ARCHITECTURE.md** - Descripción técnica de la arquitectura
- **EXAMPLES.md** - Ejemplos de uso en múltiples lenguajes
- **QUICK_START.md** - Este archivo

---

## 🎯 Próximos Pasos

1. **Explorar endpoints** en http://localhost:3000/api/docs
2. **Crear una cámara** para pruebas
3. **Conectar cliente WebSocket** para eventos en tiempo real
4. **Crear eventos** desde tu sistema IA
5. **Desplegar** en Railway cuando esté listo

---

## 🆘 Si Algo Falla

```bash
# Probar conexión a BD
npx ts-node src/database/test-connection.ts

# Ver logs
docker-compose logs -f

# Reinstalar todo
rm -rf node_modules && npm install

# Resetear BD (⚠️ borra datos)
npx prisma migrate reset
```

---

## 🎉 ¡Listo!

```
✅ Backend corriendo en puerto 3000
✅ Base de datos conectada
✅ WebSocket activo
✅ API Docs disponible
✅ JWT funcionando
```

**¡A codificar!** 🚀

---

Ver `INSTALLATION.md` para configuración detallada.
