/**
 * academy.js - Currículo Progresivo del Método de los Pasos (10 Lecciones)
 * Diseñado con pedagogía de alto impacto, andamiaje cognitivo y refuerzo positivo
 */

const ACADEMY_LESSONS = [
  {
    id: 1,
    title: "1. El Tablero y las Coordenadas",
    subtitle: "¡Aprende el mapa del reino!",
    character: "🦉 Maestro Búho",
    dialogue: "¡Bienvenido a la Academia! El tablero tiene 64 casillas (32 de luz y 32 de sombra). Las letras (a-h) son **columnas** y los números (1-8) son **filas**. La casilla de tu esquina derecha SIEMPRE debe ser clara.",
    fen: "8/8/8/8/8/8/8/8 w - - 0 1",
    instruction: "Toca las 3 casillas secretas del **Centro del Tablero: e4, d4 y e5**.",
    type: "click_targets",
    targets: [{ row: 4, col: 4 }, { row: 4, col: 3 }, { row: 3, col: 4 }], // e4, d4, e5
    explanation: "¡Excelente! Quien domina las 4 casillas del centro (e4, d4, e5, d5), domina todo el reino.",
    rewardXP: 50
  },
  {
    id: 2,
    title: "2. El Colibrí Guardián (El Peón)",
    subtitle: "¡Pequeño pero imparable!",
    character: "🦉 Maestro Búho",
    dialogue: "El **Colibrí (Peón)** avanza siempre hacia adelante: 2 pasos en su primer vuelo o 1 paso después. ¡Pero atención! Captura en **diagonal** hacia adelante.",
    fen: "8/8/8/8/8/8/4P3/8 w - - 0 1",
    instruction: "Haz volar a tu Colibrí dos pasos hacia adelante hasta la casilla **e4**.",
    type: "target_move",
    expectedTo: { row: 4, col: 4 }, // e4
    explanation: "¡Perfecto! Avanzar el peón de Rey dos pasos es la apertura clásica para liberar tus piezas.",
    rewardXP: 50
  },
  {
    id: 3,
    title: "3. La Llama Mágica (El Caballo)",
    subtitle: "¡El saltador de obstáculos!",
    character: "🦉 Maestro Búho",
    dialogue: "La **Llama Mágica (Caballo)** se mueve formando una letra **'L'** (2 casillas en una dirección y 1 al lado). ¡Es la única criatura capaz de saltar por encima de otras piezas!",
    fen: "8/8/8/8/8/8/8/1N6 w - - 0 1",
    instruction: "Haz que tu Llama salte desde b1 hasta la casilla central **c3**.",
    type: "target_move",
    expectedTo: { row: 5, col: 2 }, // c3
    explanation: "¡Magnífico salto! En c3, la Llama vigila el centro y está lista para defender el reino.",
    rewardXP: 60
  },
  {
    id: 4,
    title: "4. La Fortaleza Esmeralda (La Torre)",
    subtitle: "¡Líneas rectas y gran poder!",
    character: "🦉 Maestro Búho",
    dialogue: "La **Fortaleza (Torre)** se desliza en **línea recta**: tantas casillas libres como quiera por filas o columnas. ¡Es un cañón de largo alcance!",
    fen: "8/2p5/8/2R2p2/8/8/2p5/8 w - - 0 1",
    instruction: "Usa tu Fortaleza en c5 para capturar a los **3 cuervos negros** en línea recta.",
    type: "capture_all",
    explanation: "¡Limpieza total! Las torres son implacables dominando columnas abiertas.",
    rewardXP: 70
  },
  {
    id: 5,
    title: "5. La Orquídea Sagrada (El Alfil)",
    subtitle: "¡El guardián de las diagonales!",
    character: "🦉 Maestro Búho",
    dialogue: "La **Orquídea (Alfil)** viaja exclusivamente por las **diagonales** del color en el que nació. Nunca cambiará de color de casilla en toda la partida.",
    fen: "8/8/8/3B4/8/8/8/8 w - - 0 1",
    instruction: "Desliza tu Orquídea desde d5 hasta la esquina superior derecha en **h1** (o g8).",
    type: "target_move",
    expectedTo: { row: 7, col: 7 }, // h1
    explanation: "¡Gran diagonal! Una pareja de alfiles coordinados puede cortar el tablero por completo.",
    rewardXP: 60
  },
  {
    id: 6,
    title: "6. La Reina y la Coronación",
    subtitle: "¡El poder máximo y la transformación!",
    character: "🦉 Maestro Búho",
    dialogue: "La **Reina** combina los poderes de la Torre y el Alfil: ¡se mueve en cualquier dirección! Además, si un Colibrí llega a la última fila rival, ¡se **corona** en Reina!",
    fen: "8/4P3/8/8/8/8/8/8 w - - 0 1",
    instruction: "Avanza tu Colibrí hasta la casilla e8 y corónalo como una gloriosa Reina.",
    type: "promotion",
    expectedTo: { row: 0, col: 4 }, // e8
    explanation: "¡Viva la nueva Reina! Hasta la pieza más pequeña puede decidir el destino del reino.",
    rewardXP: 75
  },
  {
    id: 7,
    title: "7. El Rey Sabio y la Seguridad",
    subtitle: "¡El corazón de tu ejército!",
    character: "🦉 Maestro Búho",
    dialogue: "El **Rey** es la pieza más importante: se mueve 1 sola casilla hacia cualquier dirección. ¡El Rey nunca se captura! Si no tiene salida, termina la partida.",
    fen: "8/8/8/8/4K3/8/8/8 w - - 0 1",
    instruction: "Mueve a tu Rey Sabio un paso hacia el centro a la casilla e5.",
    type: "target_move",
    expectedTo: { row: 3, col: 4 }, // e5
    explanation: "¡Bien hecho! Regla de oro: tu Rey **NUNCA** puede pisar una casilla donde quede atacado por el rival.",
    rewardXP: 60
  },
  {
    id: 8,
    title: "8. El Jaque y el Escudo C-I-M",
    subtitle: "¡Alerta en el castillo!",
    character: "🦉 Maestro Búho",
    dialogue: "Cuando una pieza enemiga amenaza capturar a tu Rey, se llama **¡JAQUE!**. Salva a tu Rey con la regla mágica **C-I-M**:\n1. **C**apturar la pieza atacante.\n2. **I**nterponer una pieza defensora.\n3. **M**over al Rey a un lugar seguro.",
    fen: "4r3/8/8/8/8/8/8/4KB2 w - - 0 1",
    instruction: "La Torre negra en e8 da jaque al Rey en e1. Usa el escudo **I (Interponer)** moviendo tu Alfil de f1 a e2.",
    type: "target_move",
    expectedTo: { row: 6, col: 4 }, // e2
    explanation: "¡Escudo perfecto! Interponer el Alfil bloquea la columna y deja al Rey completamente a salvo.",
    rewardXP: 80
  },
  {
    id: 9,
    title: "9. ¡Jaque Mate! La Victoria Definitiva",
    subtitle: "¡Sin escapatoria, sin defensa!",
    character: "🦉 Maestro Búho",
    dialogue: "El **Jaque Mate** ocurre cuando el Rey está en jaque y **NO puede** Capturar, Interponer ni Moverse. ¡Es el fin de la partida y ganas el trofeo!",
    fen: "6k1/5ppp/8/8/8/8/8/4Q1K1 w - - 0 1",
    instruction: "El Rey rival está atrapado detrás de sus propios peones (el mate del pasillo). ¡Lleva tu Reina a e8 y da Jaque Mate!",
    type: "target_move",
    expectedTo: { row: 0, col: 4 }, // e8
    explanation: "¡¡JAQUE MATE!! Las piezas rivales no pudieron defender a su Rey. ¡Victoria indiscutible!",
    rewardXP: 100
  },
  {
    id: 10,
    title: "10. El Enroque: El Refugio Secreto",
    subtitle: "¡El único movimiento doble del ajedrez!",
    character: "🦉 Maestro Búho",
    dialogue: "El **Enroque** es una jugada especial donde el Rey y la Torre se mueven juntos: el Rey avanza 2 pasos hacia la Torre y la Torre salta al otro lado. ¡Protege a tu Rey y activa tu Torre a la vez!",
    fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
    instruction: "Realiza el **Enroque Corto**: mueve tu Rey dos pasos a la derecha (casilla g1).",
    type: "castling",
    expectedTo: { row: 7, col: 6 }, // g1
    explanation: "¡Enroque magistral! Ahora tu Rey descansa seguro y tu Torre está lista para la batalla.",
    rewardXP: 100
  }
];

