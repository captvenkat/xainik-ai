'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GenerationResult {
  title: string;
  slug: string;
  posterUrl: string;
  tags: string[];
  keywords: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
}

export default function ImageGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [customPrompts, setCustomPrompts] = useState('');

  const defaultPrompts = [
    {
      title: "Made decisions in zero visibility",
      prompt: "A cinematic digital painting of a military leader silhouetted against a stormy night sky, dramatic lighting, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
      tags: ["leadership", "crisis", "decision-making", "resilience"],
      keywords: "military leadership, crisis management, decision making, storm, silhouette, dramatic lighting"
    },
    {
      title: "Led when failure wasn't an option",
      prompt: "A cinematic digital painting of a group of military personnel in formation against a dramatic sunset, heroic pose, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
      tags: ["leadership", "teamwork", "crisis", "performance"],
      keywords: "military leadership, team building, crisis leadership, formation, sunset, heroic"
    },
    {
      title: "Built trust under fire",
      prompt: "A cinematic digital painting of hands clasped in solidarity against a backdrop of flames and smoke, symbolic of trust and unity, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
      tags: ["trust", "teamwork", "crisis", "values"],
      keywords: "trust building, teamwork, crisis, unity, solidarity, fire, symbolic"
    },
    {
      title: "Turned setbacks into comebacks",
      prompt: "A cinematic digital painting of a phoenix rising from ashes with military elements, symbolic of resilience and comeback, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
      tags: ["resilience", "adaptation", "performance", "values"],
      keywords: "resilience, comeback, phoenix, ashes, military, symbolic, transformation"
    },
    {
      title: "Adapted when the map ended",
      prompt: "A cinematic digital painting of a compass and map transforming into digital elements, symbolic of adaptation and innovation, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
      tags: ["adaptation", "innovation", "leadership", "performance"],
      keywords: "adaptation, innovation, compass, map, digital transformation, leadership"
    }
  ];

  const generateImages = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults([]);

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompts: defaultPrompts,
          customPrompts: customPrompts
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setProgress(data.progress);
              } else if (data.type === 'result') {
                setResults(prev => [...prev, data.result]);
              } else if (data.type === 'error') {
                setResults(prev => [...prev, {
                  title: data.title,
                  slug: '',
                  posterUrl: '',
                  tags: [],
                  keywords: '',
                  status: 'error',
                  error: data.error
                }]);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate images: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAll = async () => {
    const completedResults = results.filter(r => r.status === 'completed' && r.posterUrl);
    
    for (const result of completedResults) {
      try {
        const response = await fetch(result.posterUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.slug}.webp`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error(`Failed to download ${result.title}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🎬 Xainik Image Generator
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Generation Settings</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompts (JSON format, optional)
              </label>
              <textarea
                value={customPrompts}
                onChange={(e) => setCustomPrompts(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='[{"title": "Custom Title", "prompt": "Your prompt here", "tags": ["tag1", "tag2"], "keywords": "keyword1, keyword2"}]'
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateImages}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Images'}
              </button>
              
              {results.some(r => r.status === 'completed') && (
                <button
                  onClick={downloadAll}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Download All WebP
                </button>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Generation Results</h2>
            
            {results.length === 0 && !isGenerating && (
              <p className="text-gray-500">No results yet. Click "Generate Images" to start.</p>
            )}
            
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === 'completed' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    result.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                
                {result.error && (
                  <p className="text-red-600 text-sm mb-2">Error: {result.error}</p>
                )}
                
                {result.status === 'completed' && result.posterUrl && (
                  <div className="space-y-2">
                    <img 
                      src={result.posterUrl} 
                      alt={result.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="text-sm text-gray-600">
                      <p><strong>Slug:</strong> {result.slug}</p>
                      <p><strong>Tags:</strong> {result.tags.join(', ')}</p>
                      <p><strong>Keywords:</strong> {result.keywords}</p>
                    </div>
                    <a
                      href={result.posterUrl}
                      download={`${result.slug}.webp`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Download WebP
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
