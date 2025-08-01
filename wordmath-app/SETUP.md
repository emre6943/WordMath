# Quick Setup Guide

## 1. Get Hugging Face API Key (FREE)

1. Go to https://huggingface.co/
2. Click "Sign Up" (or Sign In if you have an account)
3. After signing up, go to https://huggingface.co/settings/tokens
4. Click "New token"
5. Name it "WordMath" and select "Read" permissions
6. Copy the token (starts with `hf_`)

## 2. Configure Environment Variables

1. Open the `.env.local` file in the project root
2. Replace `your_huggingface_token_here` with your actual token:
   ```
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```

## 3. Test the Application

```bash
# Start the development server
npm run dev
```

Then open http://localhost:3000 in your browser.

## 4. Test with Example Words

Try these combinations to test the multilingual support:

**English Examples:**
- king - man (should suggest queen-like words)
- happy + joy (should suggest very positive words)
- paris - france (should suggest other capitals)

**Turkish Examples:**
- kral - adam (Turkish for king - man)
- mutlu + neşe (Turkish for happy + joy)
- istanbul - türkiye (Turkish for Istanbul - Turkey)

**Mixed Language Examples:**
- king - adam (English-Turkish mix)
- apple + kırmızı (English apple + Turkish red)
- love + aşk (English + Turkish for love)

## 5. Expected Results

- The app should load without errors
- You should see the WordMath interface with example buttons
- Clicking "Calculate" should show demo results (we haven't connected real similarity search yet)
- The processing should work for any language input

## Next Steps After Basic Setup

1. **Set up Firebase** (optional for now - we can work with demo data)
2. **Implement real vector similarity search** (replace demo results)
3. **Add vocabulary database** for better results
4. **Deploy to production**

## Troubleshooting

**Error: "Failed to generate embedding"**
- Check your Hugging Face API key is correct
- Make sure you have internet connection
- Verify the key has "Read" permissions

**Error: "Network error"**
- Check if you're running `npm run dev`
- Make sure you're accessing http://localhost:3000
- Check browser console for more details

**Slow responses:**
- First request to Hugging Face might take 10-20 seconds (model loading)
- Subsequent requests should be much faster (1-2 seconds)
- This is normal for the free tier

The application is designed to work with the multilingual model that supports 50+ languages automatically, so you can test with any language right away!
