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

export interface EmotionAnalysisOptions {
  emotion?: {
    happy: number;
    neutral: number;
    angry: number;
    sad: number;
  };
  sentiment?: number;
} 