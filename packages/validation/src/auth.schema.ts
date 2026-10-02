import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be at most 50 characters long')
    .trim(),
  preferredPersona: z
    .enum(['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali'])
    .default('krishna')
    .optional(),
  language: z.enum(['en', 'sa', 'hi', 'ta']).default('en').optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const GoogleAuthRequestSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});

export const UpdateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be at most 50 characters long')
    .trim()
    .optional(),
  preferences: z
    .object({
      defaultPersona: z.enum(['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali']).optional(),
      language: z.enum(['en', 'sa', 'hi', 'ta']).optional(),
      notificationsEnabled: z.boolean().optional(),
    })
    .optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(100, 'Password is too long'),
});
