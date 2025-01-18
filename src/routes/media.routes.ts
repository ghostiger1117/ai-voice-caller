import { Router, Request, Response } from 'express';
import { getGPTResponse } from '../services/gpt.service';
import { generateSpeech } from '../services/elevenlabs.service';
import { twiml } from 'twilio';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import type { GatherAttributes } from 'twilio/lib/twiml/VoiceResponse';

const router: Router = Router();
const logger = pino();
const audioDir = path.join(__dirname, '../../public/audio');

// Ensure audio directory exists
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const SPEECH_CONFIG = {
  enhanced: {
    input: ['speech'] as const,
    timeout: 3,
    speechTimeout: 'auto',
    speechModel: 'phone_call',
    language: 'en-US',
    profanityFilter: false,
    action: `${process.env.APP_URL}/media`
  } satisfies GatherAttributes
};

async function handleAudioResponse(response: any, text: string, CallSid: string) {
  try {
    const audioBuffer = await generateSpeech(text);
    const audioFilename = `${CallSid}-${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    
    await fs.promises.writeFile(audioPath, audioBuffer);
    response.play(`${process.env.APP_URL}/audio/${audioFilename}`);
    
    // Clean up after delay
    setTimeout(async () => {
      try {
        await fs.promises.unlink(audioPath);
      } catch (err) {
        logger.error({ err }, 'Error cleaning up audio file');
      }
    }, 30000);

    return true;
  } catch (error) {
    logger.error({ error }, 'Error handling audio response');
    return false;
  }
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { SpeechResult, CallSid, Confidence } = req.body;
    logger.info({ CallSid, SpeechResult, Confidence }, 'Received speech input');

    const response = new twiml.VoiceResponse();
    
    // Handle end call phrases
    if (SpeechResult && /\b(goodbye|bye|end call|hang up)\b/i.test(SpeechResult)) {
      await handleAudioResponse(response, 'Thank you for calling. Goodbye!', CallSid);
      res.type('text/xml');
      return res.send(response.toString());
    }

    if (SpeechResult) {
      const confidence = parseFloat(Confidence);
      logger.info({ confidence }, 'Speech confidence level');

      if (confidence > 0.6) {
        const aiResponse = await getGPTResponse(SpeechResult, CallSid);
        await handleAudioResponse(response, aiResponse, CallSid);
      } else {
        // Handle low confidence with clarification
        await handleAudioResponse(
          response, 
          "I didn't quite catch that. Could you please repeat?", 
          CallSid
        );
      }
      
      // Always add gather with proper timeout
      response.gather({
        ...SPEECH_CONFIG.enhanced,
        timeout: 5,  // Increased timeout
        endOnSilence: true
      } as GatherAttributes);
    } else {
      // No speech detected
      await handleAudioResponse(
        response,
        "I'm listening. Please go ahead.",
        CallSid
      );
      response.gather(SPEECH_CONFIG.enhanced as GatherAttributes);
    }

    res.type('text/xml');
    res.send(response.toString());

  } catch (error) {
    logger.error({ error }, 'Critical error in media handler');
    const response = new twiml.VoiceResponse();
    response.say({ voice: 'Polly.Amy-Neural' }, 'I encountered an error. Please try again.');
    response.gather(SPEECH_CONFIG.enhanced);
    res.type('text/xml');
    res.send(response.toString());
  }
});

export default router;
