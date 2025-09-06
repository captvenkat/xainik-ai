import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ImageSizes {
  hero: { width: 1600; height: number };
  card: { width: 800; height: number };
  thumb: { width: 320; height: number };
}

export interface ProcessedImage {
  mediaId: string;
  urls: {
    hero: string;
    card: string;
    thumb: string;
  };
  meta: {
    sizes: ImageSizes;
    source: 'runware' | 'upload';
    mime: 'image/webp';
    version: string;
  };
}

export class ImagePipeline {
  private static readonly WEBP_QUALITY = 82;
  private static readonly WEBP_EFFORT = 6;
  private static readonly SIZES = {
    hero: 1600,
    card: 800,
    thumb: 320
  } as const;

  /**
   * Process an image from URL or buffer into WebP variants
   */
  static async processImage(
    input: string | Buffer,
    speakerId: string,
    kind: 'poster' | 'photo',
    source: 'runware' | 'upload' = 'upload'
  ): Promise<ProcessedImage> {
    const mediaId = randomUUID();
    const version = Date.now().toString();

    // Download image if URL provided
    let imageBuffer: Buffer;
    if (typeof input === 'string') {
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      imageBuffer = input;
    }

    // Get original dimensions
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: missing dimensions');
    }

    // Calculate aspect ratios for each size
    const aspectRatio = metadata.width / metadata.height;
    const sizes: ImageSizes = {
      hero: { width: 1600, height: Math.round(1600 / aspectRatio) },
      card: { width: 800, height: Math.round(800 / aspectRatio) },
      thumb: { width: 320, height: Math.round(320 / aspectRatio) }
    };

    // Process each size
    const processedImages = await Promise.all([
      this.processSize(imageBuffer, sizes.hero, 'hero'),
      this.processSize(imageBuffer, sizes.card, 'card'),
      this.processSize(imageBuffer, sizes.thumb, 'thumb')
    ]);

    // Upload to Supabase Storage
    const uploadPromises = processedImages.map(async (buffer, index) => {
      const sizeName = ['hero', 'card', 'thumb'][index] as keyof ImageSizes;
      const path = `speakers/${speakerId}/${mediaId}/${sizeName}.webp`;
      
      const { error } = await supabase.storage
        .from('media')
        .upload(path, buffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Failed to upload ${sizeName}: ${error.message}`);
      }

      return { size: sizeName, path };
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Get public URLs
    const urls = {
      hero: supabase.storage.from('media').getPublicUrl(`speakers/${speakerId}/${mediaId}/hero.webp`).data.publicUrl,
      card: supabase.storage.from('media').getPublicUrl(`speakers/${speakerId}/${mediaId}/card.webp`).data.publicUrl,
      thumb: supabase.storage.from('media').getPublicUrl(`speakers/${speakerId}/${mediaId}/thumb.webp`).data.publicUrl
    };

    // Insert media record
    const { error: dbError } = await supabase
      .from('media')
      .insert({
        id: mediaId,
        speaker_id: speakerId,
        kind,
        url: urls.hero, // Primary URL points to hero size
        meta: {
          sizes,
          source,
          mime: 'image/webp',
          version,
          urls: {
            hero: urls.hero,
            card: urls.card,
            thumb: urls.thumb
          }
        }
      });

    if (dbError) {
      throw new Error(`Failed to insert media record: ${dbError.message}`);
    }

    return {
      mediaId,
      urls,
      meta: {
        sizes,
        source,
        mime: 'image/webp',
        version
      }
    };
  }

  /**
   * Process a single size variant
   */
  private static async processSize(
    inputBuffer: Buffer,
    dimensions: { width: number; height: number },
    sizeName: string
  ): Promise<Buffer> {
    return await sharp(inputBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: this.WEBP_QUALITY,
        effort: this.WEBP_EFFORT
      })
      .toBuffer();
  }

  /**
   * Validate that an image meets WebP policy requirements
   */
  static validateWebPPolicy(meta: any): boolean {
    if (!meta) return false;
    if (meta.mime !== 'image/webp') return false;
    if (!meta.sizes) return false;
    if (!meta.sizes.hero || !meta.sizes.card || !meta.sizes.thumb) return false;
    return true;
  }

  /**
   * Get the appropriate image URL for a given size
   */
  static getImageUrl(mediaRecord: any, size: 'hero' | 'card' | 'thumb' = 'card'): string {
    if (mediaRecord.meta?.urls?.[size]) {
      return mediaRecord.meta.urls[size];
    }
    
    // Fallback to primary URL for legacy records
    return mediaRecord.url;
  }
}
