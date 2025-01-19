import axios, { AxiosError } from 'axios';
import { AIVoiceConfig, VoiceSettings } from '../types';
import { AIVoiceError, ErrorCodes } from '../utils/errors';

export class ElevenLabsService {
  private config: AIVoiceConfig;
  private baseUrl: string;

  constructor(config: AIVoiceConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io/v1';
  }

  async generateSpeech(text: string, voiceSettings?: VoiceSettings): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.config.elevenLabsVoiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': this.config.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert audio buffer to base64 and return data URL
      const base64Audio = Buffer.from(response.data).toString('base64');
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new AIVoiceError(
          `ElevenLabs API error: ${error.response?.data || error.message}`,
          ErrorCodes.ELEVENLABS_ERROR,
          error.response?.data
        );
      }
      throw new AIVoiceError(
        'Failed to generate speech',
        ErrorCodes.ELEVENLABS_ERROR,
        error
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/voices`, {
        headers: { 'xi-api-key': this.config.elevenLabsApiKey }
      });
      return true;
    } catch {
      return false;
    }
  }

  async getVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: { 'xi-api-key': this.config.elevenLabsApiKey }
      });
      return response.data.voices;
    } catch (error) {
      throw new AIVoiceError(
        'Failed to fetch voices',
        ErrorCodes.ELEVENLABS_ERROR,
        error
      );
    }
  }
} 