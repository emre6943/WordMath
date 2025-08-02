# WordMath - Multilingual Word Vector Arithmetic Sandbox

**⚠️ PROJECT STATUS: ABANDONED - See "Why This Project Was Abandoned" section below**

A web application for experimenting with word embeddings through mathematical operations, supporting multiple languages and custom vocabulary.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Hugging Face account (for API key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/emre6943/WordMath.git
   cd WordMath/wordmath-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.local` and update with your Hugging Face API key:
   ```bash
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```
   - Get your free API key from: https://huggingface.co/settings/tokens
   - Required permissions: "Make calls to Inference Providers"

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## 🔧 How It Works

### Current Implementation (Demo Mode)
WordMath uses Hugging Face's `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` model to:

1. **Generate embeddings** for your two input words (e.g., "king" and "man")
2. **Perform vector arithmetic** (addition or subtraction)
3. **Return curated results** based on known linguistic relationships

### Example Operations
```
king - man = queen, princess, lady
paris - france = london, berlin, madrid  
happy + joy = blissful, euphoric, delighted
```

### Technical Architecture
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Embeddings**: Hugging Face Inference API
- **Similarity**: Cosine similarity calculations
- **Results**: Curated word relationships (not real vector search)

## ⚠️ Current Limitations & Downsides

### 1. **Not Real Vector Similarity**
- Results are **curated/hardcoded** based on known word relationships
- Only generates embeddings for input words, not for comparison
- Limited to ~50 predefined word combinations

### 2. **API Costs**
- Each request costs ~$0.0002 (2 embeddings × $0.0001)
- Real vector search would cost 50-100x more per request
- Free Hugging Face tier: 30k requests/month

### 3. **Limited Vocabulary**
- Only meaningful results for common English words
- Turkish and other language support is minimal
- No custom vocabulary management

### 4. **Performance**
- 1-3 second response time due to API calls
- Not optimized for high concurrent users
- No vector database for fast similarity search

## 🚫 Why This Project Was Abandoned

### The Core Problem: **Embedding Every Word is Expensive**

To provide *real* vector similarity results, you need:

1. **Pre-computed embeddings** for 10,000-100,000 words
2. **Vector database** (Pinecone, Weaviate, Chroma) for fast search
3. **Significant infrastructure costs** ($50-200/month minimum)

### The Math:
```
Real Implementation Cost:
- 50,000 words × $0.0001/embedding = $5 just to build vocabulary
- Vector database hosting: $20-100/month
- API calls for new words: $0.01 per request with real similarity
- Total: $50-200/month for meaningful traffic

Demo Implementation (Current):
- 2 embeddings per request × $0.0001 = $0.0002/request  
- Curated results (no real similarity)
- Total: $0.60/month for 100 requests/day
```

### Why Not Continue:

1. **Infrastructure Investment**: Requires significant setup for vector database
2. **Ongoing Costs**: Monthly hosting and API costs make it expensive to maintain
3. **Limited Utility**: Without real similarity search, it's just a fancy word game
4. **Better Alternatives**: OpenAI's embeddings API + existing vector DB solutions work better

### What Would Be Needed for Production:

1. **Offline embedding generation** for vocabulary (one-time $50-100 cost)
2. **Vector database setup** (Pinecone/Weaviate subscription)
3. **Backend infrastructure** to handle vector similarity search
4. **Caching layer** to reduce API costs
5. **User authentication** to prevent abuse

## 🛠️ For Developers

### Current File Structure
```
wordmath-app/
├── src/
│   ├── app/
│   │   ├── api/similarity/     # Main API endpoint
│   │   ├── page.tsx           # Dark theme UI
│   │   └── globals.css        # Dark theme styles
│   ├── lib/
│   │   ├── embedding-service.ts    # Hugging Face integration
│   │   ├── vector-operations.ts    # Vector math + demo results
│   │   └── vocabulary-service.ts   # Curated word lists
│   └── types/index.ts              # TypeScript definitions
├── .env.local                      # API keys
└── package.json
```

### If You Want to Continue Development:

1. **Phase 1**: Implement offline embedding generation script
2. **Phase 2**: Set up vector database (recommend Pinecone)
3. **Phase 3**: Replace demo results with real similarity search
4. **Phase 4**: Add user authentication and rate limiting

### Key Technologies Used:
- **Next.js 14** - React framework with API routes
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (dark theme implemented)
- **Hugging Face Transformers** - Multilingual embeddings
- **Vector Math** - Cosine similarity calculations

## 📝 License

MIT License - Feel free to fork and improve!

## 🤝 Contributing

This project is abandoned, but feel free to:
- Fork it for your own experiments
- Use the dark theme implementation
- Learn from the embedding integration
- Build a better version with proper vector search

---

**Bottom Line**: This is a proof-of-concept that demonstrates the UI and basic embedding integration, but stops short of implementing real vector similarity due to cost and complexity concerns. For a production word arithmetic tool, invest in proper vector database infrastructure.