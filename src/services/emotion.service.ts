import { EmotionResult } from '../types/emotion';
import { logger } from '../utils/logger';
import { OpenAIService } from './openai.service';

export class EmotionService {
  private openai: OpenAIService;

  constructor() {
    this.openai = new OpenAIService();
  }

  async analyzeEmotion(audioBuffer: Buffer): Promise<EmotionResult> {
    try {
      const transcription = await this.openai.transcribeAudio(audioBuffer);
      const analysis = await this.openai.analyzeEmotion(transcription);
      
      return {
        sentiment: analysis.sentiment,
        emotions: analysis.emotions,
        transcription
      };
    } catch (error) {
      logger.error({ error }, 'Failed to analyze emotion');
      throw error;
    }
  }
} 