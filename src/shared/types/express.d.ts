import { Role } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      sub: string;
      role: Role;
    };
  }
}
