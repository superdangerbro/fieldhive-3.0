import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { setupDatabase } from './config/database';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3001;
const wsPort = process.env.WS_PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// WebSocket server
function createWebSocketServer() {
    const wss = new WebSocketServer({ port: Number(wsPort) });

    wss.on('connection', (ws) => {
        logger.info('WebSocket client connected');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                logger.info('Received:', data);

                // Handle different message types
                switch (data.type) {
                    case 'METRICS_UPDATE':
                        // Handle metrics update
                        break;
                    case 'ping':
                        ws.send(JSON.stringify({
                            type: 'pong',
                            payload: {
                                latency: Date.now() - new Date(data.timestamp).getTime()
                            },
                            timestamp: new Date().toISOString()
                        }));
                        break;
                    default:
                        // Handle unknown message type
                        ws.send(JSON.stringify({
                            type: 'ERROR',
                            payload: {
                                code: 'UNKNOWN_MESSAGE_TYPE',
                                message: `Unknown message type: ${data.type}`
                            },
                            timestamp: new Date().toISOString()
                        }));
                }
            } catch (error) {
                logger.error('Error processing message:', error);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: {
                        code: 'MESSAGE_PROCESSING_ERROR',
                        message: 'Error processing message'
                    },
                    timestamp: new Date().toISOString()
                }));
            }
        });

        ws.on('close', () => {
            logger.info('WebSocket client disconnected');
        });
    });

    logger.info(`WebSocket server started on port ${wsPort}`);
    return wss;
}

async function startServer() {
    try {
        // Initialize database
        await setupDatabase();

        // Start WebSocket server
        const wss = createWebSocketServer();

        // Start HTTP server
        app.listen(port, () => {
            logger.info(`🚀 HTTP Server running on port ${port}`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();
