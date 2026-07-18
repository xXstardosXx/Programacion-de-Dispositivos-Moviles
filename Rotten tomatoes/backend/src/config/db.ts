import { PrismaClient } from '@prisma/client';

// Cliente único de Prisma reutilizado en toda la app (evita agotar el pool de Neon).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

let connected = false;

export const connectDB = async (): Promise<void> => {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      // Ping real: confirma que el compute de Neon ya despertó.
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      console.log('PostgreSQL (Neon) conectado correctamente');
      return;
    } catch (error) {
      lastError = error;
      connected = false;
      if (attempt < maxAttempts) {
        console.warn(
          `Neon no respondió (intento ${attempt}/${maxAttempts}). Reintentando en 3s (compute despertando)...`
        );
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  throw lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      // Ping real: confirma que el compute de Neon ya despertó.
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      console.log('PostgreSQL (Neon) conectado correctamente');
      return;
    } catch (error) {
      lastError = error;
      connected = false;
      if (attempt < maxAttempts) {
        console.warn(
          `Neon no respondió (intento ${attempt}/${maxAttempts}). Reintentando en 3s (compute despertando)...`
        );
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  throw lastError;
};

export const isDbConnected = (): boolean => connected;
