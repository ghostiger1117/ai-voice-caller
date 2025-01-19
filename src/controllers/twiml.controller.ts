import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { TwilioService } from '../services/twilio.service';

export const generateTwiML = async (req: Request, res: Response) => {
  try {
    const { message } = req.query;
    
    logger.info({ 
      method: req.method,
      message,
      query: req.query,
      body: req.body 
    }, 'TwiML request received');

    if (!message) {
      logger.error('No message provided for TwiML');
      return res.status(400).send('Message is required');
    }

    const twilioService = new TwilioService();
    const twiml = twilioService.generateTwiML();
    
    // First, say the message
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, message as string);

    // Then gather speech input with proper configuration
    twiml.gather({
      input: ['speech'],
      action: '/api/media/process',
      method: 'POST',
      language: 'en-US',
      speechTimeout: 'auto',
      enhanced: true,
      speechModel: 'phone_call'
    });

    // Fallback message if no input is received
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'I didn\'t receive any input. Goodbye!');

    logger.info({ message }, 'Generated TwiML response');
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error({ error }, 'Error generating TwiML');
    res.status(500).send('Error generating TwiML');
  }
}; 