interface CacheOptions {
  ttl: number;
  maxSize: number;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class CacheService<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: CacheOptions;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000
    };
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  clear(): void {
    this.cache.clear();
  }
} 