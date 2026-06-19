import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business Name must be at least 2 characters'),
    ownerName: z.string().min(2, 'Owner Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format (e.g. name@bank)'),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

export const createQRSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    customerName: z.string().optional(),
    invoiceNumber: z.string().optional(),
    description: z.string().optional(),
    expiryTime: z.string().datetime().optional().or(z.string().optional()),
    notes: z.string().optional(),
    upiIdUsed: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format'),
  }),
});

