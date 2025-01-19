import { CallMetrics } from '../types';

export interface AggregateMetrics extends CallMetrics {
  totalCalls: number;
  averageDuration: number;
  totalCost: number;
  successRate: number;
}

export class MetricsService {
  private metrics: Map<string, CallMetrics> = new Map();

  trackCall(callId: string, metrics: CallMetrics): void {
    this.metrics.set(callId, {
      ...this.metrics.get(callId),
      ...metrics
    });
  }

  getCallMetrics(callId: string): CallMetrics | undefined {
    return this.metrics.get(callId);
  }

  getAggregateMetrics(): AggregateMetrics {
    let totalDuration = 0;
    let totalCost = 0;
    let successfulCalls = 0;

    this.metrics.forEach(metric => {
      totalDuration += metric.duration;
      totalCost += metric.cost;
      if (metric.status === 'completed') successfulCalls++;
    });

    return {
      totalCalls: this.metrics.size,
      averageDuration: totalDuration / this.metrics.size,
      totalCost,
      successRate: (successfulCalls / this.metrics.size) * 100,
      duration: totalDuration,
      cost: totalCost,
      status: 'completed'
    };
  }
} 