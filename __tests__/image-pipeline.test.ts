import { ImagePipeline } from '../lib/image-pipeline';

describe('ImagePipeline', () => {
  describe('validateWebPPolicy', () => {
    it('should return true for valid WebP metadata', () => {
      const validMeta = {
        mime: 'image/webp',
        sizes: {
          hero: { width: 1600, height: 900 },
          card: { width: 800, height: 450 },
          thumb: { width: 320, height: 180 }
        },
        source: 'runware',
        version: '1234567890'
      };

      expect(ImagePipeline.validateWebPPolicy(validMeta)).toBe(true);
    });

    it('should return false for missing metadata', () => {
      expect(ImagePipeline.validateWebPPolicy(null)).toBe(false);
      expect(ImagePipeline.validateWebPPolicy(undefined)).toBe(false);
      expect(ImagePipeline.validateWebPPolicy({})).toBe(false);
    });

    it('should return false for non-WebP MIME type', () => {
      const invalidMeta = {
        mime: 'image/jpeg',
        sizes: {
          hero: { width: 1600, height: 900 },
          card: { width: 800, height: 450 },
          thumb: { width: 320, height: 180 }
        }
      };

      expect(ImagePipeline.validateWebPPolicy(invalidMeta)).toBe(false);
    });

    it('should return false for missing sizes', () => {
      const invalidMeta = {
        mime: 'image/webp',
        sizes: null
      };

      expect(ImagePipeline.validateWebPPolicy(invalidMeta)).toBe(false);
    });

    it('should return false for incomplete sizes', () => {
      const invalidMeta = {
        mime: 'image/webp',
        sizes: {
          hero: { width: 1600, height: 900 },
          card: { width: 800, height: 450 }
          // missing thumb
        }
      };

      expect(ImagePipeline.validateWebPPolicy(invalidMeta)).toBe(false);
    });
  });

  describe('getImageUrl', () => {
    it('should return size-specific URL when available', () => {
      const mediaRecord = {
        url: 'https://example.com/hero.webp',
        meta: {
          urls: {
            hero: 'https://example.com/hero.webp',
            card: 'https://example.com/card.webp',
            thumb: 'https://example.com/thumb.webp'
          }
        }
      };

      expect(ImagePipeline.getImageUrl(mediaRecord, 'card')).toBe('https://example.com/card.webp');
      expect(ImagePipeline.getImageUrl(mediaRecord, 'thumb')).toBe('https://example.com/thumb.webp');
    });

    it('should fallback to primary URL for legacy records', () => {
      const mediaRecord = {
        url: 'https://example.com/image.jpg',
        meta: null
      };

      expect(ImagePipeline.getImageUrl(mediaRecord, 'card')).toBe('https://example.com/image.jpg');
    });

    it('should default to card size', () => {
      const mediaRecord = {
        url: 'https://example.com/hero.webp',
        meta: {
          urls: {
            hero: 'https://example.com/hero.webp',
            card: 'https://example.com/card.webp',
            thumb: 'https://example.com/thumb.webp'
          }
        }
      };

      expect(ImagePipeline.getImageUrl(mediaRecord)).toBe('https://example.com/card.webp');
    });
  });
});
