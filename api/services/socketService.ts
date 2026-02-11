import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import logger from '../utils/logger.js';

let wss: WebSocketServer | null = null;

export const initWebSocket = (server: Server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    logger.info('Client connected');
    
    ws.on('close', () => {
      logger.info('Client disconnected');
    });
  });
};

export const broadcast = (type: string, payload: unknown) => {
  if (!wss) return;
  
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
