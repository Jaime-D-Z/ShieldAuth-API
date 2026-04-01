import { createHash, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { redis } from '@/config/redis';
import { AppError } from '@/shared/errors/AppError';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

type AccessPayload = {
  sub: string;
  role: string;
};

type RefreshPayload = {
  sub: string;
  jti: string;
};

export class TokenService {
  static signAccess(payload: AccessPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TTL_SECONDS,
    });
  }

  static async signRefresh(userId: string): Promise<string> {
    const jti = randomUUID();
    const token = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TTL_SECONDS,
    });

    const value = `${jti}:${this.hash(token)}`;
    await redis.set(this.refreshKey(userId), value, 'EX', REFRESH_TTL_SECONDS);

    return token;
  }

  static verifyRefresh(token: string): RefreshPayload {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);

      if (
        typeof payload !== 'object' ||
        payload === null ||
        typeof payload.sub !== 'string' ||
        typeof payload.jti !== 'string'
      ) {
        throw new AppError('Refresh token invalido o expirado', 401, 'INVALID_REFRESH_TOKEN');
      }

      return { sub: payload.sub, jti: payload.jti };
    } catch {
      throw new AppError('Refresh token invalido o expirado', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  static async isRevoked(userId: string, token: string, jti: string): Promise<boolean> {
    const stored = await redis.get(this.refreshKey(userId));

    if (!stored) {
      return true;
    }

    const [storedJti, storedHash] = stored.split(':');
    return storedJti !== jti || storedHash !== this.hash(token);
  }

  static async revoke(userId: string): Promise<void> {
    await redis.del(this.refreshKey(userId));
  }

  private static refreshKey(userId: string): string {
    return `refresh:${userId}`;
  }

  private static hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}