import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

// League of Legends specific schemas
export const summonerNameSchema = z
  .string()
  .min(3, 'Summoner name must be at least 3 characters')
  .max(16, 'Summoner name must be at most 16 characters');

export const regionSchema = z.enum([
  'NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'JP1', 'LA1', 'LA2', 'OC1', 'TR1', 'RU'
]);

export const championKeySchema = z
  .string()
  .regex(/^[A-Za-z]+$/, 'Champion key must only contain letters');

// API request validation
export const leagueStatsRequestSchema = z.object({
  region: regionSchema,
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

export const tournamentCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'SWISS', 'ROUND_ROBIN']),
  maxParticipants: z.number().min(2).max(256),
  startDate: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  rules: z.array(z.string()).max(10).optional(),
});

export const graphQLQuerySchema = z.object({
  query: z.string().max(10000),
  variables: z.record(z.any()).optional(),
  operationName: z.string().optional(),
});

// Sanitization functions
export function sanitizeInput(input: string): string {
  // Remove any potential XSS vectors
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeHtml(html: string): string {
  // For production, use a library like DOMPurify
  // This is a basic implementation
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'];
  const allowedAttributes = ['href', 'target', 'rel'];
  
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous protocols
  html = html.replace(/javascript:|data:|vbscript:|file:/gi, '');
  
  return html;
}

// SQL injection prevention
export function escapeSqlIdentifier(identifier: string): string {
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error('Invalid SQL identifier');
  }
  return identifier;
}

// Rate limit key sanitization
export function sanitizeRateLimitKey(key: string): string {
  // Remove any characters that could cause issues in Redis keys
  return key.replace(/[^a-zA-Z0-9:_-]/g, '');
}

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255),
  type: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});

export const imageUploadSchema = fileUploadSchema.extend({
  type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

// Validation middleware helper
export function validateRequest<T>(schema: z.Schema<T>) {
  return async (data: unknown): Promise<T> => {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        throw new ValidationError('Validation failed', errors);
      }
      throw error;
    }
  };
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Environment variable validation
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Riot API
  RIOT_API_DEVELOPMENT_KEY: z.string().optional(),
  RIOT_API_PRODUCTION_KEY: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // WebSocket
  WEBSOCKET_URL: z.string().url().optional(),
});

// Validate environment on startup
export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach(e => {
        console.error(`- ${e.path}: ${e.message}`);
      });
      process.exit(1);
    }
  }
}