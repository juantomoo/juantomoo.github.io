/**
 * engine.js — Bucle Principal del Juego de Ritmo Multiplica-Pulse (Versión Arcade & Progresiva)
 * 
 * Implementa:
 * - Soporte para Dificultad Dinámica (Fácil, Moderado, Difícil)
 * - Soporte para Modo Familias y Modo Tabla Individual
 * - Detección de colisión rítmica y racha de combos
 * - Integración con Leaderboard Arcade al finalizar
 */

class PulseGameEngine {
  constructor(canvas, audio, curriculum, input, particles, renderer) {
    this.canvas = canvas;
    this.audio = audio;
    this.curriculum = curriculum;
    this.input = input;
    this.particles = particles;
    this.renderer = renderer;

    // Estado de la partida
    this.state = 'idle'; // 'idle' | 'playing' | 'track_complete'
    this.currentTrack = null;
    this.singleTableNumber = null;
    this.score = 0;
    this.multiplier = 1;
    this.streak = 0;
    this.maxStreak = 0;
    this.challengesResolved = 0;
    this.totalChallengesInTrack = 10;

    this.currentSpeed = 0.50;
    this.cooldownTimer = 0;

    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDelta = 1000 / 60; // 16.666 ms
    this.animFrameId = null;
    this.finishTimeout = null;

    this.input.onLaneChange = (lane) => {
      this.renderer.setLane(lane);
      this.audio.playLaneSwitch();
    };

    this.onScoreUpdate = null;
    this.onTrackComplete = null;
    this.onNewChallenge = null;
  }

  startTrack(trackConfig, options = {}) {
    this.currentTrack = trackConfig;
    this.playOptions = typeof options === 'number' ? { singleTable: options, category: 'single_table' } : (options || {});
    this.singleTableNumber = this.playOptions.singleTable || null;
    this.score = 0;
    this.multiplier = 1;
    this.streak = 0;
    this.maxStreak = 0;
    this.challengesResolved = 0;
    this.state = 'playing';

    const diff = this.curriculum.getDifficultyConfig();
    this.currentSpeed = diff.baseSpeed;
    this.renderer.speed = this.currentSpeed;
    this.renderer.setTheme(trackConfig.color, trackConfig.secondaryColor || '#3b82f6');
    this.particles.clear();
    this.cooldownTimer = 0.5;

    // Iniciar pista de audio procedural
    this.audio.startTrack(trackConfig.bpm, (measureStep, beatNumber) => {
      this.renderer.triggerBeat(measureStep);
    });

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  spawnNextChallenge() {
    const challenge = this.curriculum.generateChallenge(this.currentTrack, this.playOptions || {});
    this.renderer.activeGate = {
      ...challenge,
      z: 1.0
    };

    if (this.onNewChallenge) {
      this.onNewChallenge(challenge);
    }
  }

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const frameTime = Math.min(100, currentTime - this.lastTime); // Cap máximo contra spiral of death
    this.lastTime = currentTime;
    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedDelta) {
      this.update(1.0); // dt normalizado a 60hz
      this.accumulator -= this.fixedDelta;
    }

    this.render();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.state !== 'playing' && this.state !== 'track_complete') return;

    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= 0.016 * dt;
      if (this.cooldownTimer <= 0 && this.state === 'playing' && !this.renderer.activeGate) {
        if (this.challengesResolved < this.totalChallengesInTrack) {
          this.spawnNextChallenge();
        }
      }
    }

    this.renderer.update(dt);
    this.particles.update(dt);

    const gate = this.renderer.activeGate;
    if (gate && gate.z <= 0.04) {
      this.resolveGate(gate);
      this.renderer.activeGate = null;
    }
  }

  resolveGate(gate) {
    const playerLane = this.renderer.currentLane;
    const isCorrect = playerLane === gate.correctLane;
    const playerPos = this.renderer.getLaneXPositions(this.renderer.height * 0.82)[playerLane];
    const playerY = this.renderer.height * 0.82;
    const diff = this.curriculum.getDifficultyConfig();

    this.challengesResolved++;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      if (this.streak >= 8) this.multiplier = 4;
      else if (this.streak >= 5) this.multiplier = 3;
      else if (this.streak >= 2) this.multiplier = 2;
      else this.multiplier = 1;

      // Escalado de velocidad según dificultad
      this.currentSpeed = Math.min(diff.maxSpeedLimit, diff.baseSpeed + this.streak * diff.maxStreakSpeedBoost);
      this.renderer.speed = this.currentSpeed;

      const pointsGained = 100 * this.multiplier;
      this.score += pointsGained;

      this.audio.setComboMultiplier(this.multiplier);
      this.audio.playHitSuccess(this.multiplier);
      this.particles.spawnHitBurst(playerPos, playerY, this.currentTrack.color, 35);
      if (this.renderer.triggerHitSuccess) {
        this.renderer.triggerHitSuccess(playerPos, playerY, this.currentTrack.color);
      }

      this.cooldownTimer = diff.cooldownSuccess;
    } else {
      this.streak = 0;
      this.multiplier = 1;
      this.currentSpeed = diff.baseSpeed;
      this.renderer.speed = this.currentSpeed;

      this.audio.setComboMultiplier(1);
      this.audio.playGentleMiss();
      this.particles.spawnGentleMiss(playerPos, playerY);

      this.cooldownTimer = diff.cooldownMiss;
    }

    if (this.onScoreUpdate) {
      this.onScoreUpdate({
        score: this.score,
        streak: this.streak,
        multiplier: this.multiplier,
        speed: this.currentSpeed,
        progress: this.challengesResolved / this.totalChallengesInTrack,
        isCorrect
      });
    }

    if (this.challengesResolved >= this.totalChallengesInTrack) {
      if (this.finishTimeout) clearTimeout(this.finishTimeout);
      this.finishTimeout = setTimeout(() => this.finishTrack(), 1000);
    }
  }

  finishTrack() {
    if (this.finishTimeout) {
      clearTimeout(this.finishTimeout);
      this.finishTimeout = null;
    }
    this.state = 'track_complete';
    this.audio.stopTrack();
    this.audio.playTrackComplete();

    const category = (this.playOptions && this.playOptions.category) || (this.singleTableNumber !== null ? 'single_table' : 'families');
    const trackKey = this.singleTableNumber !== null ? this.singleTableNumber : (this.playOptions && this.playOptions.operation ? this.playOptions.operation : this.currentTrack.id);
    this.curriculum.recordTrackResult(trackKey, this.score, this.maxStreak, category);

    let unlockedNext = null;
    if (category === 'families') {
      unlockedNext = this.curriculum.unlockNextTrack(this.currentTrack.id);
    }

    if (this.onTrackComplete) {
      this.onTrackComplete({
        track: this.currentTrack,
        singleTableNumber: this.singleTableNumber,
        score: this.score,
        maxStreak: this.maxStreak,
        unlockedNext,
        difficulty: this.curriculum.getDifficultyConfig().name
      });
    }
  }

  render() {
    this.renderer.render();
    this.particles.render(this.renderer.ctx);
  }

  stop() {
    this.state = 'idle';
    if (this.finishTimeout) {
      clearTimeout(this.finishTimeout);
      this.finishTimeout = null;
    }
    this.audio.stopTrack();
    this.renderer.activeGate = null;
    this.cooldownTimer = 0;
    this.accumulator = 0;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

window.PulseGameEngine = PulseGameEngine;
