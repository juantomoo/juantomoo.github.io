/**
 * constellation-map.js — Mapa de Constelaciones Estelares Arcade (Bóveda Celeste)
 * Representa visualmente las 4 operaciones (Suma, Resta, Multiplicación, División)
 * cada una con 3 estrellas (Iniciación, Exploración, Maestría) = 12 estrellas totales.
 */

class ConstellationMap {
  constructor(canvas, curriculum) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.curriculum = curriculum;

    // Configuración de las 4 constelaciones estelares
    this.constellations = [
      {
        id: 'add',
        name: 'Orión de la Suma',
        symbol: '+',
        color: '#06b6d4',
        stars: [
          { level: 1, name: 'Alfa (+)', x: 0.18, y: 0.65 },
          { level: 2, name: 'Beta (+)', x: 0.25, y: 0.40 },
          { level: 3, name: 'Gama (+)', x: 0.32, y: 0.22 }
        ]
      },
      {
        id: 'sub',
        name: 'Péiro de la Resta',
        symbol: '−',
        color: '#ec4899',
        stars: [
          { level: 1, name: 'Delta (−)', x: 0.38, y: 0.72 },
          { level: 2, name: 'Épsilon (−)', x: 0.46, y: 0.52 },
          { level: 3, name: 'Zeta (−)', x: 0.42, y: 0.30 }
        ]
      },
      {
        id: 'mul',
        name: 'Corona de la Multiplicación',
        symbol: '×',
        color: '#eab308',
        stars: [
          { level: 1, name: 'Eta (×)', x: 0.62, y: 0.30 },
          { level: 2, name: 'Theta (×)', x: 0.70, y: 0.48 },
          { level: 3, name: 'Iota (×)', x: 0.78, y: 0.28 }
        ]
      },
      {
        id: 'div',
        name: 'Fénix de la División',
        symbol: '÷',
        color: '#10b981',
        stars: [
          { level: 1, name: 'Kappa (÷)', x: 0.68, y: 0.75 },
          { level: 2, name: 'Lambda (÷)', x: 0.80, y: 0.60 },
          { level: 3, name: 'Mu (÷)', x: 0.88, y: 0.42 }
        ]
      }
    ];

    this.backgroundStars = [];
    this.initBackgroundStars();
  }

  initBackgroundStars() {
    this.backgroundStars = [];
    for (let i = 0; i < 45; i++) {
      this.backgroundStars.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Fondo cósmico suave
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#040817');
    bgGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Estrellas de fondo decorativas
    for (const s of this.backgroundStars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const state = this.curriculum.state || {};
    const opScores = state.operationScores || {};

    // Renderizar cada constelación
    this.constellations.forEach(c => {
      const bestScore = opScores[c.id] || 0;
      // Determinar estrellas desbloqueadas según puntuación máxima alcanzada
      // Nivel 1: >= 300 pts, Nivel 2: >= 700 pts, Nivel 3: >= 1200 pts
      const starsUnlocked = bestScore >= 1200 ? 3 : (bestScore >= 700 ? 2 : (bestScore >= 300 ? 1 : 0));

      // Líneas de conexión
      ctx.beginPath();
      for (let i = 0; i < c.stars.length; i++) {
        const star = c.stars[i];
        const sx = star.x * w;
        const sy = star.y * h;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = starsUnlocked > 0 ? c.color : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = starsUnlocked > 0 ? 1.8 : 1.0;
      ctx.stroke();

      // Dibujar estrellas
      c.stars.forEach((star, idx) => {
        const isLit = idx < starsUnlocked;
        const sx = star.x * w;
        const sy = star.y * h;

        ctx.save();
        if (isLit) {
          // Halo de brillo
          ctx.beginPath();
          ctx.arc(sx, sy, 9, 0, Math.PI * 2);
          ctx.fillStyle = c.color;
          ctx.globalAlpha = 0.35;
          ctx.fill();

          // Núcleo blanco radiante
          ctx.beginPath();
          ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 1.0;
          ctx.fill();
        } else {
          // Estrella tenue latente
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fill();
        }

        // Etiqueta de la estrella
        ctx.fillStyle = isLit ? c.color : 'rgba(255, 255, 255, 0.4)';
        ctx.font = '600 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`N${star.level}`, sx, sy + 16);
        ctx.restore();
      });

      // Título de la constelación
      const midStar = c.stars[1];
      ctx.fillStyle = c.color;
      ctx.font = '800 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${c.symbol} ${c.name}`, midStar.x * w, midStar.y * h - 18);
    });
  }

  renderLegend(container) {
    if (!container) return;
    const state = this.curriculum.state || {};
    const opScores = state.operationScores || {};

    container.innerHTML = '';
    this.constellations.forEach(c => {
      const best = opScores[c.id] || 0;
      const count = best >= 1200 ? 3 : (best >= 700 ? 2 : (best >= 300 ? 1 : 0));
      const card = document.createElement('div');
      card.className = 'constellation-badge';
      card.style.borderColor = c.color;
      card.innerHTML = `
        <div style="font-weight: 800; color: ${c.color}; font-size: 0.95rem;">${c.symbol} ${c.name}</div>
        <div style="font-size: 0.85rem; color: #fff; margin-top: 0.2rem;">
          ${'⭐'.repeat(count)}${'☆'.repeat(3 - count)} (${count}/3 Estrellas)
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">Máx: ${best} pts</div>
      `;
      container.appendChild(card);
    });
  }
}

window.ConstellationMap = ConstellationMap;
