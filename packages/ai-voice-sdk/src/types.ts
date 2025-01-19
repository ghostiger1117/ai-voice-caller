export interface AIVoiceConfig {
  apiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  baseUrl?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  maxConcurrentCalls?: number;
  cacheTTL?: number;
  cacheMaxSize?: number;
  retryAttempts?: number;
  timeout?: number;
}

export interface CallOptions {
  to: string;
  message?: string;
  audioUrl?: string;
  language?: string;
  voiceId?: string;
  callbackUrl?: string;
  webhookEvents?: string[];
  voiceSettings?: VoiceSettings;
}

export interface CallResponse {
  callId: string;
  status: 'initiated' | 'failed' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'canceled';
  message: string;
  details?: {
    to: string;
    from?: string;
    duration?: number;
    callbackUrl?: string;
    body?: string;
  };
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

export interface CallMetrics {
  duration: number;
  cost: number;
  status: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface AggregateMetrics extends CallMetrics {
  totalCalls: number;
  averageDuration: number;
  totalCost: number;
  successRate: number;
}

export interface TranscriptOptions {
  format?: 'text' | 'json' | 'html';
  includeTiming?: boolean;
  speakerLabels?: boolean;
}

export interface CallFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  phoneNumber?: string;
  minDuration?: number;
  maxDuration?: number;
}

export interface AnalyticsData {
  callId: string;
  duration: number;
  status: string;
  from: string;
  to: string;
  cost?: number;
  type: 'voice' | 'sms';
} 