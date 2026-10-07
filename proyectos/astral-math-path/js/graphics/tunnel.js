/**
 * tunnel.js — Renderizador 2.5D con Game Juice de Autor
 * 
 * Implementa:
 * - Screen Shake elástico calibrado
 * - White Flash de impacto (0.08s) al resolver compuertas
 * - Starfield Warp (estrellas hiperespaciales cinéticas con estelas de velocidad)
 * - Squash & Stretch elástico en la nave al cambiar de carril y recibir impacto
 * - Ondas de choque cromáticas expansivas
 * - Placas y orbes de neón con brillo interior y tipografía de contraste absoluto
 */

class TunnelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Paleta y temas
    this.themeColor = '#06b6d4';
    this.secondaryColor = '#3b82f6';

    // Carriles y estado del avatar
    this.currentLane = 1; // 0: Izq, 1: Centro, 2: Der
    this.playerX = 0;
    this.targetPlayerX = 0;
    this.playerSquashX = 1.0;
    this.playerSquashY = 1.0;

    // Animación, pulso y velocidad
    this.beatPulse = 0;
    this.gridOffset = 0;
    this.speed = 0.50;

    // Game Juice: Screen Shake & Flash
    this.shakeAmount = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.flashOpacity = 0;

    // Game Juice: Starfield Warp (Partículas de velocidad)
    this.stars = [];
    this.initStars(90);

    // Game Juice: Ondas de Choque
    this.shockwaves = [];

    // Compuerta activa
    this.activeGate = null;

    // Caché de gradientes para no recrear en cada frame
    this.cachedBgGrad = null;
    this.cachedSunGrad = null;
    this.cachedFloorGrad = null;

    // Caché de medidas del banner
    this.bannerMetrics = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random(),
        size: Math.random() * 1.8 + 0.8
      });
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
    const h = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;

    // Pre-construir gradiente de fondo estático
    this.cachedBgGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    this.cachedBgGrad.addColorStop(0, '#030712');
    this.cachedBgGrad.addColorStop(0.5, '#090d16');
    this.cachedBgGrad.addColorStop(1, '#05131f');
  }

  setTheme(primary, secondary) {
    this.themeColor = primary;
    this.secondaryColor = secondary;
  }

  setLane(lane) {
    this.currentLane = Math.max(0, Math.min(2, lane));
    // Squash & stretch al cambiar de carril (se comprime horizontalmente y se alarga)
    this.playerSquashX = 0.75;
    this.playerSquashY = 1.35;
  }

  triggerBeat(measureStep) {
    this.beatPulse = measureStep === 0 ? 1.0 : 0.45;
  }

  triggerHitSuccess(x, y, color) {
    // 1. Screen Shake visceral (5px con decaimiento elástico)
    this.shakeAmount = 5.5;

    // 2. White flash sutil
    this.flashOpacity = 0.35;

    // 3. Squash de impacto (la nave se aplana al absorber energía)
    this.playerSquashX = 1.45;
    this.playerSquashY = 0.65;

    // 4. Onda de choque cromática expansiva
    this.shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius: this.width * 0.45,
      opacity: 1.0,
      color: color || '#22c55e'
    });
  }

  update(dt = 1) {
    // 1. Decaimiento del pulso rítmico
    this.beatPulse = Math.max(0, this.beatPulse - 0.06 * dt);

    // 2. Screen Shake
    if (this.shakeAmount > 0.05) {
      this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeAmount;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeAmount;
      this.shakeAmount *= Math.pow(0.85, dt);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAmount = 0;
    }

    // 3. Flash decay
    if (this.flashOpacity > 0.01) {
      this.flashOpacity *= Math.pow(0.72, dt);
    } else {
      this.flashOpacity = 0;
    }

    // 4. Squash & Stretch lerp hacia 1.0
    this.playerSquashX += (1.0 - this.playerSquashX) * 0.18 * dt;
    this.playerSquashY += (1.0 - this.playerSquashY) * 0.18 * dt;

    // 5. Ondas de Choque
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.14 * dt + 4 * dt;
      sw.opacity *= Math.pow(0.88, dt);
      if (sw.opacity < 0.02) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 6. Starfield Warp
    const starSpeed = 0.018 * this.speed * dt;
    this.stars.forEach(s => {
      s.z -= starSpeed;
      if (s.z <= 0.02) {
        s.z = 1.0;
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
      }
    });

    // 7. Cuadrícula y carril del jugador
    this.gridOffset = (this.gridOffset + 0.015 * this.speed * dt) % 1.0;

    const laneXPositions = this.getLaneXPositions(this.height * 0.82);
    this.targetPlayerX = laneXPositions[this.currentLane];
    this.playerX += (this.targetPlayerX - this.playerX) * 0.22 * dt;

    // 8. Avanzar compuerta
    if (this.activeGate) {
      this.activeGate.z -= 0.0055 * this.speed * dt;
    }
  }

  getLaneXPositions(y) {
    const vanishY = this.height * 0.22;
    const vanishX = this.width * 0.5;
    const progress = Math.max(0, Math.min(1, (y - vanishY) / (this.height - vanishY)));

    const runwayWidth = this.width * 0.88 * Math.pow(progress, 1.25);
    const leftX = vanishX - runwayWidth * 0.5;
    const rightX = vanishX + runwayWidth * 0.5;

    return [
      leftX + runwayWidth * 0.18,
      vanishX,
      rightX - runwayWidth * 0.18
    ];
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    // Aplicar Screen Shake elástico a toda la escena
    ctx.translate(this.shakeOffsetX, this.shakeOffsetY);

    ctx.clearRect(-20, -20, w + 40, h + 40);

    // 1. Fondo cósmico con gradiente reactivo pre-cacheado
    ctx.fillStyle = this.cachedBgGrad || '#030712';
    ctx.fillRect(0, 0, w, h);

    const vanishX = w * 0.5;
    const vanishY = h * 0.22;

    // 2. Starfield Warp (Líneas de velocidad estelares)
    this.renderStarfield(ctx, vanishX, vanishY, w, h);

    // 3. Sol / Horizonte reactivo
    const sunRadius = 42 + this.beatPulse * 16;
    const sunGrad = ctx.createRadialGradient(vanishX, vanishY, 4, vanishX, vanishY, sunRadius * 2);
    sunGrad.addColorStop(0, this.themeColor);
    sunGrad.addColorStop(0.35, this.secondaryColor);
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(vanishX, vanishY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Pista en Perspectiva 2.5D
    this.renderRunway(ctx, vanishX, vanishY, w, h);

    // 5. Orbes y compuerta entrante
    if (this.activeGate) {
      this.renderGateOrbs(ctx, vanishX, vanishY, w, h);
    }

    // 6. Ondas de Choque
    this.renderShockwaves(ctx);

    // 7. Avatar del Jugador con Squash & Stretch
    this.renderPlayer(ctx, h * 0.82);

    // 8. White Flash de Impacto
    if (this.flashOpacity > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashOpacity})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  renderStarfield(ctx, vx, vy, w, h) {
    ctx.save();
    this.stars.forEach(s => {
      const sx = vx + (s.x * w * 0.5) / s.z;
      const sy = vy + (s.y * h * 0.5) / s.z;
      const prevZ = s.z + 0.04 * this.speed;
      const px = vx + (s.x * w * 0.5) / prevZ;
      const py = vy + (s.y * h * 0.5) / prevZ;

      if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) {
        const alpha = Math.min(1.0, (1.0 - s.z) * 1.5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = Math.max(1, (1.0 - s.z) * 2.5);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  renderRunway(ctx, vx, vy, w, h) {
    const bottomW = w * 0.88;
    const p1 = { x: vx - bottomW * 0.5, y: h };
    const p2 = { x: vx + bottomW * 0.5, y: h };

    const floorGrad = ctx.createLinearGradient(0, vy, 0, h);
    floorGrad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
    floorGrad.addColorStop(1, 'rgba(6, 182, 212, 0.24)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();

    // Líneas divisoras longitudinales
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = this.themeColor;
    ctx.shadowColor = this.themeColor;
    ctx.shadowBlur = 14 + this.beatPulse * 10;

    const laneFractions = [-0.5, -0.166, 0.166, 0.5];
    laneFractions.forEach((frac, idx) => {
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + bottomW * frac, h);
      ctx.globalAlpha = (idx === 0 || idx === 3) ? 0.9 : 0.45;
      ctx.stroke();
    });

    // Líneas horizontales de compás
    ctx.lineWidth = 1.5;
    const numHorizontalLines = 9;
    for (let i = 0; i < numHorizontalLines; i++) {
      const p = (i / numHorizontalLines + this.gridOffset) % 1.0;
      const y = vy + (h - vy) * Math.pow(p, 2.2);
      const spanW = bottomW * Math.pow(p, 1.25);

      ctx.beginPath();
      ctx.moveTo(vx - spanW * 0.5, y);
      ctx.lineTo(vx + spanW * 0.5, y);
      ctx.globalAlpha = p * 0.7;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }

  renderGateOrbs(ctx, vx, vy, w, h) {
    const z = this.activeGate.z;
    if (z < -0.1) return;

    const progress = 1.0 - z;
    const y = vy + (h * 0.82 - vy) * Math.pow(progress, 1.35);
    const laneX = this.getLaneXPositions(y);
    const orbRadius = Math.max(16, 54 * Math.pow(progress, 0.95));

    // Cartel flotante de la multiplicación
    if (progress > 0.05 && progress < 0.98) {
      this.renderOperationBanner(ctx, vx, Math.max(vy + 32, y - orbRadius - 42), progress);
    }

    for (let lane = 0; lane < 3; lane++) {
      const x = laneX[lane];
      const val = this.activeGate.laneValues[lane];
      const isPlayerHere = this.currentLane === lane && progress > 0.7;

      const numColor = window.PulseColors ? window.PulseColors.getNumberColor(val) : this.themeColor;
      const numGlow = window.PulseColors ? window.PulseColors.getNumberGlow(val) : this.themeColor;

      ctx.save();
      ctx.shadowColor = isPlayerHere ? '#22c55e' : numGlow;
      ctx.shadowBlur = Math.max(10, 30 * progress);

      // Orbe esférico con gradiente sinestésico
      if (window.PulseColors) {
        ctx.fillStyle = window.PulseColors.getNumberGradient(val, ctx, x, y, orbRadius);
      } else {
        ctx.fillStyle = this.themeColor;
      }

      ctx.beginPath();
      ctx.arc(x, y, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      // Borde de contraste alto con doble aro
      ctx.lineWidth = Math.max(2.5, 5.5 * progress);
      ctx.strokeStyle = isPlayerHere ? '#86efac' : '#ffffff';
      ctx.stroke();

      // Número tipográfico grande de máxima legibilidad
      ctx.shadowBlur = 0;
      const fontSize = Math.max(15, Math.round(orbRadius * 1.05));
      ctx.font = `900 ${fontSize}px "Outfit", "Nunito", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Halo oscuro grueso para garantizar lectura instantánea
      ctx.lineWidth = Math.max(3.5, 7 * progress);
      ctx.strokeStyle = 'rgba(3, 7, 18, 0.95)';
      ctx.strokeText(val.toString(), x, y);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(val.toString(), x, y);

      ctx.restore();
    }
  }

  renderOperationBanner(ctx, x, y, progress) {
    ctx.save();
    const promptText = this.activeGate.prompt;
    const a = this.activeGate.a;
    const b = this.activeGate.b;

    ctx.font = `900 ${Math.round(22 + progress * 14)}px "Outfit", "Nunito", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(promptText).width + 44;
    const bannerH = 46;

    ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
    ctx.strokeStyle = this.themeColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.themeColor;
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.roundRect(x - textWidth * 0.5, y - bannerH * 0.5, textWidth, bannerH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    if (window.PulseColors && a !== undefined && b !== undefined) {
      const colorA = window.PulseColors.getNumberColor(a);
      const colorB = window.PulseColors.getNumberColor(b);

      const symbol = this.activeGate.symbol || '×';
      const partA = `${a}`;
      const partTimes = ` ${symbol} `;
      const partB = `${b}`;
      const partQuestion = ` = ?`;

      const wA = ctx.measureText(partA).width;
      const wTimes = ctx.measureText(partTimes).width;
      const wB = ctx.measureText(partB).width;
      const wQ = ctx.measureText(partQuestion).width;
      const totalW = wA + wTimes + wB + wQ;

      let startX = x - totalW * 0.5;
      ctx.textAlign = 'left';

      ctx.fillStyle = colorA;
      ctx.fillText(partA, startX, y);
      startX += wA;

      ctx.fillStyle = '#ffffff';
      ctx.fillText(partTimes, startX, y);
      startX += wTimes;

      ctx.fillStyle = colorB;
      ctx.fillText(partB, startX, y);
      startX += wB;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(partQuestion, startX, y);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(promptText, x, y);
    }

    ctx.restore();
  }

  renderShockwaves(ctx) {
    ctx.save();
    this.shockwaves.forEach(sw => {
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = sw.color;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 18;
      ctx.globalAlpha = sw.opacity;

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  renderPlayer(ctx, y) {
    const x = this.playerX;
    const baseSize = 34 + this.beatPulse * 8;

    ctx.save();
    ctx.translate(x, y);
    // Aplicar Squash & Stretch elástico
    ctx.scale(this.playerSquashX, this.playerSquashY);

    ctx.shadowColor = this.themeColor;
    ctx.shadowBlur = 26 + this.beatPulse * 18;

    // Nave aerodinámica de neón
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -baseSize * 0.9);
    ctx.lineTo(baseSize * 0.72, baseSize * 0.65);
    ctx.lineTo(0, baseSize * 0.28);
    ctx.lineTo(-baseSize * 0.72, baseSize * 0.65);
    ctx.closePath();
    ctx.fill();

    // Núcleo central pulsante
    ctx.fillStyle = this.themeColor;
    ctx.beginPath();
    ctx.arc(0, baseSize * 0.05, baseSize * 0.26, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

window.TunnelRenderer = TunnelRenderer;
