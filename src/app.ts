import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from '@/config/env';

// Importación de Middlewares y Rutas
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';

const app: Application = express();

// --- 1. Middlewares Globales ---
app.use(cors({ 
  origin: env.CLIENT_URL,
  credentials: true 
}));
app.use(express.json()); // Parsea body como JSON
app.use(cookieParser()); // Permite leer cookies (para el Refresh Token)

// --- 2. Rutas de la API ---
// Prefijo v1 para versionamiento de API
app.use('/api/v1/auth', authRoutes);

// --- 3. Manejo de Errores ---
// Debe ser el ÚLTIMO middleware para capturar todos los errores de las rutas
app.use(errorHandler);

export default app;