import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';
import { router } from './mainRouter';
import { errorHandler, requestLogger } from './middleware/errorHandler';
import { createWebSocketServer } from './websocket';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);  // Add request logging

// Routes
app.use('/api', router);

// Error handling
app.use(errorHandler);

// Start server
const API_PORT = 3001;
const WS_PORT = 3004;

async function startServer() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        // Start WebSocket server
        createWebSocketServer(WS_PORT);

        // Start HTTP server
        app.listen(API_PORT, () => {
            console.log(`API server is running on port ${API_PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