class AcademyManager {
  constructor(boardUI, notebookManager, onLessonComplete) {
    this.boardUI = boardUI;
    this.notebookManager = notebookManager;
    this.onLessonComplete = onLessonComplete;
    this.currentLessonIndex = 0;
    this.activeTargets = [];
  }

  startLesson(index) {
    this.currentLessonIndex = index;
    const lesson = ACADEMY_LESSONS[index];
    if (!lesson) return null;

    this.boardUI.engine.loadFen(lesson.fen);
    this.boardUI.engine.turn = 'w';
    this.boardUI.lastMove = null;
    this.boardUI.clearArrows();

    if (lesson.type === 'click_targets') {
      this.activeTargets = [...lesson.targets];
      const overlays = {};
      this.activeTargets.forEach(t => {
        overlays[`${t.row},${t.col}`] = { icon: '⭐', class: 'star-target-glow' };
      });
      this.boardUI.setCustomOverlays(overlays);
      this.boardUI.options.onSquareClick = (r, c) => this.handleClickTarget(r, c);
    } else {
      this.boardUI.setCustomOverlays({});
      this.boardUI.options.onSquareClick = null;
    }

    this.boardUI.render();
    return lesson;
  }

  handleClickTarget(r, c) {
    const lesson = ACADEMY_LESSONS[this.currentLessonIndex];
    if (lesson.type !== 'click_targets') return false;

    const idx = this.activeTargets.findIndex(t => t.row === r && t.col === c);
    if (idx !== -1) {
      window.soundFx.playStar();
      this.activeTargets.splice(idx, 1);

      const overlays = {};
      this.activeTargets.forEach(t => {
        overlays[`${t.row},${t.col}`] = { icon: '⭐', class: 'star-target-glow' };
      });
      this.boardUI.setCustomOverlays(overlays);

      if (this.activeTargets.length === 0) {
        this.completeCurrentLesson();
      }
      return true;
    }
    return false;
  }

