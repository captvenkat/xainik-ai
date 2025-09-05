'use client';
import { useState } from 'react';
import { MemeMode } from '@/lib/enhanced-meme-generator';
import { shareCaptionManager } from '@/lib/share-captions';

interface MemePosterProps {
  meme: {
    id: string;
    line: string;
    bgKey: string;
    imageUrl: string;
    mode: MemeMode;
    isPublished?: boolean;
    publishedId?: string;
  };
  onRemix: () => void;
  onPublish: (publishedMeme: any) => void;
}

export function MemePoster({ meme, onRemix, onPublish }: MemePosterProps) {
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [composedImageUrl, setComposedImageUrl] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  async function handleShare() {
    try {
      // Check if this is a temporary meme (not yet published)
      if (meme.id.startsWith('meme_')) {
        alert('Please publish the meme first to enable sharing!');
        return;
      }

      // Get rotating share caption
      const shareCaption = shareCaptionManager.getNextCaption();
      
      // Use native share if available
      if (navigator.share) {
        await navigator.share({
          title: 'Military Skill Unlocked',
          text: shareCaption,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareCaption}\n${window.location.href}`
        );
      }
      
      // Increment share count
      setShares(prev => prev + 1);
      
      // Show donation toast
      setTimeout(() => {
        alert('✅ Shared! Want to support veterans? [Donate ₹99]');
      }, 1000);
      
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  async function handleLike() {
    try {
      // Check if this is a temporary meme (not yet published)
      if (meme.id.startsWith('meme_')) {
        alert('Please publish the meme first to enable likes and shares!');
        return;
      }

      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeId: meme.id })
      });
      
      if (response.ok) {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
      } else {
        throw new Error('Like failed');
      }
    } catch (error) {
      console.error('Like failed:', error);
      alert('Failed to like meme. Please try again!');
    }
  }

  async function handlePublish() {
    if (!creatorName.trim()) {
      setCreatorName('Supporter of Military');
    }
    
    setPublishing(true);
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeId: meme.id,
          mode: meme.mode,
          line: meme.line,
          bgKey: meme.bgKey,
          imageUrl: meme.imageUrl,
          creatorName: creatorName.trim() || 'Supporter of Military'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the meme to show it's published
        const publishedMeme = {
          ...meme,
          isPublished: true,
          publishedId: result.id
        };
        
        // Call onPublish with the updated meme
        onPublish(publishedMeme);
      } else {
        throw new Error('Publish failed');
      }
    } catch (error) {
      console.error('Publish failed:', error);
      alert('Failed to publish. Please try again!');
    } finally {
      setPublishing(false);
    }
  }

  async function generateComposedImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a canvas element to compose the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Set canvas dimensions (standard poster size)
      canvas.width = 1080;
      canvas.height = 1350;
      
      // Load the background image
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS
      
      img.onload = () => {
        try {
          // Draw background image
          ctx.drawImage(img, 0, 0, 1080, 1350);
          
          // Set text style according to your requirements
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Use a bold font (Bebas Neue would need to be loaded)
          ctx.font = 'bold 72px Arial, sans-serif';
          
          // Calculate text positioning (avoid footer area)
          const centerX = 1080 / 2;
          const centerY = 1350 / 2 - 100; // Slightly above center to avoid footer
          
          // Add text shadow for better readability
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Draw the text in ALL CAPS
          ctx.fillText(meme.line.toUpperCase(), centerX, centerY);
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load background image'));
      img.src = meme.imageUrl;
    });
  }

  async function handlePreview() {
    if (composedImageUrl) return; // Already generated
    
    setComposing(true);
    try {
      const composedUrl = await generateComposedImage();
      setComposedImageUrl(composedUrl);
    } catch (error) {
      console.error('Preview generation failed:', error);
      alert('Failed to generate preview. Please try again!');
    } finally {
      setComposing(false);
    }
  }

  async function handleDownload() {
    try {
      setComposing(true);
      
      // Generate composed image if not already done
      let imageUrl = composedImageUrl;
      if (!imageUrl) {
        imageUrl = await generateComposedImage();
        setComposedImageUrl(imageUrl);
      }
      
      // Download the composed image
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `military-meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Show success message
      alert('🎉 Meme downloaded successfully as PNG!');
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // If CORS fails, show alternative download method
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('CORS') || errorMessage.includes('Failed to load')) {
        alert('⚠️ Direct download failed due to CORS. Right-click the image and "Save As" instead.');
      } else {
        alert('Failed to download meme. Please try again!');
      }
    } finally {
      setComposing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 text-center">
        <p className="text-green-400 font-medium">
          {meme.isPublished 
            ? '🎉 Published! Your military skill is now live on the Meme Wall.'
            : '🎉 You unlocked a military skill. Share it with the world.'
          }
        </p>
      </div>
      
      {/* Meme Display */}
      <div className="space-y-4">
        {/* Original with Text Overlay */}
        <div className="bg-white/10 rounded-2xl p-3 shadow-xl border border-white/20">
          <h3 className="text-white font-bold mb-3 text-center">Preview (Text Overlay)</h3>
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg">
            <img
              src={meme.imageUrl}
              alt="Military meme background"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Background image failed to load:', meme.imageUrl);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-white text-2xl md:text-3xl font-black leading-tight mb-4 drop-shadow-2xl">
                  {meme.line}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Composed Image Preview */}
        {composedImageUrl && (
          <div className="bg-white/10 rounded-2xl p-3 shadow-xl border border-white/20">
            <h3 className="text-white font-bold mb-3 text-center">Composed Poster (Ready for Download)</h3>
            <div className="aspect-[4/5] w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg">
              <img
                src={composedImageUrl}
                alt="Composed military meme poster"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Generate Preview Button */}
        {!composedImageUrl && (
          <div className="text-center">
            <button
              onClick={handlePreview}
              disabled={composing}
              className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {composing ? 'Generating...' : '👁️ Generate Poster Preview'}
            </button>
            <p className="text-white/60 text-sm mt-2">
              See how your poster will look before downloading
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleShare}
          className="py-3 px-6 rounded-2xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors duration-200 shadow-lg"
        >
          🔗 Share
        </button>
        <button
          onClick={handleLike}
          className={`py-3 px-6 rounded-2xl font-bold transition-colors duration-200 shadow-lg ${
            liked 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
          }`}
        >
          ❤️ {likes || 'Like'}
        </button>
        <button
          onClick={onRemix}
          className="py-3 px-6 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors duration-200 shadow-lg"
        >
          🎨 Remix
        </button>
        <button
          onClick={handleDownload}
          className="py-3 px-6 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors duration-200 shadow-lg"
        >
          💾 Download
        </button>
      </div>
      
      {/* Publish Section */}
      <div className="text-center">
        {meme.isPublished ? (
          <div className="px-8 py-3 rounded-2xl bg-green-500 text-white font-bold">
            ✅ Published to Meme Wall
          </div>
        ) : !showPublishForm ? (
          <button
            onClick={() => setShowPublishForm(true)}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-400 text-black font-bold hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 shadow-lg"
          >
            🚀 Publish to Meme Wall
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-6 py-3 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
            <p className="text-white/60 text-sm">
              Leave blank to show as "Supporter of Military"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
