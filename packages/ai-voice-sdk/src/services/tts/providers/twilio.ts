import { twiml } from 'twilio';
import { TTSProvider, TTSOptions, TTSError } from '../base';
import type { Say } from 'twilio/lib/twiml/VoiceResponse';

type TwilioVoice = 'man' | 'woman' | 'alice' | 'matthew';

export class TwilioTTSProvider implements TTSProvider {
  name = 'twilio';
  priority = 3;

  constructor(config?: any) {}

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const response = new twiml.VoiceResponse();
      response.say({
        voice: (options?.voice || 'alice') as Say['voice'],
        language: (options?.language || 'en-US') as Say['language']
      }, text);

      return Buffer.from(response.toString());
    } catch (error) {
      throw new TTSError(
        'Twilio TTS failed',
        this.name,
        error as Error
      );
    }
  }
} 