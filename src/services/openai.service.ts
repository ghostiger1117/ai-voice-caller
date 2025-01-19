import { OpenAI } from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { EmotionResult, EmotionAnalysisOptions } from '../types/emotion';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async generateResponse(prompt: string, options?: EmotionAnalysisOptions): Promise<string> {
    try {
      const emotionContext = options ? 
        `Consider the user's emotional state (happiness: ${options.emotion?.happy}, neutral: ${options.emotion?.neutral}, anger: ${options.emotion?.angry}, sadness: ${options.emotion?.sad}) and sentiment (${options.sentiment}) when responding.` 
        : '';

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `You are an empathetic AI assistant. ${emotionContext}`
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      logger.error({ error }, 'OpenAI API error');
      throw error;
    }
  }

  async transcribeAudio(audioFile: Buffer): Promise<string> {
    try {
      const response = await this.client.audio.transcriptions.create({
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

  async analyzeEmotion(text: string): Promise<EmotionResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Analyze the emotional content of the following text. Return a JSON object with sentiment (0-1) and emotion percentages."
        }, {
          role: "user",
          content: text
        }]
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return {
        sentiment: analysis.sentiment || 0.5,
        emotions: analysis.emotions || {
          happy: 0.25,
          neutral: 0.25,
          angry: 0.25,
          sad: 0.25
        },
        transcription: text
      };
    } catch (error) {
      logger.error({ error }, 'Failed to analyze emotion');
      throw error;
    }
  }
} 
