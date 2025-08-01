# WordMath - Multilingual Word Vector Arithmetic Sandbox

## Project Overview
A casual web application for experimenting with word embeddings through mathematical operations, supporting multiple languages and custom vocabulary.

## Core Features
- Word vector arithmetic (addition/subtraction) between any two words
- Multilingual support (English + Turkish + others)
- Custom vocabulary management for slang/internet terms
- Returns top 3 similar words with similarity percentages
- Budget-conscious architecture (<$1/user/month)

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS for rapid development
- **Deployment**: Vercel (free tier) or Netlify (free tier)

### Backend Architecture
- **Primary Option**: Hugging Face Inference API (free tier: 30k requests/month)
- **Backup Option**: Firebase Functions + OpenAI embeddings (free tier)
- **Database**: Firebase Firestore (free tier: 50k reads/20k writes/day)

### Embedding Model Selection
**Recommended**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Pros**: 
  - Supports 50+ languages including English and Turkish
  - Smaller model size (120MB) = faster inference
  - Good balance of quality vs. speed
  - Available on Hugging Face free tier
- **Alternatives**:
  - `sentence-transformers/distiluse-base-multilingual-cased`
  - `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`

## Cost Breakdown (Monthly)

### Option 1: Hugging Face + Vercel + Firebase (Recommended)
- **Vercel Hosting**: $0 (free tier)
- **Hugging Face API**: $0 (30k requests/month free)
- **Firebase Firestore**: $0 (within free limits for small user base)
- **Total**: $0-5/month for small to medium usage

### Option 2: OpenAI + Firebase
- **Firebase Hosting**: $0 (free tier)
- **OpenAI API**: ~$0.0001 per embedding request
- **Firebase Functions**: $0 (125k invocations free)
- **Total**: $0.50-2/month depending on usage

## Database Schema

### Words Collection
```typescript
interface Word {
  id: string;
  word: string;
  language: string;
  embedding: number[];
  isCustom: boolean;
  addedBy?: string;
  createdAt: Timestamp;
  usageCount: number;
}
```

### Operations Log (Optional)
```typescript
interface Operation {
  id: string;
  word1: string;
  word2: string;
  operation: '+' | '-';
  results: Array<{word: string, similarity: number}>;
  timestamp: Timestamp;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Set up Next.js project with TypeScript
2. Configure Tailwind CSS
3. Set up Firebase project and Firestore
4. Implement Hugging Face API integration
5. Create basic word embedding service

### Phase 2: Core Functionality
1. Build word input interface
2. Implement vector arithmetic operations
3. Create similarity search algorithm
4. Build results display component
5. Add basic error handling

### Phase 3: Custom Vocabulary
1. Create admin interface for adding words
2. Implement custom word embedding generation
3. Build vocabulary management system
4. Add word validation and conflict resolution

### Phase 4: Polish & Deploy
1. Mobile responsiveness
2. Performance optimization
3. Enhanced error handling
4. Deployment and monitoring

## Key Technical Decisions

### Embedding Strategy
- **Pre-computed**: Store embeddings for common 10k English + 5k Turkish words
- **On-demand**: Generate embeddings for custom/rare words
- **Caching**: Cache new embeddings in Firestore for reuse

### Vector Operations
```typescript
// Vector addition: word1 + word2
result_vector = embedding1 + embedding2

// Vector subtraction: word1 - word2  
result_vector = embedding1 - embedding2

// Find similar words using cosine similarity
similarity = cosine_similarity(result_vector, candidate_vectors)
```

### Similarity Search
- Use cosine similarity for finding nearest neighbors
- Return top 3 matches with similarity percentages
- Filter out input words from results

## Performance Targets
- **Response Time**: 1-2 seconds acceptable
- **Concurrent Users**: 10-50 (not optimized for high load)
- **Accuracy**: 70-80% reasonable results (not research-grade)

## Error Handling Strategy
- Unknown words: Suggest similar words or prompt to add
- API failures: Graceful degradation with cached results
- Invalid operations: Clear error messages
- Rate limiting: Queue requests if needed

## Security Considerations
- Input validation for word entries
- Rate limiting on API endpoints
- Sanitize custom vocabulary additions
- Basic spam protection for custom words

## Monitoring & Analytics
- Track API usage to stay within limits
- Monitor response times
- Log popular word combinations
- Track custom vocabulary growth

## Development Environment Setup
```bash
# Required tools
- Node.js 18+
- npm/yarn
- Firebase CLI
- Git

# Environment variables needed
NEXT_PUBLIC_FIREBASE_CONFIG={}
HUGGINGFACE_API_KEY=xxx
FIREBASE_ADMIN_SDK_KEY=xxx
```

## Deployment Checklist
- [ ] Configure production Firebase project
- [ ] Set up Hugging Face API key
- [ ] Deploy to Vercel/Netlify
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring
- [ ] Test with Turkish and English words
- [ ] Load initial vocabulary dataset

## Future Enhancements (Beyond MVP)
- Support for phrases (not just single words)
- Visualization of word relationships
- User accounts and operation history
- More languages support
- Advanced similarity algorithms
- Word analogy detection (king - man + woman = queen)

## Risk Mitigation
- **API Rate Limits**: Implement request queuing and caching
- **Cost Overruns**: Set up billing alerts and usage monitoring
- **Model Accuracy**: Collect user feedback for result quality
- **Scalability**: Design for easy migration to paid tiers

## Success Metrics
- Users can perform word arithmetic with reasonable results
- Supports English + Turkish effectively
- Costs remain under $1/user/month
- Response times under 2 seconds
- Custom vocabulary system working
- Mobile-friendly interface

## Notes for Development
- Focus on functionality over optimization
- Start with free tiers and scale up as needed
- Keep architecture simple and maintainable
- Document API usage patterns for cost optimization
- Regular backups of custom vocabulary data
