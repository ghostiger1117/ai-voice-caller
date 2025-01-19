import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { OpenAIService } from '../services/openai.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { AudioProcessor } from '../services/audio.service';
import { TwilioService } from '../services/twilio.service';
import { EmotionService } from '../services/emotion.service';
import { AnalyticsService } from '../services/analytics.service';
import { TTSService } from '../services/tts/tts.service';

export const processAudio = async (req: Request, res: Response) => {
  try {
    const { SpeechResult, Confidence, CallSid } = req.body;
    
    logger.info({ SpeechResult, Confidence, CallSid }, 'Processing speech input');

    if (!SpeechResult || parseFloat(Confidence) < 0.5) {
      const twiml = new TwilioService().generateTwiML();
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, 'I couldn\'t understand that. Could you please try again?');
      
      twiml.gather({
        input: ['speech'],
        action: '/api/media/process',
        method: 'POST',
        language: 'en-US',
        speechTimeout: 'auto',
        enhanced: true
      });

      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Generate AI response
    const openai = new OpenAIService();
    const aiResponse = await openai.generateResponse(SpeechResult);

    // Initialize TTS service with all providers
    const ttsService = new TTSService({
      providers: [
        { name: 'elevenlabs', enabled: true, priority: 1 },
        { name: 'google', enabled: true, priority: 2 },
        { name: 'twilio', enabled: true, priority: 3 }
      ]
    });

    // Generate speech with automatic fallback
    const audioResponse = await ttsService.generateSpeech(aiResponse, {
      language: 'en-US',
      speed: 1,
      pitch: 0
    });

    const twiml = new TwilioService().generateTwiML();
    twiml.play(audioResponse.toString('base64'));
    twiml.gather({
      input: ['speech'],
      action: '/api/media/process',
      method: 'POST',
      language: 'en-US',
      speechTimeout: 'auto',
      enhanced: true
    });

    res.type('text/xml');
    return res.send(twiml.toString());

  } catch (error) {
    logger.error({ error }, 'Failed to process speech input');
    
    const twiml = new TwilioService().generateTwiML();
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'I apologize, but I encountered an error. Please try again.');
    
    twiml.gather({
      input: ['speech'],
      action: '/api/media/process',
      method: 'POST',
      language: 'en-US',
      speechTimeout: 'auto',
      enhanced: true
    });

    res.type('text/xml');
    return res.send(twiml.toString());
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