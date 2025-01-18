import { Router, Request, Response } from 'express';
import { getGPTResponse } from '../services/gpt.service';
import { generateSpeech } from '../services/elevenlabs.service';
import { twiml } from 'twilio';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { GatherAttributes } from 'twilio/lib/twiml/VoiceResponse';

const router: Router = Router();
const logger = pino();
const audioDir = path.join(__dirname, '../../public/audio');

// Ensure audio directory exists
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Speech recognition configuration
const SPEECH_CONFIG = {
  enhanced: {
    input: ['speech'] as const,
    speechModel: 'phone_call',
    speechTimeout: 'auto',
    timeout: 3,
    language: 'en-US',
    profanityFilter: false,
    hints: [
      'goodbye', 'bye', 'end call', 'hang up',
      'yes', 'no', 'correct', 'incorrect', 
      'help', 'repeat', 'stop'
    ].join(' ')
  },
  default: {
    input: ['speech'] as const,
    speechModel: 'experimental_utterances',
    speechTimeout: 'auto',
    timeout: 5,
    language: 'en-US',
    profanityFilter: false
  }
};

// Handle speech events from Twilio
router.post('/', async (req: Request, res: Response) => {
  try {
    const { SpeechResult, CallSid, Confidence } = req.body;
    logger.info({ CallSid, SpeechResult, Confidence }, 'Received speech input');

    const response = new twiml.VoiceResponse();
    
    // Handle end call phrases
    if (SpeechResult && /\b(goodbye|bye|end call|hang up)\b/i.test(SpeechResult)) {
      const goodbyeAudio = await generateSpeech('Thank you for calling. Goodbye!');
      const audioFilename = `${CallSid}-goodbye-${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFilename);
      await fs.promises.writeFile(audioPath, goodbyeAudio);
      
      response.play(`${process.env.APP_URL}/audio/${audioFilename}`);
      res.type('text/xml');
      return res.send(response.toString());
    }

    if (SpeechResult && parseFloat(Confidence) > 0.6) {
      // Generate AI response
      const aiResponse = await getGPTResponse(SpeechResult, CallSid);
      logger.info({ aiResponse }, 'Generated AI response');

      // Generate speech using ElevenLabs
      const audioBuffer = await generateSpeech(aiResponse);
      const audioFilename = `${CallSid}-${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFilename);
      
      // Save the audio file
      await fs.promises.writeFile(audioPath, audioBuffer);
      logger.info({ audioPath }, 'Saved audio file');

      // Play the audio file using the full URL
      const audioUrl = `${process.env.APP_URL}/audio/${audioFilename}`;
      logger.info({ audioUrl }, 'Playing audio');
      response.play(audioUrl);

      // Clean up after delay
      setTimeout(async () => {
        try {
          await fs.promises.unlink(audioPath);
          logger.info({ audioPath }, 'Cleaned up audio file');
        } catch (err) {
          logger.error({ err }, 'Error cleaning up audio file');
        }
      }, 30000);

      // Continue listening
      response.gather({
        input: ['speech'],
        timeout: 5,
        speechTimeout: 'auto',
        action: `${process.env.APP_URL}/media`,
        speechModel: 'experimental_utterances',
        language: 'en-US',
        profanityFilter: false
      });
    } else {
      // Handle low confidence or no speech
      const promptAudio = await generateSpeech(
        "I didn't catch that. Could you please repeat?"
      );
      const audioFilename = `${CallSid}-prompt-${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFilename);
      await fs.promises.writeFile(audioPath, promptAudio);
      
      response.play(`${process.env.APP_URL}/audio/${audioFilename}`);
      response.gather({
        input: ['speech'],
        timeout: 5,
        speechTimeout: 'auto',
        action: `${process.env.APP_URL}/media`,
        speechModel: 'phone_call',
        language: 'en-US',
        profanityFilter: false
      });
    }

    response.redirect(`${process.env.APP_URL}/media`);
    res.type('text/xml');
    res.send(response.toString());

  } catch (error) {
    logger.error({ error }, 'Critical error in media handler');
    const response = new twiml.VoiceResponse();
    response.say({ voice: 'Polly.Amy-Neural' }, 'I encountered an error. Please try again.');
    response.redirect(`${process.env.APP_URL}/media`);
    res.type('text/xml');
    res.send(response.toString());
  }
});

export default router;
