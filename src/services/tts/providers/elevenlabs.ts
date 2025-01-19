import { TTSProvider, TTSOptions, TTSError } from '../base';
import { ElevenLabsService } from '../../elevenlabs.service';

export class ElevenLabsTTSProvider implements TTSProvider {
  name = 'elevenlabs';
  priority = 1;
  private service: ElevenLabsService;

  constructor(config?: any) {
    this.service = new ElevenLabsService();
  }

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
      return await this.service.generateSpeech(text, {
        emotion: options?.emotion
      });
    } catch (error) {
      throw new TTSError(
        'ElevenLabs TTS failed',
        this.name,
        error as Error
      );
    }
  }
} 