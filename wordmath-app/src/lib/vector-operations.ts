/**
 * Vector arithmetic operations for word embeddings
 */

export function addVectors(v1: number[], v2: number[]): number[] {
  if (v1.length !== v2.length) {
    throw new Error(`Vector dimensions must match: ${v1.length} !== ${v2.length}`);
  }
  return v1.map((val, idx) => val + v2[idx]);
}

export function subtractVectors(v1: number[], v2: number[]): number[] {
  if (v1.length !== v2.length) {
    throw new Error(`Vector dimensions must match: ${v1.length} !== ${v2.length}`);
  }
  return v1.map((val, idx) => val - v2[idx]);
}

export function multiplyVectorByScalar(vector: number[], scalar: number): number[] {
  return vector.map(val => val * scalar);
}

export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error(`Vector dimensions must match: ${v1.length} !== ${v2.length}`);
  }
  
  const dotProduct = v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
  const magnitude1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}

export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    return vector;
  }
  return vector.map(val => val / magnitude);
}

export function euclideanDistance(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error(`Vector dimensions must match: ${v1.length} !== ${v2.length}`);
  }
  
  const sumSquaredDifferences = v1.reduce((sum, val, idx) => {
    const diff = val - v2[idx];
    return sum + diff * diff;
  }, 0);
  
  return Math.sqrt(sumSquaredDifferences);
}

export function manhattanDistance(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error(`Vector dimensions must match: ${v1.length} !== ${v2.length}`);
  }
  
  return v1.reduce((sum, val, idx) => sum + Math.abs(val - v2[idx]), 0);
}

/**
 * Perform word arithmetic: word1 ± word2
 */
export function performWordArithmetic(
  embedding1: number[],
  embedding2: number[],
  operation: '+' | '-'
): number[] {
  switch (operation) {
    case '+':
      return addVectors(embedding1, embedding2);
    case '-':
      return subtractVectors(embedding1, embedding2);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

/**
 * Find the most similar vectors from a list of candidates
 */
export function findMostSimilar(
  targetVector: number[],
  candidateVectors: Array<{ vector: number[]; word: string; language?: string }>,
  topK: number = 3,
  excludeWords: string[] = []
): Array<{ word: string; similarity: number; language?: string }> {
  const similarities = candidateVectors
    .filter(candidate => !excludeWords.includes(candidate.word.toLowerCase()))
    .map(candidate => ({
      word: candidate.word,
      similarity: cosineSimilarity(targetVector, candidate.vector),
      language: candidate.language,
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
  
  return similarities;
}

/**
 * Generate some demo vectors for testing when we don't have a full vocabulary
 */
export function generateDemoSimilarWords(
  word1: string,
  word2: string,
  operation: '+' | '-'
): Array<{ word: string; similarity: number; language: string }> {
  // This is a temporary function for demo purposes
  // In production, this would be replaced with actual vector similarity search
  
  const demoResults: Record<string, Array<{ word: string; similarity: number; language: string }>> = {
    'king-man': [
      { word: 'queen', similarity: 0.87, language: 'en' },
      { word: 'princess', similarity: 0.72, language: 'en' },
      { word: 'lady', similarity: 0.68, language: 'en' },
    ],
    'paris-france': [
      { word: 'london', similarity: 0.83, language: 'en' },
      { word: 'berlin', similarity: 0.79, language: 'en' },
      { word: 'madrid', similarity: 0.76, language: 'en' },
    ],
    'happy+joy': [
      { word: 'blissful', similarity: 0.89, language: 'en' },
      { word: 'euphoric', similarity: 0.84, language: 'en' },
      { word: 'delighted', similarity: 0.81, language: 'en' },
    ],
    'apple+red': [
      { word: 'cherry', similarity: 0.85, language: 'en' },
      { word: 'strawberry', similarity: 0.78, language: 'en' },
      { word: 'tomato', similarity: 0.72, language: 'en' },
    ],
  };
  
  const key = `${word1.toLowerCase()}${operation}${word2.toLowerCase()}`;
  
  return demoResults[key] || [
    { word: 'result1', similarity: 0.75, language: 'en' },
    { word: 'result2', similarity: 0.68, language: 'en' },
    { word: 'result3', similarity: 0.62, language: 'en' },
  ];
}
