import app from './app';
import { redis } from './config/redis';
import { prisma } from './config/database';
import { env } from './config/env';

const PORT = env.PORT;

const startServer = async () => {
  try {
    await prisma.$connect();
    await redis.ping();

    console.log('📦 Infraestructura conectada (PostgreSQL + Redis)');

    app.listen(PORT, () => {
      console.log(`
      🚀 Servidor corriendo en: http://localhost:${PORT}
      🛡️  Modo: ${env.NODE_ENV}
      `);
    });

    const shutdown = async () => {
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();