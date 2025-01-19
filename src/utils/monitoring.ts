import prometheus from 'prom-client';

export const metrics = {
  callDuration: new prometheus.Histogram({
    name: 'call_duration_seconds',
    help: 'Duration of calls in seconds',
    buckets: [30, 60, 120, 300, 600]
  }),
  
  callSentiment: new prometheus.Gauge({
    name: 'call_sentiment',
    help: 'Sentiment score of calls'
  }),
  
  activeCallsCount: new prometheus.Gauge({
    name: 'active_calls_count',
    help: 'Number of active calls'
  })
};

export const initMonitoring = () => {
  prometheus.collectDefaultMetrics();
}; 