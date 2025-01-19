export interface AIVoiceConfig {
  apiKey: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  baseUrl?: string;
}

export interface CallOptions {
  to: string;
  message: string;
  language?: string;
  voiceId?: string;
  callbackUrl?: string;
  webhookEvents?: string[];
}

export interface CallResponse {
  callId: string;
  status: 'initiated' | 'failed';
  message?: string;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
} 