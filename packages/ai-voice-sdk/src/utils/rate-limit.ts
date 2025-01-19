export class RateLimit {
  private timestamps: number[] = [];
  private readonly limit: number;
  private readonly interval: number;

  constructor(limit: number, intervalMs: number) {
    this.limit = limit;
    this.interval = intervalMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(
      time => now - time < this.interval
    );

    if (this.timestamps.length >= this.limit) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  async waitForSlot(): Promise<void> {
    while (!(await this.checkLimit())) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
} 