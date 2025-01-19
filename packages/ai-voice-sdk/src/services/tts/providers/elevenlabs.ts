import axios from 'axios';
import { TTSProvider, TTSOptions, TTSError } from '../base';
import { AIVoiceError, ErrorCodes } from '../../../utils/errors';

export class ElevenLabsTTSProvider implements TTSProvider {
  name = 'elevenlabs';
  priority = 1;
  private apiKey: string;
  private voiceId: string;
  private baseUrl: string;

  constructor(config: any) {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      throw new TTSError(
        'ElevenLabs TTS failed',
        this.name,
        error as Error
      );
    }
  }
} 