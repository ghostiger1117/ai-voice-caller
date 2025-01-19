export interface CallData {
  callSid: string;
  duration: number;
  sentiment: number;
  transcription: string;
  emotions?: {
    happy: number;
    neutral: number;
    angry: number;
    sad: number;
  };
}

export interface EmotionResult {
  sentiment: number;
  emotions: {
    happy: number;
    neutral: number;
    angry: number;
    sad: number;
  };
  transcription: string;
} 