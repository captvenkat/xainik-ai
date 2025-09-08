/**
 * 🎬 Xainik Runware Image Generator
 * High-quality cinematic poster generation with Runware API
 * Bulk prompt processing with Supabase integration
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import slugify from "slugify";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Runware API configuration
const RUNWARE_API_URL = "https://api.runware.com/v1";
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;

// Output directories
const OUTPUT_DIR = "generated-images";
const POSTERS_DIR = path.join(OUTPUT_DIR, "posters");
const THUMBS_DIR = path.join(OUTPUT_DIR, "thumbs");
const OG_DIR = path.join(OUTPUT_DIR, "og");

// Create output directories
await fs.mkdir(POSTERS_DIR, { recursive: true });
await fs.mkdir(THUMBS_DIR, { recursive: true });
await fs.mkdir(OG_DIR, { recursive: true });

/**
 * Cinematic poster prompts for military leadership themes
 * Each prompt is designed for high-quality, square cinematic posters
 */
const CINEMATIC_PROMPTS = [
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
  },
  {
    title: "Forged excellence under pressure",
    prompt: "A cinematic digital painting of molten metal being forged into a sword, symbolic of excellence under pressure, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
    tags: ["excellence", "performance", "discipline", "values"],
    keywords: "excellence, forging, pressure, metal, sword, symbolic, discipline"
  },
  {
    title: "Commanded respect through action",
    prompt: "A cinematic digital painting of a military leader's shadow cast on a wall, commanding presence, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
    tags: ["leadership", "respect", "performance", "values"],
    keywords: "leadership, respect, command, shadow, presence, symbolic, action"
  },
  {
    title: "Mentored the next generation",
    prompt: "A cinematic digital painting of a torch being passed from one hand to another, symbolic of mentorship and knowledge transfer, no faces visible, abstract and symbolic, poster style, square format 1024x1024, ultra high resolution, sharp, detailed, cinematic mood, epic heroic atmosphere",
    tags: ["mentorship", "leadership", "values", "teamwork"],
    keywords: "mentorship, knowledge transfer, torch, passing, symbolic, leadership"
  }
];

/**
 * Generate image using Runware API
 */
async function generateImage(prompt, title) {
  try {
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
  } catch (error) {
    console.error(`❌ Error generating image for "${title}":`, error.message);
    throw error;
  }
}

/**
 * Download image from URL and save as WebP
 */
