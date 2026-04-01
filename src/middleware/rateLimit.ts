import { Request, Response, NextFunction } from 'express';
import { redis } from '@/config/redis';
import { AppError } from '@/shared/errors/AppError';

export const rateLimit = (limit: number, windowSec: number) => 
  async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const windowBucket = Math.floor(Date.now() / (windowSec * 1000));
    const key = `rl:${ip}:${windowBucket}`;
    
    try {
      const count = await redis.incr(key);
      
      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - count)));
      res.setHeader('X-RateLimit-Reset', String(ttl > 0 ? ttl : windowSec));

      if (count > limit) {
        if (ttl > 0) {
          res.setHeader('Retry-After', String(ttl));
        }
        return next(new AppError('Demasiadas peticiones. Intenta más tarde.', 429));
      }

      next();
    } catch (error) {
      // Si falla Redis, dejamos pasar la petición para no bloquear el servicio
      next();
    }
  };