/**
 * validators.js
 * ─────────────────────────────────────────────────────────────
 * Zod schemas for every form in the application.
 * Kept in one file so field rules stay consistent across pages.
 */

import { z } from 'zod';

/* ══════════════════════════════════════════════════════════════
   Auth Schemas
   ══════════════════════════════════════════════════════════════ */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email or username is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required').max(100),
    username: z
      .string()
      .min(3,  'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, dots, dashes and underscores'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/,          'Include at least one uppercase letter')
      .regex(/[0-9]/,          'Include at least one number')
      .regex(/[^A-Za-z0-9]/,  'Include at least one special character'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, 'You must accept the terms to continue'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const organisationRegisterSchema = z.object({
  organisationName: z.string().trim().min(1, 'Organisation name is required'),
  organisationCode: z.string().trim().min(1, 'Organisation code is required'),
  organisationType: z.string().min(1, 'Organisation type is required'),
  industry: z.string().optional(),
  officialEmail: z.string().email('Enter a valid official email'),
  contactNumber: z.string().optional(), address: z.string().optional(),
  city: z.string().optional(), state: z.string().optional(), country: z.string().optional(),
  adminFullName: z.string().trim().min(1, 'Admin full name is required'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/, 'Use letters, numbers, dots, dashes or underscores'),
  workEmail: z.string().email('Enter a valid work email'),
  jobTitle: z.string().optional(),
  password: z.string().min(8).regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number').regex(/[^A-Za-z0-9]/, 'Include a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  acceptTerms: z.boolean().refine(Boolean, 'You must accept the terms to continue'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/,         'Include at least one uppercase letter')
      .regex(/[0-9]/,         'Include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Include at least one special character'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ══════════════════════════════════════════════════════════════
   App Schemas
   ══════════════════════════════════════════════════════════════ */

export const activityLogSchema = z.object({
  category:     z.string().min(1, 'Category is required'),
  activityType: z.string().min(1, 'Activity type is required'),
  amount: z
    .coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  unit:    z.string().min(1, 'Unit is required'),
  logDate: z.string().min(1, 'Date is required'),
  notes:   z.string().max(300, 'Notes must be 300 characters or fewer').optional().default(''),
  calculatedEmissions: z.number().optional(),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3,  'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  email: z.string().email('Enter a valid email address'),
});

/* ══════════════════════════════════════════════════════════════
   Goal Schema
   ══════════════════════════════════════════════════════════════ */

export const goalSchema = z.object({
  title: z
    .string()
    .min(3,   'Title must be at least 3 characters')
    .max(80,  'Title must be at most 80 characters'),
  description: z
    .string()
    .max(200, 'Description must be at most 200 characters')
    .optional()
    .default(''),
  category: z.string().min(1, 'Category is required'),
  period:   z.string().min(1, 'Period is required'),
  target: z
    .number({ invalid_type_error: 'Target must be a number' })
    .positive('Target must be greater than 0')
    .max(100_000, 'Target seems too large'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate:   z.string().min(1, 'End date is required'),
}).refine(
  (d) => !d.startDate || !d.endDate || d.startDate <= d.endDate,
  { message: 'End date must be after start date', path: ['endDate'] }
);
