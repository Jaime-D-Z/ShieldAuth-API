import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppError } from '@/shared/errors/AppError';

type AccessJwtPayload = {
	sub: string;
	role: Role;
};

export const authenticate = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next(new AppError('Token de acceso requerido', 401, 'MISSING_ACCESS_TOKEN'));
	}

	const token = authHeader.slice(7);

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET);

		if (
			typeof decoded !== 'object' ||
			decoded === null ||
			typeof decoded.sub !== 'string' ||
			typeof decoded.role !== 'string' ||
			!Object.values(Role).includes(decoded.role as Role)
		) {
			throw new AppError('Token inválido', 401, 'INVALID_ACCESS_TOKEN');
		}

		const payload: AccessJwtPayload = {
			sub: decoded.sub,
			role: decoded.role as Role,
		};

		req.user = {
			sub: payload.sub,
			role: payload.role,
		};

		return next();
	} catch {
		return next(new AppError('Token inválido o expirado', 401, 'INVALID_ACCESS_TOKEN'));
	}
};
