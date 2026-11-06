import { z } from 'zod';
import { ROLES } from '../constants/index.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.USER, ROLES.ADMIN]).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional()
});

export const updateRoleSchema = z.object({
  role: z.enum([ROLES.USER, ROLES.ADMIN])
});

export const updateStatusSchema = z.object({
  isActive: z.boolean()
});
