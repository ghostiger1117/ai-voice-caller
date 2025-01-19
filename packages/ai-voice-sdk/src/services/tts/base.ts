export interface TTSOptions {
  language?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  emotion?: string;
}

export interface TTSProvider {
  name: string;
  priority: number;
  generateSpeech(text: string, options?: TTSOptions): Promise<Buffer>;
}

export class TTSError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TTSError';
  }
} 