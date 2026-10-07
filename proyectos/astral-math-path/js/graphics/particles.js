/**
 * particles.js — Sistema de Partículas Generativas y Orbes de Energía
 * Estética synthwave/solarpunk luminosa y ligera a 60 FPS sin canvas pesados.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.bursts = [];
  }

  // Explosión radiante al acertar en el compás ("Perfect Pulse")
  spawnHitBurst(x, y, color = '#38bdf8', count = 35) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      const size = Math.random() * 5 + 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        sparkle: Math.random() > 0.5
      });
    }

    // Anillo de onda de choque expansiva
    this.bursts.push({
      x,
      y,
      radius: 12,
      maxRadius: 110,
      color,
      alpha: 0.9,
      lineWidth: 5
    });
  }

  // Efecto sutil al errar (gotas que flotan suavemente)
  spawnGentleMiss(x, y) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1,
        size: Math.random() * 3 + 2,
        color: '#94a3b8',
        alpha: 0.7,
        decay: 0.02,
        sparkle: false
      });
    }
  }

  update(dt = 1) {
    // Actualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.12 * dt; // Gravedad ligera
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Actualizar ondas de choque
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.radius += 5.5 * dt;
      b.alpha -= 0.035 * dt;
      b.lineWidth = Math.max(1, b.lineWidth - 0.12 * dt);

      if (b.alpha <= 0 || b.radius >= b.maxRadius) {
        this.bursts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Dibujar ondas de choque
    for (const b of this.bursts) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.lineWidth = b.lineWidth;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 15;
      ctx.stroke();
    }

    // 2. Dibujar partículas
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.sparkle ? 18 : 6;
      ctx.fill();
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
    this.bursts = [];
  }
}

window.ParticleSystem = ParticleSystem;
