import winston, { Logger, format } from 'winston';

const { combine, timestamp, printf, colorize } = format;

interface LogEntry {
    level: string;
    message: string;
    timestamp?: string;
    [key: string]: any;
}

// Custom log format
const logFormat = printf((info: LogEntry) => {
    const { level, message, timestamp, ...metadata } = info;
    
    let msg = `[${timestamp}] ${level}: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
        msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
});

// Create logger instance
export const logger: Logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat
    ),
    transports: [
        // Console transport with colors for development
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                logFormat
            )
        }),
        // File transport for errors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Add request context if available
export interface RequestContext {
    requestId?: string;
    method: string;
    url: string;
    ip: string;
    userAgent?: string;
}

export const addRequestContext = (req: {
    id?: string;
    method: string;
    originalUrl: string;
    ip: string;
    get: (header: string) => string | undefined;
}): RequestContext => {
    return {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
    };
};

// Log levels
export const LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    HTTP: 'http',
    DEBUG: 'debug'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

// Helper functions for structured logging
export const logError = (message: string, error: Error, context?: Record<string, any>) => {
    logger.error(message, {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        ...context
    });
};

export const logWarning = (message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
    logger.info(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
    logger.debug(message, context);
};

export const logHttp = (message: string, context?: Record<string, any>) => {
    logger.http(message, context);
};

// Export default logger instance
export default logger;
