/**
 * config.js — Constantes y Configuración Global de Astral Math Path
 * Versión 2.0 Ultra-Refinada (Desacoplada y Centralizada)
 */

window.GAME_CONFIG = {
  // Claves de almacenamiento local (migración transparente)
  STORAGE_KEY_CURRICULUM: 'astral_math_path_v2',
  STORAGE_KEY_LEADERBOARD: 'astral_math_path_leaderboard_v2',
  STORAGE_KEY_LEGACY_CURRICULUM: 'multiplica_pulse_v1',
  STORAGE_KEY_LEGACY_LEADERBOARD: 'multiplica_pulse_leaderboard_v1',
  STORAGE_KEY_SETTINGS: 'astral_math_path_settings_v2',

  // Dinámica de Juego Arcade
  CHALLENGES_PER_TRACK: 10,
  GATE_COLLISION_THRESHOLD_Z: 0.04,
  GATE_SPAWN_Z: 1.0,
  
  // Racha y multiplicadores de combo
  COMBO_THRESHOLDS: [
    { streak: 8, multiplier: 4 },
    { streak: 5, multiplier: 3 },
    { streak: 2, multiplier: 2 }
  ],
  BASE_POINTS_PER_HIT: 100,

  // Renderizado y Gráficos
  STARFIELD_COUNT: 90,
  HIT_PARTICLES_COUNT: 35,
  MISS_PARTICLES_COUNT: 15,
  SHOCKWAVE_MAX_RADIUS_FACTOR: 0.45,

  // Controles e Input
  SWIPE_THRESHOLD_PX: 40,
  SWIPE_TIMEOUT_MS: 300,
  HAPTIC_ENABLED: true,

  // Audio Procedural
  AUDIO: {
    DEFAULT_BPM: 105,
    MASTER_VOLUME: 0.75,
    PAD_VOLUME: 0.45,
    ARP_VOLUME: 0.38,
    LEAD_VOLUME: 0.40,
    DELAY_TIME: 0.22,
    DELAY_FEEDBACK: 0.35,
    DELAY_FILTER_FREQ: 3200
  },

  // Paleta de Operaciones
  OPERATION_THEMES: {
    add: { primary: '#06b6d4', secondary: '#3b82f6', symbol: '+' },
    sub: { primary: '#ec4899', secondary: '#8b5cf6', symbol: '−' },
    mul: { primary: '#eab308', secondary: '#f97316', symbol: '×' },
    div: { primary: '#10b981', secondary: '#06b6d4', symbol: '÷' }
  }
};
