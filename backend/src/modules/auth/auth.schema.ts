import { z } from 'zod';
import type { ValidationSchemas } from '../../middleware/validate';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254)
  .email('Enter a valid email address')
  .toLowerCase();

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const registerSchema: ValidationSchemas = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email,
    password,
  }),
};

export const loginSchema: ValidationSchemas = {
  body: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),
};
