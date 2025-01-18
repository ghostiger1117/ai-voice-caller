import axios from 'axios';
import pino from 'pino';

const logger = pino();
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
const voiceId = process.env.ELEVENLABS_VOICE_ID || '';

interface ElevenLabsOptions {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

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

// Verify ElevenLabs configuration
export const verifyElevenLabsConfig = async (): Promise<boolean> => {
  try {
    const response = await axios.get(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
      },
    );
    return response.status === 200;
  } catch (error) {
    logger.error({ error }, 'ElevenLabs configuration verification failed');
    return false;
  }
};
