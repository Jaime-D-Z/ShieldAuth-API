import { prisma } from '@/config/database';

export type AuthAuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED_USER_NOT_FOUND'
  | 'LOGIN_FAILED_INVALID_PASSWORD'
  | 'LOGIN_FAILED_INTERNAL_ERROR'
  | 'USER_REGISTERED';

export class AuditRepository {
  static async create(data: {
    action: AuthAuditAction;
    ip: string;
    userId?: string;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        ip: data.ip,
        userId: data.userId,
      },
    });
  }
}