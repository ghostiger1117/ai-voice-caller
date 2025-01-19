import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { OpenAIService } from '../services/openai.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { AudioProcessor } from '../services/audio.service';
import { TwilioService } from '../services/twilio.service';

export const processAudio = async (req: Request, res: Response) => {
  try {
    const { RecordingUrl, CallSid } = req.body;
    const audioProcessor = new AudioProcessor();
    
    // Download and process audio
    const processedAudio = await audioProcessor.processRecording(RecordingUrl);
    
    // Convert speech to text
    const openai = new OpenAIService();
    const text = await openai.transcribeAudio(processedAudio);
    
    // Generate AI response
    const response = await openai.generateResponse(text);
    
    // Convert response to speech
    const elevenlabs = new ElevenLabsService();
    const audioResponse = await elevenlabs.generateSpeech(response);
    
    const twiml = new TwilioService().generateTwiML();
    twiml.play(audioResponse);
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error({ error }, 'Failed to process audio');
    res.status(500).send();
  }
};

export const generateResponse = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const elevenlabs = new ElevenLabsService();
    const audioUrl = await elevenlabs.generateSpeech(text);
    
    res.json({
      status: 'success',
      data: { audioUrl }
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate response');
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate response'
    });
  }
}; 