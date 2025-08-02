/**
 * Vocabulary service for providing candidate words for similarity search
 * This is a simplified version that would be replaced with a proper database in production
 */

export interface VocabularyWord {
  word: string;
  language: string;
  frequency?: number; // How common the word is
  category?: string; // e.g., 'noun', 'verb', 'adjective'
}

export class VocabularyService {
  // A curated list of common words across multiple languages
  // In production, this would be stored in a database with pre-computed embeddings
  private commonWords: VocabularyWord[] = [
    // English words
    { word: 'queen', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'king', language: 'en', frequency: 0.9, category: 'noun' },
    { word: 'man', language: 'en', frequency: 0.95, category: 'noun' },
    { word: 'woman', language: 'en', frequency: 0.95, category: 'noun' },
    { word: 'prince', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'princess', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'lady', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'gentleman', language: 'en', frequency: 0.6, category: 'noun' },
    
    // Cities and countries
    { word: 'london', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'paris', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'berlin', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'madrid', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'rome', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'tokyo', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'beijing', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'moscow', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'istanbul', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'ankara', language: 'en', frequency: 0.5, category: 'noun' },
    
    { word: 'france', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'england', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'germany', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'spain', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'italy', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'turkey', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'japan', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'china', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'russia', language: 'en', frequency: 0.7, category: 'noun' },
    
    // Emotions
    { word: 'happy', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'sad', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'joy', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'anger', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'love', language: 'en', frequency: 0.9, category: 'noun' },
    { word: 'hate', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'blissful', language: 'en', frequency: 0.5, category: 'adjective' },
    { word: 'euphoric', language: 'en', frequency: 0.4, category: 'adjective' },
    { word: 'delighted', language: 'en', frequency: 0.6, category: 'adjective' },
    { word: 'cheerful', language: 'en', frequency: 0.6, category: 'adjective' },
    { word: 'joyful', language: 'en', frequency: 0.6, category: 'adjective' },
    { word: 'optimistic', language: 'en', frequency: 0.5, category: 'adjective' },
    { word: 'depressed', language: 'en', frequency: 0.6, category: 'adjective' },
    { word: 'gloomy', language: 'en', frequency: 0.5, category: 'adjective' },
    { word: 'melancholy', language: 'en', frequency: 0.4, category: 'adjective' },
    
    // Colors and objects
    { word: 'red', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'blue', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'green', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'yellow', language: 'en', frequency: 0.8, category: 'adjective' },
    { word: 'black', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'white', language: 'en', frequency: 0.9, category: 'adjective' },
    { word: 'purple', language: 'en', frequency: 0.7, category: 'adjective' },
    { word: 'orange', language: 'en', frequency: 0.8, category: 'adjective' },
    
    { word: 'apple', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'banana', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'cherry', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'strawberry', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'tomato', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'fruit', language: 'en', frequency: 0.8, category: 'noun' },
    
    // Animals
    { word: 'cat', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'dog', language: 'en', frequency: 0.9, category: 'noun' },
    { word: 'bird', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'fish', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'lion', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'tiger', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'elephant', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'mouse', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'horse', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'cow', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'cheetah', language: 'en', frequency: 0.5, category: 'noun' },
    { word: 'leopard', language: 'en', frequency: 0.4, category: 'noun' },
    { word: 'panther', language: 'en', frequency: 0.4, category: 'noun' },
    
    // Technology
    { word: 'computer', language: 'en', frequency: 0.9, category: 'noun' },
    { word: 'phone', language: 'en', frequency: 0.9, category: 'noun' },
    { word: 'internet', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'smartphone', language: 'en', frequency: 0.8, category: 'noun' },
    { word: 'laptop', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'tablet', language: 'en', frequency: 0.6, category: 'noun' },
    
    // Turkish words
    { word: 'kral', language: 'tr', frequency: 0.7, category: 'noun' }, // king
    { word: 'kraliçe', language: 'tr', frequency: 0.7, category: 'noun' }, // queen
    { word: 'adam', language: 'tr', frequency: 0.9, category: 'noun' }, // man
    { word: 'kadın', language: 'tr', frequency: 0.9, category: 'noun' }, // woman
    { word: 'mutlu', language: 'tr', frequency: 0.8, category: 'adjective' }, // happy
    { word: 'üzgün', language: 'tr', frequency: 0.8, category: 'adjective' }, // sad
    { word: 'sevgi', language: 'tr', frequency: 0.8, category: 'noun' }, // love
    { word: 'kızgın', language: 'tr', frequency: 0.7, category: 'adjective' }, // angry
    { word: 'istanbul', language: 'tr', frequency: 0.9, category: 'noun' },
    { word: 'ankara', language: 'tr', frequency: 0.8, category: 'noun' },
    { word: 'türkiye', language: 'tr', frequency: 0.9, category: 'noun' },
    
    // More meaningful results
    { word: 'discovery', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'innovation', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'creation', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'imagination', language: 'en', frequency: 0.5, category: 'noun' },
    { word: 'wisdom', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'knowledge', language: 'en', frequency: 0.7, category: 'noun' },
    { word: 'understanding', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'compassion', language: 'en', frequency: 0.5, category: 'noun' },
    { word: 'courage', language: 'en', frequency: 0.6, category: 'noun' },
    { word: 'strength', language: 'en', frequency: 0.7, category: 'noun' },
  ];

  /**
   * Get candidate words for similarity search
   * Excludes the input words to avoid returning them as results
   */
  getCandidateWords(excludeWords: string[] = []): VocabularyWord[] {
    const lowercaseExcludes = excludeWords.map(w => w.toLowerCase());
    return this.commonWords.filter(
      word => !lowercaseExcludes.includes(word.word.toLowerCase())
    );
  }

  /**
   * Get words by language
   */
  getWordsByLanguage(language: string, excludeWords: string[] = []): VocabularyWord[] {
    const candidates = this.getCandidateWords(excludeWords);
    return candidates.filter(word => word.language === language);
  }

  /**
   * Get words by category
   */
  getWordsByCategory(category: string, excludeWords: string[] = []): VocabularyWord[] {
    const candidates = this.getCandidateWords(excludeWords);
    return candidates.filter(word => word.category === category);
  }

  /**
   * Get high-frequency words (more common/meaningful results)
   */
  getHighFrequencyWords(minFrequency: number = 0.6, excludeWords: string[] = []): VocabularyWord[] {
    const candidates = this.getCandidateWords(excludeWords);
    return candidates.filter(word => (word.frequency || 0) >= minFrequency);
  }
}

export const vocabularyService = new VocabularyService();
