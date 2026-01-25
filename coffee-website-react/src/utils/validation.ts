// Form validation schemas using Zod
import { z } from 'zod';

// Email validation with detailed error messages
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Simple password for login (no strength requirements, just required)
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required');

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

// Registration form schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
});

// Gift card purchase schema
export const giftCardPurchaseSchema = z.object({
  senderName: z.string().min(1, 'Your name is required').max(100, 'Name is too long'),
  senderEmail: emailSchema,
  recipientEmail: emailSchema,
  recipientName: z.string().max(100, 'Name is too long').optional(),
  amount: z
    .number()
    .min(10, 'Minimum gift card amount is £10')
    .max(500, 'Maximum gift card amount is £500'),
  message: z
    .string()
    .max(200, 'Message must be 200 characters or less')
    .optional(),
});

// Review form schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title is too long'),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review is too long'),
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
});

// Shipping address schema
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type GiftCardPurchaseFormData = z.infer<typeof giftCardPurchaseSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

// Helper function to get password strength
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: 'Weak', color: 'red' };
  } else if (score <= 4) {
    return { score, label: 'Medium', color: 'yellow' };
  } else {
    return { score, label: 'Strong', color: 'green' };
  }
}

// Helper function to validate a value against a schema and return errors
export function validateField<T>(
  schema: z.ZodType<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors[0]?.message || 'Invalid value' };
}
