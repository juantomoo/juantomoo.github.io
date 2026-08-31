/**
 * notebook.js - Sistema de Cuadernos de Estudio Pedagógicos y Gamificación
 * Basado en los 4 Cuadernos de Yusupov y la Psicología del Rendimiento
 * Totalmente internacionalizado con soporte para español e inglés.
 */

class StudyNotebookManager {
  constructor() {
    this.storageKey = 'jaque_al_rey_profile';
    this.data = this.loadData();

    if (window.i18n) {
      window.i18n.onLanguageChange(() => {
        this.updateHeaderUI();
      });
    }
  }

  loadData() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }

    return {
      name: "Pequeño Gran Maestro",
      xp: 0,
      completedLessons: [],
      solvedPuzzles: [],
      unlockedMedals: [],
      blindspots: [],
      battlesLog: [],
      minigamesWon: []
    };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  getRanksList() {
    if (window.i18n) return window.i18n.getRanks();
    return [
      { minXP: 0, title: "Aprendiz del Valle", badge: "🌱" },
      { minXP: 100, title: "Explorador de la Selva", badge: "🌿" },
      { minXP: 250, title: "Guardián de los Andes", badge: "🏔️" },
      { minXP: 450, title: "Táctico de la Neblina", badge: "🦅" },
      { minXP: 700, title: "Maestro del Cóndor", badge: "👑" },
      { minXP: 1000, title: "Gran Chamán del Tablero", badge: "⚡" },
      { minXP: 1500, title: "Inca Inmortal", badge: "☀️" }
    ];
  }

  getMedalsCatalog() {
    if (window.i18n) return window.i18n.getMedals();
    return [
      { id: 'first_lesson', name: 'Primeros Pasos', desc: 'Completaste tu primera lección', icon: '🌟' },
      { id: 'all_lessons', name: 'Maestro Graduado', desc: 'Superaste las 10 lecciones', icon: '🎓' },
      { id: 'route_star', name: 'Cazador de Estrellas', desc: 'Completaste el Planificador de Rutas', icon: '⭐' },
      { id: 'knight_maze', name: 'Jinete del Laberinto', desc: 'Superaste el Laberinto de la Llama', icon: '🦙' },
      { id: 'tactics_hero', name: 'Mente Táctica', desc: 'Resolviste 5 puzzles tácticos', icon: '🧩' },
      { id: 'first_win', name: '¡Jaque Mate!', desc: 'Ganaste tu primera partida', icon: '⚔️' },
      { id: 'beat_hard', name: 'Vencedor del Oso', desc: 'Derrotaste al Oso Guardián', icon: '🐻' }
    ];
  }

  addXP(amount) {
    const prevRank = this.getCurrentRank();
    this.data.xp += amount;
    this.saveData();

    this.showFloatingXP(amount);

    const newRank = this.getCurrentRank();
    if (newRank.title !== prevRank.title) {
      window.soundFx.playVictory();
      this.triggerConfetti();
      this.showLevelUpModal(newRank);
    }

    this.updateHeaderUI();
    return this.data.xp;
  }

  getCurrentRank() {
    const ranks = this.getRanksList();
    let current = ranks[0];
    for (const r of ranks) {
      if (this.data.xp >= r.minXP) current = r;
    }
    return current;
  }

  getNextRank() {
    const ranks = this.getRanksList();
    for (const r of ranks) {
      if (this.data.xp < r.minXP) return r;
    }
    return null;
  }

  markLessonCompleted(lessonId) {
    if (!this.data.completedLessons.includes(lessonId)) {
      this.data.completedLessons.push(lessonId);
      this.saveData();

      this.unlockMedal('first_lesson');
      if (this.data.completedLessons.length >= 10) {
        this.unlockMedal('all_lessons');
      }
    }
  }

  markPuzzleSolved(puzzleId) {
    if (!this.data.solvedPuzzles.includes(puzzleId)) {
      this.data.solvedPuzzles.push(puzzleId);
      this.saveData();

      if (this.data.solvedPuzzles.length >= 5) {
        this.unlockMedal('tactics_hero');
      }
    }
  }

  recordMinigameWin(gameType) {
    if (!this.data.minigamesWon.includes(gameType)) {
      this.data.minigamesWon.push(gameType);
      this.saveData();

      if (gameType === 'route_planner') this.unlockMedal('route_star');
      if (gameType === 'knight_maze') this.unlockMedal('knight_maze');
    }
  }

  recordBattle(botKey, winner, moves) {
    this.data.battlesLog.unshift({
      bot: botKey,
      winner,
      moves,
      date: new Date().toLocaleDateString()
    });
    if (this.data.battlesLog.length > 20) this.data.battlesLog.pop();
    this.saveData();

    if (winner === 'w') {
      this.unlockMedal('first_win');
      if (botKey === 'hard') {
        this.unlockMedal('beat_hard');
      }
    }
  }

  recordBlindspot(puzzle) {
    const exists = this.data.blindspots.some(b => b.id === puzzle.id);
    if (!exists) {
      this.data.blindspots.push({
        id: puzzle.id,
        title: puzzle.title,
        fen: puzzle.fen,
        count: 1
      });
    } else {
      const item = this.data.blindspots.find(b => b.id === puzzle.id);
      if (item) item.count++;
    }
    this.saveData();
  }

  unlockMedal(medalId) {
    if (!this.data.unlockedMedals.includes(medalId)) {
      this.data.unlockedMedals.push(medalId);
      this.saveData();

      const medal = this.getMedalsCatalog().find(m => m.id === medalId);
      if (medal) {
        this.showMedalUnlockModal(medal);
      }
    }
  }

  updateHeaderUI() {
    const rank = this.getCurrentRank();
    const iconEl = document.getElementById('user-rank-icon');
    const badgeEl = document.getElementById('user-rank-badge');
    const xpEl = document.getElementById('user-xp-counter');

    if (iconEl) iconEl.innerText = rank.badge;
    if (badgeEl) badgeEl.innerText = rank.title;
    if (xpEl) xpEl.innerText = `${this.data.xp} XP`;
  }

  showFloatingXP(amount) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      top: 60px;
      left: 30px;
      font-family: var(--font-mono-stats);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--gold-sun);
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      z-index: 200;
      pointer-events: none;
      animation: floatUpFade 1.4s ease-out forwards;
    `;
    el.innerText = `+${amount} XP`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  showLevelUpModal(newRank) {
    const isEn = window.i18n && window.i18n.getLang() === 'en';
    const title = isEn ? '🎉 RANK ASCENSION!' : '🎉 ¡ASCENSO DE RANGO!';
    const sub = isEn ? `You reached the title: <strong>${newRank.title}</strong>` : `Has alcanzado el título de: <strong>${newRank.title}</strong>`;
    const btnText = isEn ? 'CONTINUE 🚀' : '¡A CELEBRAR! 🚀';

    const modal = document.createElement('div');
    modal.className = 'luxury-promotion-modal';
    modal.innerHTML = `
      <div class="luxury-promotion-dialog">
        <div style="font-size: 3rem; margin-bottom: 6px;">${newRank.badge}</div>
        <h3>${title}</h3>
        <p>${sub}</p>
        <button class="btn-game-tablet gold" style="margin-top: 14px;" onclick="this.closest('.luxury-promotion-modal').remove()">
          ${btnText}
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showMedalUnlockModal(medal) {
    const isEn = window.i18n && window.i18n.getLang() === 'en';
    const title = isEn ? '🏅 MEDAL UNLOCKED!' : '🏅 ¡NUEVA MEDALLA DESBLOQUEADA!';
    const btnText = isEn ? 'AWESOME! 🌟' : '¡GENIAL! 🌟';

    const modal = document.createElement('div');
    modal.className = 'luxury-promotion-modal';
    modal.innerHTML = `
      <div class="luxury-promotion-dialog">
        <div style="font-size: 3rem; margin-bottom: 6px;">${medal.icon}</div>
        <h3>${title}</h3>
        <h4 style="font-family:var(--font-hero); font-size:16px; color:var(--jungle-canopy); margin: 6px 0;">${medal.name}</h4>
        <p>${medal.desc}</p>
        <button class="btn-game-tablet emerald" style="margin-top: 14px;" onclick="this.closest('.luxury-promotion-modal').remove()">
          ${btnText}
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  triggerConfetti() {
    const colors = ['#F6C138', '#2EB886', '#E84D58', '#38BDF8', '#FFF0BD'];
    for (let i = 0; i < 35; i++) {
      const piece = document.createElement('div');
      piece.style.cssText = `
        position: fixed;
        width: ${Math.random() * 8 + 6}px;
        height: ${Math.random() * 8 + 6}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: 20%;
        left: ${Math.random() * 80 + 10}vw;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        z-index: 300;
        pointer-events: none;
        animation: confettiFall ${Math.random() * 1.5 + 1}s ease-out forwards;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2500);
    }
  }
}

window.StudyNotebookManager = StudyNotebookManager;
