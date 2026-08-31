/**
 * puzzles.js - Gimnasio de Puzzles Tácticos para Jaque al Rey
 * Desafíos progresivos con andamiaje de pistas pedagógicas
 */

const CHESS_PUZZLES = [
  {
    id: 1,
    title: "El Beso de la Reina 👑",
    category: "Jaque Mate en 1",
    elo: 600,
    description: "Tu Reina de la Primavera tiene el respaldo de la Orquídea en c4. ¡Asesta el golpe final!",
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: { from: { row: 5, col: 5 }, to: { row: 1, col: 5 } }, // Qxf7#
    hint: "Busca la casilla f7, el punto más vulnerable del Rey rival respaldado por tu Reina y Alfil.",
    explanation: "¡Jaque Mate! La Reina ataca al Rey cara a cara ('el beso') y el Alfil la protege, así que no puede ser capturada.",
    rewardXP: 50
  },
  {
    id: 2,
    title: "El Mate del Pasillo 🏰",
    category: "Jaque Mate en 1",
    elo: 700,
    description: "Los peones rivales encierran a su propio Rey en la octava fila. ¡Aprovecha el pasillo!",
    fen: "6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 0, col: 1 } }, // Rb8#
    hint: "Lleva tu Fortaleza Esmeralda a la última fila rival. Los peones negros le impiden huir.",
    explanation: "¡Mate del pasillo! Como no avanzaron ningún peón de escape ('ventana'), el Rey quedó acorralado.",
    rewardXP: 50
  },
  {
    id: 3,
    title: "El Tenedor de la Llama 🦙",
    category: "Tácticas: Ataque Doble",
    elo: 850,
    description: "¡Ataque doble! Tu Llama Mágica puede amenazar al Rey y a la Torre rival al mismo tiempo.",
    fen: "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
    solution: { from: { row: 3, col: 3 }, to: { row: 1, col: 2 } }, // Nc7+
    hint: "Salta con la Llama a la casilla c7. ¡Atacarás al Rey y a la Torre a la vez!",
    explanation: "¡Tenedor real! El Rey tiene que huir del jaque y en la siguiente jugada capturarás la Torre gratis.",
    rewardXP: 60
  },
  {
    id: 4,
    title: "El Mate Árabe 🌙",
    category: "Jaque Mate en 1",
    elo: 950,
    description: "La Llama y la Torre coordinadas en la esquina del tablero.",
    fen: "7k/5R2/5N2/8/8/8/8/4K3 w - - 0 1",
    solution: { from: { row: 1, col: 5 }, to: { row: 1, col: 7 } }, // Rh7#
    hint: "La Torre blanca puede ir a h7. La Llama en f6 la defenderá y sellará la casilla g8.",
    explanation: "¡Mate Árabe! Uno de los mates más antiguos y elegantes de la historia del ajedrez.",
    rewardXP: 65
  },
  {
    id: 5,
    title: "La Clavada de la Orquídea 🎯",
    category: "Tácticas: Clavada",
    elo: 1050,
    description: "La Reina rival está en la misma diagonal que su Rey. ¡Inmovilízala!",
    fen: "r1b1k2r/pp1q1ppp/8/8/8/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    solution: { from: { row: 7, col: 5 }, to: { row: 3, col: 1 } }, // Bb5
    hint: "Mueve tu Orquídea a b5. Como el Rey está detrás de su Reina, ¡la Reina no puede moverse!",
    explanation: "¡Clavada absoluta! La Reina rival no puede escapar sin dejar a su Rey en jaque ilegal.",
    rewardXP: 70
  },
  {
    id: 6,
    title: "El Doble Ataque del Colibrí 🐤",
    category: "Tácticas: Tenedor",
    elo: 1100,
    description: "Un valiente peón puede poner en apuros a dos gigantes.",
    fen: "4k3/8/8/2r1b3/8/3P4/8/4K3 w - - 0 1",
    solution: { from: { row: 5, col: 3 }, to: { row: 4, col: 3 } }, // d4
    hint: "Avanza tu peón un paso a d4 para amenazar a la Torre de c5 y al Alfil de e5 al mismo tiempo.",
    explanation: "¡Tenedor de peón! Las negras solo pueden salvar una de sus dos piezas valiosas.",
    rewardXP: 65
  },
  {
    id: 7,
    title: "El Mate de la Coz (Asfixiado) 💨",
    category: "Jaque Mate en 1",
    elo: 1200,
    description: "El Rey rival está rodeado por sus propios guardianes. ¡Un salto basta!",
    fen: "6rk/6pp/7N/8/8/8/8/4K3 w - - 0 1",
    solution: { from: { row: 2, col: 7 }, to: { row: 1, col: 5 } }, // Nf7#
    hint: "Salta con tu Llama a f7. ¡El Rey rival está tan encerrado que no tiene a dónde escapar!",
    explanation: "¡Mate de la coz! Las propias piezas rivales le impiden respirar a su Rey.",
    rewardXP: 80
  },
  {
    id: 8,
    title: "La Batería de Primavera ⚡",
    category: "Jaque Mate en 1",
    elo: 1300,
    description: "Torre y Reina alineadas en la columna 'h'. ¡Lanza el ataque frontal!",
    fen: "5rk1/5ppp/8/8/8/8/6PQ/7R w - - 0 1",
    solution: { from: { row: 6, col: 6 }, to: { row: 1, col: 7 } }, // Qxh7#
    hint: "Lleva tu Reina a h7 con captura. Tu Torre en h1 la respalda como un cañón detrás.",
    explanation: "¡Impacto directo! Cuando la Torre respalda a la Reina en la misma columna, forman una batería pesada imparable.",
    rewardXP: 75
  }
];

