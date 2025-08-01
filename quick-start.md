# WordMath - Quick Start Guide

## Prerequisites Setup

### Required Accounts & Keys
1. **Hugging Face Account** (Free)
   - Sign up at https://huggingface.co/
   - Generate API token: Profile → Settings → Access Tokens
   - Free tier: 30k API calls/month

2. **Firebase Project** (Free)
   - Go to https://console.firebase.google.com/
   - Create new project: "wordmath-app"
   - Enable Firestore Database
   - Enable Authentication (optional)

3. **Vercel Account** (Free)
   - Sign up at https://vercel.com/
   - Connect GitHub repository
   - Free tier: Unlimited deployments

### Development Environment
```bash
# Required software
Node.js 18+ (https://nodejs.org/)
Git (https://git-scm.com/)
VS Code (https://code.visualstudio.com/)

# Verify installations
node --version  # Should be 18+
npm --version   # Should be 8+
git --version   # Any recent version
```

## Project Initialization

### 1. Create Next.js Project
```bash
# Navigate to your project directory
cd c:\Code\WordMath

# Initialize Next.js with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install additional dependencies
npm install firebase firebase-admin
npm install @huggingface/inference
npm install lucide-react
npm install zod
```

### 2. Environment Configuration
Create `.env.local` file:
```env
# Hugging Face
HUGGINGFACE_API_KEY=hf_your_token_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wordmath-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wordmath-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wordmath-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@wordmath-app.iam.gserviceaccount.com
```

