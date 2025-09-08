/**
 * 🎬 Xainik DALL-E 3 + Supabase Generator
 * Generate 5 cinematic posters with DALL-E 3, add text overlays, and save to Supabase
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import slugify from "slugify";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

// Output directories
const OUTPUT_DIR = "supabase-posters";
const POSTERS_DIR = path.join(OUTPUT_DIR, "posters");
const THUMBS_DIR = path.join(OUTPUT_DIR, "thumbs");
const OG_DIR = path.join(OUTPUT_DIR, "og");

// Create output directories
await fs.mkdir(POSTERS_DIR, { recursive: true });
await fs.mkdir(THUMBS_DIR, { recursive: true });
await fs.mkdir(OG_DIR, { recursive: true });

/**
 * 5 Cinematic Posters with exact specifications
 */
const CINEMATIC_POSTERS = [
  {
    title: "Made tough calls with no clear answers",
    prompt: "Epic cinematic military-inspired poster background, storm clouds swirling above a barren ridge, dramatic searchlights cutting through heavy fog. No people, no faces, no flags, no insignia, no logos. Atmospheric, moody, with powerful negative space for a large bold title. Ultra-detailed, 1024x1024, professional movie-poster look.",
    tags: ["leadership", "crisis", "decision-making"],
    footer: "Experience. Not certificates.\nXainik — Natural Leaders"
  },
  {
    title: "Kept the team moving in chaos",
    prompt: "Cinematic poster background, convoy headlights piercing dust and haze on a rugged desert road at dusk. No people, no faces, no insignia. Epic scale, strong cinematic lighting, stormy atmosphere. Composition leaves open space at top for bold title and bottom for footer text. 1024x1024, ultra-detailed.",
    tags: ["teamwork", "resilience", "leadership"],
    footer: "Experience. Not certificates.\nXainik — Natural Leaders"
  },
  {
    title: "Delivered results when everything changed overnight",
    prompt: "Epic cinematic poster background, desert camp illuminated by sudden lightning against stormy skies. Tents and equipment scattered, dramatic atmosphere, no faces, no insignia, no logos. Moody cinematic lighting, designed for bold title text placement. Sharp detail, 1024x1024, movie-poster quality.",
    tags: ["adaptability", "transition", "innovation"],
    footer: "Experience. Not certificates.\nXainik — Natural Leaders"
  },
  {
    title: "Got the job done with less than enough",
    prompt: "Cinematic military poster background, rugged field table lit by a single lantern, scattered equipment casting long dramatic shadows. Minimalistic yet epic, gritty texture, no faces, no insignia. Poster composition with strong negative space for large bold title. Ultra-detailed 1024x1024, cinematic grading.",
    tags: ["resilience", "resourcefulness", "performance"],
    footer: "Experience. Not certificates.\nXainik — Natural Leaders"
  },
  {
    title: "Stayed calm when everything else was on fire",
    prompt: "Cinematic military-inspired poster, distant fires glowing under storm clouds, but foreground calm — a compass and map under a spotlight. Epic, high-contrast lighting, dramatic atmosphere, no faces, no insignia. Designed like a movie poster: bold title area at top, footer area at bottom. Ultra-sharp 1024x1024, professional movie-poster style.",
    tags: ["crisis", "discipline", "leadership"],
    footer: "Experience. Not certificates.\nXainik — Natural Leaders"
  }
];

/**
 * Generate image using DALL-E 3
 */
async function generateImageWithDALLE(prompt, title) {
  try {
    console.log(`🎨 Generating DALL-E 3 image for: "${title}"`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No images returned from DALL-E 3');
    }

    return response.data[0].url;
  } catch (error) {
    console.error(`❌ Error generating DALL-E 3 image for "${title}":`, error.message);
    throw error;
  }
}

/**
 * Download image and process with Sharp + text overlay
 */
