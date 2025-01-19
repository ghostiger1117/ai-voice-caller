import { Application } from 'express';
import smsRoutes from './sms.routes';
import outboundRoutes from './outbound.routes';
import inboundRoutes from './inbound.routes';
import mediaRoutes from './media.routes';
import callStatusRoutes from './callStatus.routes';
import webRoutes from './web.routes';
import healthRoutes from './health.routes';

export function setupRoutes(app: Application) {
  app.use('/api/sms', smsRoutes);
  app.use('/api/outbound', outboundRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/inbound', inboundRoutes);
  app.use('/api/call-status', callStatusRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/', webRoutes);
} 