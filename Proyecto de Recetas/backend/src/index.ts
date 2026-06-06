import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import net from 'net';
import os from 'os';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import recipeRoutes from './routes/recipeRoutes';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API de Recetas funcionando' });
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
  await connectDB();
  const localIp = getLocalIp();
  const port = await findAvailablePort(DEFAULT_PORT);

  if (port !== DEFAULT_PORT) {
    console.warn(
      `Usando puerto ${port}. Actualiza EXPO_PUBLIC_API_URL en frontend/.env si pruebas desde el teléfono.`
    );
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor local: http://localhost:${port}`);
    if (localIp) {
      console.log(`Desde el telefono: http://${localIp}:${port}/api`);
    }
  });
};

start();