async function downloadAndProcessImage(imageUrl, title, tags, keywords) {
  try {
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
    
    // Save poster
    const posterPath = path.join(POSTERS_DIR, `${slug}.webp`);
    await fs.writeFile(posterPath, finalPoster);
    
    // Create thumbnail (512x512)
    const thumbnail = await sharp(finalPoster)
      .resize(512, 512, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toBuffer();
    
    const thumbPath = path.join(THUMBS_DIR, `${slug}.webp`);
    await fs.writeFile(thumbPath, thumbnail);
    
    // Create OG image (1200x630)
    const ogImage = await sharp(finalPoster)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toBuffer();
    
    const ogPath = path.join(OG_DIR, `${slug}.webp`);
    await fs.writeFile(ogPath, ogImage);
    
    console.log(`✅ Generated: ${slug}.webp`);
    
    return {
      slug,
      title,
      tags,
      keywords,
      posterPath,
      thumbPath,
      ogPath,
      originalUrl: imageUrl
    };
    
  } catch (error) {
    console.error(`❌ Error processing image for "${title}":`, error.message);
    throw error;
  }
}

/**
 * Create SVG text overlay for the poster
 */
function createTextOverlay(title) {
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

/**
 * Upload to Supabase Storage and save metadata
 */
async function uploadToSupabase(imageData) {
  try {
    console.log(`☁️ Uploading to Supabase: ${imageData.slug}`);
    
    // Upload poster
    const posterFile = await fs.readFile(imageData.posterPath);
    const { data: posterUpload, error: posterError } = await supabase.storage
      .from('posters')
      .upload(`posters/${imageData.slug}.webp`, posterFile, {
        contentType: 'image/webp',
        upsert: true
      });
    
    if (posterError) throw posterError;
    
    // Upload thumbnail
    const thumbFile = await fs.readFile(imageData.thumbPath);
    const { data: thumbUpload, error: thumbError } = await supabase.storage
      .from('posters')
      .upload(`thumbs/${imageData.slug}.webp`, thumbFile, {
        contentType: 'image/webp',
        upsert: true
      });
    
    if (thumbError) throw thumbError;
    
    // Upload OG image
    const ogFile = await fs.readFile(imageData.ogPath);
    const { data: ogUpload, error: ogError } = await supabase.storage
      .from('posters')
      .upload(`og/${imageData.slug}.webp`, ogFile, {
        contentType: 'image/webp',
        upsert: true
      });
    
    if (ogError) throw ogError;
    
    // Get public URLs
    const { data: posterUrl } = supabase.storage
      .from('posters')
      .getPublicUrl(`posters/${imageData.slug}.webp`);
    
    const { data: thumbUrl } = supabase.storage
      .from('posters')
      .getPublicUrl(`thumbs/${imageData.slug}.webp`);
    
    const { data: ogUrl } = supabase.storage
      .from('posters')
      .getPublicUrl(`og/${imageData.slug}.webp`);
    
    // Save metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('posters')
      .upsert({
        id: imageData.slug,
        slug: imageData.slug,
        title_line: imageData.title,
        contrast_line: 'Experience. Not certificates.',
        image_url: posterUrl.publicUrl,
        og_image_url: ogUrl.publicUrl,
        thumb_url: thumbUrl.publicUrl,
        tags: imageData.tags,
        keywords: imageData.keywords,
        likes: 0,
        views: 0,
        shares: 0,
        created_at: new Date().toISOString()
      });
    
    if (dbError) throw dbError;
    
    console.log(`✅ Uploaded to Supabase: ${imageData.slug}`);
    
    return {
      ...imageData,
      posterUrl: posterUrl.publicUrl,
      thumbUrl: thumbUrl.publicUrl,
      ogUrl: ogUrl.publicUrl
    };
    
  } catch (error) {
    console.error(`❌ Error uploading to Supabase:`, error.message);
    throw error;
  }
}

// Utility functions
function wrapText(text, maxChars) {
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

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, c => (
    c === '<' ? '&lt;' :
    c === '>' ? '&gt;' :
    c === '&' ? '&amp;' :
    c === "'" ? '&apos;' :
    '&quot;'
  ));
}

/**
 * Main generation process
 */
async function generateAllPosters() {
  console.log('🎬 Starting Xainik Runware Image Generation...');
  console.log(`📊 Processing ${CINEMATIC_PROMPTS.length} prompts`);
  
  const results = [];
  
  for (let i = 0; i < CINEMATIC_PROMPTS.length; i++) {
    const prompt = CINEMATIC_PROMPTS[i];
    
    try {
      console.log(`\n[${i + 1}/${CINEMATIC_PROMPTS.length}] Processing: "${prompt.title}"`);
      
      // Generate image with Runware
      const imageUrl = await generateImage(prompt.prompt, prompt.title);
      
      // Download and process
      const imageData = await downloadAndProcessImage(
        imageUrl, 
        prompt.title, 
        prompt.tags, 
        prompt.keywords
      );
      
      // Upload to Supabase
      const uploadedData = await uploadToSupabase(imageData);
      
      results.push(uploadedData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to process "${prompt.title}":`, error.message);
      // Continue with next prompt
    }
  }
  
  console.log(`\n🎉 Generation complete!`);
  console.log(`✅ Successfully generated: ${results.length}/${CINEMATIC_PROMPTS.length} posters`);
  
  // Save results summary
  const summary = {
    generated: results.length,
    total: CINEMATIC_PROMPTS.length,
    results: results.map(r => ({
      title: r.title,
      slug: r.slug,
      posterUrl: r.posterUrl,
      tags: r.tags,
      keywords: r.keywords
    })),
    timestamp: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'generation-summary.json'), 
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`📄 Summary saved to: ${OUTPUT_DIR}/generation-summary.json`);
  
  return results;
}

// Run the generation process
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllPosters().catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });
}

export { generateAllPosters, CINEMATIC_PROMPTS };
