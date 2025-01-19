import { logger } from '../../utils/logger';
import { TTSProvider, TTSOptions, TTSError } from './base';
import { TTSServiceConfig } from '../../types/tts';
import { TTSProviderFactory } from './provider.factory';

export class TTSService {
  private providers: TTSProvider[] = [];

  constructor(config?: TTSServiceConfig) {
    // Default configuration
    const defaultProviders = [
      { name: 'elevenlabs', enabled: true, priority: 1 },
      { name: 'google', enabled: true, priority: 2 },
      { name: 'twilio', enabled: true, priority: 3 }
    ];

    const providersConfig = config?.providers || defaultProviders;

    // Initialize enabled providers using factory
    providersConfig
      .filter(p => p.enabled)
      .forEach(p => {
        const provider = TTSProviderFactory.createProvider(p);
        if (provider) {
          this.providers.push(provider);
        }
      });

    // Sort by priority
    this.providers.sort((a, b) => a.priority - b.priority);

    logger.info(
      { providers: this.providers.map(p => p.name) },
      'TTS Service initialized'
    );
  }

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    const errors: TTSError[] = [];

    // Try each provider in order
    for (const provider of this.providers) {
      try {
        logger.info({ provider: provider.name }, 'Attempting to generate speech');
        const audio = await provider.generateSpeech(text, options);
        logger.info({ provider: provider.name }, 'Successfully generated speech');
        return audio;
      } catch (error) {
        logger.warn({ 
          provider: provider.name, 
          error 
        }, 'Failed to generate speech, trying next provider');
        errors.push(new TTSError(
          `Failed to generate speech with ${provider.name}`,
          provider.name,
          error as Error
        ));
      }
    }

    // If all providers failed
    throw new TTSError(
      'All TTS providers failed',
      'tts-service',
      new AggregateError(errors)
    );
  }
} 