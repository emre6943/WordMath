import { NextRequest, NextResponse } from 'next/server';
import { embeddingService } from '@/lib/embedding-service';
import { z } from 'zod';

const requestSchema = z.object({
  words: z.array(z.string().min(1).max(100)).min(1).max(10), // Max 10 words per request
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words } = requestSchema.parse(body);
    
    const startTime = Date.now();
    
    // Clean and validate words
    const cleanWords = words.map(word => word.trim().toLowerCase());
    
    // Get embeddings for all words
    const embeddings = await embeddingService.getBatchEmbeddings(cleanWords);
    
    const processingTime = Date.now() - startTime;
    
    // Build response with word -> embedding mapping
    const result = cleanWords.reduce((acc, word, index) => {
      acc[word] = {
        embedding: embeddings[index],
        language: embeddingService.detectLanguage(word),
        dimension: embeddings[index].length,
      };
      return acc;
    }, {} as Record<string, { embedding: number[]; language: string; dimension: number }>);
    
    return NextResponse.json({
      success: true,
      data: result,
      processingTime,
      cacheStats: embeddingService.getCacheStats(),
    });
    
  } catch (error) {
    console.error('Embeddings API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate embeddings',
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Embeddings API is running',
    model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    supportedLanguages: ['en', 'tr', 'es', 'fr', 'de', 'it', 'ru', 'zh', 'ar', '+ 40 more'],
    cacheStats: embeddingService.getCacheStats(),
  });
}
