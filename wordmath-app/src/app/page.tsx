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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="mr-3 text-indigo-600" size={48} />
            <h1 className="text-5xl font-bold text-gray-900">WordMath</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Explore word relationships through vector arithmetic
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Globe className="mr-2" size={16} />
            <span>Supports 50+ languages including English, Turkish, Spanish, French, German, Chinese, Arabic, and more</span>
          </div>
        </div>

        {/* Example Queries */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Try these examples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="font-medium text-gray-900">
                  {example.word1} {example.operation} {example.word2}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              
              {/* Word 1 Input */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={word1}
                  onChange={(e) => setWord1(e.target.value)}
                  placeholder="Enter first word (any language)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              {/* Operation Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setOperation(operation === '+' ? '-' : '+')}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                    operation === '+' 
                      ? 'border-green-500 bg-green-50 text-green-600 hover:bg-green-100' 
                      : 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  title={`Click to switch to ${operation === '+' ? 'subtraction' : 'addition'}`}
                >
                  {operation === '+' ? <Plus size={24} /> : <Minus size={24} />}
                </button>
              </div>
              
              {/* Word 2 Input */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={word2}
                  onChange={(e) => setWord2(e.target.value)}
                  placeholder="Enter second word (any language)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !word1.trim() || !word2.trim()}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Computing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={20} />
                      Calculate
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Clear Button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={clearAll}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear all
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="text-red-800 font-medium">Error</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
            </div>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Results for: <span className="text-indigo-600">{operationText}</span>
                </h2>
                {processingTime && (
                  <span className="text-sm text-gray-500">
                    Processed in {processingTime}ms
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-indigo-600 mr-4">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="text-lg font-medium text-gray-900">
                          {result.word}
                        </span>
                        {result.language && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            {result.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-700">
                        {(result.similarity * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">similarity</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
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
