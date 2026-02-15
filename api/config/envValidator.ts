import { z } from 'zod';
import logger from '../utils/logger.js';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().transform(Number),
    mongo: z.string().url(),
    FRONTEND_URL: z.string().url(),
    SESSION_SECRET: z.string().min(10),
    REDIS_HOST: z.string().min(1),
    ENCRYPTION_KEY: z.string().length(64),
    COOKIE_SECURE: z.string().transform(v => v === 'true'),
    VITE_REQUIRED_PIN: z.string().min(4),
    // Optional but recommended
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Validates the process.env against the schema.
 * Crashes the process if validation fails to prevent unstable states.
 */
export const validateEnv = () => {
    try {
        envSchema.parse(process.env);
        logger.info('Environment validation successful');
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingFields = error.issues.map(i => i.path.join('.')).join(', ');
            logger.error('Invalid environment configuration. Missing or invalid fields:', missingFields);
            process.exit(1);
        }
    }
};
