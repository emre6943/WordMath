export interface Word {
  id: string;
  word: string;
  language: string;
  embedding: number[];
  isCustom: boolean;
  addedBy?: string;
  createdAt: Date;
  usageCount: number;
  metadata?: {
    definition?: string;
    tags?: string[];
    approved?: boolean;
  };
}

export interface OperationRequest {
  word1: string;
  word2: string;
  operation: '+' | '-';
}

export interface SimilarityResult {
  word: string;
  similarity: number;
  language: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  processingTime?: number;
}

export interface OperationResult {
  results: SimilarityResult[];
  operation: string;
  processingTime: number;
  word1Embedding?: number[];
  word2Embedding?: number[];
  resultVector?: number[];
}

export type Operation = '+' | '-';

export interface EmbeddingCache {
  [word: string]: {
    embedding: number[];
    timestamp: number;
    language: string;
  };
}
