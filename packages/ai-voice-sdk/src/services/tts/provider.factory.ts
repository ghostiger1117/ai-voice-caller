import { TTSProvider } from './base';
import { ElevenLabsTTSProvider } from './providers/elevenlabs';
import { GoogleTTSProvider } from './providers/google';
import { TwilioTTSProvider } from './providers/twilio';
import { LoggerService } from '../logger';

export class TTSProviderFactory {
  private static logger = new LoggerService({ level: 'info' });

  static createProvider(config: {
    name: string;
    enabled: boolean;
    priority?: number;
    config?: any;
  }): TTSProvider | null {
    try {
      switch (config.name.toLowerCase()) {
        case 'elevenlabs':
          return new ElevenLabsTTSProvider(config.config);
        case 'google':
          return new GoogleTTSProvider(config.config);
        case 'twilio':
          return new TwilioTTSProvider(config.config);
        default:
          this.logger.warn(`Unknown TTS provider: ${config.name}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create TTS provider: ${config.name}`, error as Error);
      return null;
    }
  }
} 