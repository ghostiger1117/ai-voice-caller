import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { TwilioService } from '../services/twilio.service';
import { ElevenLabsService } from '../services/elevenlabs.service';

export const handleIncomingCall = async (req: Request, res: Response) => {
  try {
    const { CallSid, From } = req.body;
    logger.info({ CallSid, From }, 'Incoming call received');
    
    const elevenlabs = new ElevenLabsService();
    const welcomeAudio = await elevenlabs.generateSpeech(
      "Welcome to AI Voice Caller. How can I help you today?"
    );
    
    const twiml = new TwilioService().generateTwiML();
    twiml.play(welcomeAudio.toString());
    twiml.record({
      action: '/api/media/process',
      maxLength: 30,
      playBeep: true
    });
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error({ error }, 'Failed to handle incoming call');
    res.status(500).send();
  }
}; 