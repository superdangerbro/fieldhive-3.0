import { z } from 'zod';
import { getSecrets } from '@fieldhive/infrastructure';

// Schema for environment variables
const envSchema = z.object({
    // Database
    database: z.object({
        host: z.string(),
        port: z.number(),
        name: z.string(),
        user: z.string(),
        password: z.string(),
        ssl: z.boolean().default(true),
        sslRejectUnauthorized: z.boolean().default(false),
        pool: z.object({
            min: z.number().default(2),
            max: z.number().default(10),
            idleTimeoutMillis: z.number().default(10000),
        }),
    }),

    // Server
    server: z.object({
        port: z.number().default(3001),
        wsPort: z.number().default(3004),
        nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
        corsOrigin: z.string().default('http://localhost:3000'),
    }),

    // Logging
    logging: z.object({
        level: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
        enableRequestLogging: z.boolean().default(true),
        enableQueryLogging: z.boolean().default(true),
    }),

    // Security
    security: z.object({
        jwtSecret: z.string(),
    }),

    // Rate Limiting
    rateLimit: z.object({
        windowMs: z.number().default(900000), // 15 minutes
        maxRequests: z.number().default(100),
    }),

    // Cache
    cache: z.object({
        ttl: z.number().default(3600), // 1 hour
        checkPeriod: z.number().default(120), // 2 minutes
    }),

    // File Upload
    fileUpload: z.object({
        maxSize: z.number().default(5242880), // 5MB
        allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/pdf']),
    }),

    // Maintenance
    maintenance: z.object({
        enabled: z.boolean().default(false),
        message: z.string().default('System is under maintenance. Please try again later.'),
    }),

    // AWS Configuration
    aws: z.object({
        region: z.string(),
        accessKeyId: z.string().optional(),
        secretAccessKey: z.string().optional(),
    }),
});

export const loadConfig = async () => {
    const nodeEnv = process.env.NODE_ENV || 'development';

    try {
        if (nodeEnv === 'production') {
            const secrets = await getSecrets('production');
            return envSchema.parse({
                database: {
                    host: secrets.database.host,
                    port: secrets.database.port,
                    name: secrets.database.name,
                    user: secrets.database.user,
                    password: secrets.database.password,
                    ssl: true,
                    sslRejectUnauthorized: false,
                    pool: {
                        min: Number(process.env.DB_POOL_MIN) || 2,
                        max: Number(process.env.DB_POOL_MAX) || 10,
                        idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT) || 10000,
                    },
                },
                server: {
                    port: Number(process.env.PORT) || 3001,
                    wsPort: Number(process.env.WS_PORT) || 3004,
                    nodeEnv,
                    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
                },
                logging: {
                    level: (process.env.LOG_LEVEL || 'info') as any,
                    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
                    enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
                },
                security: {
                    jwtSecret: secrets.jwt.secret,
                },
                rateLimit: {
                    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
                    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
                },
                cache: {
                    ttl: Number(process.env.CACHE_TTL) || 3600,
                    checkPeriod: Number(process.env.CACHE_CHECK_PERIOD) || 120,
                },
                fileUpload: {
                    maxSize: Number(process.env.MAX_FILE_SIZE) || 5242880,
                    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'],
                },
                maintenance: {
                    enabled: process.env.MAINTENANCE_MODE === 'true',
                    message: process.env.MAINTENANCE_MESSAGE || 'System is under maintenance. Please try again later.',
                },
                aws: {
                    region: process.env.AWS_REGION || 'us-east-1',
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
        }

        // Development/Test environment
        return envSchema.parse({
            database: {
                host: process.env.DB_HOST!,
                port: Number(process.env.DB_PORT),
                name: process.env.DB_NAME!,
                user: process.env.DB_USER!,
                password: process.env.DB_PASSWORD!,
                ssl: process.env.DB_SSL === 'true',
                sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
                pool: {
                    min: Number(process.env.DB_POOL_MIN) || 2,
                    max: Number(process.env.DB_POOL_MAX) || 10,
                    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT) || 10000,
                },
            },
            server: {
                port: Number(process.env.PORT) || 3001,
                wsPort: Number(process.env.WS_PORT) || 3004,
                nodeEnv,
                corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            },
            logging: {
                level: (process.env.LOG_LEVEL || 'info') as any,
                enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
                enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
            },
            security: {
                jwtSecret: process.env.JWT_SECRET || 'development-secret',
            },
            rateLimit: {
                windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
                maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            },
            cache: {
                ttl: Number(process.env.CACHE_TTL) || 3600,
                checkPeriod: Number(process.env.CACHE_CHECK_PERIOD) || 120,
            },
            fileUpload: {
                maxSize: Number(process.env.MAX_FILE_SIZE) || 5242880,
                allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'],
            },
            maintenance: {
                enabled: process.env.MAINTENANCE_MODE === 'true',
                message: process.env.MAINTENANCE_MESSAGE || 'System is under maintenance. Please try again later.',
            },
            aws: {
                region: process.env.AWS_REGION || 'us-east-1',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
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

// Export type for environment variables
export type Env = z.infer<typeof envSchema>;

// Helper functions
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isTest = () => process.env.NODE_ENV === 'test';