/**
 * curriculum.js — Currículo Neurocognitivo y Aritmética Completa (Suma, Resta, Multiplicación, División)
 * 
 * Soporta:
 * - 4 Operaciones Aritméticas (Filtros por Operación o Modo Integral):
 *   1. 'mul': Multiplicación (Red verbal / Giro angular)
 *   2. 'add': Suma (Regrupamiento, complementos a 10 y dobles)
 *   3. 'sub': Resta (Operación inversa de la suma, surco intraparietal)
 *   4. 'div': División (Operación inversa de la multiplicación, cálculo exacto de cocientes)
 * 
 * - Modos de Juego:
 *   1. 'families': 7 Familias de Patrones Rítmicos
 *   2. 'single_table': Práctica individual Tabla / Número por Número (del 1 al 12)
 *   3. 'operations': Práctica especializada por Operación Aritmética (+, -, ×, ÷)
 * 
 * - Dificultades:
 *   1. 'easy': Cifras menores, velocidad 0.38
 *   2. 'moderate': Cifras estándar, velocidad 0.50
 *   3. 'hard': Cifras ágiles, velocidad 0.72
 */

const DIFFICULTIES = {
  easy: {
    id: 'easy',
    name: 'Fácil',
    emoji: '🌱',
    baseSpeed: 0.38,
    travelSeconds: 5.2,
    maxStreakSpeedBoost: 0.02,
    maxSpeedLimit: 0.60,
    cooldownSuccess: 1.5,
    cooldownMiss: 2.2,
    factorMax: 7,
    maxSumRange: 20
  },
  moderate: {
    id: 'moderate',
    name: 'Moderado',
    emoji: '⚡',
    baseSpeed: 0.50,
    travelSeconds: 4.0,
    maxStreakSpeedBoost: 0.035,
    maxSpeedLimit: 0.85,
    cooldownSuccess: 1.2,
    cooldownMiss: 1.8,
    factorMax: 10,
    maxSumRange: 50
  },
  hard: {
    id: 'hard',
    name: 'Difícil',
    emoji: '🔥',
    baseSpeed: 0.72,
    travelSeconds: 2.8,
    maxStreakSpeedBoost: 0.05,
    maxSpeedLimit: 1.20,
    cooldownSuccess: 0.9,
    cooldownMiss: 1.4,
    factorMax: 12,
    maxSumRange: 100
  }
};