async function processImageWithTextOverlay(imageUrl, title, tags, footer) {
  try {
    const slug = slugify(title, { lower: true, strict: true });
    
    console.log(`📥 Downloading and processing: "${title}"`);
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Process with Sharp and add text overlay
    const svgOverlay = createTextOverlay(title, footer);
    
    const finalPoster = await sharp(Buffer.from(imageBuffer))
      .resize(1024, 1024, { fit: 'cover', position: 'centre' })
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
    
    console.log(`✅ Processed: ${slug}.webp`);
    
    return {
      slug,
      title,
      tags,
      footer,
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
        contrast_line: imageData.footer,
        image_url: posterUrl.publicUrl,
        og_image_url: ogUrl.publicUrl,
        thumb_url: thumbUrl.publicUrl,
        tags: imageData.tags,
        keywords: imageData.tags.join(', '),
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

/**
 * Create SVG text overlay with new footer format
 */
function createTextOverlay(title, footer) {
  const W = 1024, H = 1024;
  const TITLE_SIZE = 64;
  const FOOTER_SIZE = 28;
  
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
  
  // Footer block - new format
  const footerLines = footer.split('\n');
  const footerStartY = H - 60;
  const footerLineHeight = FOOTER_SIZE * 1.2;
  
  const footerTSpans = footerLines.map((line, i) => {
    const y = footerStartY - (footerLineHeight * (footerLines.length - 1 - i));
    const weight = line.includes('Experience') ? 700 : 600;
    return `<text x="50%" y="${y}" text-anchor="middle" fill="#ffffff" font-size="${FOOTER_SIZE}" font-weight="${weight}" font-family="Inter, Arial, sans-serif" letter-spacing="0.5px" stroke="#000000" stroke-width="1">${escapeXml(line)}</text>`;
  }).join("");
  
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
  ${footerTSpans}
</svg>`;
  
  return Buffer.from(svg);
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
 * Main generation process for 5 posters with Supabase integration
 */
async function generateAndSaveToSupabase() {
  console.log('🎬 Starting Xainik DALL-E 3 + Supabase Generation...');
  console.log(`📊 Generating ${CINEMATIC_POSTERS.length} cinematic posters with Supabase integration`);
  
  const results = [];
  
  for (let i = 0; i < CINEMATIC_POSTERS.length; i++) {
    const poster = CINEMATIC_POSTERS[i];
    
    try {
      console.log(`\n[${i + 1}/${CINEMATIC_POSTERS.length}] Processing: "${poster.title}"`);
      
      // Generate image with DALL-E 3
      const imageUrl = await generateImageWithDALLE(poster.prompt, poster.title);
      
      // Process and add text overlay
      const imageData = await processImageWithTextOverlay(
        imageUrl, 
        poster.title, 
        poster.tags, 
        poster.footer
      );
      
      // Upload to Supabase (skip if credentials are placeholder)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        const uploadedData = await uploadToSupabase(imageData);
        results.push(uploadedData);
      } else {
        console.log(`⚠️ Skipping Supabase upload (placeholder credentials) - files saved locally`);
        results.push(imageData);
      }
      
      console.log(`✅ Completed: "${poster.title}"`);
      
      // Delay between requests to avoid rate limiting
      if (i < CINEMATIC_POSTERS.length - 1) {
        console.log('⏳ Waiting 3 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to process "${poster.title}":`, error.message);
      // Continue with next poster
    }
  }
  
  console.log(`\n🎉 Generation complete!`);
  console.log(`✅ Successfully generated and saved: ${results.length}/${CINEMATIC_POSTERS.length} posters to Supabase`);
  
  // Save results summary
  const summary = {
    generated: results.length,
    total: CINEMATIC_POSTERS.length,
    results: results.map(r => ({
      title: r.title,
      slug: r.slug,
      posterUrl: r.posterUrl,
      tags: r.tags,
      footer: r.footer
    })),
    timestamp: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'supabase-generation-summary.json'), 
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`📄 Summary saved to: ${OUTPUT_DIR}/supabase-generation-summary.json`);
  console.log(`📁 Local files saved to: ${OUTPUT_DIR}/`);
  
  return results;
}

// Run the generation process
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAndSaveToSupabase().catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });
}

export { generateAndSaveToSupabase, CINEMATIC_POSTERS };
