# WordMath - Technical Specifications

## Architecture Deep Dive

### Frontend Architecture
```
Next.js App Router Structure:
├── app/
│   ├── page.tsx (Main interface)
│   ├── layout.tsx (Global layout)
│   ├── globals.css (Tailwind styles)
│   ├── api/ (API routes)
│   └── components/ (React components)
```

### Backend API Design

#### 1. Embeddings API (`/api/embeddings`)
```typescript
POST /api/embeddings
{
  "words": ["apple", "elma"],
  "language": "auto" // or "en", "tr"
}

Response:
{
  "embeddings": {
    "apple": [0.1, 0.2, ...],
    "elma": [0.3, 0.4, ...]
  },
  "cached": ["apple"], // words retrieved from cache
  "generated": ["elma"] // words generated via API
}
```

#### 2. Similarity API (`/api/similarity`)
```typescript
POST /api/similarity
{
  "word1": "apple",
  "word2": "red",
  "operation": "+"
}

Response:
{
  "results": [
    {"word": "cherry", "similarity": 0.87, "language": "en"},
    {"word": "strawberry", "similarity": 0.82, "language": "en"},
    {"word": "tomato", "similarity": 0.76, "language": "en"}
  ],
  "operation_vector": [0.2, 0.5, ...], // for debugging
  "processing_time": 1.2
}
```

#### 3. Custom Words API (`/api/words`)
```typescript
POST /api/words
{
  "word": "brainrot",
  "language": "en",
  "definition": "internet slang term"
}

GET /api/words?language=en&limit=100
Response: { "words": [...] }

DELETE /api/words/:id (admin only)
```

## Hugging Face Integration

### Model Selection Rationale
**Primary**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- 384-dimensional embeddings
- 50+ languages including Turkish
- Fast inference (~200ms per request)
- Free tier: 30k requests/month

### API Implementation
```typescript
// lib/embedding-service.ts
export class EmbeddingService {
  private apiKey: string;
  private modelName = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
  
  async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.modelName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    );
    
    return response.json();
  }
}
```

## Vector Operations Mathematics

### Addition Operation
```typescript
function addVectors(v1: number[], v2: number[]): number[] {
  return v1.map((val, idx) => val + v2[idx]);
}

// Semantic meaning: word1 + word2
// Example: "king" + "woman" → "queen"
```

### Subtraction Operation
```typescript
function subtractVectors(v1: number[], v2: number[]): number[] {
  return v1.map((val, idx) => val - v2[idx]);
}

// Semantic meaning: word1 - word2
// Example: "running" - "speed" → "walking"
```

### Cosine Similarity
```typescript
function cosineSimilarity(v1: number[], v2: number[]): number {
  const dotProduct = v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
  const magnitude1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (magnitude1 * magnitude2);
}
```

## Firebase Firestore Schema

### Collections Structure
```typescript
// Collection: 'words'
interface WordDocument {
  id: string; // auto-generated
  word: string; // "apple"
  language: string; // "en", "tr", "auto"
  embedding: number[]; // 384-dimensional vector
  isCustom: boolean; // true for user-added words
  addedBy?: string; // user ID (for custom words)
  createdAt: FirebaseTimestamp;
  lastUsed: FirebaseTimestamp;
  usageCount: number;
  metadata?: {
    definition?: string;
    tags?: string[];
    approved?: boolean; // for moderation
  }
}

// Collection: 'operations' (optional analytics)
interface OperationDocument {
  id: string;
  word1: string;
  word2: string;
  operation: '+' | '-';
  results: Array<{word: string, similarity: number}>;
  timestamp: FirebaseTimestamp;
  userAgent?: string;
  processingTime: number;
}
```

### Firestore Queries
```typescript
// Get word by text
const wordQuery = query(
  collection(db, 'words'),
  where('word', '==', searchTerm),
  limit(1)
);

// Get similar words for similarity search
const similarWordsQuery = query(
  collection(db, 'words'),
  where('language', '==', targetLanguage),
  orderBy('usageCount', 'desc'),
  limit(1000) // for similarity comparison
);
```

## Caching Strategy

