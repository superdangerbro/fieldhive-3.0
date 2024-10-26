import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../utils/logger';
import { WebSocketMessage } from '@fieldhive/shared';

interface ExtendedWebSocket extends WebSocket {
    isAlive: boolean;
    clientId?: string;
}

export function createWebSocketServer(port: number) {
    const wss = new WebSocketServer({ port });

    wss.on('connection', (ws: ExtendedWebSocket) => {
        ws.isAlive = true;
        ws.clientId = Math.random().toString(36).substring(7);

        // Send connection confirmation
        const connectionMessage: WebSocketMessage = {
            type: 'connection',
            payload: {
                clientId: ws.clientId,
                status: 'connected'
            },
            timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(connectionMessage));

        ws.on('message', (message: string) => {
            try {
                const data = JSON.parse(message);
                logger.info('Received:', data);

                // Handle different message types
                switch (data.type) {
                    case 'METRICS_UPDATE':
                        // Handle metrics update
                        break;
                    case 'EQUIPMENT_UPDATE':
                        // Handle equipment update
                        break;
                    case 'SENSOR_UPDATE':
                        // Handle sensor update
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

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('close', () => {
            logger.info(`Client ${ws.clientId} disconnected`);
        });
    });

    // Heartbeat to check for stale connections
    const interval = setInterval(() => {
        wss.clients.forEach((client) => {
            const ws = client as ExtendedWebSocket;
            if (!ws.isAlive) {
                logger.info(`Terminating inactive client ${ws.clientId}`);
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    logger.info(`WebSocket server started on port ${port}`);
    return wss;
}