class PuzzlesManager {
  constructor(boardUI, notebookManager, onPuzzleSolved) {
    this.boardUI = boardUI;
    this.notebookManager = notebookManager;
    this.onPuzzleSolved = onPuzzleSolved;
    this.currentPuzzleIndex = 0;
  }

  loadPuzzle(index) {
    this.currentPuzzleIndex = index;
    const puzzle = CHESS_PUZZLES[index];
    if (!puzzle) return null;

    this.boardUI.engine.loadFen(puzzle.fen);
    this.boardUI.lastMove = null;
    this.boardUI.clearArrows();
    this.boardUI.setCustomOverlays({});
    this.boardUI.render();

    return puzzle;
  }

  showHint() {
    const puzzle = CHESS_PUZZLES[this.currentPuzzleIndex];
    if (!puzzle) return;

    const sol = puzzle.solution;
    this.boardUI.drawVectorArrow(sol.from.row, sol.from.col, sol.to.row, sol.to.col, '#E8B84B');
    this.boardUI.highlightSquares([sol.from, sol.to]);

    return puzzle.hint;
  }

  handlePuzzleMove(move) {
    const puzzle = CHESS_PUZZLES[this.currentPuzzleIndex];
    if (!puzzle) return;

    const sol = puzzle.solution;
    const isCorrect = (move.from.row === sol.from.row && move.from.col === sol.from.col &&
                       move.to.row === sol.to.row && move.to.col === sol.to.col);

    if (isCorrect) {
      window.soundFx.playVictory();
      this.notebookManager.addXP(puzzle.rewardXP);
      this.notebookManager.markPuzzleSolved(puzzle.id);

      if (this.onPuzzleSolved) {
        this.onPuzzleSolved(puzzle, true);
      }
    } else {
      window.soundFx.playWrong();
      this.notebookManager.recordBlindspot(puzzle);

      setTimeout(() => {
        this.boardUI.engine.undoMove();
        this.boardUI.render();
      }, 500);

      if (this.onPuzzleSolved) {
        this.onPuzzleSolved(puzzle, false);
      }
    }
  }
}

window.CHESS_PUZZLES = CHESS_PUZZLES;
window.PuzzlesManager = PuzzlesManager;
