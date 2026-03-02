
class AudioManager {
  private ctx: AudioContext | null = null;
  private scratchSource: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      this.noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public stopPenScratch() {
    if (this.scratchSource) {
      try {
        this.scratchSource.stop();
      } catch {}
      this.scratchSource = null;
    }
  }

  public playRustle() {
    this.init();
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx!.currentTime);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0, this.ctx!.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx!.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.3);
    source.connect(filter).connect(gain).connect(this.ctx!.destination);
    source.start();
  }

  public playPenScratch(duration: number = 0.1) {
    this.init();
    this.stopPenScratch();
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, this.ctx!.currentTime);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0, this.ctx!.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx!.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + duration);
    source.connect(filter).connect(gain).connect(this.ctx!.destination);
    this.scratchSource = source;
    source.start(0, Math.random() * 1.5);
  }
}
export const audioManager = new AudioManager();
