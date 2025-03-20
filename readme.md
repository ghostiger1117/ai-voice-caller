# AI Voice Caller with Twilio & ElevenLabs 🎙️

A sophisticated AI-powered voice caller that combines Twilio's telephony capabilities with ElevenLabs' natural voice generation and OpenAI's GPT-3.5 for intelligent conversations.

## Features 🌟

- Natural voice conversations using ElevenLabs
- Intelligent responses powered by GPT-3.5
- Inbound & outbound call handling
- Speech recognition with Twilio
- Conversation memory and context awareness
- Automatic audio file cleanup
- Error handling and fallback mechanisms
- Multi-language support
- Real-time call status monitoring

## Tech Stack 💻

- TypeScript/Node.js
- Express.js
- Twilio
- ElevenLabs API
- OpenAI GPT-3.5 / GPT-4
- FFmpeg for audio processing
- Pino for logging

## Quick Start 🚀

1. Clone the repository
```bash
git clone https://github.com/your-username/ai-voice-caller.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
PORT=3000
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
ELEVENLABS_VOICE_ID=your_voice_id
ELEVENLABS_AGENT_ID=your_agent_id
APP_URL=your_ngrok_url
```

4. Run the development server
```bash
npm run dev
```

## API Endpoints 🛣️

- `/inbound` - Handle incoming calls
- `/outbound` - Initiate outbound calls
- `/media` - Process speech and generate responses
- `/call-status` - Monitor call status
- `/health` - Service health check

## Code Structure 📁

The main components are organized as follows:

1. **Routes** - Handle different API endpoints

```1:136:src/routes/media.routes.ts
import { Router, Request, Response } from 'express';
import { getGPTResponse } from '../services/gpt.service';
import { generateSpeech } from '../services/elevenlabs.service';
import { twiml } from 'twilio';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { GatherAttributes } from 'twilio/lib/twiml/VoiceResponse';
 */
const router: Router = Router();
const logger = pino();
const audioDir = path.join(__dirname, '../../public/audio');
    const { CallSid } = req.body;
// Ensure audio directory exists
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
    console.log(`[AI] Generated Response: ${aiResponse}`);
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
        input: ['speech'],
// Handle speech events from Twilio
router.post('/', async (req: Request, res: Response) => {
      try {
    const { SpeechResult, CallSid, Confidence } = req.body;
    logger.info({ CallSid, SpeechResult, Confidence }, 'Received speech input');
        profanityFilter:false,
    const response = new twiml.VoiceResponse();
        });
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
        // Play the hosted audio file
    if (SpeechResult && parseFloat(Confidence) > 0.6) {
      // Generate AI response
      const aiResponse = await getGPTResponse(SpeechResult, CallSid);
      logger.info({ aiResponse }, 'Generated AI response');
          try {
      // Generate speech using ElevenLabs
      const audioBuffer = await generateSpeech(aiResponse);
      const audioFilename = `${CallSid}-${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFilename);
        }, 60000); // Clean up after 1 minute
      // Save the audio file
      await fs.promises.writeFile(audioPath, audioBuffer);
      logger.info({ audioPath }, 'Saved audio file');
        // Fallback to Twilio's TTS if ElevenLabs fails
      // Play the audio file using the full URL
      const audioUrl = `${process.env.APP_URL}/audio/${audioFilename}`;
      logger.info({ audioUrl }, 'Playing audio');
      response.play(audioUrl);
      response.gather({
      // Clean up after delay
      setTimeout(async () => {
        try {
          await fs.promises.unlink(audioPath);
          logger.info({ audioPath }, 'Cleaned up audio file');
        } catch (err) {
          logger.error({ err }, 'Error cleaning up audio file');
        }, 30000);
      }, 30000);
      // No speech detected, prompt user
      // Continue listening
      response.gather({
        input: ['speech'],
        timeout: 5,
        speechTimeout: 'auto',
        action: `${process.env.APP_URL}/media`,
        speechModel: 'experimental_utterances',
        language: 'en-US',
        profanityFilter: false,
      });
    } else {
      // Handle low confidence or no speech
      const promptAudio = await generateSpeech(
        "I didn't catch that. Could you please repeat?"
      );
      const audioFilename = `${CallSid}-prompt-${Date.now()}.mp3`;
      const audioPath = path.join(audioDir, audioFilename);
      await fs.promises.writeFile(audioPath, promptAudio);
      // No speech detected
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
    if (isValid) {
    response.redirect(`${process.env.APP_URL}/media`);
    res.type('text/xml');
    res.send(response.toString());
    }
  } catch (error) {
    logger.error({ error }, 'Critical error in media handler');
    const response = new twiml.VoiceResponse();
    response.say({ voice: 'Polly.Amy-Neural' }, 'I encountered an error. Please try again.');
    response.redirect(`${process.env.APP_URL}/media`);
    res.type('text/xml');
    res.send(response.toString());
  }
});
```


2. **Services** - Core business logic

```1:52:src/services/elevenlabs.service.ts
import axios from 'axios';
import pino from 'pino';
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
const logger = pino();
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
const voiceId = process.env.ELEVENLABS_VOICE_ID || '';
 * Generate speech using ElevenLabs.
interface ElevenLabsOptions {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}
      headers: {
const defaultVoiceOptions: ElevenLabsOptions = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.7,
  use_speaker_boost: true,
};

export const generateSpeech = async (
  text: string, 
  options: Partial<ElevenLabsOptions> = {}
): Promise<Buffer> => {
  try {
    const voiceOptions = { ...defaultVoiceOptions, ...options };
    logger.info({ text: text.substring(0, 50) }, 'Generating speech with ElevenLabs');

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceOptions,
      },
      {
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      },
    );

    logger.info('Successfully generated speech with ElevenLabs');
    return Buffer.from(response.data);
  } catch (error) {
    logger.error({ error }, 'Error generating speech with ElevenLabs');
    throw new Error('Failed to generate speech with ElevenLabs');
  }
};
```


3. **Configuration** - Environment and app setup

```1:15:src/config/env.ts
import dotenv from 'dotenv';
import { cleanEnv, str, port } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE_NUMBER: str(),
  OPENAI_API_KEY: str(),
  ELEVENLABS_API_KEY: str(),
  ELEVENLABS_VOICE_ID: str(),
  ELEVENLABS_AGENT_ID: str(),
});
```


## Contributing 🤝

This project is maintained by [@ghostiger1117](https://github.com/ghostiger1117). Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📝

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments 👏

- [@ghostiger1117](https://github.com/ghostiger1117) - Project Creator & Maintainer
- Twilio - Telephony Services
- ElevenLabs - Voice Generation
- OpenAI - Natural Language Processing

## Contact 📧

Moeid Saleem - [@ghostiger1117](https://github.com/ghostiger1117)

Project Link: [https://github.com/ghostiger1117/ai-voice-caller](https://github.com/ghostiger1117/ai-voice-caller)

---

Made with ❤️ by [@ghostiger1117](https://github.com/ghostiger1117)
