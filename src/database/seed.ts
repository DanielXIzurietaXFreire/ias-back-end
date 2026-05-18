import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script de seeding - Población inicial de la base de datos
 * 
 * Crea datos de ejemplo para desarrollo y pruebas.
 * Ejecutar con: npm run prisma:seed
 */
async function main() {
  console.log('🌱 Iniciando seeding de datos...');

  try {
    // Limpiar datos existentes (en orden inverso de dependencias)
    await prisma.alert.deleteMany({});
    console.log('  ✓ Alertas eliminadas');

    await prisma.event.deleteMany({});
    console.log('  ✓ Eventos eliminados');

    await prisma.camera.deleteMany({});
    console.log('  ✓ Cámaras eliminadas');

    await prisma.user.deleteMany({});
    console.log('  ✓ Usuarios eliminados');

    // Crear usuarios
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@cooperativa.com',
        password: hashedPassword,
        name: 'Juan',
        lastname: 'Administrador',
        role: 'SUPERADMIN',
      },
    });
    console.log(`  ✓ SuperAdmin creado: ${superAdmin.email}`);

    const operador = await prisma.user.create({
      data: {
        email: 'operador@cooperativa.com',
        password: hashedPassword,
        name: 'María',
        lastname: 'Operadora',
        role: 'USUARIO',
      },
    });
    console.log(`  ✓ Operador creado: ${operador.email}`);

    // Crear cámaras
    const camera1 = await prisma.camera.create({
      data: {
        name: 'Cámara Entrada Principal',
        location: 'Entrada frontal - Sucursal Centro',
        ip: '192.168.1.10',
        streamUrl: 'rtsp://192.168.1.10/live',
        status: 'ACTIVA',
      },
    });
    console.log(`  ✓ Cámara 1: ${camera1.name}`);

    const camera2 = await prisma.camera.create({
      data: {
        name: 'Cámara Caja de Seguridad',
        location: 'Bóveda - Piso 2',
        ip: '192.168.1.11',
        streamUrl: 'rtsp://192.168.1.11/live',
        status: 'ACTIVA',
      },
    });
    console.log(`  ✓ Cámara 2: ${camera2.name}`);

    const camera3 = await prisma.camera.create({
      data: {
        name: 'Cámara Zona ATM',
        location: 'Vestíbulo - ATM',
        ip: '192.168.1.12',
        streamUrl: 'rtsp://192.168.1.12/live',
        status: 'INACTIVA',
      },
    });
    console.log(`  ✓ Cámara 3: ${camera3.name}`);

    // Crear eventos
    const event1 = await prisma.event.create({
      data: {
        cameraId: camera1.id,
        type: 'persona_detectada',
        description: 'Persona entrando a la sucursal',
        location: 'Entrada frontal',
        imageUrl: 'https://cdn.example.com/event1.jpg',
        confidence: 0.92,
        priority: 'MEDIA',
        status: 'PENDIENTE',
        aiMetadata: {
          model: 'YOLOv8',
          timestamp: new Date().toISOString(),
          detections: [{ class: 'person', confidence: 0.92 }],
        },
      },
    });
    console.log(`  ✓ Evento 1 creado: ${event1.type}`);

    const event2 = await prisma.event.create({
      data: {
        cameraId: camera1.id,
        type: 'comportamiento_anormal',
        description: 'Actividad sospechosa detectada',
        location: 'Entrada frontal',
        imageUrl: 'https://cdn.example.com/event2.jpg',
        confidence: 0.87,
        priority: 'ALTA',
        status: 'REVISADO',
        reviewedBy: superAdmin.id,
        reviewedAt: new Date(),
      },
    });
    console.log(`  ✓ Evento 2 creado: ${event2.type}`);

    const event3 = await prisma.event.create({
      data: {
        cameraId: camera2.id,
        type: 'acceso_no_autorizado',
        description: 'Intento de acceso a bóveda fuera de horario',
        location: 'Bóveda - Piso 2',
        imageUrl: 'https://cdn.example.com/event3.jpg',
        confidence: 0.95,
        priority: 'CRITICA',
        status: 'REVISADO',
        reviewedBy: superAdmin.id,
        reviewedAt: new Date(),
      },
    });
    console.log(`  ✓ Evento 3 creado: ${event3.type}`);

    // Crear alertas
    const alert1 = await prisma.alert.create({
      data: {
        eventId: event2.id,
        message: 'Comportamiento anormal detectado en entrada principal - Requiere revisión',
        priority: 'ALTA',
      },
    });
    console.log(`  ✓ Alerta 1 creada`);

    const alert2 = await prisma.alert.create({
      data: {
        eventId: event3.id,
        message: 'ALERTA CRÍTICA: Intento de acceso no autorizado a bóveda',
        priority: 'CRITICA',
      },
    });
    console.log(`  ✓ Alerta 2 creada`);

    console.log('');
    console.log('✅ Seeding completado exitosamente');
    console.log('');
    console.log('📊 Datos creados:');
    console.log(`   - 2 usuarios (1 admin, 1 operador)`);
    console.log(`   - 3 cámaras`);
    console.log(`   - 3 eventos`);
    console.log(`   - 2 alertas`);
    console.log('');
    console.log('🔐 Credenciales de prueba:');
    console.log('   Email: admin@cooperativa.com');
    console.log('   Contraseña: Admin123!');
  } catch (e) {
    console.error('❌ Error durante seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
