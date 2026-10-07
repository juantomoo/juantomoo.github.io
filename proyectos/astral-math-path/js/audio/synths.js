/**
 * synths.js — Motor de Audio Procedural de Alta Fidelidad (Estilo Indie / Sayonara Wild Hearts)
 * Síntesis procedural pura en tiempo real mediante Web Audio API: 0 MB de archivos descargados.
 * 
 * Capas de audio dinámicas por Multiplicador de Combo:
 * - 1x: Base Rítmica Punchy (Bombo 808 sub-bass, Clack Snare estéreo, Hi-Hats funkys)
 * - 2x: Pad Ambiental Flotante (Acordes ricos de 7ma y 9na con envolvente cálida)
 * - 3x: Arpegio Pop/Chiptune Sincopado con Delay Estéreo y Feedback
 * - 4x: Modo Overdrive/Frenzy con solo melódico procedural en escala pentatónica
 * 
 * Feedback Kinestésico:
 * - Perfect Hit: Acorde triunfal afinado a la armonía activa con decaimiento estéreo
 * - Gentle Miss: Simulación orgánica de tape-stop / vinyl brake suave (200ms) sin ruido punitivo
 */

class PulseAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.tempo = 105;
    this.currentBeat = 0;
    this.nextNoteTime = 0;
    this.isPlaying = false;
    this.timerId = null;

    // Escala pentatónica en Sol Mayor con extensiones: Sol, La, Si, Re, Mi (G3..G5)
    this.scale = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99];

    // Progresión de acordes ricos: Gmaj7, Em9, Cmaj7, Dadd9
    this.chordProgression = [
      { root: 98.00,  arp: [196.00, 246.94, 293.66, 369.99], pad: [196.00, 293.66, 369.99, 493.88] }, // Gmaj7
      { root: 82.41,  arp: [164.81, 196.00, 246.94, 293.66], pad: [164.81, 246.94, 293.66, 392.00] }, // Em9
      { root: 130.81, arp: [130.81, 164.81, 196.00, 246.94], pad: [130.81, 196.00, 246.94, 329.63] }, // Cmaj7
      { root: 146.83, arp: [146.83, 220.00, 293.66, 329.63], pad: [146.83, 220.00, 329.63, 440.00] }  // Dadd9
    ];

    this.currentComboMultiplier = 1;
    this.currentChordIndex = 0;
    this.onBeat = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // 1. Bus Maestro
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

    // 2. Compresor dinámico analógico para punch y calidez
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-15, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

    // 3. Unidad de Delay Estéreo para arpegios espaciales
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.22, this.ctx.currentTime); // semicorchea con swing
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);

    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFilter.connect(this.masterGain);

    // 4. Ganancias por capa
    this.rhythmGain = this.ctx.createGain();
    this.padGain = this.ctx.createGain();
    this.arpGain = this.ctx.createGain();
    this.leadGain = this.ctx.createGain();

    this.rhythmGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.padGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.arpGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.leadGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.rhythmGain.connect(this.masterGain);
    this.padGain.connect(this.masterGain);
    this.arpGain.connect(this.masterGain);
    this.arpGain.connect(this.delayNode); // arpegios alimentan el delay
    this.leadGain.connect(this.masterGain);
    this.leadGain.connect(this.delayNode);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // Pre-renderizar y cachear AudioBuffers de ruido estático para evitar allocs en cada compás
    this.initNoiseBuffers();
  }

  initNoiseBuffers() {
    if (!this.ctx) return;
    // Buffer snare (160ms)
    const snareLen = Math.floor(this.ctx.sampleRate * 0.16);
    this.cachedSnareBuffer = this.ctx.createBuffer(1, snareLen, this.ctx.sampleRate);
    const sData = this.cachedSnareBuffer.getChannelData(0);
    for (let i = 0; i < snareLen; i++) {
      sData[i] = (Math.random() * 2 - 1) * 0.75;
    }

    // Buffer hi-hat (40ms)
    const hihatLen = Math.floor(this.ctx.sampleRate * 0.04);
    this.cachedHihatBuffer = this.ctx.createBuffer(1, hihatLen, this.ctx.sampleRate);
    const hData = this.cachedHihatBuffer.getChannelData(0);
    for (let i = 0; i < hihatLen; i++) {
      hData[i] = Math.random() * 2 - 1;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : (window.GAME_CONFIG?.AUDIO?.MASTER_VOLUME || 0.75);
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setComboMultiplier(multiplier) {
    this.currentComboMultiplier = multiplier;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Transiciones armónicas dinámicas de capas
    // 1x: Solo ritmo
    // 2x: Entra Pad cálido
    // 3x: Entran arpegios estéreo
    // 4x: Entra Overdrive/Solo melódico
    const padVol = multiplier >= 2 ? 0.45 : 0.0;
    const arpVol = multiplier >= 3 ? 0.38 : 0.0;
    const leadVol = multiplier >= 4 ? 0.40 : 0.0;

    this.padGain.gain.setTargetAtTime(padVol, t, 0.4);
    this.arpGain.gain.setTargetAtTime(arpVol, t, 0.3);
    this.leadGain.gain.setTargetAtTime(leadVol, t, 0.2);
  }

  setBPM(bpm) {
    this.tempo = Math.max(75, Math.min(145, bpm));
  }

  startTrack(bpm = 105, onBeatCallback = null) {
    this.init();
    this.resume();
    this.tempo = bpm;
    this.onBeat = onBeatCallback;
    this.currentBeat = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.08;
    this.isPlaying = true;
    this.setComboMultiplier(1);
    this.scheduler();
  }

  stopTrack() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduler() {
    if (!this.isPlaying) return;
    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.12; // seg

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleBeat(this.currentBeat, this.nextNoteTime);
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += secondsPerBeat;
      this.currentBeat++;
    }

    this.timerId = setTimeout(() => this.scheduler(), lookahead);
  }

  scheduleBeat(beatNumber, time) {
    if (this.isMuted) return;
    const measureStep = beatNumber % 4;
    const currentMeasure = Math.floor(beatNumber / 4);
    this.currentChordIndex = currentMeasure % this.chordProgression.length;

    const chord = this.chordProgression[this.currentChordIndex];
    const secondsPerBeat = 60.0 / this.tempo;

    // --- 1. RITMO BASE ---
    if (measureStep === 0 || measureStep === 2) {
      this.playPunchyKick(time);
    } else {
      this.playPunchyKick(time, 0.4);
    }

    if (measureStep === 1 || measureStep === 3) {
      this.playSnappySnare(time);
    }

    this.playHihat(time, 0.32);
    this.playHihat(time + secondsPerBeat * 0.5, 0.22); // Contratiempo bailable

    // Línea de bajo slap bailable
    this.playFunkyBass(chord.root, time, 0.42);
    if (measureStep === 2) {
      this.playFunkyBass(chord.root * 1.5, time + secondsPerBeat * 0.5, 0.32);
    }

    // --- 2. PAD AMBIENTAL FLOTANTE (Combo >= 2x) ---
    if (measureStep === 0) {
      this.playLushPad(chord.pad, time, secondsPerBeat * 4);
    }

    // --- 3. ARPEGIO POP/CHIPTUNE CON DELAY (Combo >= 3x) ---
    const arpNotes = chord.arp;
    const note1 = arpNotes[measureStep % arpNotes.length];
    const note2 = arpNotes[(measureStep + 2) % arpNotes.length];
    this.playArpNote(note1, time + secondsPerBeat * 0.25, 0.22);
    this.playArpNote(note2, time + secondsPerBeat * 0.75, 0.18);

    // --- 4. OVERDRIVE MELODIC SOLO (Combo >= 4x) ---
    if (this.currentComboMultiplier >= 4) {
      const scaleNote = this.scale[(beatNumber * 3) % this.scale.length];
      this.playLeadSynth(scaleNote, time + secondsPerBeat * 0.125, 0.25);
    }

    if (this.onBeat) {
      const delay = Math.max(0, (time - this.ctx.currentTime) * 1000);
      setTimeout(() => {
        if (this.isPlaying && this.onBeat) {
          this.onBeat(measureStep, beatNumber);
        }
      }, delay);
    }
  }

  playPunchyKick(time, vol = 0.8) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc.connect(gain);
    gain.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  playSnappySnare(time, vol = 0.55) {
    if (!this.cachedSnareBuffer) this.initNoiseBuffers();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.cachedSnareBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(950, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.rhythmGain);

    // Cuerpo resonante del redoblante
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(230, time);
    bodyOsc.frequency.exponentialRampToValueAtTime(115, time + 0.09);

    bodyGain.gain.setValueAtTime(vol * 0.75, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.rhythmGain);

    noise.start(time);
    bodyOsc.start(time);
    bodyOsc.stop(time + 0.18);
  }

  playHihat(time, vol = 0.3) {
    if (!this.cachedHihatBuffer) this.initNoiseBuffers();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.cachedHihatBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.rhythmGain);

    noise.start(time);
  }

  playFunkyBass(freq, time, vol = 0.42) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6, time);
    filter.frequency.setValueAtTime(650, time);
    filter.frequency.exponentialRampToValueAtTime(135, time + 0.22);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  playLushPad(chordFrequencies, time, duration) {
    chordFrequencies.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      // Envolvente lenta y etérea (fade in 0.8s, fade out 1.2s)
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.8);
      gain.gain.linearRampToValueAtTime(0.10, time + duration - 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.6);

      osc.connect(gain);
      gain.connect(this.padGain);

      osc.start(time);
      osc.stop(time + duration + 0.7);
    });
  }

  playArpNote(freq, time, vol = 0.2) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.arpGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  playLeadSynth(freq, time, vol = 0.25) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.leadGain);

    osc.start(time);
    osc.stop(time + 0.28);
  }

  // --- FEEDBACK KINESTÉSICO ---

  playLaneSwitch() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.07);
  }

  playHitSuccess(multiplier = 1) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const chord = this.chordProgression[this.currentChordIndex].pad;

    // Acorde triunfal afinado a la armonía del compás activo
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const octaveShift = multiplier >= 4 ? 2 : (multiplier >= 2 ? 1 : 0);
      osc.frequency.setValueAtTime(freq * Math.pow(2, octaveShift), t + idx * 0.025);

      gain.gain.setValueAtTime(0.28, t + idx * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.025 + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode); // Eco espacial de victoria

      osc.start(t + idx * 0.025);
      osc.stop(t + idx * 0.025 + 0.48);
    });
  }

  playGentleMiss() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Simulación de Tape-Stop / Vinyl Brake suave de 200ms
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.22); // Caída analógica de velocidad

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.22);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  playTrackComplete() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Fanfarria arpegiada victoriosa (Do-Mi-Sol-Si-Do)
    const fanfarre = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    fanfarre.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.07);

      gain.gain.setValueAtTime(0.3, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.65);
    });
  }
}

window.PulseAudioEngine = PulseAudioEngine;
