export type MediaType = 'text' | 'image' | 'audio' | 'video';

export interface AnalysisIndicator {
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  confidenceScore: number; // 0 to 100, where 100 is "Highly likely to be AI"
  summary: string;
  indicators: AnalysisIndicator[];
  isAI: boolean;
  metadata?: {
    modelVersion: string;
    analysisLatency: number;
    forensicHash: string;
  };
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