### In-Memory Cache (Server-Side)
```typescript
interface CacheEntry {
  embedding: number[];
  timestamp: number;
  hitCount: number;
}

class EmbeddingCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;
  private ttl = 24 * 60 * 60 * 1000; // 24 hours
  
  get(word: string): number[] | null {
    const entry = this.cache.get(word.toLowerCase());
    if (!entry || Date.now() - entry.timestamp > this.ttl) {
      return null;
    }
    entry.hitCount++;
    return entry.embedding;
  }
}
```

### Browser Cache (Client-Side)
```typescript
// Use sessionStorage for recent operations
const cacheKey = `embedding_${word}_${language}`;
sessionStorage.setItem(cacheKey, JSON.stringify(embedding));
```

## Error Handling Strategy

### API Error Types
```typescript
enum ErrorType {
  WORD_NOT_FOUND = 'WORD_NOT_FOUND',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  INVALID_OPERATION = 'INVALID_OPERATION',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EMBEDDING_FAILED = 'EMBEDDING_FAILED'
}

interface APIError {
  type: ErrorType;
  message: string;
  suggestions?: string[];
  retryAfter?: number;
}
```

### Graceful Degradation
```typescript
// Fallback chain for word embeddings
async function getWordEmbedding(word: string): Promise<number[]> {
  try {
    // 1. Check cache
    const cached = cache.get(word);
    if (cached) return cached;
    
    // 2. Check Firestore
    const stored = await getStoredEmbedding(word);
    if (stored) return stored;
    
    // 3. Generate via Hugging Face
    const generated = await huggingFaceAPI.getEmbedding(word);
    await storeEmbedding(word, generated);
    return generated;
    
  } catch (error) {
    // 4. Fallback to similar word
    const similar = await findSimilarWord(word);
    if (similar) return similar.embedding;
    
    throw new APIError(ErrorType.WORD_NOT_FOUND, `Word "${word}" not found`);
  }
}
```

## Performance Optimization

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};
```

### API Response Optimization
```typescript
// Compress embeddings for storage
function compressEmbedding(embedding: number[]): string {
  return Buffer.from(new Float32Array(embedding).buffer).toString('base64');
}

function decompressEmbedding(compressed: string): number[] {
  const buffer = Buffer.from(compressed, 'base64');
  return Array.from(new Float32Array(buffer.buffer));
}
```

## Security Measures

### Input Validation
```typescript
const wordSchema = z.object({
  word: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s-]+$/) // Allow Turkish chars
    .transform(s => s.toLowerCase().trim()),
  language: z.enum(['en', 'tr', 'auto']).default('auto'),
});
```

### Rate Limiting
```typescript
// Simple in-memory rate limiter
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  isAllowed(ip: string, maxRequests = 60, window = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(ip) || [];
    
    // Remove old requests
    const recentRequests = userRequests.filter(time => now - time < window);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(ip, recentRequests);
    return true;
  }
}
```

## Testing Strategy

### Unit Tests (Jest + Testing Library)
```typescript
// __tests__/vector-operations.test.ts
describe('Vector Operations', () => {
  test('vector addition', () => {
    const v1 = [1, 2, 3];
    const v2 = [4, 5, 6];
    const result = addVectors(v1, v2);
    expect(result).toEqual([5, 7, 9]);
  });
  
  test('cosine similarity', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1.0);
  });
});
```

### Integration Tests
```typescript
// __tests__/api/similarity.test.ts
describe('/api/similarity', () => {
  test('word arithmetic operation', async () => {
    const response = await fetch('/api/similarity', {
      method: 'POST',
      body: JSON.stringify({
        word1: 'king',
        word2: 'man',
        operation: '-'
      }),
    });
    
    const data = await response.json();
    expect(data.results).toHaveLength(3);
    expect(data.results[0].similarity).toBeGreaterThan(0.5);
  });
});
```

## Monitoring & Analytics

### Performance Monitoring
```typescript
// lib/analytics.ts
export function trackOperation(
  word1: string,
  word2: string,
  operation: string,
  processingTime: number
) {
  // Log to Firebase Analytics or simple logging
  console.log('Operation:', { word1, word2, operation, processingTime });
}

export function trackError(error: Error, context: any) {
  // Error reporting service
  console.error('Error:', error, context);
}
```

### Usage Statistics
- Daily active users
- Most popular word combinations
- Average response times
- Error rates by operation type
- Custom vocabulary growth rate

This technical specification provides the detailed foundation needed to implement the WordMath application while maintaining budget constraints and performance targets.
