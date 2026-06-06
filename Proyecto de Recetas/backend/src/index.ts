import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import net from 'net';
import os from 'os';
import { connectDB, isDbConnected } from './config/db';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import recipeRoutes from './routes/recipeRoutes';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const isProduction = process.env.NODE_ENV === 'production' || isRailway;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', api: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  const dbConnected = isDbConnected();
  res.json({
    status: 'ok',
    message: 'API de Recetas funcionando',
    db: dbConnected ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/recipes', recipeRoutes);

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
      `Usando puerto ${port}. Actualiza EXPO_PUBLIC_API_URL en frontend/.env si pruebas desde el teléfono.`
    );
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor escuchando en puerto ${port}`);
    if (isRailway && process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(`API pública: https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api`);
    }
    if (!isProduction && localIp) {
      console.log(`Desde el telefono (local): http://${localIp}:${port}/api`);
    }
  });

  try {
    await connectDB();
  } catch (error) {
    console.error('Error al conectar MongoDB (el servidor sigue arriba):', error);
  }
};

start();
