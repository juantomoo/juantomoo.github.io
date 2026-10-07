/**
 * particles.js — Sistema de Partículas Generativas con Object Pooling
 * Versión 2.0 Ultra-Refinada: Cero allocations en el loop, mezcla aditiva para brillo sin shadowBlur
 */

class ParticleSystem {
  constructor() {
    this.maxParticles = 200;
    this.particles = [];
    this.bursts = [];

    // Pre-asignar el pool para cero allocations en juego
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        color: '#38bdf8',
        alpha: 0,
        decay: 0.02,
        sparkle: false
      });
    }

    // Pool de ondas de choque (máx 8 simultáneas)
    for (let i = 0; i < 8; i++) {
      this.bursts.push({
        active: false,
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: 100,
        color: '#38bdf8',
        alpha: 0,
        lineWidth: 5
      });
    }
  }

  // Obtener partícula libre del pool
  acquireParticle() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.particles[i].active) {
        return this.particles[i];
      }
    }
    return null;
  }

  // Obtener onda de choque libre del pool
  acquireBurst() {
    for (let i = 0; i < this.bursts.length; i++) {
      if (!this.bursts[i].active) {
        return this.bursts[i];
      }
    }
    return null;
  }

  clear() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles[i].active = false;
    }
    for (let i = 0; i < this.bursts.length; i++) {
      this.bursts[i].active = false;
    }
  }

  // Explosión radiante al acertar en el compás ("Perfect Pulse")
  spawnHitBurst(x, y, color = '#38bdf8', count = 35) {
    const safeCount = Math.min(count, 45);
    for (let i = 0; i < safeCount; i++) {
      const p = this.acquireParticle();
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1.5;
      p.size = Math.random() * 4.5 + 2.0;
      p.color = color;
      p.alpha = 1.0;
      p.decay = Math.random() * 0.025 + 0.018;
      p.sparkle = Math.random() > 0.5;
    }

    // Onda de choque expansiva
    const b = this.acquireBurst();
    if (b) {
      b.active = true;
      b.x = x;
      b.y = y;
      b.radius = 12;
      b.maxRadius = 110;
      b.color = color;
      b.alpha = 0.9;
      b.lineWidth = 5;
    }
  }

  // Efecto sutil al errar (gotas que flotan suavemente)
  spawnGentleMiss(x, y) {
    for (let i = 0; i < 15; i++) {
      const p = this.acquireParticle();
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed + 1;
      p.size = Math.random() * 3 + 2;
      p.color = '#94a3b8';
      p.alpha = 0.7;
      p.decay = 0.022;
      p.sparkle = false;
    }
  }

  update(dt = 1) {
    // Actualizar partículas activas
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.12 * dt; // Gravedad suave
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        p.active = false;
      }
    }

    // Actualizar ondas de choque activas
    for (let i = 0; i < this.bursts.length; i++) {
      const b = this.bursts[i];
      if (!b.active) continue;

      b.radius += 5.5 * dt;
      b.alpha -= 0.035 * dt;
      b.lineWidth = Math.max(1, b.lineWidth - 0.12 * dt);

      if (b.alpha <= 0 || b.radius >= b.maxRadius) {
        b.active = false;
      }
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Dibujar ondas de choque activas
    for (let i = 0; i < this.bursts.length; i++) {
      const b = this.bursts[i];
      if (!b.active) continue;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.lineWidth = b.lineWidth;
      ctx.stroke();
    }

    // 2. Dibujar partículas con mezcla aditiva (elimina overhead de shadowBlur)
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Centro blanco para partículas brillantes
      if (p.sparkle && p.alpha > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

window.ParticleSystem = ParticleSystem;
