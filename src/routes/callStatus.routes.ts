import { Router, Request, Response } from 'express';
import pino from 'pino';
import { cleanupConversation } from '../services/gpt.service';

const router: Router = Router();
const logger = pino();

/**
 * Handle call status updates from Twilio.
 */
router.post('/', (req: Request, res: Response) => {
  const { CallSid, CallStatus, To, From } = req.body;

  logger.info({ CallSid, CallStatus, To, From }, 'Received call status update');

  // Clean up conversation history when call ends
  if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(CallStatus)) {
    cleanupConversation(CallSid);
    logger.info({ CallSid }, 'Cleaned up conversation history');
  }

  // Respond to Twilio
  res.status(200).send('Status received');
});

export default router;
