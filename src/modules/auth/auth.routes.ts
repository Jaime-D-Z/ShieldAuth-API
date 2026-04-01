import { Router } from 'express';
import { AuthController } from './auth.controller';
import { rateLimit } from '@/middleware/rateLimit';
import { authenticate } from '@/middleware/authenticate';

const router = Router();

// Register: máximo 3 registros por 15 minutos por IP
router.post('/register', rateLimit(3, 15 * 60), AuthController.register);

// Login: máximo 5 intentos por minuto por IP
router.post('/login', rateLimit(5, 60), AuthController.login);

// Refresh: genera un nuevo Access Token usando la Cookie
router.post('/refresh', AuthController.refresh);

// Logout: requiere estar autenticado para revocar el token en Redis
router.post('/logout', authenticate, AuthController.logout);

export default router;