import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z
		.string()
		.optional()
		.default('3000')
		.transform((value) => Number(value))
		.pipe(z.number().int().positive()),
	CLIENT_URL: z.string().url().optional().default('http://localhost:3000'),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerido'),
	REDIS_URL: z.string().min(1, 'REDIS_URL es requerido'),
	JWT_SECRET: z.string().min(20, 'JWT_SECRET debe tener al menos 20 caracteres'),
	JWT_REFRESH_SECRET: z
		.string()
		.min(20, 'JWT_REFRESH_SECRET debe tener al menos 20 caracteres'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const issues = parsed.error.issues
		.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
		.join(', ');
	throw new Error(`Configuracion de entorno invalida: ${issues}`);
}

export const env = parsed.data;