  handleLessonMove(move) {
    const lesson = ACADEMY_LESSONS[this.currentLessonIndex];
    if (!lesson) return;

    if (lesson.type === 'capture_all') {
      window.soundFx.playCorrect();

      let remaining = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = this.boardUI.engine.getPiece(r, c);
          if (p && p[0] === 'b') remaining++;
        }
      }

      if (remaining === 0) {
        this.completeCurrentLesson();
      } else {
        // Mantener el turno de las blancas para capturar el resto de piezas
        this.boardUI.engine.turn = 'w';
        this.boardUI.render();
      }

    } else if (lesson.type === 'target_move' || lesson.type === 'castling' || lesson.type === 'promotion') {
      const exp = lesson.expectedTo;
      if (move.to.row === exp.row && move.to.col === exp.col) {
        window.soundFx.playCorrect();
        this.completeCurrentLesson();
      } else {
        window.soundFx.playWrong();
        setTimeout(() => {
          this.boardUI.engine.undoMove();
          this.boardUI.engine.turn = 'w';
          this.boardUI.render();
        }, 500);
      }
    }
  }

  completeCurrentLesson() {
    const lesson = ACADEMY_LESSONS[this.currentLessonIndex];
    window.soundFx.playVictory();
    this.notebookManager.addXP(lesson.rewardXP);
    this.notebookManager.markLessonCompleted(lesson.id);

    if (this.onLessonComplete) {
      this.onLessonComplete(lesson);
    }
  }
}

window.ACADEMY_LESSONS = ACADEMY_LESSONS;
window.AcademyManager = AcademyManager;
