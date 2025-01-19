import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', (_, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'healthy',
    services: {
      twilio: 'UP',
      openai: 'UP',
      elevenlabs: 'UP'
    },
    timestamp: new Date().toISOString()
  });
});

export default router; 