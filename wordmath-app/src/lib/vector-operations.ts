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
    // Classic word analogies
    'king-man': [
      { word: 'queen', similarity: 0.87, language: 'en' },
      { word: 'princess', similarity: 0.72, language: 'en' },
      { word: 'lady', similarity: 0.68, language: 'en' },
    ],
    'man-king': [
      { word: 'commoner', similarity: 0.79, language: 'en' },
      { word: 'peasant', similarity: 0.71, language: 'en' },
      { word: 'citizen', similarity: 0.65, language: 'en' },
    ],
    'paris-france': [
      { word: 'london', similarity: 0.83, language: 'en' },
      { word: 'berlin', similarity: 0.79, language: 'en' },
      { word: 'madrid', similarity: 0.76, language: 'en' },
    ],
    'france-paris': [
      { word: 'country', similarity: 0.81, language: 'en' },
      { word: 'nation', similarity: 0.77, language: 'en' },
      { word: 'republic', similarity: 0.73, language: 'en' },
    ],
    
    // Emotion combinations
    'happy+joy': [
      { word: 'blissful', similarity: 0.89, language: 'en' },
      { word: 'euphoric', similarity: 0.84, language: 'en' },
      { word: 'delighted', similarity: 0.81, language: 'en' },
    ],
    'joy+happy': [
      { word: 'blissful', similarity: 0.89, language: 'en' },
      { word: 'euphoric', similarity: 0.84, language: 'en' },
      { word: 'delighted', similarity: 0.81, language: 'en' },
    ],
    'happy-sad': [
      { word: 'joyful', similarity: 0.85, language: 'en' },
      { word: 'cheerful', similarity: 0.78, language: 'en' },
      { word: 'optimistic', similarity: 0.74, language: 'en' },
    ],
    'sad-happy': [
      { word: 'depressed', similarity: 0.82, language: 'en' },
      { word: 'gloomy', similarity: 0.76, language: 'en' },
      { word: 'melancholy', similarity: 0.71, language: 'en' },
    ],
    
    // Color and objects
    'apple+red': [
      { word: 'cherry', similarity: 0.85, language: 'en' },
      { word: 'strawberry', similarity: 0.78, language: 'en' },
      { word: 'tomato', similarity: 0.72, language: 'en' },
    ],
    'red+apple': [
      { word: 'cherry', similarity: 0.85, language: 'en' },
      { word: 'strawberry', similarity: 0.78, language: 'en' },
      { word: 'tomato', similarity: 0.72, language: 'en' },
    ],
    'apple-red': [
      { word: 'fruit', similarity: 0.84, language: 'en' },
      { word: 'orange', similarity: 0.77, language: 'en' },
      { word: 'banana', similarity: 0.73, language: 'en' },
    ],
    
    // Animals and qualities
    'cat+fast': [
      { word: 'cheetah', similarity: 0.82, language: 'en' },
      { word: 'leopard', similarity: 0.76, language: 'en' },
      { word: 'panther', similarity: 0.71, language: 'en' },
    ],
    'fast+cat': [
      { word: 'cheetah', similarity: 0.82, language: 'en' },
      { word: 'leopard', similarity: 0.76, language: 'en' },
      { word: 'panther', similarity: 0.71, language: 'en' },
    ],
    'dog+big': [
      { word: 'mastiff', similarity: 0.79, language: 'en' },
      { word: 'greathound', similarity: 0.74, language: 'en' },
      { word: 'rottweiler', similarity: 0.69, language: 'en' },
    ],
    
    // Technology
    'computer+fast': [
      { word: 'supercomputer', similarity: 0.83, language: 'en' },
      { word: 'workstation', similarity: 0.77, language: 'en' },
      { word: 'processor', similarity: 0.72, language: 'en' },
    ],
    'phone+smart': [
      { word: 'smartphone', similarity: 0.91, language: 'en' },
      { word: 'iphone', similarity: 0.84, language: 'en' },
      { word: 'android', similarity: 0.78, language: 'en' },
    ],
    
    // Weather and nature
    'sun+hot': [
      { word: 'desert', similarity: 0.81, language: 'en' },
      { word: 'summer', similarity: 0.76, language: 'en' },
      { word: 'tropical', similarity: 0.71, language: 'en' },
    ],
    'rain+cold': [
      { word: 'storm', similarity: 0.79, language: 'en' },
      { word: 'winter', similarity: 0.74, language: 'en' },
      { word: 'blizzard', similarity: 0.68, language: 'en' },
    ],
    
    // Common word combinations
    'love+music': [
      { word: 'passion', similarity: 0.82, language: 'en' },
      { word: 'melody', similarity: 0.76, language: 'en' },
      { word: 'harmony', similarity: 0.71, language: 'en' },
    ],
    'book+read': [
      { word: 'novel', similarity: 0.84, language: 'en' },
      { word: 'story', similarity: 0.78, language: 'en' },
      { word: 'literature', similarity: 0.73, language: 'en' },
    ],
    'car+speed': [
      { word: 'racecar', similarity: 0.86, language: 'en' },
      { word: 'motorcycle', similarity: 0.79, language: 'en' },
      { word: 'ferrari', similarity: 0.74, language: 'en' },
    ],
  };
  
  const key = `${word1.toLowerCase()}${operation}${word2.toLowerCase()}`;
  
  // If we don't have a specific combination, try to generate contextual results
  if (demoResults[key]) {
    return demoResults[key];
  }
  
  // Generate more contextual fallback results based on the words
  const fallbackResults = generateContextualResults(word1, word2, operation);
  if (fallbackResults.length > 0) {
    return fallbackResults;
  }
  
  // Last resort: generic but more meaningful results
  return [
    { word: 'discovery', similarity: 0.75, language: 'en' },
    { word: 'innovation', similarity: 0.68, language: 'en' },
    { word: 'creation', similarity: 0.62, language: 'en' },
  ];
}

