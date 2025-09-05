import { MEME_CONFIG, GenerationState, INITIAL_STATE, COOLDOWNS } from './meme-config';
import crypto from 'crypto';

export type MemeMode = 'humor' | 'inspiration';

interface GeneratedMeme {
  id: string;
  line: string;
  bgKey: string;
  imageUrl: string;
  mode: MemeMode;
  frameId: number;
  wordChoices: string[];
  hash: string;
}

// Global state for anti-repetition (in production, this would be in Redis/DB)
let globalState: GenerationState = INITIAL_STATE;

export class EnhancedMemeGenerator {
  private state: GenerationState;

  constructor() {
    this.state = globalState;
  }

  async generateMeme(mode: MemeMode, userId?: string): Promise<GeneratedMeme> {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const result = await this.generateWithFrame(mode, userId);
        if (result) {
          // Update global state
          this.updateState(result, userId);
          globalState = this.state;
          return result;
        }
      } catch (error) {
        console.error(`Generation attempt ${attempts + 1} failed:`, error);
      }
      attempts++;
    }

    // Fallback to static meme
    return this.generateFallback(mode);
  }

  private async generateWithFrame(mode: MemeMode, userId?: string): Promise<GeneratedMeme | null> {
    // Step 1: Pick frame with cooldown
    const frameId = this.pickFrameWithCooldown(mode, userId);
    if (frameId === -1) return null;

    // Step 2: Assemble slots with word banks
    const frame = MEME_CONFIG.modes[mode].frames[frameId];
    const { assembledFrame, wordChoices } = this.assembleFrame(frame);

    // Step 3: Generate with AI via API
    const line = await this.generateWithAI(mode, assembledFrame);
    if (!line) return null;

    // Step 4: Post-process
    const processedLine = this.postProcess(line, mode);
    if (!processedLine) return null;

    // Step 5: Quality gates
    if (!this.passQualityGates(processedLine, mode)) {
      return null;
    }

    // Step 6: Similarity check
    if (this.isTooSimilar(processedLine)) {
      return null;
    }

    // Step 7: Generate background and image
    const bgKey = this.pickRandomBackground();
    const imageUrl = await this.composeMemeImage(processedLine, bgKey);

    // Step 8: Create hash
    const hash = this.generateHash(processedLine);

    return {
      id: crypto.randomUUID(),
      line: processedLine,
      bgKey,
      imageUrl,
      mode,
      frameId,
      wordChoices,
      hash
    };
  }

  private pickFrameWithCooldown(mode: MemeMode, userId?: string): number {
    const frames = MEME_CONFIG.modes[mode].frames;
    const availableFrames: number[] = [];

    for (let i = 0; i < frames.length; i++) {
      // Check global cooldown
      const lastUsed = this.state.frameCooldown.get(i);
      if (lastUsed && Date.now() - lastUsed.getTime() < COOLDOWNS.FRAME_COOLDOWN_MS) {
        continue;
      }

      // Check user cooldown
      if (userId) {
        const userFrames = this.state.userHistory.get(userId) || [];
        const recentUserFrames = userFrames
          .filter(h => h.mode === mode && Date.now() - h.createdAt.getTime() < COOLDOWNS.FRAME_COOLDOWN_MS)
          .map(h => h.frameId);
        
        if (recentUserFrames.includes(i)) {
          continue;
        }
      }

      availableFrames.push(i);
    }

    if (availableFrames.length === 0) return -1;
    return availableFrames[Math.floor(Math.random() * availableFrames.length)];
  }

  private assembleFrame(frame: string): { assembledFrame: string; wordChoices: string[] } {
    const wordChoices: string[] = [];
    let assembledFrame = frame;

    // Replace placeholders with word bank selections
    const placeholders = frame.match(/\{(\w+)\}/g) || [];
    
    for (const placeholder of placeholders) {
      const key = placeholder.slice(1, -1) as keyof typeof MEME_CONFIG.wordBanks;
      const wordBank = MEME_CONFIG.wordBanks[key];
      
      if (wordBank) {
        // Pick word with cooldown
        const availableWords = wordBank.filter(word => {
          const lastUsed = this.state.wordCooldown.get(word);
          return !lastUsed || Date.now() - lastUsed.getTime() > COOLDOWNS.WORD_COOLDOWN_MS;
        });

        if (availableWords.length === 0) {
          // Use any word if all are in cooldown
          const word = wordBank[Math.floor(Math.random() * wordBank.length)];
          wordChoices.push(word);
          assembledFrame = assembledFrame.replace(placeholder, word);
        } else {
          const word = availableWords[Math.floor(Math.random() * availableWords.length)];
          wordChoices.push(word);
          assembledFrame = assembledFrame.replace(placeholder, word);
        }
      }
    }

    return { assembledFrame, wordChoices };
  }

  private async generateWithAI(mode: MemeMode, assembledFrame: string): Promise<string | null> {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode,
          frame: assembledFrame,
          enhanced: true 
        })
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.line || null;
    } catch (error) {
      console.error('AI generation failed:', error);
      return null;
    }
  }

  private postProcess(line: string, mode: MemeMode): string | null {
    // Uppercase and clean
    let processed = line.toUpperCase().trim();
    
    // Strip quotes and emojis
    processed = processed.replace(/["'`]/g, '').replace(/[^\w\s.,!?-]/g, '');
    
    // Check length cap
    const wordCount = processed.split(/\s+/).length;
    const maxWords = mode === 'inspiration' ? MEME_CONFIG.lengthCaps.inspirationMaxWords : MEME_CONFIG.lengthCaps.humorMaxWords;
    
    if (wordCount > maxWords) {
      // Trim to fit by removing weakest phrase
      const words = processed.split(/\s+/);
      processed = words.slice(0, maxWords).join(' ');
    }
    
    // Safety check
    if (this.containsBlockedContent(processed)) {
      return null;
    }
    
    return processed;
  }

  private passQualityGates(line: string, mode: MemeMode): boolean {
    if (mode === 'inspiration') {
      // Must contain at least one absolute word
      const absolutes = ['ALWAYS', 'NEVER', 'ZERO', 'FLAWLESS', 'TOGETHER'];
      return absolutes.some(abs => line.includes(abs));
    } else {
      // Must contain frame token or playful exaggeration
      const frameTokens = ['IF THE MILITARY', 'CALLS', 'MONDAYS?', 'THE MILITARY'];
      const playfulElements = ['BEFORE THE COFFEE COOLS', 'ONE PAGE', 'TEN MINUTES', 'NO SLIDES'];
      
      return frameTokens.some(token => line.includes(token)) || 
             playfulElements.some(element => line.includes(element));
    }
  }

  private isTooSimilar(line: string): boolean {
    const recentLines = this.state.lastNGenerated.slice(-100);
    
    for (const recent of recentLines) {
      const similarity = this.calculateSimilarity(line, recent.line);
      if (similarity > 0.85) return true;
    }
    
    return false;
  }

  private calculateSimilarity(line1: string, line2: string): number {
    // Simple Jaccard similarity over words
    const words1 = new Set(line1.split(/\s+/));
    const words2 = new Set(line2.split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    return intersection.size / union.size;
  }

  private containsBlockedContent(line: string): boolean {
    const upperLine = line.toUpperCase();
    return MEME_CONFIG.safety.blocklist.some(blocked => 
      upperLine.includes(blocked.toUpperCase())
    );
  }

  private pickRandomBackground(): string {
    const backgrounds = [
      'military-01.webp', 'military-02.webp', 'military-03.webp', 'military-04.webp', 'military-05.webp',
      'military-06.webp', 'military-07.webp', 'military-08.webp', 'military-09.webp', 'military-10.webp',
      'military-11.webp', 'military-12.webp', 'military-13.webp', 'military-14.webp', 'military-15.webp',
      'military-16.webp', 'military-17.webp', 'military-18.webp', 'military-19.webp', 'military-20.webp',
      'military-21.webp', 'military-22.webp', 'military-23.webp', 'military-24.webp', 'military-25.webp',
      'military-26.webp', 'military-27.webp', 'military-28.webp', 'military-29.webp', 'military-30.webp',
      'military-31.webp', 'military-32.webp', 'military-33.webp', 'military-34.webp', 'military-35.webp',
      'military-36.webp', 'military-37.webp', 'military-38.webp', 'military-39.webp', 'military-40.webp'
    ];
    
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }

  private async composeMemeImage(line: string, bgKey: string): Promise<string> {
    try {
      const response = await fetch('/api/og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, bgKey })
      });

      if (!response.ok) throw new Error('Image composition failed');
      
      const data = await response.json();
      return data.imageUrl || `/api/og?line=${encodeURIComponent(line)}&bg=${bgKey}`;
    } catch (error) {
      console.error('Image composition failed:', error);
      return `/api/og?line=${encodeURIComponent(line)}&bg=${bgKey}`;
    }
  }

  private generateHash(line: string): string {
    return crypto.createHash('sha1').update(line).digest('hex');
  }

  private updateState(result: GeneratedMeme, userId?: string) {
    // Update lastN generated
    this.state.lastNGenerated.push({
      mode: result.mode,
      frameId: result.frameId,
      wordChoices: result.wordChoices,
      line: result.line,
      createdAt: new Date(),
      hash: result.hash
    });

    // Keep only last 100
    if (this.state.lastNGenerated.length > 100) {
      this.state.lastNGenerated = this.state.lastNGenerated.slice(-100);
    }

    // Update frame cooldown
    this.state.frameCooldown.set(result.frameId, new Date());

    // Update word cooldowns
    result.wordChoices.forEach(word => {
      this.state.wordCooldown.set(word, new Date());
    });

    // Update user history
    if (userId) {
      const userHistory = this.state.userHistory.get(userId) || [];
      userHistory.push({
        mode: result.mode,
        frameId: result.frameId,
        line: result.line,
        createdAt: new Date()
      });

      // Keep only last 10 per user
      if (userHistory.length > 10) {
        userHistory.splice(0, userHistory.length - 10);
      }

      this.state.userHistory.set(userId, userHistory);
    }
  }

  private generateFallback(mode: MemeMode): GeneratedMeme {
    const fallbackLine = mode === 'inspiration' 
      ? MEME_CONFIG.safety.fallbackInspiration 
      : MEME_CONFIG.safety.fallbackHumor;

    const bgKey = this.pickRandomBackground();
    
    return {
      id: crypto.randomUUID(),
      line: fallbackLine,
      bgKey,
      imageUrl: `/api/og?line=${encodeURIComponent(fallbackLine)}&bg=${bgKey}`,
      mode,
      frameId: -1,
      wordChoices: [],
      hash: this.generateHash(fallbackLine)
    };
  }
}

// Export singleton instance
export const enhancedMemeGenerator = new EnhancedMemeGenerator();
