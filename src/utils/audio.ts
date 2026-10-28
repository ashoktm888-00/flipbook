class PageSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playFlip(volume: number = 0.6) {
    this.initCtx();

    // 1. Synthesize crisp paper turn with Web Audio API (zero network latency)
    if (this.ctx) {
      try {
        const sampleRate = this.ctx.sampleRate;
        const duration = 0.28;
        const buffer = this.ctx.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        // Pink/brown filtered noise with paper flutter envelope
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < data.length; i++) {
          const t = i / (sampleRate * duration);
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.1;
          b2 = 0.85 * b2 + white * 0.25;
          const noise = b0 + b1 + b2 + white * 0.1;
          
          // Double whoosh envelope (lift + flap)
          const env = Math.pow(Math.sin(Math.PI * t), 1.8) * (1 - 0.3 * Math.sin(t * 30));
          data[i] = noise * env;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Bandpass filter centered around 1800Hz for paper texture
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + duration);
        filter.Q.value = 1.2;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(volume * 0.7, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start();
        return;
      } catch {
        // Fall back to HTMLAudioElement
      }
    }

    // Fallback: Heyzine remote sound
    try {
      if (!this.audioEl) {
        this.audioEl = new Audio('https://cdnm.heyzine.com/flipbook/snd/flip-ct-sm.mp3');
      }
      this.audioEl.volume = Math.max(0, Math.min(1, volume));
      this.audioEl.currentTime = 0;
      this.audioEl.play().catch(() => {});
    } catch {
      // Ignored if user has not interacted yet
    }
  }
}

export const soundManager = new PageSoundSynthesizer();
