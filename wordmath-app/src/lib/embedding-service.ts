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
      
      // Check if API key is available
      if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'your_huggingface_token_here') {
        console.warn('No valid Hugging Face API key found, using mock embedding');
        return this.generateMockEmbedding(text);
      }
      
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
      console.warn('Falling back to mock embedding due to API error');
      return this.generateMockEmbedding(text);
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
  
  /**
   * Generate a mock embedding for demo purposes when API is not available
   */
  private generateMockEmbedding(text: string): number[] {
    const dimension = 384; // Same as the multilingual model
    const embedding = new Array(dimension);
    
    // Create a deterministic "embedding" based on the text
    // This is not a real embedding but allows the demo to work
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i);
    }
    
    // Simple pseudorandom number generator with seed
    const random = (function(seed: number) {
      return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    })(seed);
    
    // Generate normalized random vector
    for (let i = 0; i < dimension; i++) {
      embedding[i] = (random() - 0.5) * 2; // Range: -1 to 1
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    for (let i = 0; i < dimension; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
    
    return embedding;
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService();
