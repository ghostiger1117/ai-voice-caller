export interface TTSProviderConfig {
  name: string;
  enabled: boolean;
  priority?: number;
  config?: {
    apiKey?: string;
    voiceId?: string;
    model?: string;
    // Add other provider-specific config options
  };
}

export interface TTSServiceConfig {
  providers: TTSProviderConfig[];
} 