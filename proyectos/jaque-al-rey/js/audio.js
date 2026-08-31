/**
 * audio.js - Motor de Audio Sintetizado con Web Audio API Nativo
 * 100% offline, seguro con políticas de Autoplay del navegador.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('jaque_al_rey_muted') === 'true';
    this.unlocked = false;

    // Escuchar el primer gesto del usuario en la página antes de tocar cualquier audio
    const unlockAudio = () => {
      this.unlocked = true;
      this.initContext();
      ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(evt => {
        window.removeEventListener(evt, unlockAudio);
      });
    };

    ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { once: true, passive: true });
    });
  }

  initContext() {
    if (!this.unlocked) return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('jaque_al_rey_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playTone(freq, dur = 0.12, type = 'sine', startDelay = 0, vol = 0.18) {
    if (this.muted || !this.unlocked) return;
    this.initContext();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t0 = this.ctx.currentTime + startDelay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);

      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {}
  }

  playMove() {
    // Sonido sutil de madera/casilla
    this.playTone(392, 0.09, 'triangle', 0, 0.2);
  }

  playCapture() {
    // Sonido crujiente de impacto
    this.playTone(220, 0.14, 'sawtooth', 0, 0.25);
    this.playTone(110, 0.1, 'square', 0.02, 0.2);
  }

  playCheck() {
    // Doble tono de alerta
    this.playTone(587.33, 0.12, 'square', 0, 0.2);
    this.playTone(659.25, 0.14, 'square', 0.12, 0.2);
  }

  playStar() {
    // Campanilla mágica ascendente
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone(f, 0.15, 'sine', i * 0.06, 0.2);
    });
  }

  playCorrect() {
    // Acorde alegre de éxito
    this.playTone(587.33, 0.15, 'triangle', 0, 0.22);
    this.playTone(880, 0.2, 'triangle', 0.08, 0.25);
  }

  playWrong() {
    // Tono grave de error suave
    this.playTone(180, 0.18, 'sawtooth', 0, 0.18);
  }

  playVictory() {
    // Fanfarria triunfal de campeonato
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this.playTone(f, 0.22, 'triangle', i * 0.12, 0.3);
    });
  }

  playSelect() {
    this.playTone(880, 0.05, 'sine', 0, 0.08);
  }
}

window.soundFx = new SoundEngine();
