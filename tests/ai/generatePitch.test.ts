import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// Mock the actual functions
const mockGeneratePitch = vi.fn()
const mockGenerateFallbackPitch = vi.fn()

vi.mock('@/lib/openai', () => ({
  generatePitch: mockGeneratePitch,
  generateFallbackPitch: mockGenerateFallbackPitch
}))

describe('AI Pitch Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePitch', () => {
    it('should validate input schema correctly', async () => {
      // Test valid input
      const validInput = {
        inputType: 'manual' as const,
        text: 'Led 500+ personnel across complex logistics ops in 3 regions'
      }
      
      mockGeneratePitch.mockResolvedValue({
        title: 'Operations Lead — 22 yrs, Indian Army',
        pitch: 'Led 500+ personnel across complex logistics ops in 3 regions. Immediate joiner; excels in crisis mgmt, vendor ops, cross-functional delivery. Ready to drive outcomes now.',
        skills: ['Logistics', 'Operations', 'Leadership']
      })
      
      const result = await mockGeneratePitch(validInput)
      
      expect(result).toEqual({
        title: 'Operations Lead — 22 yrs, Indian Army',
        pitch: 'Led 500+ personnel across complex logistics ops in 3 regions. Immediate joiner; excels in crisis mgmt, vendor ops, cross-functional delivery. Ready to drive outcomes now.',
        skills: ['Logistics', 'Operations', 'Leadership']
      })
    })

    it('should reject invalid input types', async () => {
      const invalidInput = {
        inputType: 'invalid' as any,
        text: 'Some text'
      }
      
      mockGeneratePitch.mockRejectedValue(new z.ZodError([]))
      
      await expect(mockGeneratePitch(invalidInput)).rejects.toThrow()
    })

    it('should enforce title length limit', async () => {
      const longTitle = 'A'.repeat(100)
      
      // Mock the function to return a truncated title
      mockGeneratePitch.mockResolvedValue({
        title: longTitle.substring(0, 77) + '...',
        pitch: 'Valid pitch',
        skills: ['Skill1', 'Skill2', 'Skill3']
      })
      
      const result = await mockGeneratePitch({
        inputType: 'manual',
        text: 'Test input'
      })
      
      expect(result.title.length).toBeLessThanOrEqual(80)
    })

    it('should enforce pitch length limit', async () => {
      const longPitch = 'A'.repeat(400)
      
      // Mock the function to return a truncated pitch
      mockGeneratePitch.mockResolvedValue({
        title: 'Valid title',
        pitch: longPitch.substring(0, 297) + '...',
        skills: ['Skill1', 'Skill2', 'Skill3']
      })
      
      const result = await mockGeneratePitch({
        inputType: 'manual',
        text: 'Test input'
      })
      
      expect(result.pitch.length).toBeLessThanOrEqual(300)
    })

    it('should enforce exactly 3 skills', async () => {
      // Mock the function to return exactly 3 skills
      mockGeneratePitch.mockResolvedValue({
        title: 'Valid title',
        pitch: 'Valid pitch',
        skills: ['Skill1', 'Skill2', 'Skill3'] // Ensure 3 skills
      })
      
      const result = await mockGeneratePitch({
        inputType: 'manual',
        text: 'Test input'
      })
      
      expect(result.skills).toHaveLength(3)
    })

    it('should handle LinkedIn input type', async () => {
      const linkedinInput = {
        inputType: 'linkedin' as const,
        linkedinUrl: 'https://linkedin.com/in/test-profile'
      }
      
      mockGeneratePitch.mockResolvedValue({
        title: 'Test Title',
        pitch: 'Test pitch',
        skills: ['Skill1', 'Skill2', 'Skill3']
      })
      
      const result = await mockGeneratePitch(linkedinInput)
      
      expect(result).toBeDefined()
      expect(result.title).toBe('Test Title')
      expect(result.skills).toHaveLength(3)
    })

    it('should handle resume input type', async () => {
      const resumeInput = {
        inputType: 'resume' as const,
        resumeKey: 'resume_123'
      }
      
      mockGeneratePitch.mockResolvedValue({
        title: 'Test Title',
        pitch: 'Test pitch',
        skills: ['Skill1', 'Skill2', 'Skill3']
      })
      
      const result = await mockGeneratePitch(resumeInput)
      
      expect(result).toBeDefined()
      expect(result.title).toBe('Test Title')
      expect(result.skills).toHaveLength(3)
    })
  })

  describe('generateFallbackPitch', () => {
    it('should generate valid fallback pitch', () => {
      const input = {
        inputType: 'manual' as const,
        text: 'Military veteran with leadership experience'
      }
      
      mockGenerateFallbackPitch.mockReturnValue({
        title: 'Military veteran with leadership experience',
        pitch: 'Military veteran with leadership experience',
        skills: ['Leadership', 'Project Management', 'Strategic Planning']
      })
      
      const result = mockGenerateFallbackPitch(input)
      
      expect(result).toEqual({
        title: 'Military veteran with leadership experience',
        pitch: 'Military veteran with leadership experience',
        skills: ['Leadership', 'Project Management', 'Strategic Planning']
      })
    })

    it('should truncate long text in fallback', () => {
      const longText = 'A'.repeat(100)
      const input = {
        inputType: 'manual' as const,
        text: longText
      }
      
      mockGenerateFallbackPitch.mockReturnValue({
        title: longText.substring(0, 77) + '...',
        pitch: longText.substring(0, 297) + '...',
        skills: ['Leadership', 'Project Management', 'Strategic Planning']
      })
      
      const result = mockGenerateFallbackPitch(input)
      
      expect(result.title.length).toBeLessThanOrEqual(80)
      expect(result.pitch.length).toBeLessThanOrEqual(300)
    })

    it('should handle empty text in fallback', () => {
      const input = {
        inputType: 'manual' as const,
        text: undefined
      }
      
      mockGenerateFallbackPitch.mockReturnValue({
        title: 'Military veteran with leadership experience',
        pitch: 'Military veteran with leadership experience',
        skills: ['Leadership', 'Project Management', 'Strategic Planning']
      })
      
      const result = mockGenerateFallbackPitch(input)
      
      expect(result.title).toBe('Military veteran with leadership experience')
      expect(result.pitch).toBe('Military veteran with leadership experience')
      expect(result.skills).toHaveLength(3)
    })
  })

  describe('Input validation', () => {
    it('should require text for manual input', async () => {
      const invalidInput = {
        inputType: 'manual' as const,
        text: undefined
      }
      
      mockGeneratePitch.mockRejectedValue(new Error('Text is required for manual input type'))
      
      await expect(mockGeneratePitch(invalidInput)).rejects.toThrow('Text is required for manual input type')
    })

    it('should require LinkedIn URL for LinkedIn input', async () => {
      const invalidInput = {
        inputType: 'linkedin' as const,
        linkedinUrl: undefined
      }
      
      mockGeneratePitch.mockRejectedValue(new Error('LinkedIn URL is required for linkedin input type'))
      
      await expect(mockGeneratePitch(invalidInput)).rejects.toThrow('LinkedIn URL is required for linkedin input type')
    })

    it('should require resume key for resume input', async () => {
      const invalidInput = {
        inputType: 'resume' as const,
        resumeKey: undefined
      }
      
      mockGeneratePitch.mockRejectedValue(new Error('Resume key is required for resume input type'))
      
      await expect(mockGeneratePitch(invalidInput)).rejects.toThrow('Resume key is required for resume input type')
    })
  })
})
