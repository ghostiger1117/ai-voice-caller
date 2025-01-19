import axios from 'axios';
import { AIVoiceConfig, AnalyticsData } from '../types';
import { RateLimit } from '../utils/rate-limit';

export class AnalyticsService {
  private config: AIVoiceConfig;
  private rateLimit: RateLimit;

  constructor(config: AIVoiceConfig) {
    this.config = config;
    this.rateLimit = new RateLimit(100, 60000); // 100 requests per minute
  }

  async trackCall(data: AnalyticsData) {
    await this.rateLimit.waitForSlot();
    
    try {
      await axios.post(
        `${this.config.baseUrl || 'https://api.atrix.dev'}/v1/analytics/calls`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      // Silently fail analytics
      console.error('Analytics error:', error);
    }
  }
} 