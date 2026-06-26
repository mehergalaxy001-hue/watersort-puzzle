/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMusicMuted: boolean = false;
  private isSoundMuted: boolean = false;
  private bgmInterval: any = null;
  private bgmStarted: boolean = false;
  private bgmGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicMute(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public setSoundMute(muted: boolean) {
    this.isSoundMuted = muted;
  }

  public getMusicMute() {
    return this.isMusicMuted;
  }

  public getSoundMute() {
    return this.isSoundMuted;
  }

  public startBGM() {
    if (this.isMusicMuted) {
      this.stopBGM();
      return;
    }
    try {
      this.init();
      if (!this.ctx) return;
      
      // Initialize bgmGain if not present
      if (!this.bgmGain) {
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.ctx.destination);
      }
      // Instantly open the volume ramp gently
      this.bgmGain.gain.setValueAtTime(1, this.ctx.currentTime);

      if (this.bgmStarted) return;
      this.bgmStarted = true;

      let step = 0;
      // Ambient solar chord progression - pure spacious frequencies
      const chords = [
        [261.63, 329.63, 392.00, 493.88, 523.25], // Cmaj9 (warm and full)
        [220.00, 261.63, 329.63, 392.00, 440.00], // Am9
        [174.61, 261.63, 329.63, 392.00, 523.25], // Fmaj9
        [196.00, 246.94, 293.66, 349.23, 440.00]  // G13
      ];

      // Glistening cosmic space melody notes
      const melodies = [
        [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0],
        [659.25, 0, 880.00, 0, 1046.50, 0, 783.99, 0],
        [587.33, 0, 783.99, 0, 987.77, 0, 0, 0],
        [783.99, 0, 1046.50, 0, 1318.51, 0, 1046.50, 0]
      ];

      // Echo-delay for majestic cave acoustics
      const delayNode = this.ctx.createDelay(1.5);
      delayNode.delayTime.value = 0.52; // 520ms deep echoing feedback
      const feedbackGain = this.ctx.createGain();
      feedbackGain.gain.value = 0.38; // Soft decay

      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      feedbackGain.connect(this.bgmGain);

      const playNextBar = () => {
        if (!this.ctx || this.isMusicMuted || !this.bgmStarted) return;
        try {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
          const now = this.ctx.currentTime;
          const chordIndex = step % chords.length;
          const currentChord = chords[chordIndex];
          const currentMelody = melodies[chordIndex];

          // 1. Cozy Deep Solar Drone Pads (Pristine, sweet swells)
          currentChord.forEach((freq, idx) => {
            if (!this.ctx || idx > 2) return; // Keep warm, light drone pad using root, third, fifth
            const padFreq = freq / 2; // drop 1 octave for deep cave atmosphere

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine'; // Sine waves are pure and clean
            osc.frequency.setValueAtTime(padFreq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(250, now); // Sweet warm filter cut

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 1.8); // Smooth swell
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5); // Decay softly

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain!);

            osc.start(now);
            osc.stop(now + 4.6);
          });

          // 2. Realistic Subterranean Cavern Water Drips (Pure glass clicks instead of harsh bandpass)
          const drips = [0.6, 1.4, 2.1, 2.9, 3.8];
          drips.forEach((offset) => {
            if (!this.ctx) return;
            const dripTime = now + offset + (Math.random() * 0.4 - 0.2);

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            const basePitch = 400 + Math.random() * 100;
            osc.frequency.setValueAtTime(basePitch, dripTime);
            osc.frequency.exponentialRampToValueAtTime(basePitch * 2.8, dripTime + 0.04);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1500, dripTime); // Clean lowpass instead of narrow harsh bandpass

            gain.gain.setValueAtTime(0, dripTime);
            gain.gain.linearRampToValueAtTime(0.035, dripTime + 0.008); // Perfect soft drip volume
            gain.gain.exponentialRampToValueAtTime(0.0001, dripTime + 0.18); // Soft tail

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain!);
            gain.connect(delayNode); // Soft echoes

            osc.start(dripTime);
            osc.stop(dripTime + 0.25);
          });

          // 3. Spaced Celestial Melody Bells (Pure sparkling sine waves without distorted peaking filters)
          currentMelody.forEach((freq, idx) => {
            if (!this.ctx || freq === 0) return;

            const noteTime = now + (idx * 0.58);

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, noteTime); // Gentle sweet lowpass for warmth

            gain.gain.setValueAtTime(0, noteTime);
            gain.gain.linearRampToValueAtTime(0.045, noteTime + 0.03); // Sweet and crisp
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.8);

            osc.connect(filter);
            filter.connect(gain);

            gain.connect(this.bgmGain!);
            gain.connect(delayNode);

            osc.start(noteTime);
            osc.stop(noteTime + 0.85);
          });

          step++;
        } catch (e) {
          console.warn('BGM player loop error', e);
        }
      };

      playNextBar();
      this.bgmInterval = setInterval(playNextBar, 4600);
    } catch (err) {
      console.warn('Failed to start BGM engine', err);
    }
  }

  public stopBGM() {
    this.bgmStarted = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        if (this.ctx) {
          this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else {
          this.bgmGain.gain.value = 0;
        }
      } catch (err) {
        this.bgmGain.gain.value = 0;
      }
    }
  }

  public playSelect() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      // Gentle glass click
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.35, now); // Boosted volume
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio playSelect error', e);
    }
  }

  public playInvalid() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.15);

      gain.gain.setValueAtTime(0.25, now); // Boosted volume
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio playInvalid error', e);
    }
  }

  // Beautiful pouring sound
  public startPour() {
    if (this.isSoundMuted) return null;
    try {
      this.init();
      if (!this.ctx) return null;

      const now = this.ctx.currentTime;
      
      const bubbleInterval = setInterval(() => {
        if (!this.ctx || this.isSoundMuted) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        o.type = 'sine';
        const startFreq = 300 + Math.random() * 200;
        o.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(startFreq * 2.2, this.ctx.currentTime + 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

        g.gain.setValueAtTime(0.12, this.ctx.currentTime); // Boosted volume
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        o.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);

        o.start();
        o.stop(this.ctx.currentTime + 0.15);
      }, 60);

      // Pouring stream rumble/swoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.5);

      gain.gain.setValueAtTime(0.12, now); // Boosted volume
      gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.0); // Stop after 2 seconds as a fallback

      return {
        stop: () => {
          clearInterval(bubbleInterval);
          try {
            if (this.ctx) {
              const currentNow = this.ctx.currentTime;
              // Instantly ramp down volume to 0 (avoiding audio pop clicks)
              gain.gain.cancelScheduledValues(currentNow);
              gain.gain.setValueAtTime(0.12, currentNow);
              gain.gain.exponentialRampToValueAtTime(0.0001, currentNow + 0.02);
              setTimeout(() => {
                try {
                  osc.stop();
                } catch (e) {}
              }, 30);
            }
          } catch (err) {}
        }
      };
    } catch (e) {
      console.warn('Audio startPour error', e);
      return null;
    }
  }

  public playWin() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Beautiful sparkling pentatonic ascensions for dynamic winning satisfaction
      const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // E4, G4, C5, E5, G5, C6, E6, G6
      
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Use standard triangles with high-pitched sine layers to make it sound energetic
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08); // Speed up for snappier feedback
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.04); // Significant volume boost
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.75);
      });
    } catch (e) {
      console.warn('Audio playWin error', e);
    }
  }

  public playUndo() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      gain.gain.setValueAtTime(0.2, now); // Volume boost
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio playUndo error', e);
    }
  }

  public playClick() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      gain.gain.setValueAtTime(0.18, now); // Louder snap clicks
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Audio playClick error', e);
    }
  }

  public playCelebration() {
    if (this.isSoundMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Beautiful harmonic progression scales sounding like a jackpot / magical cascade - much louder!
      const chimeNotes = [261.63, 311.13, 329.63, 392.00, 440.00, 523.25, 587.33, 622.25, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      chimeNotes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.04; // Super fast sparkle cascade

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Gentle sweeping frequency to make it sound premium and interactive
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, noteTime + 0.07);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.025); // Louder sparkle!
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });

      // Quick coin plonk sounds to simulate dropping coins - loud & metallic!
      const coinOffsets = [0.0, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.60];
      coinOffsets.forEach((delay) => {
        if (!this.ctx) return;
        const time = now + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 1050 + Math.random() * 600;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.setValueAtTime(startFreq * 1.45, time + 0.03);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.015); // Loud coin drops!
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.25);
      });

      // Warm retro swell bass fanfare - much more prominent!
      const swellOsc1 = this.ctx.createOscillator();
      const swellOsc2 = this.ctx.createOscillator();
      const swellGain = this.ctx.createGain();

      swellOsc1.type = 'triangle';
      swellOsc1.frequency.setValueAtTime(261.63, now); // C4
      swellOsc1.frequency.linearRampToValueAtTime(523.25, now + 0.45); // Slide up to C5

      swellOsc2.type = 'triangle';
      swellOsc2.frequency.setValueAtTime(329.63, now); // E4
      swellOsc2.frequency.linearRampToValueAtTime(659.25, now + 0.45); // Slide up to E5

      swellGain.gain.setValueAtTime(0.22, now);
      swellGain.gain.linearRampToValueAtTime(0.32, now + 0.15);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      swellOsc1.connect(swellGain);
      swellOsc2.connect(swellGain);
      swellGain.connect(this.ctx.destination);

      swellOsc1.start(now);
      swellOsc1.stop(now + 0.7);
      swellOsc2.start(now);
      swellOsc2.stop(now + 0.7);

    } catch (e) {
      console.warn('Audio playCelebration error', e);
    }
  }
}

export const audio = new AudioEngine();
