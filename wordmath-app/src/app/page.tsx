'use client';

import { useState } from 'react';
import { Calculator, Plus, Minus, Loader2, Sparkles, Globe } from 'lucide-react';
import type { SimilarityResult, OperationResult } from '@/types';

export default function Home() {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [operation, setOperation] = useState<'+' | '-'>('+');
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationText, setOperationText] = useState('');
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const exampleQueries = [
    { word1: 'king', word2: 'man', operation: '-' as const, description: 'Classic word analogy' },
    { word1: 'happy', word2: 'joy', operation: '+' as const, description: 'Add emotions' },
    { word1: 'paris', word2: 'france', operation: '-' as const, description: 'Remove country from capital' },
    { word1: 'apple', word2: 'red', operation: '+' as const, description: 'Add color to fruit' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word1.trim() || !word2.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word1: word1.trim(), 
          word2: word2.trim(), 
          operation 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
        setOperationText(data.data.operation);
        setProcessingTime(data.data.processingTime);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: typeof exampleQueries[0]) => {
    setWord1(example.word1);
    setWord2(example.word2);
    setOperation(example.operation);
    setError(null);
  };

  const clearAll = () => {
    setWord1('');
    setWord2('');
    setResults([]);
    setError(null);
    setOperationText('');
    setProcessingTime(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="mr-3 text-indigo-400" size={48} />
            <h1 className="text-5xl font-bold text-white">WordMath</h1>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Explore word relationships through vector arithmetic
          </p>
          <div className="flex items-center justify-center text-sm text-gray-400">
            <Globe className="mr-2" size={16} />
            <span>Supports 50+ languages including English, Turkish, Spanish, French, German, Chinese, Arabic, and more</span>
          </div>
        </div>

        {/* Example Queries */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Try these examples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="p-3 bg-gray-800 rounded-lg shadow-sm border border-gray-700 hover:border-indigo-500 hover:shadow-md hover:bg-gray-750 transition-all duration-200 text-left"
              >
                <div className="font-medium text-white">
                  {example.word1} {example.operation} {example.word2}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              
              {/* Word 1 Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">First Word</label>
                <input
                  type="text"
                  value={word1}
                  onChange={(e) => setWord1(e.target.value)}
                  placeholder="Enter first word (any language)"
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              {/* Operation Button */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-300 mb-2">Operation</label>
                <button
                  type="button"
                  onClick={() => setOperation(operation === '+' ? '-' : '+')}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                    operation === '+' 
                      ? 'border-green-500 bg-green-900 text-green-400 hover:bg-green-800' 
                      : 'border-red-500 bg-red-900 text-red-400 hover:bg-red-800'
                  }`}
                  title={`Click to switch to ${operation === '+' ? 'subtraction' : 'addition'}`}
                >
                  {operation === '+' ? <Plus size={24} /> : <Minus size={24} />}
                </button>
              </div>
              
              {/* Word 2 Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Second Word</label>
                <input
                  type="text"
                  value={word2}
                  onChange={(e) => setWord2(e.target.value)}
                  placeholder="Enter second word (any language)"
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Calculate Button - Full Width */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading || !word1.trim() || !word2.trim()}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-medium text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={24} />
                    Computing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={24} />
                    Calculate
                  </>
                )}
              </button>
            </div>
            
            {/* Clear Button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={clearAll}
                className="text-gray-400 hover:text-gray-200 text-sm"
              >
                Clear all
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-8">
              <div className="text-red-200 font-medium">Error</div>
              <div className="text-red-300 text-sm mt-1">{error}</div>
            </div>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Results for: <span className="text-indigo-400">{operationText}</span>
                </h2>
                {processingTime && (
                  <span className="text-sm text-gray-400">
                    Processed in {processingTime}ms
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg border border-gray-600 hover:shadow-md hover:from-gray-600 hover:to-gray-500 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-indigo-400 mr-4">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="text-lg font-medium text-white">
                          {result.word}
                        </span>
                        {result.language && (
                          <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                            {result.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-200">
                        {(result.similarity * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">similarity</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400 text-sm">
          <p>
            Powered by multilingual sentence transformers • 
            Supporting 50+ languages • 
            Built with Next.js & Hugging Face
          </p>
        </div>
      </div>
    </main>
  );
}
