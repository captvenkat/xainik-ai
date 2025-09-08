import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import slugify from 'slugify';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RUNWARE_API_URL = "https://api.runware.com/v1";
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;

interface GenerationPrompt {
  title: string;
  prompt: string;
  tags: string[];
  keywords: string;
}

export async function POST(request: NextRequest) {
  const { prompts, customPrompts } = await request.json();
  
  const allPrompts = [...prompts];
  
  // Parse custom prompts if provided
  if (customPrompts) {
    try {
      const custom = JSON.parse(customPrompts);
      allPrompts.push(...custom);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid custom prompts JSON' }, { status: 400 });
    }
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (progress: number) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', progress })}\n\n`));
      };

      const sendResult = (result: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', result })}\n\n`));
      };

      const sendError = (title: string, error: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', title, error })}\n\n`));
      };

      try {
        for (let i = 0; i < allPrompts.length; i++) {
          const prompt = allPrompts[i];
          const progress = Math.round(((i + 1) / allPrompts.length) * 100);
          
          sendProgress(progress);
          
          try {
            // Generate image with Runware
            const imageUrl = await generateImageWithRunware(prompt.prompt, prompt.title);
            
            // Process and upload
            const result = await processAndUploadImage(
              imageUrl,
              prompt.title,
              prompt.tags,
              prompt.keywords
            );
            
            sendResult({
              title: prompt.title,
              slug: result.slug,
              posterUrl: result.posterUrl,
              tags: prompt.tags,
              keywords: prompt.keywords,
              status: 'completed'
            });
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.error(`Error processing ${prompt.title}:`, error);
            sendError(prompt.title, error instanceof Error ? error.message : 'Unknown error');
          }
        }
        
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function generateImageWithRunware(prompt: string, title: string): Promise<string> {
  console.log(`🎨 Generating image for: "${title}"`);
  
  const response = await fetch(`${RUNWARE_API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWARE_API_KEY}`
    },
    body: JSON.stringify({
      prompt: prompt,
      width: 1024,
      height: 1024,
      num_images: 1,
      model: "runware-sdxl-1.0",
      style: "cinematic",
      quality: "high"
    })
  });

  if (!response.ok) {
    throw new Error(`Runware API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.images || data.images.length === 0) {
    throw new Error('No images returned from Runware API');
  }

  return data.images[0].url;
}

async function processAndUploadImage(
  imageUrl: string, 
  title: string, 
  tags: string[], 
  keywords: string
) {
  const slug = slugify(title, { lower: true, strict: true });
  
  // Download the image
  console.log(`📥 Downloading image for: "${title}"`);
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageBuffer = await imageResponse.arrayBuffer();
  
  // Process with Sharp to ensure WebP format and add text overlay
  const processedImage = await sharp(Buffer.from(imageBuffer))
    .resize(1024, 1024, { fit: 'cover', position: 'centre' })
    .webp({ quality: 90 });
  
  // Add text overlay using SVG
  const svgOverlay = createTextOverlay(title);
  
  // Final poster with text overlay
  const finalPoster = await processedImage
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .webp({ quality: 90 })
    .toBuffer();
  
  // Create thumbnail (512x512)
  const thumbnail = await sharp(finalPoster)
    .resize(512, 512, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })
    .toBuffer();
  
  // Create OG image (1200x630)
  const ogImage = await sharp(finalPoster)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })
    .toBuffer();
  
  // Upload to Supabase Storage
  const { data: posterUpload, error: posterError } = await supabase.storage
    .from('posters')
    .upload(`posters/${slug}.webp`, finalPoster, {
      contentType: 'image/webp',
      upsert: true
    });
  
  if (posterError) throw posterError;
  
  const { data: thumbUpload, error: thumbError } = await supabase.storage
    .from('posters')
    .upload(`thumbs/${slug}.webp`, thumbnail, {
      contentType: 'image/webp',
      upsert: true
    });
  
  if (thumbError) throw thumbError;
  
  const { data: ogUpload, error: ogError } = await supabase.storage
    .from('posters')
    .upload(`og/${slug}.webp`, ogImage, {
      contentType: 'image/webp',
      upsert: true
    });
  
  if (ogError) throw ogError;
  
  // Get public URLs
  const { data: posterUrl } = supabase.storage
    .from('posters')
    .getPublicUrl(`posters/${slug}.webp`);
  
  const { data: thumbUrl } = supabase.storage
    .from('posters')
    .getPublicUrl(`thumbs/${slug}.webp`);
  
  const { data: ogUrl } = supabase.storage
    .from('posters')
    .getPublicUrl(`og/${slug}.webp`);
  
  // Save metadata to database
  const { data: dbData, error: dbError } = await supabase
    .from('posters')
    .upsert({
      id: slug,
      slug: slug,
      title_line: title,
      contrast_line: 'Experience. Not certificates.',
      image_url: posterUrl.publicUrl,
      og_image_url: ogUrl.publicUrl,
      thumb_url: thumbUrl.publicUrl,
      tags: tags,
      keywords: keywords,
      likes: 0,
      views: 0,
      shares: 0,
      created_at: new Date().toISOString()
    });
  
  if (dbError) throw dbError;
  
  console.log(`✅ Uploaded to Supabase: ${slug}`);
  
  return {
    slug,
    posterUrl: posterUrl.publicUrl,
    thumbUrl: thumbUrl.publicUrl,
    ogUrl: ogUrl.publicUrl
  };
}

function createTextOverlay(title: string): Buffer {
  const W = 1024, H = 1024;
  const TITLE_SIZE = 64;
  const FOOTER_SIZE = 32;
  
  // Wrap title if too long
  const titleLines = wrapText(title, 20);
  const titleLineHeight = TITLE_SIZE * 1.1;
  const titleStartY = Math.round(H * 0.25);
  const totalTitleHeight = titleLines.length * titleLineHeight;
  const titleY = titleStartY - (totalTitleHeight / 2);
  
  const titleTSpans = titleLines.map((line, i) => {
    const y = titleY + (i * titleLineHeight) + TITLE_SIZE;
    return `<text x="50%" y="${y}" text-anchor="middle" fill="#ffffff" font-size="${TITLE_SIZE}" font-weight="900" font-family="Impact, Oswald, Arial Black, sans-serif" letter-spacing="1px" stroke="#000000" stroke-width="2">${escapeXml(line)}</text>`;
  }).join("");
  
  // Footer block
  const footerBlock = [
    { text: "Natural Leaders", size: FOOTER_SIZE, weight: 600 },
    { text: "Experience. Not certificates.", size: FOOTER_SIZE, weight: 700 },
    { text: "Xainik", size: FOOTER_SIZE, weight: 600 }
  ];
  
  const footerStartY = H - 60;
  const footerLines = footerBlock
    .map((l, idx) => {
      const y = footerStartY - (40 * (footerBlock.length - 1 - idx));
      return `<text x="50%" y="${y}" text-anchor="middle" fill="#ffffff" font-size="${l.size}" font-weight="${l.weight}" font-family="Inter, Arial, sans-serif" letter-spacing="0.5px" stroke="#000000" stroke-width="1">${escapeXml(l.text)}</text>`;
    })
    .join("");
  
  const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="black" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottomFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="black" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="black" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <rect x="0" y="0" width="${W}" height="${Math.round(H*0.40)}" fill="url(#topFade)"/>
  <rect x="0" y="${Math.round(H*0.60)}" width="${W}" height="${Math.round(H*0.40)}" fill="url(#bottomFade)"/>
  
  ${titleTSpans}
  ${footerLines}
</svg>`;
  
  return Buffer.from(svg);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine ? currentLine + ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines.slice(0, 3);
}

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, c => (
    c === '<' ? '&lt;' :
    c === '>' ? '&gt;' :
    c === '&' ? '&amp;' :
    c === "'" ? '&apos;' :
    '&quot;'
  ));
}
