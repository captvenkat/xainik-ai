import { RunwareService } from '../lib/runware-service';

// Mock fetch
global.fetch = jest.fn();

describe('RunwareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when API key is present', () => {
      process.env.RUNWARE_API_KEY = 'test-key';
      expect(RunwareService.isAvailable()).toBe(true);
    });

    it('should return false when API key is missing', () => {
      delete process.env.RUNWARE_API_KEY;
      expect(RunwareService.isAvailable()).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return true when feature flag is true', () => {
      process.env.NEXT_PUBLIC_RUNWARE_ENABLED = 'true';
      process.env.RUNWARE_API_KEY = 'test-key';
      expect(RunwareService.isEnabled()).toBe(true);
    });

    it('should return false when feature flag is false', () => {
      process.env.NEXT_PUBLIC_RUNWARE_ENABLED = 'false';
      process.env.RUNWARE_API_KEY = 'test-key';
      expect(RunwareService.isEnabled()).toBe(false);
    });

    it('should default to true when API key is present and no flag', () => {
      delete process.env.NEXT_PUBLIC_RUNWARE_ENABLED;
      process.env.RUNWARE_API_KEY = 'test-key';
      expect(RunwareService.isEnabled()).toBe(true);
    });
  });

  describe('generatePoster', () => {
    it('should return error when API key is missing', async () => {
      delete process.env.RUNWARE_API_KEY;
      
      const result = await RunwareService.generatePoster({
        photoUrl: 'https://example.com/photo.jpg'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Runware API key not configured');
    });

    it('should return error when photo URL is missing', async () => {
      process.env.RUNWARE_API_KEY = 'test-key';
      
      const result = await RunwareService.generatePoster({
        photoUrl: ''
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Photo URL is required');
    });

    it('should return error when API call fails', async () => {
      process.env.RUNWARE_API_KEY = 'test-key';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request')
      });

      const result = await RunwareService.generatePoster({
        photoUrl: 'https://example.com/photo.jpg'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Runware API error');
    });

    it('should return success when API call succeeds', async () => {
      process.env.RUNWARE_API_KEY = 'test-key';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'test-id',
            images: [{
              id: 'img-1',
              url: 'https://example.com/generated.jpg',
              width: 1080,
              height: 1350
            }]
          }
        })
      });

      const result = await RunwareService.generatePoster({
        photoUrl: 'https://example.com/photo.jpg',
        prompt: 'Test prompt',
        style: 'professional'
      });

      expect(result.success).toBe(true);
      expect(result.data?.images).toHaveLength(1);
      expect(result.data?.images[0].url).toBe('https://example.com/generated.jpg');
    });
  });
});
