import { TTSError } from '../services/tts/base';

import { TTSOptions } from '../services/tts/base';
import { TTSService } from '../services/tts/tts.service';

export * from '../services/tts/base';
export * from '../services/tts/tts.service';
export * from '../services/tts/providers/elevenlabs';
export * from '../services/tts/providers/google';
export * from '../services/tts/providers/twilio';
export * from '../services/tts/provider.factory';



export interface TTSConfig {
  providers: {
    name: string;
    enabled: boolean;
    priority?: number;
    config?: any;
  }[];
}

export class TTSManager {
  private service: TTSService;

  constructor(config: TTSConfig) {
    this.service = new TTSService(config);
  }

  async synthesize(text: string, options?: TTSOptions): Promise<Buffer> {
    return this.service.generateSpeech(text, options);
  }
}

export { TTSOptions, TTSError };