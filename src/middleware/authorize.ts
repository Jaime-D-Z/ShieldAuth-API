import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';

export const authorize = (...allowedRoles: Role[]) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const role = req.user?.role as Role | undefined;

		if (!role || !allowedRoles.includes(role)) {
			return next(new AppError('No autorizado para esta acción', 403, 'FORBIDDEN'));
		}

		return next();
	};
};
