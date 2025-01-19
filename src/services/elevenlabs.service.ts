import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class ElevenLabsService {
  private baseUrl = 'https://api.elevenlabs.io/v1';

  async generateSpeech(text: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${env.ELEVENLABS_VOICE_ID}`,
        { text },
        {
          headers: {
            'xi-api-key': env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      // Save audio file and return URL
      const audioUrl = await this.saveAudioFile(response.data);
      return audioUrl;
    } catch (error) {
      logger.error({ error }, 'ElevenLabs API error');
      throw error;
    }
  }

  private async saveAudioFile(audioBuffer: Buffer): Promise<string> {
    // Implementation to save audio file and return public URL
    // This would typically involve saving to disk or cloud storage
    return '/audio/response.mp3';
  }
}
