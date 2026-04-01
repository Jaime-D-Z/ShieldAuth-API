import { z } from 'zod';

const passwordComplexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .regex(
      passwordComplexityRegex,
      'La contraseña debe tener mayúscula, minúscula, número y carácter especial'
    ),
  name: z.string().trim().min(2, 'El nombre es obligatorio'),
});

// Tipos inferidos para TypeScript
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;