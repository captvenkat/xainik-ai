export interface ShareCaption {
  text: string;
  lastUsed: Date | null;
}

export const SHARE_CAPTIONS: ShareCaption[] = [
  { text: "I unlocked a military skill on Xainik. Your turn.", lastUsed: null },
  { text: "New military skill unlocked. Share one.", lastUsed: null },
  { text: "One tap → one military truth. Try it.", lastUsed: null },
  { text: "This made me smile. Respect.", lastUsed: null },
  { text: "Unlocked. Share to support veterans.", lastUsed: null },
  { text: "Another military skill, another share.", lastUsed: null },
  { text: "Military wisdom unlocked. Pass it on.", lastUsed: null },
  { text: "This is how we honor service. Share it.", lastUsed: null }
];

export class ShareCaptionManager {
  private captions: ShareCaption[];

  constructor() {
    this.captions = [...SHARE_CAPTIONS];
  }

  getNextCaption(): string {
    // Find the least recently used caption
    const availableCaptions = this.captions.filter(caption => 
      !caption.lastUsed || 
      Date.now() - caption.lastUsed.getTime() > 5 * 60 * 1000 // 5 minute cooldown
    );

    if (availableCaptions.length === 0) {
      // Reset all captions if all are in cooldown
      this.captions.forEach(caption => caption.lastUsed = null);
      return this.captions[0].text;
    }

    // Pick the least recently used
    const leastRecent = availableCaptions.reduce((prev, current) => {
      if (!prev.lastUsed) return prev;
      if (!current.lastUsed) return current;
      return prev.lastUsed < current.lastUsed ? prev : current;
    });

    // Mark as used
    leastRecent.lastUsed = new Date();
    
    return leastRecent.text;
  }

  resetCooldowns(): void {
    this.captions.forEach(caption => caption.lastUsed = null);
  }
}

// Export singleton instance
export const shareCaptionManager = new ShareCaptionManager();
