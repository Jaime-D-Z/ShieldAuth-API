import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';
import { AppError } from '@/shared/errors/AppError';
import { env } from '@/config/env';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerSchema.parse(req.body);

      const user = await AuthService.register(body, {
        ip: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar entrada
      const body = loginSchema.parse(req.body);

      const { accessToken, refreshToken } = await AuthService.login(body, {
        ip: req.ip || req.socket.remoteAddress || 'unknown',
      });

      // Enviar Refresh Token en cookie HttpOnly (Inaccesible desde JS del navegador)
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600 * 1000, // 7 días
      });

      res.json({ accessToken });
    } catch (err) {
      next(err); // Va directo al errorHandler global
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token as string | undefined;

      if (!refreshToken) {
        throw new AppError('Refresh token requerido', 401, 'MISSING_REFRESH_TOKEN');
      }

      const { accessToken, refreshToken: rotatedRefreshToken } =
        await AuthService.refresh(refreshToken);

      res.cookie('refresh_token', rotatedRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.json({ accessToken });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (userId) {
        await AuthService.logout(userId);
      }
      
      res.clearCookie('refresh_token');
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}