import { LoggerService } from '../logger';
import { TTSProvider, TTSOptions, TTSError } from './base';
import { TTSProviderFactory } from './provider.factory';
import { TTSConfig } from '../../types';

export class TTSService {
  private providers: TTSProvider[] = [];
  private logger: LoggerService;

  constructor(config: TTSConfig) {
    this.logger = new LoggerService({ level: config.logLevel });
    
    const providersConfig = config.providers || [];
    
    providersConfig
      .filter(p => p.enabled)
      .forEach(p => {
        const provider = TTSProviderFactory.createProvider(p);
        if (provider) {
          this.providers.push(provider);
        }
      });

    this.providers.sort((a, b) => a.priority - b.priority);
  }

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    const errors: TTSError[] = [];

    for (const provider of this.providers) {
      try {
        const audio = await provider.generateSpeech(text, options);
        return audio;
      } catch (error) {
        errors.push(new TTSError(
          `Failed to generate speech with ${provider.name}`,
          provider.name,
          error as Error
        ));
      }
    }

    throw new TTSError(
      `All TTS providers failed: ${errors.map(e => e.message).join(', ')}`,
      'tts-service'
    );
  }
} 