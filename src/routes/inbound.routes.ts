import { Router, Request, Response } from 'express';
import { getGPTResponse } from '../services/gpt.service';
import { generateSpeech } from '../services/elevenlabs.service';
        import { twiml } from 'twilio';
const router: Router = Router();

/**
 * Handle incoming calls.
 */
router.post('/', async (req: Request, res: Response) => {
    console.log('Inbound call received');
    console.log(req.body);
  const voiceResponse = new twiml.VoiceResponse();

  try {
    // Generate AI response
    const aiResponse = await getGPTResponse('Hello! How can I help you today?', 'temp_call_sid');
    const audioBuffer = await generateSpeech(aiResponse);

    // Convert audio to Base64 for Twilio
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    voiceResponse.play(audioUrl);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(voiceResponse.toString());
  } catch (error) {
    console.error('Error handling incoming call:', error);
    voiceResponse.say('We are currently experiencing issues. Please try again later.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(voiceResponse.toString());
  }
});

export default router;
