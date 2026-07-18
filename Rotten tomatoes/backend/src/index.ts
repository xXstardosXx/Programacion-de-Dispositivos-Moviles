import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import net from 'net';
import os from 'os';
import dns from 'dns';
import { connectDB, isDbConnected } from './config/db';
import { isRawgConfigured } from './services/rawg';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import reviewRoutes from './routes/reviewRoutes';

dotenv.config();

// En Windows, Node a veces prioriza IPv6 y Prisma se cuelga con Neon.
// Forzar IPv4 primero evita P1001 / timeouts falsos.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  /* Node < 17 */
}

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 4001;
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const isProduction = process.env.NODE_ENV === 'production' || isRailway || isRender;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '6mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', api: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API de QuestScore (videojuegos) funcionando',
    db: isDbConnected() ? 'connected' : 'disconnected',
    rawg: isRawgConfigured() ? 'configured' : 'missing',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const getLocalIp = (): string | null => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface ?? []) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return null;
};

const findAvailablePort = (startPort: number, maxAttempts = 10): Promise<number> =>
  new Promise((resolve, reject) => {
    const tryPort = (port: number, attemptsLeft: number) => {
      const tester = net.createServer();
      tester.once('error', (err: NodeJS.ErrnoException) => {
        tester.close();
        if (err.code === 'EADDRINUSE' && attemptsLeft > 1) {
          console.warn(`Puerto ${port} en uso, probando ${port + 1}...`);
          tryPort(port + 1, attemptsLeft - 1);
          return;
        }
        reject(err);
      });
      tester.once('listening', () => {
        tester.close(() => resolve(port));
      });
      tester.listen(port, '0.0.0.0');
    };
    tryPort(startPort, maxAttempts);
  });

const start = async () => {
  const localIp = getLocalIp();
  const port = isProduction ? DEFAULT_PORT : await findAvailablePort(DEFAULT_PORT);

  if (!isProduction && port !== DEFAULT_PORT) {
    console.warn(
      `Usando puerto ${port}. Actualiza apiUrl en frontend/src/environments/environment.ts si pruebas desde el teléfono.`
    );
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor escuchando en puerto ${port}`);
    if (isRender && process.env.RENDER_EXTERNAL_URL) {
      console.log(`API pública (Render): ${process.env.RENDER_EXTERNAL_URL}/api`);
    }
    if (isRailway && process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(`API pública (Railway): https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api`);
    }
    if (!isProduction && localIp) {
      console.log(`Desde el teléfono (local): http://${localIp}:${port}/api`);
    }
    if (!isRawgConfigured()) {
      console.warn('RAWG no configurado: define RAWG_API_KEY para importar juegos.');
    }
  });

  try {
    await connectDB();
  } catch (error) {
    console.error('Error al conectar PostgreSQL (el servidor sigue arriba):', error);
  }
};

start();
