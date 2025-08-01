import { NextRequest, NextResponse } from 'next/server';
import { embeddingService } from '@/lib/embedding-service';
import { performWordArithmetic, generateDemoSimilarWords } from '@/lib/vector-operations';
import { z } from 'zod';

const requestSchema = z.object({
  word1: z.string().min(1).max(100),
  word2: z.string().min(1).max(100),
  operation: z.enum(['+', '-']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word1, word2, operation } = requestSchema.parse(body);
    
    const startTime = Date.now();
    
    // Clean input words
    const cleanWord1 = word1.trim().toLowerCase();
    const cleanWord2 = word2.trim().toLowerCase();
    
    console.log(`Processing: ${cleanWord1} ${operation} ${cleanWord2}`);
    
    // Get embeddings for both words
    const [embedding1, embedding2] = await embeddingService.getBatchEmbeddings([
      cleanWord1,
      cleanWord2,
    ]);
    
    // Perform vector arithmetic
    const resultVector = performWordArithmetic(embedding1, embedding2, operation);
    
    // For now, use demo results since we don't have a full vocabulary database yet
    // In production, this would search through stored embeddings using vector similarity
    const results = generateDemoSimilarWords(cleanWord1, cleanWord2, operation);
    
    const processingTime = Date.now() - startTime;
    
    // Detect languages for better UX
    const word1Language = embeddingService.detectLanguage(word1);
    const word2Language = embeddingService.detectLanguage(word2);
    
    return NextResponse.json({
      success: true,
      data: {
        results,
        operation: `${cleanWord1} ${operation} ${cleanWord2}`,
        word1Language,
        word2Language,
        processingTime,
        // Include embeddings for debugging (remove in production)
        debug: {
          word1Embedding: embedding1.slice(0, 5), // First 5 dimensions only
          word2Embedding: embedding2.slice(0, 5),
          resultVector: resultVector.slice(0, 5),
          embeddingDimensions: embedding1.length,
        },
      },
    });
    
  } catch (error) {
    console.error('Similarity API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.issues,
      }, { status: 400 });
    }
    
    // Handle specific embedding errors
    if (error instanceof Error && error.message.includes('Failed to generate embedding')) {
      return NextResponse.json({
        success: false,
        error: 'Could not process one or both words. Please try different words.',
        suggestion: 'Make sure the words are spelled correctly and try common words.',
      }, { status: 422 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process similarity request',
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Similarity API is running',
    supportedOperations: ['+', '-'],
    examples: [
      { word1: 'king', word2: 'man', operation: '-', expected: 'queen-like words' },
      { word1: 'happy', word2: 'joy', operation: '+', expected: 'very positive words' },
      { word1: 'paris', word2: 'france', operation: '-', expected: 'other capitals' },
    ],
  });
}
