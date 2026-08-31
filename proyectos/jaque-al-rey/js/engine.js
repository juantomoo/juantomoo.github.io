/**
 * engine.js - Motor de Ajedrez Completo y Ligero para Jaque al Rey
 * Soporta validación estricta de movimientos legales, jaque, jaque mate, ahogado,
 * enroque (O-O, O-O-O), captura al paso, coronación de peones, FEN e historial.
 */

class ChessEngine {
  constructor() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 'w';
    this.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
    this.enPassant = null; // { row, col }
    this.halfMoves = 0;
    this.fullMoves = 1;
    this.history = [];
    this.capturedPieces = { w: [], b: [] };
    this.reset();
  }

  reset() {
    this.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  loadFen(fen) {
    const parts = fen.trim().split(/\s+/);
    const rows = parts[0].split('/');
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.capturedPieces = { w: [], b: [] };

    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (/[1-8]/.test(char)) {
          c += parseInt(char, 10);
        } else {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase();
          this.board[r][c] = color + type;
          c++;
        }
      }
    }

    this.turn = parts[1] || 'w';

    const castling = parts[2] || 'KQkq';
    this.castling = {
      w: { k: castling.includes('K'), q: castling.includes('Q') },
      b: { k: castling.includes('k'), q: castling.includes('q') }
    };

    if (parts[3] && parts[3] !== '-') {
      const col = parts[3].charCodeAt(0) - 97;
      const row = 8 - parseInt(parts[3][1], 10);
      this.enPassant = { row, col };
    } else {
      this.enPassant = null;
    }

    this.halfMoves = parseInt(parts[4] || '0', 10);
    this.fullMoves = parseInt(parts[5] || '1', 10);
    this.history = [];
  }

  getPiece(row, col) {
    if (typeof row === 'object' && row !== null) {
      col = row.col;
      row = row.row;
    }
    if (row === undefined || col === undefined || row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row] ? this.board[row][col] : null;
  }

  setPiece(row, col, piece) {
    if (typeof row === 'object' && row !== null) {
      piece = col;
      col = row.col;
      row = row.row;
    }
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      if (this.board[row]) this.board[row][col] = piece;
    }
  }

  pieceColor(piece) {
    return piece ? piece[0] : null;
  }

  pieceType(piece) {
    return piece ? piece[1] : null;
  }

  findKing(color = this.turn) {
    const target = color + 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === target) return { row: r, col: c };
      }
    }
    return null;
  }

  isSquareAttacked(row, col, attackerColor) {
    if (typeof row === 'object' && row !== null) {
      attackerColor = col;
      col = row.col;
      row = row.row;
    }
    if (row === undefined || col === undefined || row < 0 || row >= 8 || col < 0 || col >= 8) return false;
    const enemy = attackerColor;

    // Peones atacantes
    const pawnDir = enemy === 'w' ? 1 : -1;
    for (const dc of [-1, 1]) {
      const pr = row + pawnDir, pc = col + dc;
      if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
        if (this.board[pr][pc] === enemy + 'p') return true;
      }
    }

    // Caballos atacantes
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (this.board[nr][nc] === enemy + 'n') return true;
      }
    }

    // Rey atacante (1 casilla)
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of kingMoves) {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (this.board[nr][nc] === enemy + 'k') return true;
      }
    }

    // Rayos rectilíneos (Torre, Dama)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let nr = row + dr, nc = col + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = this.board[nr][nc];
        if (p) {
          const pColor = this.pieceColor(p);
          const pType = this.pieceType(p);
          if (pColor === enemy && (pType === 'r' || pType === 'q')) return true;
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    // Rayos diagonales (Alfil, Dama)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let nr = row + dr, nc = col + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = this.board[nr][nc];
        if (p) {
          const pColor = this.pieceColor(p);
          const pType = this.pieceType(p);
          if (pColor === enemy && (pType === 'b' || pType === 'q')) return true;
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    return false;
  }

  isCheck(color = this.turn) {
    const king = this.findKing(color);
    if (!king) return false;
    const enemy = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(king.row, king.col, enemy);
  }

  getPseudoMoves(fromRow, fromCol) {
    if (typeof fromRow === 'object' && fromRow !== null) {
      fromCol = fromRow.col;
      fromRow = fromRow.row;
    }
    if (fromRow === undefined || fromCol === undefined || fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8) return [];
    if (!this.board[fromRow]) return [];
    const piece = this.board[fromRow][fromCol];
    if (!piece) return [];

    const moves = [];
    const color = this.pieceColor(piece);
    const type = this.pieceType(piece);
    const enemy = color === 'w' ? 'b' : 'w';

    if (type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const promoRow = color === 'w' ? 0 : 7;

      // Avance simple
      const fwdRow = fromRow + dir;
      if (fwdRow >= 0 && fwdRow < 8 && !this.board[fwdRow][fromCol]) {
        if (fwdRow === promoRow) {
          ['q', 'r', 'b', 'n'].forEach(promo => {
            moves.push({ from: { row: fromRow, col: fromCol }, to: { row: fwdRow, col: fromCol }, promotion: promo });
          });
        } else {
          moves.push({ from: { row: fromRow, col: fromCol }, to: { row: fwdRow, col: fromCol } });
          // Avance doble inicial
          const fwd2Row = fromRow + 2 * dir;
          if (fromRow === startRow && !this.board[fwd2Row][fromCol]) {
            moves.push({ from: { row: fromRow, col: fromCol }, to: { row: fwd2Row, col: fromCol }, isDoublePawn: true });
          }
        }
      }

      // Capturas diagonales
      for (const dc of [-1, 1]) {
        const toCol = fromCol + dc;
        if (toCol >= 0 && toCol < 8 && fwdRow >= 0 && fwdRow < 8) {
          const target = this.board[fwdRow][toCol];
          if (target && this.pieceColor(target) === enemy) {
            if (fwdRow === promoRow) {
              ['q', 'r', 'b', 'n'].forEach(promo => {
                moves.push({ from: { row: fromRow, col: fromCol }, to: { row: fwdRow, col: toCol }, captured: target, promotion: promo });
              });
            } else {
              moves.push({ from: { row: fromRow, col: fromCol }, to: { row: fwdRow, col: toCol }, captured: target });
            }
          }
          // Captura al paso
          if (this.enPassant && this.enPassant.row === fwdRow && this.enPassant.col === toCol) {
            moves.push({
              from: { row: fromRow, col: fromCol },
              to: { row: fwdRow, col: toCol },
              isEnPassant: true,
              captured: enemy + 'p'
            });
          }
        }
      }
    } else if (type === 'n') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of offsets) {
        const tr = fromRow + dr, tc = fromCol + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          const target = this.board[tr][tc];
          if (!target || this.pieceColor(target) === enemy) {
            moves.push({ from: { row: fromRow, col: fromCol }, to: { row: tr, col: tc }, captured: target });
          }
        }
      }
    } else if (type === 'b' || type === 'r' || type === 'q') {
      const dirs = [];
      if (type === 'b' || type === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (type === 'r' || type === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

      for (const [dr, dc] of dirs) {
        let tr = fromRow + dr, tc = fromCol + dc;
        while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          const target = this.board[tr][tc];
          if (!target) {
            moves.push({ from: { row: fromRow, col: fromCol }, to: { row: tr, col: tc } });
          } else {
            if (this.pieceColor(target) === enemy) {
              moves.push({ from: { row: fromRow, col: fromCol }, to: { row: tr, col: tc }, captured: target });
            }
            break;
          }
          tr += dr;
          tc += dc;
        }
      }
    } else if (type === 'k') {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (const [dr, dc] of dirs) {
        const tr = fromRow + dr, tc = fromCol + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          const target = this.board[tr][tc];
          if (!target || this.pieceColor(target) === enemy) {
            moves.push({ from: { row: fromRow, col: fromCol }, to: { row: tr, col: tc }, captured: target });
          }
        }
      }

      // Enroque
      const homeRow = color === 'w' ? 7 : 0;
      if (fromRow === homeRow && fromCol === 4 && !this.isCheck(color)) {
        // Enroque corto (O-O)
        if (this.castling[color].k) {
          if (!this.board[homeRow][5] && !this.board[homeRow][6]) {
            if (!this.isSquareAttacked(homeRow, 5, enemy) && !this.isSquareAttacked(homeRow, 6, enemy)) {
              if (this.board[homeRow][7] === color + 'r') {
                moves.push({
                  from: { row: fromRow, col: fromCol },
                  to: { row: homeRow, col: 6 },
                  isCastling: 'k'
                });
              }
            }
          }
        }
        // Enroque largo (O-O-O)
        if (this.castling[color].q) {
          if (!this.board[homeRow][3] && !this.board[homeRow][2] && !this.board[homeRow][1]) {
            if (!this.isSquareAttacked(homeRow, 3, enemy) && !this.isSquareAttacked(homeRow, 2, enemy)) {
              if (this.board[homeRow][0] === color + 'r') {
                moves.push({
                  from: { row: fromRow, col: fromCol },
                  to: { row: homeRow, col: 2 },
                  isCastling: 'q'
                });
              }
            }
          }
        }
      }
    }

    return moves;
  }

  getLegalMoves(fromRow, fromCol) {
    if (typeof fromRow === 'object' && fromRow !== null) {
      fromCol = fromRow.col;
      fromRow = fromRow.row;
    }
    if (fromRow === undefined || fromCol === undefined || fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8) return [];
    if (!this.board[fromRow]) return [];
    const piece = this.board[fromRow][fromCol];
    if (!piece || this.pieceColor(piece) !== this.turn) return [];

    const pseudo = this.getPseudoMoves(fromRow, fromCol);
    const color = this.pieceColor(piece);

    return pseudo.filter(move => {
      const state = this.makeMove(move, true);
      const isIllegal = this.isCheck(color);
      this.undoMove(state);
      return !isIllegal;
    });
  }

  getAllLegalMoves(color = this.turn) {
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && this.pieceColor(piece) === color) {
          const pseudo = this.getPseudoMoves(r, c);
          for (const move of pseudo) {
            const state = this.makeMove(move, true);
            const isIllegal = this.isCheck(color);
            this.undoMove(state);
            if (!isIllegal) {
              allMoves.push(move);
            }
          }
        }
      }
    }
    return allMoves;
  }

  generateAllLegalMoves(color = this.turn) {
    return this.getAllLegalMoves(color);
  }

  makeMove(move, isHypothetical = false) {
    const { from, to, promotion, isCastling, isEnPassant, isDoublePawn } = move;
    const piece = this.board[from.row][from.col];
    const captured = this.board[to.row][to.col];
    const color = this.pieceColor(piece);
    const type = this.pieceType(piece);

    const state = {
      move,
      piece,
      captured,
      castling: JSON.parse(JSON.stringify(this.castling)),
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfMoves: this.halfMoves,
      fullMoves: this.fullMoves,
      turn: this.turn
    };

    // Mover pieza
    this.board[from.row][from.col] = null;

    if (promotion) {
      this.board[to.row][to.col] = color + promotion;
    } else {
      this.board[to.row][to.col] = piece;
    }

    // Manejar enroque
    if (isCastling === 'k') {
      const rook = this.board[from.row][7];
      this.board[from.row][7] = null;
      this.board[from.row][5] = rook;
    } else if (isCastling === 'q') {
      const rook = this.board[from.row][0];
      this.board[from.row][0] = null;
      this.board[from.row][3] = rook;
    }

    // Manejar captura al paso
    if (isEnPassant) {
      state.enPassantCaptured = this.board[from.row][to.col];
      this.board[from.row][to.col] = null;
    }

    // Actualizar permisos de enroque
    if (type === 'k') {
      this.castling[color].k = false;
      this.castling[color].q = false;
    } else if (type === 'r') {
      if (from.row === 7 && from.col === 7) this.castling.w.k = false;
      if (from.row === 7 && from.col === 0) this.castling.w.q = false;
      if (from.row === 0 && from.col === 7) this.castling.b.k = false;
      if (from.row === 0 && from.col === 0) this.castling.b.q = false;
    }

    if (captured && this.pieceType(captured) === 'r') {
      if (to.row === 7 && to.col === 7) this.castling.w.k = false;
      if (to.row === 7 && to.col === 0) this.castling.w.q = false;
      if (to.row === 0 && to.col === 7) this.castling.b.k = false;
      if (to.row === 0 && to.col === 0) this.castling.b.q = false;
    }

    if (isDoublePawn) {
      this.enPassant = { row: (from.row + to.row) / 2, col: from.col };
    } else {
      this.enPassant = null;
    }

    if (type === 'p' || captured) {
      this.halfMoves = 0;
    } else {
      this.halfMoves++;
    }

    if (this.turn === 'b') {
      this.fullMoves++;
    }

    this.turn = this.turn === 'w' ? 'b' : 'w';

    if (!isHypothetical) {
      if (captured) {
        this.capturedPieces[this.turn === 'w' ? 'b' : 'w'].push(captured);
      } else if (isEnPassant) {
        this.capturedPieces[this.turn === 'w' ? 'b' : 'w'].push(state.enPassantCaptured);
      }
      this.history.push(state);
    }

    return state;
  }

  undoMove(customState = null) {
    const state = customState || this.history.pop();
    if (!state) return false;

    const { move, piece, captured, castling, enPassant, halfMoves, fullMoves, turn } = state;
    const { from, to, isCastling, isEnPassant } = move;

    this.board[from.row][from.col] = piece;
    this.board[to.row][to.col] = captured;

    if (isCastling === 'k') {
      const rook = this.board[from.row][5];
      this.board[from.row][5] = null;
      this.board[from.row][7] = rook;
    } else if (isCastling === 'q') {
      const rook = this.board[from.row][3];
      this.board[from.row][3] = null;
      this.board[from.row][0] = rook;
    }

    if (isEnPassant) {
      this.board[from.row][to.col] = state.enPassantCaptured;
    }

    this.castling = castling;
    this.enPassant = enPassant;
    this.halfMoves = halfMoves;
    this.fullMoves = fullMoves;
    this.turn = turn;

    if (!customState && (captured || isEnPassant)) {
      this.capturedPieces[turn].pop();
    }

    return true;
  }

  getGameStatus() {
    const legalMoves = this.getAllLegalMoves(this.turn);
    const inCheck = this.isCheck(this.turn);

    if (legalMoves.length === 0) {
      if (inCheck) {
        return {
          gameOver: true,
          winner: this.turn === 'w' ? 'b' : 'w',
          reason: 'checkmate',
          message: this.turn === 'w' ? '¡Jaque Mate! Ganan las Negras.' : '¡Jaque Mate! Ganan las Blancas.'
        };
      } else {
        return {
          gameOver: true,
          winner: null,
          reason: 'stalemate',
          message: '¡Rey Ahogado! La partida termina en Tablas.'
        };
      }
    }

    if (this.halfMoves >= 100) {
      return {
        gameOver: true,
        winner: null,
        reason: '50-moves',
        message: 'Tablas por regla de 50 movimientos.'
      };
    }

    if (inCheck) {
      return {
        gameOver: false,
        inCheck: true,
        message: `¡Jaque al Rey ${this.turn === 'w' ? 'Blanco' : 'Negro'}!`
      };
    }

    return {
      gameOver: false,
      inCheck: false
    };
  }
}

window.ChessEngine = ChessEngine;
