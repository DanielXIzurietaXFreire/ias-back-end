import { PrismaClient } from '@prisma/client';

/**
 * Script para probar conexión con la base de datos
 * Ejecutar con: npx ts-node src/database/test-connection.ts
 */
async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Probando conexión a base de datos...');

    // Intenta una consulta simple
    const userCount = await prisma.user.count();
    console.log(`✅ Conexión exitosa!`);
    console.log(`   Usuarios en BD: ${userCount}`);

    // Obtén información adicional
    const stats = {
      users: await prisma.user.count(),
      cameras: await prisma.camera.count(),
      events: await prisma.event.count(),
      alerts: await prisma.alert.count(),
    };

    console.log('\n📊 Estadísticas actuales:');
    console.log(`   Usuarios: ${stats.users}`);
    console.log(`   Cámaras: ${stats.cameras}`);
    console.log(`   Eventos: ${stats.events}`);
    console.log(`   Alertas: ${stats.alerts}`);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('');
    console.error('Verifica:');
    console.error('1. DATABASE_URL en .env está correcto');
    console.error('2. PostgreSQL está ejecutándose');
    console.error('3. La base de datos existe');
    console.error('4. Las credenciales son correctas');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