### 3. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init firestore
firebase init hosting
```

## Core File Creation

### 1. Type Definitions
Create `src/types/index.ts`:
```typescript
export interface Word {
  id: string;
  word: string;
  language: string;
  embedding: number[];
  isCustom: boolean;
  addedBy?: string;
  createdAt: Date;
  usageCount: number;
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
```

### 2. Firebase Configuration
Create `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 3. Embedding Service
Create `src/lib/embedding-service.ts`:
```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class EmbeddingService {
  private modelName = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
  
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await hf.featureExtraction({
        model: this.modelName,
        inputs: text,
      });
      
      return Array.isArray(response[0]) ? response[0] : response;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error('Failed to generate embedding');
    }
  }
  
  async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.getEmbedding(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();
```

### 4. Vector Operations
Create `src/lib/vector-operations.ts`:
```typescript
export function addVectors(v1: number[], v2: number[]): number[] {
  if (v1.length !== v2.length) {
    throw new Error('Vector dimensions must match');
  }
  return v1.map((val, idx) => val + v2[idx]);
}

export function subtractVectors(v1: number[], v2: number[]): number[] {
  if (v1.length !== v2.length) {
    throw new Error('Vector dimensions must match');
  }
  return v1.map((val, idx) => val - v2[idx]);
}

export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error('Vector dimensions must match');
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
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}
```

## Basic API Routes

### 1. Embeddings API
Create `src/app/api/embeddings/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { embeddingService } from '@/lib/embedding-service';
import { z } from 'zod';

const requestSchema = z.object({
  words: z.array(z.string().min(1).max(50)),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words } = requestSchema.parse(body);
    
    const startTime = Date.now();
    const embeddings = await embeddingService.getBatchEmbeddings(words);
    const processingTime = Date.now() - startTime;
    
    const result = words.reduce((acc, word, index) => {
      acc[word] = embeddings[index];
      return acc;
    }, {} as Record<string, number[]>);
    
    return NextResponse.json({
      success: true,
      data: result,
      processingTime,
    });
    
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate embeddings',
    }, { status: 500 });
  }
}
```

### 2. Similarity API
Create `src/app/api/similarity/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { embeddingService } from '@/lib/embedding-service';
import { addVectors, subtractVectors, cosineSimilarity } from '@/lib/vector-operations';
import { z } from 'zod';

const requestSchema = z.object({
  word1: z.string().min(1).max(50),
  word2: z.string().min(1).max(50),
  operation: z.enum(['+', '-']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word1, word2, operation } = requestSchema.parse(body);
    
    const startTime = Date.now();
    
    // Get embeddings for both words
    const [embedding1, embedding2] = await embeddingService.getBatchEmbeddings([word1, word2]);
    
    // Perform vector operation
    const resultVector = operation === '+' 
      ? addVectors(embedding1, embedding2)
      : subtractVectors(embedding1, embedding2);
    
    // For demo, return mock similar words
    // In production, this would search through stored embeddings
    const mockResults = [
      { word: 'result1', similarity: 0.85, language: 'en' },
      { word: 'result2', similarity: 0.78, language: 'en' },
      { word: 'result3', similarity: 0.72, language: 'en' },
    ];
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: {
        results: mockResults,
        operation: `${word1} ${operation} ${word2}`,
        processingTime,
      },
    });
    
  } catch (error) {
    console.error('Similarity API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process similarity request',
    }, { status: 500 });
  }
}
```

## Basic UI Components

### 1. Main Page
Update `src/app/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Calculator, Plus, Minus } from 'lucide-react';

export default function Home() {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [operation, setOperation] = useState<'+' | '-'>('+');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word1 || !word2) return;

    setLoading(true);
    try {
      const response = await fetch('/api/similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word1, word2, operation }),
      });
      
      const data = await response.json();
      if (data.success) {
        setResults(data.data.results);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-8">
          <Calculator className="mx-auto mb-4 text-indigo-600" size={48} />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WordMath</h1>
          <p className="text-gray-600">Explore word relationships through vector arithmetic</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <input
              type="text"
              value={word1}
              onChange={(e) => setWord1(e.target.value)}
              placeholder="First word"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setOperation(operation === '+' ? '-' : '+')}
                className={`p-2 rounded-lg border-2 ${
                  operation === '+' 
                    ? 'border-green-500 bg-green-50 text-green-600' 
                    : 'border-red-500 bg-red-50 text-red-600'
                }`}
              >
                {operation === '+' ? <Plus size={20} /> : <Minus size={20} />}
              </button>
            </div>
            
            <input
              type="text"
              value={word2}
              onChange={(e) => setWord2(e.target.value)}
              placeholder="Second word"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            <div className="text-center text-2xl font-bold text-gray-400">=</div>
            
            <button
              type="submit"
              disabled={loading || !word1 || !word2}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Computing...' : 'Calculate'}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{result.word}</span>
                  <span className="text-sm text-gray-600">
                    {(result.similarity * 100).toFixed(1)}% similarity
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

## Testing & Development

### 1. Run Development Server
```bash
npm run dev
```
Visit http://localhost:3000 to see the application.

### 2. Test API Endpoints
```bash
# Test embeddings endpoint
curl -X POST http://localhost:3000/api/embeddings \
  -H "Content-Type: application/json" \
  -d '{"words": ["apple", "elma"]}'

# Test similarity endpoint
curl -X POST http://localhost:3000/api/similarity \
  -H "Content-Type: application/json" \
  -d '{"word1": "king", "word2": "man", "operation": "-"}'
```

### 3. Basic Error Handling
The current setup includes:
- Input validation with Zod
- API error responses
- Loading states in UI
- Form validation

## Next Steps

### Immediate (Next 2-3 days)
1. **Complete Firebase integration** - Store and retrieve word embeddings
2. **Implement real similarity search** - Replace mock results with actual vector search
3. **Add Turkish language support** - Test with Turkish words
4. **Enhance error handling** - Better user feedback

### Short term (Next week)
1. **Custom vocabulary system** - Allow users to add new words
2. **Caching implementation** - Reduce API calls
3. **Mobile optimization** - Improve responsive design
4. **Performance monitoring** - Track API usage and costs

### Medium term (Next 2 weeks)
1. **Deploy to production** - Set up Vercel deployment
2. **Advanced features** - Word suggestions, history
3. **Analytics integration** - Track usage patterns
4. **Documentation** - User guide and API docs

This quick start guide provides everything needed to get the WordMath application running locally and ready for development. The foundation is built for scalability and easy deployment to production.
