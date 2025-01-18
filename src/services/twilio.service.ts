import twilio from 'twilio';
import pino from 'pino';
import { generateSpeech } from './elevenlabs.service';
import fs from 'fs';
import path from 'path';

const logger = pino();
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
const client = twilio(accountSid, authToken);
const audioDir = path.join(__dirname, '../../public/audio');

export const createOutboundCall = async (to: string): Promise<string> => {
  try {
    logger.info({ to }, 'Creating outbound call');
    
    // Single greeting generation
    const greetingAudio = await generateSpeech("Hello! How can I assist you today?");
    const audioFilename = `greeting-${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    await fs.promises.writeFile(audioPath, greetingAudio);
    
    const call = await client.calls.create({
      to,
      from: twilioPhoneNumber,
      twiml: `
        <Response>
          <Play>${process.env.APP_URL}/audio/${audioFilename}</Play>
          <Gather 
            input="speech" 
            timeout="5" 
            speechTimeout="auto"
            speechModel="phone_call"
            language="en-US"
            action="${process.env.APP_URL}/media"
          />
        </Response>
      `,
      statusCallback: `${process.env.APP_URL}/call-status`,
      statusCallbackMethod: 'POST',
    });

    // Clean up audio file after delay
    setTimeout(() => fs.promises.unlink(audioPath), 30000);
    
    return call.sid;
  } catch (error) {
    logger.error({ error }, 'Error creating outbound call');
    throw error;
  }
};
