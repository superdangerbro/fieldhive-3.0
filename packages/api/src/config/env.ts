import { z } from 'zod';

// Schema for environment variables
const envSchema = z.object({
    // Database
    DB_HOST: z.string(),
    DB_PORT: z.string().transform(Number),
    DB_USER: z.string(),
    DB_NAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_SSL: z.string().transform(val => val === 'true').default('true'),
    DB_SSL_REJECT_UNAUTHORIZED: z.string().transform(val => val === 'true').default('false'),
    DB_POOL_MIN: z.string().transform(Number).default('2'),
    DB_POOL_MAX: z.string().transform(Number).default('10'),
    DB_POOL_IDLE_TIMEOUT: z.string().transform(Number).default('10000'),

    // Server
    PORT: z.string().transform(Number).default('3001'),
    WS_PORT: z.string().transform(Number).default('3004'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
    ENABLE_REQUEST_LOGGING: z.string().transform(val => val === 'true').default('true'),
    ENABLE_QUERY_LOGGING: z.string().transform(val => val === 'true').default('true'),

    // Security
    JWT_SECRET: z.string().optional(),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

    // Cache
    CACHE_TTL: z.string().transform(Number).default('3600'),
    CACHE_CHECK_PERIOD: z.string().transform(Number).default('120'),

    // File Upload
    MAX_FILE_SIZE: z.string().transform(Number).default('5242880'),
    ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),

    // Maintenance
    MAINTENANCE_MODE: z.string().transform(val => val === 'true').default('false'),
    MAINTENANCE_MESSAGE: z.string().default('System is under maintenance. Please try again later.')
});

// Parse and validate environment variables
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors
                .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
                .map(err => err.path.join('.'));

            if (missingVars.length > 0) {
                throw new Error(
                    `Missing required environment variables: ${missingVars.join(', ')}\n` +
                    'Please check your .env file and ensure all required variables are set.'
                );
            }

            throw new Error(
                'Invalid environment variables:\n' +
                error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
            );
        }
        throw error;
    }
};

// Export validated environment variables
export const env = parseEnv();

// Export type for environment variables
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper function to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development';

// Helper function to check if we're in test
export const isTest = env.NODE_ENV === 'test';

// Export database configuration
export const dbConfig = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: env.DB_SSL ? {
        rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED
    } : false,
    pool: {
        min: env.DB_POOL_MIN,
        max: env.DB_POOL_MAX,
        idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT
    }
};

// Export server configuration
export const serverConfig = {
    port: env.PORT,
    wsPort: env.WS_PORT,
    corsOrigin: env.CORS_ORIGIN
};

// Export logging configuration
export const loggingConfig = {
    level: env.LOG_LEVEL,
    enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
    enableQueryLogging: env.ENABLE_QUERY_LOGGING
};

// Export rate limiting configuration
export const rateLimitConfig = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS
};

// Export cache configuration
export const cacheConfig = {
    ttl: env.CACHE_TTL,
    checkPeriod: env.CACHE_CHECK_PERIOD
};

// Export file upload configuration
export const fileUploadConfig = {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(',')
};

// Export maintenance configuration
export const maintenanceConfig = {
    enabled: env.MAINTENANCE_MODE,
    message: env.MAINTENANCE_MESSAGE
};
