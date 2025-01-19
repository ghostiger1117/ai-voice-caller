import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { OpenAIService } from '../services/openai.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { AudioProcessor } from '../services/audio.service';
import { TwilioService } from '../services/twilio.service';
import { EmotionService } from '../services/emotion.service';
import { AnalyticsService } from '../services/analytics.service';

export const processAudio = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { RecordingUrl, CallSid } = req.body;
    const audioProcessor = new AudioProcessor();
    const emotionService = new EmotionService();
    const analyticsService = new AnalyticsService();
    
    // Process audio and analyze emotion
    const processedAudio = await audioProcessor.processRecording(RecordingUrl);
    const emotionResult = await emotionService.analyzeEmotion(processedAudio);
    
    // Generate contextual AI response
    const openai = new OpenAIService();
    const response = await openai.generateResponse(emotionResult.transcription, {
      emotion: emotionResult.emotions,
      sentiment: emotionResult.sentiment
    });
    
    // Generate speech with emotion-aware voice
    const elevenlabs = new ElevenLabsService();
    const audioResponse = await elevenlabs.generateSpeech(response, {
      emotion: emotionResult.emotions
    });
    
    // Track analytics
    await analyticsService.trackCall({
      callSid: CallSid,
      duration: (Date.now() - startTime) / 1000,
      sentiment: emotionResult.sentiment,
      transcription: emotionResult.transcription
    });
    
    const twiml = new TwilioService().generateTwiML();
    twiml.play(audioResponse.toString('base64'));
    
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