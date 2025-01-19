import { TTSProviderConfig } from '../../types/tts';
import { ElevenLabsTTSProvider } from './providers/elevenlabs';
import { GoogleTTSProvider } from './providers/google';
import { TwilioTTSProvider } from './providers/twilio';
import { logger } from '../../utils/logger';
import { TTSProvider } from './base';

export class TTSProviderFactory {
  static createProvider(config: TTSProviderConfig): TTSProvider | null {
    try {
      switch (config.name.toLowerCase()) {
        case 'elevenlabs':
          return new ElevenLabsTTSProvider(config.config);
        case 'google':
          return new GoogleTTSProvider(config.config);
        case 'twilio':
          return new TwilioTTSProvider(config.config);
        default:
          logger.warn({ provider: config.name }, 'Unknown TTS provider');
          return new ElevenLabsTTSProvider(config.config); // Default to ElevenLabs
      }
    } catch (error) {
      logger.error({ error, config }, 'Failed to create TTS provider');
      return null;
    }
  }
} 