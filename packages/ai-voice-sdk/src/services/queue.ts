interface QueueItem<T> {
  id: string;
  data: T;
  priority: number;
  timestamp: number;
}

export class QueueService<T> {
  private queue: QueueItem<T>[] = [];
  private processing = false;
  private maxConcurrent: number;
  private processor: (item: T) => Promise<any>;

  constructor(processor: (item: T) => Promise<any>, maxConcurrent = 5) {
    this.processor = processor;
    this.maxConcurrent = maxConcurrent;
  }

  async add(id: string, data: T, priority = 0): Promise<any> {
    this.queue.push({
      id,
      data,
      priority,
      timestamp: Date.now()
    });

    this.queue.sort((a, b) => b.priority - a.priority);

    if (!this.processing) {
      this.processing = true;
      return this.processQueue();
    }
  }

  private async processQueue(): Promise<any> {
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);
      const results = await Promise.all(
        batch.map(item => this.processor(item.data))
      );
      if (batch.length === 1) return results[0];
    }
    this.processing = false;
  }

  clear(): void {
    this.queue = [];
  }

  getQueueLength(): number {
    return this.queue.length;
  }
} 