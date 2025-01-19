import { logger } from '../utils/logger';

interface CallStatus {
  status: string;
  duration?: number;
  timestamp: Date;
}

export class CallStatusService {
  private static callStatuses = new Map<string, CallStatus>();

  static async getStatus(callId: string): Promise<CallStatus | null> {
    return this.callStatuses.get(callId) || null;
  }

  static async updateStatus(callId: string, status: string, duration?: number) {
    try {
      this.callStatuses.set(callId, {
        status,
        duration,
        timestamp: new Date()
      });
      
      // Cleanup old statuses
      this.cleanup();
    } catch (error) {
      logger.error({ error, callId }, 'Failed to update call status');
      throw error;
    }
  }

  private static cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [callId, status] of this.callStatuses) {
      if (status.timestamp < oneHourAgo) {
        this.callStatuses.delete(callId);
      }
    }
  }
} 