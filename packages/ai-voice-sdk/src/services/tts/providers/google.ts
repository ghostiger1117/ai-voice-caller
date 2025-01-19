import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { TTSProvider, TTSOptions, TTSError } from '../base';

export class GoogleTTSProvider implements TTSProvider {
  name = 'google';
  priority = 2;
  private client: TextToSpeechClient;

  constructor(config: any) {
    this.client = new TextToSpeechClient({
      credentials: config.credentials
    });
  }

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const [response] = await this.client.synthesizeSpeech({
        input: { text },
        voice: {
          languageCode: options?.language || 'en-US',
          name: options?.voice || 'en-US-Neural2-F',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: options?.pitch || 0,
          speakingRate: options?.speed || 1
        },
      });

      return Buffer.from(response.audioContent as Uint8Array);
    } catch (error) {
      throw new TTSError(
        'Google TTS failed',
        this.name,
        error as Error
      );
    }
  }
} 