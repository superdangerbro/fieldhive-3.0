import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}

export function errorHandler(
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    logger.error('API Error:', {
        error: err.message,
        stack: err.stack,
        details: err.details,
        path: req.path,
        method: req.method
    });

    // Default to 500 server error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: err.details
            })
        }
    });
}

export class HttpError extends Error implements ApiError {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export class ValidationError extends HttpError {
    constructor(message: string, details?: any) {
        super(400, message, details);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(404, message, details);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(401, message, details);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string = 'Forbidden', details?: any) {
        super(403, message, details);
        this.name = 'ForbiddenError';
    }
}

export class ConflictError extends HttpError {
    constructor(message: string, details?: any) {
        super(409, message, details);
        this.name = 'ConflictError';
    }
}
