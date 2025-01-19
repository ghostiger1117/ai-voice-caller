import { OpenAI } from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      logger.error({ error }, 'OpenAI API error');
      throw error;
    }
  }

  async transcribeAudio(audioFile: Buffer): Promise<string> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: new File([audioFile], 'audio.mp3', { type: 'audio/mp3' }),
        language: 'en',
        response_format: 'text',
      });
      return response;
    } catch (error) {
      logger.error({ error }, 'Failed to transcribe audio');
      throw error;
    }
  }
} 
