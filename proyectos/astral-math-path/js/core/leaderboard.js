/**
 * leaderboard.js — Sistema de Ranking y Salón de la Fama Arcade (Top 10)
 * 
 * Gestiona:
 * - Persistencia de Top 10 en localStorage
 * - Validación de récords y posición obtenida
 * - Registro de 3 iniciales (ej. JMG, NEO, TTO), puntuación, racha, modo, dificultad y fecha (DD/MM/AAAA)
 */

class LeaderboardManager {
  constructor() {
    this.storageKey = window.GAME_CONFIG?.STORAGE_KEY_LEADERBOARD || 'astral_math_path_leaderboard_v2';
    this.legacyKey = window.GAME_CONFIG?.STORAGE_KEY_LEGACY_LEADERBOARD || 'multiplica_pulse_leaderboard_v1';
    this.maxEntries = 10;
    this.entries = this.load();
  }

  getDefaultLeaderboard() {
    const today = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return [
      { rank: 1, initials: 'PUL', score: 2800, maxStreak: 12, mode: 'Familias', detail: 'El Pulso Doble', difficulty: 'Moderado', date: today },
      { rank: 2, initials: 'NEO', score: 2400, maxStreak: 10, mode: 'Familias', detail: 'La Danza Solar', difficulty: 'Moderado', date: today },
      { rank: 3, initials: 'JMG', score: 2100, maxStreak: 9, mode: 'Tabla x7', detail: 'Tabla del 7', difficulty: 'Fácil', date: today },
      { rank: 4, initials: 'SOL', score: 1850, maxStreak: 8, mode: 'Tabla x9', detail: 'Tabla del 9', difficulty: 'Moderado', date: today },
      { rank: 5, initials: 'ECO', score: 1600, maxStreak: 7, mode: 'Familias', detail: 'El Eco Cuádruple', difficulty: 'Fácil', date: today },
      { rank: 6, initials: 'TRI', score: 1400, maxStreak: 6, mode: 'Tabla x3', detail: 'Tabla del 3', difficulty: 'Fácil', date: today },
      { rank: 7, initials: 'OCT', score: 1200, maxStreak: 5, mode: 'Tabla x8', detail: 'Tabla del 8', difficulty: 'Moderado', date: today },
      { rank: 8, initials: 'LIR', score: 1000, maxStreak: 4, mode: 'Tabla x2', detail: 'Tabla del 2', difficulty: 'Fácil', date: today },
      { rank: 9, initials: 'ZUM', score: 850, maxStreak: 3, mode: 'Familias', detail: 'La Tríada', difficulty: 'Fácil', date: today },
      { rank: 10, initials: 'TTO', score: 700, maxStreak: 3, mode: 'Tabla x5', detail: 'Tabla del 5', difficulty: 'Fácil', date: today }
    ];
  }

  load() {
    try {
      // 1. Intentar cargar v2
      let data = localStorage.getItem(this.storageKey);
      // 2. Si no hay v2, migrar desde legacy v1
      if (!data && this.legacyKey) {
        const legacyData = localStorage.getItem(this.legacyKey);
        if (legacyData) {
          data = legacyData;
          localStorage.setItem(this.storageKey, legacyData);
        }
      }

      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error cargando leaderboard", e);
    }
    const def = this.getDefaultLeaderboard();
    this.save(def);
    return def;
  }

  save(entries) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (e) {
      console.warn("Error guardando leaderboard", e);
    }
  }

  isTopScore(score) {
    if (score <= 0) return false;
    if (this.entries.length < this.maxEntries) return true;
    return score > this.entries[this.entries.length - 1].score;
  }

  getRankForScore(score) {
    let rank = 1;
    for (const entry of this.entries) {
      if (score > entry.score) return rank;
      rank++;
    }
    return rank <= this.maxEntries ? rank : -1;
  }

  addEntry({ initials, score, maxStreak, mode, detail, difficulty }) {
    const today = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const cleanInitials = (initials || 'AAA').toUpperCase().slice(0, 3);
    const newEntry = {
      initials: cleanInitials,
      score: Math.max(0, score),
      maxStreak: Math.max(0, maxStreak),
      mode: mode || 'Arcade',
      detail: detail || '',
      difficulty: difficulty || 'Moderado',
      date: today
    };

    this.entries.push(newEntry);
    // Ordenar de mayor a menor puntuación
    this.entries.sort((a, b) => b.score - a.score);
    this.entries = this.entries.slice(0, this.maxEntries);

    // Reasignar ranks 1..10
    this.entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    this.save(this.entries);
    return this.entries;
  }

  getTop10() {
    return this.entries;
  }
}

window.LeaderboardManager = LeaderboardManager;
