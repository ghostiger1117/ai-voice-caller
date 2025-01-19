import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { TwilioService } from '../services/twilio.service';
import { OpenAIService } from '../services/openai.service';

export const handleIncomingSMS = async (req: Request, res: Response) => {
  try {
    const { Body, From } = req.body;
    const openai = new OpenAIService();
    const response = await openai.generateResponse(Body);
    
    const twilio = new TwilioService();
    await twilio.sendSMS(From, response);
    
    res.status(200).send();
  } catch (error) {
    logger.error({ error }, 'Failed to handle incoming SMS');
    res.status(500).send();
  }
};

export const sendSMS = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    const twilio = new TwilioService();
    const result = await twilio.sendSMS(to, message);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send SMS');
    res.status(500).json({
      status: 'error',
      message: 'Failed to send SMS'
    });
  }
}; 