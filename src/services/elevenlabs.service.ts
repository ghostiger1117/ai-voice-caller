import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { VoiceSettings } from '../types/voice';

export class ElevenLabsService {
  private baseUrl = 'https://api.elevenlabs.io/v1';

  async generateSpeech(text: string, options?: { emotion?: any }) {
    try {
      const voiceSettings: VoiceSettings = {
        stability: options?.emotion?.neutral ? 0.8 : 0.5,
        similarityBoost: 0.8,
        style: 0.7,
        useSpeakerBoost: true
      };

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings,
        },
        {
          headers: {
            'xi-api-key': env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      logger.error({ error }, 'Failed to generate speech');
      throw error;
    }
  }

  private async saveAudioFile(audioBuffer: Buffer): Promise<string> {
    // Implementation to save audio file and return public URL
    // This would typically involve saving to disk or cloud storage
    return '/audio/response.mp3';
  }
}
