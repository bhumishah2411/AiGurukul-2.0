import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
  displayName: z.string().min(2).max(50).trim(),
  preferredPersona: z
    .enum(['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali'])
    .default('krishna'),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const GoogleAuthRequestSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});
