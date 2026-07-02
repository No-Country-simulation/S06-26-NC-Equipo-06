import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    provider: z.enum(['USER', 'ADMIN']).default('USER')
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    ruc: z.string().min(10, 'CUD must be at least 10 characters long'),
    companyName: z.string(),
    taxStatus: z.enum(['HABIDO', 'NO_HABIDO', 'NO_HALLADO']),
    fiscalAddress: z.string(),
    fiscalStatus: z.boolean()
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Token is required')
});

export const resendVerificationEmailSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const adminRegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string(),
    lastName: z.string()
});

export const registerLocalAdminSchema = z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string(),
    lastName: z.string(),
    municipality: z.string()
});

export const registerLocalEvaluatorSchema = z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string(),
    lastName: z.string()
});

export const tokenSchema = z.object({
    token: z.string().min(1, 'Token is required')
});

export const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const changePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    oldPassword: z.string().min(6, 'Password must be at least 6 characters long')
});

export const recoverPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const newPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long')
});