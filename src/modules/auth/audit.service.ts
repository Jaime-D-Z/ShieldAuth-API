import { AuditRepository, AuthAuditAction } from './audit.repository';

type AuthAuditInput = {
  action: AuthAuditAction;
  ip: string;
  userId?: string;
};

export class AuthAuditService {
  static async logAuthEvent(input: AuthAuditInput): Promise<void> {
    try {
      await AuditRepository.create(input);
    } catch (error) {
      console.error('No se pudo registrar AuditLog de auth', error);
    }
  }

  static async logLoginAttempt(input: Omit<AuthAuditInput, 'action'> & {
    action:
      | 'LOGIN_SUCCESS'
      | 'LOGIN_FAILED_USER_NOT_FOUND'
      | 'LOGIN_FAILED_INVALID_PASSWORD'
      | 'LOGIN_FAILED_INTERNAL_ERROR';
  }): Promise<void> {
    await this.logAuthEvent(input);
  }
}
