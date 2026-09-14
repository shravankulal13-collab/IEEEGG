// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Authentication Request Validators
// ============================================================

import { z } from 'zod';

export const userRoleEnum = z.enum([
  'citizen',
  'dispatcher',
  'ambulance_driver',
  'hospital_admin',
  'hospital_staff',
  'system_admin',
]);

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must contain at least 2 characters').max(100).optional(),
    full_name: z.string().min(2, 'Full name must contain at least 2 characters').max(100).optional(),
    email: z.string().email('Invalid email address format'),
    phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    role: userRoleEnum.default('citizen'),
  })
  .refine((data) => Boolean(data.fullName || data.full_name), {
    message: 'Full name must contain at least 2 characters',
    path: ['fullName'],
  })
  .transform((data) => ({
    ...data,
    fullName: (data.fullName || data.full_name || 'Emergency User').trim(),
  }));

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
