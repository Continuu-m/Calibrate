import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    secretKey: process.env.CLERK_SECRET_KEY || '',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  aiEngine: {
    url: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  },
};
