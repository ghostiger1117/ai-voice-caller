import { Router, Request, Response } from 'express';
import { getGPTResponse } from '../services/gpt.service';
import { generateSpeech } from '../services/elevenlabs.service';
import { twiml } from 'twilio';
import path from 'path';
import fs from 'fs';

const router: Router = Router();
const audioDir = path.join(__dirname, '../../public/audio');

router.post('/', async (req: Request, res: Response) => {
  const voiceResponse = new twiml.VoiceResponse();

  try {
    // Generate initial greeting with ElevenLabs
    const aiResponse = await getGPTResponse('Hello! How can I help you today?', 'temp_call_sid');
    const audioBuffer = await generateSpeech(aiResponse);
    
    // Save audio file
    const audioFilename = `greeting-${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    await fs.promises.writeFile(audioPath, audioBuffer);

    // Play audio and setup gather
    voiceResponse.play(`${process.env.APP_URL}/audio/${audioFilename}`);
    voiceResponse.gather({
      input: ['speech'],
      timeout: 5,
      speechTimeout: 'auto',
      action: `${process.env.APP_URL}/media`,
      speechModel: 'phone_call',
      language: 'en-US',
      profanityFilter: false
    });

    // Clean up audio file after delay
    setTimeout(async () => {
      try {
        await fs.promises.unlink(audioPath);
      } catch (err) {
        console.error('Error cleaning up audio file:', err);
      }
    }, 30000);

    res.type('text/xml');
    res.send(voiceResponse.toString());
  } catch (error) {
    console.error('Error handling incoming call:', error);
    voiceResponse.say({ voice: 'Polly.Amy-Neural' }, 'We are currently experiencing issues. Please try again later.');
    res.type('text/xml');
    res.send(voiceResponse.toString());
  }
});

export default router;
