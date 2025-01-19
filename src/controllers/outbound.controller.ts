import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { TwilioService } from '../services/twilio.service';

export const initiateCall = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }
    
    const twilioService = new TwilioService();
    const call = await twilioService.makeCall(to, message);
    
    res.json({
      status: 'success',
      data: call
    });
  } catch (error) {
    logger.error({ error }, 'Failed to initiate call');
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate call'
    });
  }
};

export const handleCallStatus = async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus } = req.body;
    // Handle call status update
    logger.info({ CallSid, CallStatus }, 'Call status update');
    res.sendStatus(200);
  } catch (error) {
    logger.error({ error }, 'Failed to handle call status');
    res.sendStatus(500);
  }
}; 