const TRACKS_CONFIG = [
  {
    id: 'track-2',
    name: 'El Pulso Doble',
    family: 'Tabla del 2',
    emoji: '🦋',
    bpm: 96,
    color: '#06b6d4',
    secondaryColor: '#3b82f6',
    desc: 'Simetría binaria (2, 4, 6, 8...). El despertar del ritmo.',
    multiplicands: [2],
    factors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'track-5-10',
    name: 'La Danza Solar',
    family: 'Tablas del 5 y 10',
    emoji: '⭐',
    bpm: 104,
    color: '#eab308',
    secondaryColor: '#f97316',
    desc: 'El reloj cósmico. Terminaciones rítmicas en 0 y 5.',
    multiplicands: [5, 10],
    factors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'track-4',
    name: 'El Eco Cuádruple',
    family: 'Tabla del 4',
    emoji: '🍀',
    bpm: 108,
    color: '#10b981',
    secondaryColor: '#059669',
    desc: 'Dobles de dobles. Si sabes el 2, dominas el 4.',
    multiplicands: [4],
    factors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'track-3-6',
    name: 'La Tríada Cantante',
    family: 'Tablas del 3 y 6',
    emoji: '🌀',
    bpm: 112,
    color: '#8b5cf6',
    secondaryColor: '#a855f7',
    desc: 'Compás ternario y su reflejo doble. Armonía modular.',
    multiplicands: [3, 6],
    factors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'track-squares',
    name: 'Las Parcelas Sagradas',
    family: 'Cuadrados n × n',
    emoji: '💎',
    bpm: 116,
    color: '#ec4899',
    secondaryColor: '#f43f5e',
    desc: 'Resonancia pura: 2×2, 3×3, 4×4, 5×5... Simetría perfecta.',
    isSquares: true,
    squares: [2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'track-9',
    name: 'El Hechizo del Nueve',
    family: 'Tabla del 9',
    emoji: '🔮',
    bpm: 110,
    color: '#6366f1',
    secondaryColor: '#8b5cf6',
    desc: 'Dígitos complementarios que siempre suman nueve.',
    multiplicands: [9],
    factors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'track-7-8',
    name: 'El Puente Armónico',
    family: 'Tablas del 7 y 8',
    emoji: '🌉',
    bpm: 118,
    color: '#14b8a6',
    secondaryColor: '#06b6d4',
    desc: 'Descomposición maestra: 5 + n. Las cimas conquistadas.',
    multiplicands: [7, 8],
    factors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
];

const SINGLE_TABLES_CONFIG = [
  { table: 1, name: 'Tabla del 1', emoji: '🌱', bpm: 90, color: '#0284c7', desc: 'Identidad y Espejo Mágico' },
  { table: 2, name: 'Tabla del 2', emoji: '🐾', bpm: 96, color: '#22c55e', desc: 'Dobles y Gemelos Simétricos' },
  { table: 3, name: 'Tabla del 3', emoji: '🐝', bpm: 102, color: '#ef4444', desc: 'Tríos Rítmicos y Círculo Waldorf' },
  { table: 4, name: 'Tabla del 4', emoji: '🍀', bpm: 106, color: '#f97316', desc: 'Tréboles de Cuatro Hojas' },
  { table: 5, name: 'Tabla del 5', emoji: '⭐', bpm: 108, color: '#a855f7', desc: 'Danza Solar en 0 y 5' },
  { table: 6, name: 'Tabla del 6', emoji: '🌀', bpm: 110, color: '#eab308', desc: 'El Doble de la Tríada' },
  { table: 7, name: 'Tabla del 7', emoji: '🌈', bpm: 114, color: '#06b6d4', desc: 'El Desafío de los 7 Colores' },
  { table: 8, name: 'Tabla del 8', emoji: '🐙', bpm: 116, color: '#ec4899', desc: 'Octópodos y Doble del Cuatro' },
  { table: 9, name: 'Tabla del 9', emoji: '🔮', bpm: 112, color: '#b45309', desc: 'Hechizo de Manos y Suma 9' },
  { table: 10, name: 'Tabla del 10', emoji: '👑', bpm: 100, color: '#eab308', desc: 'La Corona Redonda de Ceros' },
  { table: 11, name: 'Tabla del 11', emoji: '✨', bpm: 118, color: '#3b82f6', desc: 'Dígitos Espejo Gemelos' },
  { table: 12, name: 'Tabla del 12', emoji: '🏆', bpm: 122, color: '#8b5cf6', desc: 'Gran Maestría Duodecimal' }
];

// Configuración de las 4 Operaciones Aritméticas Básicas con Curvas Andamiadas (Nivel 1, 2, 3)
const ARITHMETIC_OPERATIONS_CONFIG = [
  {
    op: 'add',
    symbol: '+',
    name: 'Suma Cósmica',
    emoji: '➕',
    bpm: 100,
    color: '#22c55e',
    desc: 'Unión de magnitudes, dobles y complementos a 10',
    tags: ['Adición', 'Regrupamiento'],
    levels: [
      { id: 1, name: 'Iniciación', label: '🌱 Nivel 1: Hasta 10', desc: 'Sumas elementales dentro de 10 (2+3, 4+5), sin frustración', maxA: 5, maxB: 5, speedMod: 0.85 },
      { id: 2, name: 'Exploración', label: '⚡ Nivel 2: Hasta 20', desc: 'Complementos a 10 y paso de decena (7+3=10, 8+6=14)', maxA: 10, maxB: 10, speedMod: 1.0 },
      { id: 3, name: 'Maestría', label: '🔥 Nivel 3: Hasta 50', desc: 'Cálculo mental ágil con decenas y dobles mayores', maxA: 25, maxB: 25, speedMod: 1.15 }
    ]
  },
  {
    op: 'sub',
    symbol: '−',
    name: 'Resta Estelar',
    emoji: '➖',
    bpm: 102,
    color: '#06b6d4',
    desc: 'Diferencias, distancias y operación inversa de la suma',
    tags: ['Sustracción', 'Inversa'],
    levels: [
      { id: 1, name: 'Iniciación', label: '🌱 Nivel 1: Dentro de 10', desc: 'Restas concretas directas (7−3, 9−4, 5−2)', maxA: 10, speedMod: 0.85 },
      { id: 2, name: 'Exploración', label: '⚡ Nivel 2: Dentro de 20', desc: 'Paso de decena e inversa de suma (15−7, 12−4)', maxA: 20, speedMod: 1.0 },
      { id: 3, name: 'Maestría', label: '🔥 Nivel 3: Hasta 50', desc: 'Diferencias de dos dígitos y cálculo mental veloz', maxA: 50, speedMod: 1.15 }
    ]
  },
  {
    op: 'mul',
    symbol: '×',
    name: 'Multiplicación Astral',
    emoji: '✖️',
    bpm: 106,
    color: '#f97316',
    desc: 'Escalas de ritmo, productos iterados y familias numéricas',
    tags: ['Factores', 'Productos'],
    levels: [
      { id: 1, name: 'Iniciación', label: '🌱 Nivel 1: Tablas 1, 2, 5, 10', desc: 'Bases intuitivas: dobles, espejo y terminación en 0 y 5', tables: [1, 2, 5, 10], maxFactor: 10, speedMod: 0.85 },
      { id: 2, name: 'Exploración', label: '⚡ Nivel 2: Tablas 3, 4, 6', desc: 'Tríos rítmicos, dobles del 2 y simetrías modulares', tables: [3, 4, 6], maxFactor: 10, speedMod: 1.0 },
      { id: 3, name: 'Maestría', label: '🔥 Nivel 3: Tablas 7, 8, 9, 11, 12', desc: 'Descomposición 5+n, truco de dedos y duodecimal', tables: [7, 8, 9, 11, 12], maxFactor: 12, speedMod: 1.15 }
    ]
  },
  {
    op: 'div',
    symbol: '÷',
    name: 'División Cuántica',
    emoji: '➗',
    bpm: 108,
    color: '#a855f7',
    desc: 'Repartos exactos y operación inversa de la multiplicación',
    tags: ['Cocientes', 'Inversa'],
    levels: [
      { id: 1, name: 'Iniciación', label: '🌱 Nivel 1: Entre 2 y 5', desc: 'Mitades y quintas partes directas (8÷2, 20÷5)', divisors: [2, 5], maxQuotient: 10, speedMod: 0.85 },
      { id: 2, name: 'Exploración', label: '⚡ Nivel 2: Entre 3, 4, 6', desc: 'Terceras, cuartas y sextas partes exactas (12÷3, 24÷4)', divisors: [3, 4, 6], maxQuotient: 10, speedMod: 1.0 },
      { id: 3, name: 'Maestría', label: '🔥 Nivel 3: Entre 7, 8, 9, 10', desc: 'Cocientes mayores y automatización de la división', divisors: [7, 8, 9, 10], maxQuotient: 12, speedMod: 1.15 }
    ]
  }
];

class CurriculumManager {
  constructor() {
    this.storageKey = 'multiplica_pulse_v1';
    this.state = this.loadState();
    this.currentDifficulty = 'moderate';
    this.currentGameMode = 'operations'; // Por defecto 4 operaciones
    this.currentOperationFilter = 'all'; // 'all' | 'add' | 'sub' | 'mul' | 'div'
    this.selectedOpLevel = 1; // 1, 2, 3
  }

  loadState() {
    let parsed = null;
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) parsed = JSON.parse(data);
    } catch (e) {
      console.warn("Storage fallback activo", e);
    }

    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }

    return {
      unlockedTracks: Array.isArray(parsed.unlockedTracks) ? parsed.unlockedTracks : ['track-2'],
      highScores: (parsed.highScores && typeof parsed.highScores === 'object') ? parsed.highScores : {},
      singleTableScores: (parsed.singleTableScores && typeof parsed.singleTableScores === 'object') ? parsed.singleTableScores : {},
      operationScores: (parsed.operationScores && typeof parsed.operationScores === 'object') ? parsed.operationScores : {},
      totalOrbs: typeof parsed.totalOrbs === 'number' ? parsed.totalOrbs : 0,
      totalPerfectStreaks: typeof parsed.totalPerfectStreaks === 'number' ? parsed.totalPerfectStreaks : 0
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("No se pudo guardar", e);
    }
  }

  setDifficulty(diffId) {
    if (DIFFICULTIES[diffId]) {
      this.currentDifficulty = diffId;
    }
  }

  getDifficultyConfig() {
    return DIFFICULTIES[this.currentDifficulty] || DIFFICULTIES.moderate;
  }

  setGameMode(mode) {
    this.currentGameMode = mode;
  }

  setOperationLevel(levelNum) {
    this.selectedOpLevel = Math.max(1, Math.min(3, parseInt(levelNum) || 1));
  }

  getTracks() {
    return TRACKS_CONFIG.map(t => ({
      ...t,
      unlocked: this.state.unlockedTracks.includes(t.id),
      highScore: this.state.highScores[t.id] || 0
    }));
  }

  getSingleTables() {
    return SINGLE_TABLES_CONFIG.map(t => ({
      ...t,
      highScore: (this.state.singleTableScores && this.state.singleTableScores[t.table]) || 0
    }));
  }

  getArithmeticOperations() {
    return ARITHMETIC_OPERATIONS_CONFIG.map(o => ({
      ...o,
      highScore: (this.state.operationScores && this.state.operationScores[o.op]) || 0
    }));
  }

  unlockNextTrack(currentTrackId) {
    const idx = TRACKS_CONFIG.findIndex(t => t.id === currentTrackId);
    if (idx !== -1 && idx < TRACKS_CONFIG.length - 1) {
      const nextId = TRACKS_CONFIG[idx + 1].id;
      if (!this.state.unlockedTracks.includes(nextId)) {
        this.state.unlockedTracks.push(nextId);
        this.saveState();
        return TRACKS_CONFIG[idx + 1];
      }
    }
    return null;
  }

  recordTrackResult(trackKey, score, streak, category = 'operations') {
    if (category === 'single_table') {
      const prev = this.state.singleTableScores[trackKey] || 0;
      if (score > prev) this.state.singleTableScores[trackKey] = score;
    } else if (category === 'operations') {
      const prev = this.state.operationScores[trackKey] || 0;
      if (score > prev) this.state.operationScores[trackKey] = score;
    } else {
      const prev = this.state.highScores[trackKey] || 0;
      if (score > prev) this.state.highScores[trackKey] = score;
    }
    this.state.totalOrbs += score;
    if (streak > this.state.totalPerfectStreaks) {
      this.state.totalPerfectStreaks = streak;
    }
    this.saveState();
  }

  // Generador universal para las 4 operaciones aritméticas con progresión andamiada
  generateChallenge(trackConfig, options = {}) {
    const diff = this.getDifficultyConfig();
    const singleTable = options.singleTable || null;
    const specificOp = options.operation || (trackConfig.isArithmetic ? trackConfig.op : null);
    const levelNum = options.level || this.selectedOpLevel || 1;

    let a, b, answer, symbol, prompt;

    if (specificOp === 'add') {
      // SUMA ANDAMIADA: Nivel 1 (hasta 10), Nivel 2 (hasta 20), Nivel 3 (hasta 50)
      symbol = '+';
      if (levelNum === 1) {
        // Nivel 1: sumas dentro de 10 (sin sobrecarga, ultra amigable)
        a = Math.floor(Math.random() * 5) + 1;
        b = Math.floor(Math.random() * 5) + 1;
      } else if (levelNum === 2) {
        // Nivel 2: complementos a 10 y paso de decena hasta 20
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
      } else {
        // Nivel 3: dos dígitos ágiles hasta 50
        a = Math.floor(Math.random() * 25) + 5;
        b = Math.floor(Math.random() * 20) + 5;
      }
      answer = a + b;
      prompt = `${a} + ${b}`;
    } else if (specificOp === 'sub') {
      // RESTA ANDAMIADA: Inversa de suma sin números negativos
      symbol = '−';
      if (levelNum === 1) {
        // Nivel 1: restas dentro de 10 (concreto, intuitivo)
        const part1 = Math.floor(Math.random() * 5) + 1;
        const part2 = Math.floor(Math.random() * 4) + 1;
        answer = part1;
        a = part1 + part2;
        b = part2;
      } else if (levelNum === 2) {
        // Nivel 2: restas dentro de 20
        const part1 = Math.floor(Math.random() * 9) + 2;
        const part2 = Math.floor(Math.random() * 9) + 2;
        answer = part1;
        a = part1 + part2;
        b = part2;
      } else {
        // Nivel 3: diferencias hasta 50
        const part1 = Math.floor(Math.random() * 25) + 5;
        const part2 = Math.floor(Math.random() * 20) + 5;
        answer = part1;
        a = part1 + part2;
        b = part2;
      }
      prompt = `${a} − ${b}`;
    } else if (specificOp === 'div') {
      // DIVISIÓN ANDAMIADA: Cocientes exactos sin decimales
      symbol = '÷';
      let divisor, quotient;
      if (levelNum === 1) {
        // Nivel 1: Divisores amigables 2 y 5 (mitades y quintas partes)
        const divPool = [2, 5];
        divisor = divPool[Math.floor(Math.random() * divPool.length)];
        quotient = Math.floor(Math.random() * 7) + 1;
      } else if (levelNum === 2) {
        // Nivel 2: Divisores 3, 4 y 6
        const divPool = [3, 4, 6];
        divisor = divPool[Math.floor(Math.random() * divPool.length)];
        quotient = Math.floor(Math.random() * 8) + 1;
      } else {
        // Nivel 3: Divisores 7, 8, 9, 10
        const divPool = [7, 8, 9, 10];
        divisor = divPool[Math.floor(Math.random() * divPool.length)];
        quotient = Math.floor(Math.random() * 10) + 1;
      }
      a = divisor * quotient;
      b = divisor;
      answer = quotient;
      prompt = `${a} ÷ ${b}`;
    } else if (specificOp === 'mul') {
      // MULTIPLICACIÓN ANDAMIADA EN MODO 4 OPERACIONES
      symbol = '×';
      if (levelNum === 1) {
        // Nivel 1: Tablas 1, 2, 5, 10
        const tables = [1, 2, 5, 10];
        a = tables[Math.floor(Math.random() * tables.length)];
        b = Math.floor(Math.random() * 8) + 1;
      } else if (levelNum === 2) {
        // Nivel 2: Tablas 3, 4, 6
        const tables = [3, 4, 6];
        a = tables[Math.floor(Math.random() * tables.length)];
        b = Math.floor(Math.random() * 9) + 1;
      } else {
        // Nivel 3: Tablas 7, 8, 9, 11, 12
        const tables = [7, 8, 9, 11, 12];
        a = tables[Math.floor(Math.random() * tables.length)];
        b = Math.floor(Math.random() * 10) + 1;
      }
      answer = a * b;
      prompt = `${a} × ${b}`;
    } else if (singleTable !== null) {
      // MODO TABLA INDIVIDUAL (MULTIPLICACIÓN)
      symbol = '×';
      a = singleTable;
      b = Math.floor(Math.random() * diff.factorMax) + 1;
      answer = a * b;
      prompt = `${a} × ${b}`;
    } else if (trackConfig.isSquares) {
      // CUADRADOS PERFECTOS
      symbol = '×';
      const base = trackConfig.squares[Math.floor(Math.random() * trackConfig.squares.length)];
      a = base;
      b = base;
      answer = a * b;
      prompt = `${a} × ${b}`;
    } else {
      // MULTIPLICACIÓN POR FAMILIAS (Modo Base)
      symbol = '×';
      a = trackConfig.multiplicands[Math.floor(Math.random() * trackConfig.multiplicands.length)];
      const maxF = Math.min(diff.factorMax, trackConfig.factors.length);
      const filteredFactors = trackConfig.factors.slice(0, maxF);
      b = filteredFactors[Math.floor(Math.random() * filteredFactors.length)];
      answer = a * b;
      prompt = `${a} × ${b}`;
    }

    // Distractores adaptados a la operación
    const distractors = new Set();
    let offsets;

    if (symbol === '+' || symbol === '−') {
      offsets = [-1, 1, -2, 2, -10, 10, -5, 5];
    } else if (symbol === '÷') {
      offsets = [-1, 1, -2, 2, 3, -3];
    } else {
      // Multiplicación
      if (diff.id === 'hard') {
        offsets = [-a, a, -1, 1, -(Math.min(a, b)), Math.min(a, b)];
      } else if (diff.id === 'easy') {
        offsets = [-a * 2, a * 2, -2, 2, -10, 10, -a, a];
      } else {
        offsets = [-a, a, -1, 1, -(Math.min(a, b)), Math.min(a, b), -10, 10];
      }
    }

    let attempts = 0;
    while (distractors.size < 2 && attempts < 35) {
      attempts++;
      const randOffset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = answer + randOffset;
      if (candidate >= 0 && candidate !== answer) {
        distractors.add(candidate);
      }
    }

    if (distractors.size < 2) {
      distractors.add(answer + 2);
      distractors.add(answer > 1 ? answer - 1 : answer + 3);
    }

    const distList = Array.from(distractors);
    const correctLane = Math.floor(Math.random() * 3);

    const laneValues = [];
    let distIdx = 0;
    for (let lane = 0; lane < 3; lane++) {
      if (lane === correctLane) {
        laneValues.push(answer);
      } else {
        laneValues.push(distList[distIdx++]);
      }
    }

    return {
      a,
      b,
      symbol,
      prompt,
      answer,
      correctLane,
      laneValues
    };
  }
}

window.CurriculumManager = CurriculumManager;
window.TRACKS_CONFIG = TRACKS_CONFIG;
window.SINGLE_TABLES_CONFIG = SINGLE_TABLES_CONFIG;
window.ARITHMETIC_OPERATIONS_CONFIG = ARITHMETIC_OPERATIONS_CONFIG;
window.DIFFICULTIES = DIFFICULTIES;