/**
 * Generate contextual results based on word categories
 */
function generateContextualResults(
  word1: string,
  word2: string,
  operation: '+' | '-'
): Array<{ word: string; similarity: number; language: string }> {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  // Animal combinations
  const animals = ['cat', 'dog', 'bird', 'fish', 'lion', 'tiger', 'elephant', 'mouse', 'horse', 'cow'];
  if (animals.includes(w1) || animals.includes(w2)) {
    return [
      { word: 'creature', similarity: 0.76, language: 'en' },
      { word: 'mammal', similarity: 0.71, language: 'en' },
      { word: 'wildlife', similarity: 0.68, language: 'en' },
    ];
  }
  
  // Color combinations
  const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'purple', 'orange', 'pink', 'brown'];
  if (colors.includes(w1) || colors.includes(w2)) {
    return [
      { word: 'colorful', similarity: 0.78, language: 'en' },
      { word: 'vibrant', similarity: 0.73, language: 'en' },
      { word: 'bright', similarity: 0.69, language: 'en' },
    ];
  }
  
  // Emotion combinations
  const emotions = ['happy', 'sad', 'angry', 'joy', 'love', 'fear', 'surprise', 'calm', 'excited'];
  if (emotions.includes(w1) || emotions.includes(w2)) {
    return [
      { word: 'feeling', similarity: 0.79, language: 'en' },
      { word: 'emotion', similarity: 0.74, language: 'en' },
      { word: 'mood', similarity: 0.70, language: 'en' },
    ];
  }
  
  // Food combinations
  const foods = ['apple', 'banana', 'bread', 'cheese', 'meat', 'pizza', 'cake', 'coffee', 'tea', 'water'];
  if (foods.includes(w1) || foods.includes(w2)) {
    return [
      { word: 'delicious', similarity: 0.77, language: 'en' },
      { word: 'tasty', similarity: 0.72, language: 'en' },
      { word: 'nutritious', similarity: 0.67, language: 'en' },
    ];
  }
  
  return [];
}
