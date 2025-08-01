import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class EmbeddingService {
  // Using multilingual model that supports 50+ languages including English, Turkish, Spanish, French, German, etc.
  private modelName = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
  private cache: Map<string, { embedding: number[]; timestamp: number }> = new Map();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Get embedding for a single word/text
   * Supports all languages that the multilingual model supports
   */
  async getEmbedding(text: string): Promise<number[]> {
    const cacheKey = text.toLowerCase().trim();
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.embedding;
    }
    
    try {
      console.log(`Generating embedding for: "${text}"`);
      
      const response = await hf.featureExtraction({
        model: this.modelName,
        inputs: text,
      });
      
      // Handle different response formats from Hugging Face
      let embedding: number[];
      if (Array.isArray(response) && Array.isArray(response[0])) {
        embedding = response[0] as number[];
      } else if (Array.isArray(response)) {
        embedding = response as number[];
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        embedding,
        timestamp: Date.now(),
      });
      
      return embedding;
      
    } catch (error) {
      console.error('Embedding generation failed for:', text, error);
      throw new Error(`Failed to generate embedding for "${text}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get embeddings for multiple words in batch
   * More efficient than calling getEmbedding multiple times
   */
  async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // For now, process sequentially to avoid rate limits
    // In production, could implement proper batching
    for (const text of texts) {
      try {
        const embedding = await this.getEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Failed to get embedding for "${text}":`, error);
        // Return zero vector as fallback
        embeddings.push(new Array(384).fill(0));
      }
    }
    
    return embeddings;
  }
  
  /**
   * Detect language of text (basic implementation)
   * The multilingual model handles this automatically, but this can be useful for UI
   */
  detectLanguage(text: string): string {
    // Basic language detection based on character patterns
    const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
    const arabicChars = /[\u0600-\u06FF]/;
    const chineseChars = /[\u4e00-\u9fff]/;
    const russianChars = /[а-яё]/i;
    
    if (turkishChars.test(text)) return 'tr';
    if (arabicChars.test(text)) return 'ar';
    if (chineseChars.test(text)) return 'zh';
    if (russianChars.test(text)) return 'ru';
    
    // Default to English for Latin characters
    return 'en';
  }
  
  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Could implement hit rate tracking
    };
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService();
