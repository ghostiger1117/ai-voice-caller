import { Application } from 'express';
import outboundRoutes from './outbound.routes';
import inboundRoutes from './inbound.routes';
import mediaRoutes from './media.routes';
import callsRoutes from './calls.routes';

export function setupRoutes(app: Application) {
  // Register all routes with proper prefixes
  app.use('/api/outbound', outboundRoutes);
  app.use('/api/inbound', inboundRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/calls', callsRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
} 