import { ImagePipeline } from '../lib/image-pipeline';
import sharp from 'sharp';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.webp' } }))
      }))
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-123')
}));

describe('ImagePipeline Integration', () => {
  let mockImageBuffer: Buffer;

  beforeAll(async () => {
    // Create a test image buffer
    mockImageBuffer = await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toBuffer();
  });

  it('should process image and return correct structure', async () => {
    const result = await ImagePipeline.processImage(
      mockImageBuffer,
      'test-speaker-id',
      'poster',
      'runware'
    );

    expect(result).toMatchObject({
      mediaId: 'test-uuid-123',
      urls: {
        hero: 'https://example.com/test.webp',
        card: 'https://example.com/test.webp',
        thumb: 'https://example.com/test.webp'
      },
      meta: {
        sizes: {
          hero: { width: 1600, height: expect.any(Number) },
          card: { width: 800, height: expect.any(Number) },
          thumb: { width: 320, height: expect.any(Number) }
        },
        source: 'runware',
        mime: 'image/webp',
        version: expect.any(String)
      }
    });

    // Verify aspect ratio is maintained
    const aspectRatio = 1920 / 1080;
    expect(result.meta.sizes.hero.height).toBe(Math.round(1600 / aspectRatio));
    expect(result.meta.sizes.card.height).toBe(Math.round(800 / aspectRatio));
    expect(result.meta.sizes.thumb.height).toBe(Math.round(320 / aspectRatio));
  });

  it('should handle URL input', async () => {
    // Mock fetch for URL input
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer)
      })
    ) as jest.Mock;

    const result = await ImagePipeline.processImage(
      'https://example.com/test-image.jpg',
      'test-speaker-id',
      'photo',
      'upload'
    );

    expect(result.meta.source).toBe('upload');
    expect(result.meta.mime).toBe('image/webp');
  });

  it('should throw error for invalid image', async () => {
    const invalidBuffer = Buffer.from('not an image');

    await expect(
      ImagePipeline.processImage(
        invalidBuffer,
        'test-speaker-id',
        'poster',
        'runware'
      )
    ).rejects.toThrow('Input buffer contains unsupported image format');
  });
});
