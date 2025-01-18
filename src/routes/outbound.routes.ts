import { Router, Request, Response } from 'express';
import { createOutboundCall } from '../services/twilio.service';
import { getGPTResponse } from '../services/gpt.service';
import { generateSpeech } from '../services/elevenlabs.service';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import ffmpeg from 'fluent-ffmpeg';

const router: Router = Router();
const audioDir = path.join(__dirname, '../../public/audio');
const logger = pino();

// Ensure the audio directory exists
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Convert ElevenLabs audio to Twilio-compatible format


/**
 * Convert audio to Twilio-compatible format.
 */
export const convertToTwilioFormat = async (inputBuffer: Buffer, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tempInputPath = `${outputPath}.tmp`;
    fs.writeFileSync(tempInputPath, inputBuffer);

    ffmpeg(tempInputPath)
      .audioCodec('libmp3lame')
      .audioFrequency(8000) // Set frequency to 8 kHz
      .audioChannels(1)     // Mono channel
      .on('end', () => {
        fs.unlinkSync(tempInputPath); // Clean up temporary file
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .save(outputPath);
  });
};


/**
 * Initiate an outbound call with AI voice.
 */
router.post('/', async (req: Request, res: Response) => {
  const { to, prompt } = req.body;

  if (!to || !prompt || typeof to !== 'string' || typeof prompt !== 'string') {
    logger.warn({ body: req.body }, 'Invalid input received');
    return res.status(400).json({ 
      error: 'Invalid input: "to" and "prompt" must be non-empty strings.' 
    });
  }

  try {
    logger.info({ to, prompt }, 'Processing outbound call request');

    // Generate a temporary CallSid for initial prompt
    const tempCallSid = `temp_${Date.now()}`;
    
    // Get ChatGPT response
    const aiResponse = await getGPTResponse(prompt, tempCallSid);
    logger.debug({ aiResponse }, 'Received AI response');

    // Generate speech from AI response
    const audioBuffer = await generateSpeech(aiResponse);
    logger.debug('Generated audio from speech');

    // Save audio file locally with UUID
    const audioFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    await convertToTwilioFormat(audioBuffer, audioPath);
    logger.debug({ audioPath }, 'Saved audio file');

    // Generate public URL for the audio file
    const audioUrl = `${req.protocol}://${req.get('host')}/audio/${audioFilename}`;

    // Initiate the Twilio call
    const callSid = await createOutboundCall(to);
    logger.info({ callSid }, 'Outbound call initiated successfully');

    res.status(200).json({
      message: 'Outbound call initiated successfully!',
      callSid,
      audioUrl
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error, errorMessage }, 'Error initiating outbound call');
    res.status(500).json({ 
      error: 'Failed to initiate outbound call.',
      details: errorMessage
    });
  }
});

export default router;
