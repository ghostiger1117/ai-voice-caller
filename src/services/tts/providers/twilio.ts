import { TTSProvider, TTSOptions, TTSError } from '../base';
import { twiml } from 'twilio';
import { logger } from '../../../utils/logger';

export class TwilioTTSProvider implements TTSProvider {
  name = 'twilio';
  priority = 3;

  constructor(config?: any) {}

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const response = new twiml.VoiceResponse();
      response.say({
        voice: options?.voice || 'alice',
        language: options?.language || 'en-US'
      }, text);

      return Buffer.from(response.toString());
    } catch (error) {
      logger.error({ error }, 'Twilio TTS failed');
      throw new TTSError(
        'Twilio TTS failed',
        this.name,
        error as Error
      );
    }
  }
} 