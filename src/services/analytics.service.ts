import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { CallData } from '../types/analytics';

export class AnalyticsService {
  private analyticsDir: string;

  constructor() {
    this.analyticsDir = path.join(__dirname, '../../analytics');
    this.ensureAnalyticsDir();
  }

  private async ensureAnalyticsDir() {
    try {
      await fs.mkdir(this.analyticsDir, { recursive: true });
    } catch (error) {
      logger.error({ error }, 'Failed to create analytics directory');
    }
  }

  async trackCall(callData: CallData) {
    try {
      const filename = `${callData.callSid}-${Date.now()}.json`;
      const filepath = path.join(this.analyticsDir, filename);
      
      await fs.writeFile(
        filepath, 
        JSON.stringify({ ...callData, timestamp: new Date() }, null, 2)
      );
      
      logger.info({ callSid: callData.callSid }, 'Stored call analytics');
    } catch (error) {
      logger.error({ error }, 'Failed to store call analytics');
    }
  }

  async getCallHistory(limit = 10): Promise<CallData[]> {
    try {
      const files = await fs.readdir(this.analyticsDir);
      const recent = files
        .filter(f => f.endsWith('.json'))
        .sort()
        .slice(-limit);
      
      const calls = await Promise.all(
        recent.map(async file => {
          const data = await fs.readFile(
            path.join(this.analyticsDir, file), 
            'utf-8'
          );
          return JSON.parse(data);
        })
      );
      
      return calls;
    } catch (error) {
      logger.error({ error }, 'Failed to get call history');
      return [];
    }
  }
} 