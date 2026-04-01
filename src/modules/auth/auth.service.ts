import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { TokenService } from './token.service';
import { AppError } from '@/shared/errors/AppError';
import { LoginInput, RegisterInput } from './auth.schema';
import { UserRepository } from '@/modules/users/user.repository';
import { AuthAuditService } from './audit.service';

type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthService {
  static async register(
    { email, password, name }: RegisterInput,
    context: { ip: string }
  ): Promise<SafeUser> {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('El usuario ya existe', 409, 'USER_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = await UserRepository.create({
      email,
      password: hashedPassword,
      name,
      role: Role.USER,
    });

    await AuthAuditService.logAuthEvent({
      action: 'USER_REGISTERED',
      ip: context.ip,
      userId: createdUser.id,
    });

    const { password: _password, ...safeUser } = createdUser;
    return safeUser;
  }

  static async login(
    { email, password }: LoginInput,
    context: { ip: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        await AuthAuditService.logLoginAttempt({
          action: 'LOGIN_FAILED_USER_NOT_FOUND',
          ip: context.ip,
        });
        throw new AppError('Credenciales inválidas', 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        await AuthAuditService.logLoginAttempt({
          action: 'LOGIN_FAILED_INVALID_PASSWORD',
          ip: context.ip,
          userId: user.id,
        });
        throw new AppError('Credenciales inválidas', 401);
      }

      const accessToken = TokenService.signAccess({
        sub: user.id,
        role: user.role,
      });

      const refreshToken = await TokenService.signRefresh(user.id);

      await AuthAuditService.logLoginAttempt({
        action: 'LOGIN_SUCCESS',
        ip: context.ip,
        userId: user.id,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      if (!(error instanceof AppError)) {
        await AuthAuditService.logLoginAttempt({
          action: 'LOGIN_FAILED_INTERNAL_ERROR',
          ip: context.ip,
        });
      }
      throw error;
    }
  }

  static async refresh(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = TokenService.verifyRefresh(token);
    const revoked = await TokenService.isRevoked(payload.sub, token, payload.jti);

    if (revoked) {
      throw new AppError('Refresh token invalido o expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await UserRepository.findById(payload.sub);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const accessToken = TokenService.signAccess({ sub: user.id, role: user.role });
    const refreshToken = await TokenService.signRefresh(user.id);

    return { accessToken, refreshToken };
  }

  static async logout(userId: string): Promise<void> {
    await TokenService.revoke(userId);
  }
}