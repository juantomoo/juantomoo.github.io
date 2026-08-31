/**
 * ai.js - Motores de Inteligencia Artificial Adaptativa (AlphaDDA) y Tutor en Vivo
 * Incluye personalidades bot basadas en la fauna andina y motor de andamiaje pedagógico
 * Con soporte para internacionalización en español e inglés.
 */

const PST_SCORES = {
  p: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

const PIECE_VALS = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const BOT_PERSONALITIES = {
  easy: {
    id: 'easy',
    avatarImg: 'bp',
    get name() { return (window.i18n ? window.i18n.getBots().easy.name : '🐤 Pajarito Curioso'); },
    get elo() { return (window.i18n ? window.i18n.getBots().easy.elo : 'Elo ~400 (Principiante)'); },
    get quotes() { return (window.i18n ? window.i18n.getBots().easy.quotes : ['¡Pío!']); }
  },
  medium: {
    id: 'medium',
    avatarImg: 'wn',
    get name() { return (window.i18n ? window.i18n.getBots().medium.name : '🦙 Llama Sabia'); },
    get elo() { return (window.i18n ? window.i18n.getBots().medium.elo : 'Elo ~900 (Intermedio)'); },
    get quotes() { return (window.i18n ? window.i18n.getBots().medium.quotes : ['¡Cuidado con mis saltos!']); }
  },
  hard: {
    id: 'hard',
    avatarImg: 'bn',
    get name() { return (window.i18n ? window.i18n.getBots().hard.name : '🐻 Oso Guardián'); },
    get elo() { return (window.i18n ? window.i18n.getBots().hard.elo : 'Elo ~1400 (Maestro)'); },
    get quotes() { return (window.i18n ? window.i18n.getBots().hard.quotes : ['¡Siente la fuerza de los Andes!']); }
  }
};

class ChessAI {
  constructor(engine) {
    this.engine = engine;
  }

  evaluate(engine) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = engine.getPiece(r, c);
        if (!piece) continue;

        const color = piece[0];
        const type = piece[1];
        const val = PIECE_VALS[type] || 0;
        const pst = (PST_SCORES[type] && PST_SCORES[type][color === 'w' ? r : 7 - r][c]) || 0;
        const total = val + pst;

        if (color === 'w') score += total;
        else score -= total;
      }
    }
    return score;
  }

  minimax(engine, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return { score: this.evaluate(engine), move: null };
    }

    const legalMoves = engine.generateAllLegalMoves(engine.turn);
    if (legalMoves.length === 0) {
      if (engine.isCheck(engine.turn)) {
        return { score: isMaximizing ? -50000 + (3 - depth) : 50000 - (3 - depth), move: null };
      }
      return { score: 0, move: null };
    }

    let bestMove = null;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of legalMoves) {
        const state = engine.makeMove(move, true);
        const result = this.minimax(engine, depth - 1, alpha, beta, false);
        engine.undoMove(state);

        if (result.score > maxScore) {
          maxScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, maxScore);
        if (beta <= alpha) break;
      }
      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;
      for (const move of legalMoves) {
        const state = engine.makeMove(move, true);
        const result = this.minimax(engine, depth - 1, alpha, beta, true);
        engine.undoMove(state);

        if (result.score < minScore) {
          minScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, minScore);
        if (beta <= alpha) break;
      }
      return { score: minScore, move: bestMove };
    }
  }

  getBestMove(botLevel = 'easy', forColor = 'b') {
    const legalMoves = this.engine.generateAllLegalMoves(forColor);
    if (legalMoves.length === 0) return null;

    if (botLevel === 'easy') {
      if (Math.random() < 0.65) {
        const captures = legalMoves.filter(m => m.captured);
        if (captures.length > 0) {
          return captures[Math.floor(Math.random() * captures.length)];
        }
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    if (botLevel === 'medium') {
      if (Math.random() < 0.25) {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
      const result = this.minimax(this.engine, 2, -Infinity, Infinity, forColor === 'w');
      return result.move || legalMoves[0];
    }

    // Hard
    const result = this.minimax(this.engine, 3, -Infinity, Infinity, forColor === 'w');
    return result.move || legalMoves[0];
  }

  getCoachHint(forColor = 'w') {
    const legalMoves = this.engine.generateAllLegalMoves(forColor);
    if (legalMoves.length === 0) return null;

    const isEn = window.i18n && window.i18n.getLang() === 'en';

    // Buscar jaque mate en 1
    for (const move of legalMoves) {
      const state = this.engine.makeMove(move, true);
      const enemyLegal = this.engine.generateAllLegalMoves();
      const inCheck = this.engine.isCheck(this.engine.turn);
      this.engine.undoMove(state);

      if (inCheck && enemyLegal.length === 0) {
        return {
          move,
          explanation: isEn 
            ? 'You have a **Checkmate in 1 move**! Move your piece to that square and claim victory.'
            : '¡Tienes un **Jaque Mate en 1 jugada**! Mueve tu pieza a esa casilla y reclama la victoria.'
        };
      }
    }

    // Buscar capturas libres
    const captures = legalMoves.filter(m => m.captured);
    if (captures.length > 0) {
      captures.sort((a, b) => (PIECE_VALS[b.captured[1]] || 0) - (PIECE_VALS[a.captured[1]] || 0));
      const bestCap = captures[0];
      const name = (window.i18n ? window.i18n.getPieces()[bestCap.captured[1]]?.name : 'pieza') || 'pieza';
      return {
        move: bestCap,
        explanation: isEn
          ? `Tactical opportunity! You can capture the enemy **${name}** and gain material advantage.`
          : `¡Oportunidad táctica! Puedes capturar al **${name}** rival y ganar ventaja de material.`
      };
    }

    // Mejor jugada posicional
    let bestMove = legalMoves[0];
    let bestScore = forColor === 'w' ? -Infinity : Infinity;

    for (const move of legalMoves) {
      const state = this.engine.makeMove(move, true);
      const score = this.evaluate(this.engine);
      this.engine.undoMove(state);

      if (forColor === 'w' ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    const moving = this.engine.getPiece(bestMove.from.row, bestMove.from.col);
    const pieceInfo = (window.i18n ? window.i18n.getPieces()[moving?.[1]]?.name : 'pieza') || 'pieza';

    let reasoning = isEn
      ? `Move your **${pieceInfo}** to control the center and coordinate your army.`
      : `Mueve tu **${pieceInfo}** para controlar el centro y aumentar la armonía de tu ejército.`;

    if (bestMove.isCastling) {
      reasoning = isEn
        ? 'Perform **Castling**! It is the perfect time to safeguard your King in its fortress.'
        : '¡Haz el **Enroque**! Es el momento perfecto para resguardar a tu Rey en su fortaleza.';
    }

    return {
      move: bestMove,
      explanation: reasoning
    };
  }
}

window.BOT_PERSONALITIES = BOT_PERSONALITIES;
window.ChessAI = ChessAI;
