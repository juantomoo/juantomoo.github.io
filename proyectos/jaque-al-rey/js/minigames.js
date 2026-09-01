/**
 * minigames.js - Catálogo de Minijuegos y Entrenamiento Neurocognitivo
 * 1. Planificador de Rutas (Come-Estrellas)
 * 2. El Laberinto de la Llama (Saltos en 'L')
 * 3. Space Invaders Táctico (Caza de Invasores)
 * 4. La Lucha de Sumo (Oposición de Reyes en Tablero Reducido)
 */

class MinigamesManager {
  constructor(boardUI, notebookManager, onGameComplete) {
    this.boardUI = boardUI;
    this.notebookManager = notebookManager;
    this.onGameComplete = onGameComplete;

    this.activeGame = null;
    this.moveCount = 0;
    this.starsRemaining = [];
    this.currentPiece = null;
  }

  // 1. Planificador de Rutas (Come-Estrellas)
  startRoutePlanner(pieceType = 'n', level = 1) {
    this.activeGame = 'route_planner';
    this.moveCount = 0;
    this.currentPiece = pieceType;

    const engine = this.boardUI.engine;
    engine.loadFen('8/8/8/8/8/8/8/8 w - - 0 1');

    const startPos = { row: 7, col: 1 };
    engine.setPiece(startPos.row, startPos.col, 'w' + pieceType);
    engine.turn = 'w';

    this.starsRemaining = this.getStarConfigs(pieceType, level);

    const overlays = {};
    this.starsRemaining.forEach(s => {
      overlays[`${s.row},${s.col}`] = { icon: '⭐', class: 'star-item-pulse' };
    });

    this.boardUI.setCustomOverlays(overlays);
    this.boardUI.render();

    return {
      title: "⭐ Planificador de Rutas",
      subtitle: `Recolecta todas las estrellas con tu ${this.getPieceName(pieceType)}.`,
      starCount: this.starsRemaining.length,
      piece: pieceType
    };
  }

  getStarConfigs(pieceType, level) {
    if (pieceType === 'n') {
      return level === 1
        ? [{ row: 5, col: 2 }, { row: 3, col: 3 }, { row: 1, col: 4 }]
        : [{ row: 5, col: 0 }, { row: 3, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 4 }, { row: 4, col: 5 }];
    } else if (pieceType === 'b') {
      return [{ row: 5, col: 3 }, { row: 2, col: 6 }, { row: 0, col: 4 }];
    } else if (pieceType === 'r') {
      return [{ row: 7, col: 6 }, { row: 2, col: 6 }, { row: 2, col: 1 }, { row: 0, col: 1 }];
    } else if (pieceType === 'q') {
      return [{ row: 4, col: 4 }, { row: 1, col: 1 }, { row: 1, col: 7 }, { row: 6, col: 2 }];
    }
    return [{ row: 5, col: 2 }, { row: 3, col: 4 }];
  }

  // 2. El Laberinto de la Llama
  startKnightMaze(level = 1) {
    this.activeGame = 'knight_maze';
    this.moveCount = 0;
    this.currentPiece = 'n';

    const engine = this.boardUI.engine;
    engine.loadFen('8/8/8/8/8/8/8/8 w - - 0 1');

    engine.setPiece(7, 0, 'wn'); // Llama blanca en a1
    engine.turn = 'w';

    this.mazeGoal = { row: 0, col: 7 }; // Cofre dorado en h8

    const obstacles = level === 1
      ? [{ row: 5, col: 1 }, { row: 6, col: 2 }, { row: 4, col: 3 }, { row: 2, col: 5 }, { row: 1, col: 6 }]
      : [{ row: 6, col: 2 }, { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 3, col: 3 }, { row: 2, col: 4 }, { row: 1, col: 6 }];

    obstacles.forEach(obs => {
      engine.setPiece(obs.row, obs.col, 'bp');
    });

    const overlays = {};
    overlays[`${this.mazeGoal.row},${this.mazeGoal.col}`] = { icon: '🏆', class: 'goal-chest-glow' };
    this.boardUI.setCustomOverlays(overlays);
    this.boardUI.render();

    return {
      title: "🦙 El Laberinto de la Llama",
      subtitle: "Llega al Cofre Dorado 🏆 esquivando centinelas usando saltos en 'L'.",
      level
    };
  }

  // 3. Space Invaders Táctico
  startSpaceInvaders() {
    this.activeGame = 'space_invaders';
    this.moveCount = 0;
    this.currentPiece = 'r';

    const engine = this.boardUI.engine;
    engine.loadFen('8/8/2p1p1p1/8/8/8/8/R7 w - - 0 1');
    engine.turn = 'w';

    this.boardUI.setCustomOverlays({});
    this.boardUI.render();

    return {
      title: "👾 Space Invaders Táctico",
      subtitle: "¡Captura a las piezas invasoras con tu Torre antes de que avancen!",
      enemies: 3
    };
  }

  // 4. La Lucha de Sumo (Oposición de Reyes)
  startSumoBattle() {
    this.activeGame = 'sumo_battle';
    this.moveCount = 0;
    this.currentPiece = 'k';

    const engine = this.boardUI.engine;
    engine.loadFen('8/8/8/8/8/8/8/8 w - - 0 1');
    engine.setPiece(6, 4, 'wk'); // Rey blanco en e2
    engine.setPiece(1, 4, 'bk'); // Rey negro en e7
    engine.turn = 'w';

    this.sumoGoal = { row: 3, col: 4 }; // e5 (casilla clave)

    const overlays = {};
    overlays[`${this.sumoGoal.row},${this.sumoGoal.col}`] = { icon: '👑', class: 'goal-chest-glow' };
    this.boardUI.setCustomOverlays(overlays);
    this.boardUI.render();

    return {
      title: "🥊 La Lucha de Reyes",
      subtitle: "Avanza con tu Rey hacia la corona central dominando la oposición.",
      goal: 'Corona Central'
    };
  }

  handleMinigameMove(move) {
    this.moveCount++;
    const counterEl = document.getElementById('mini-moves-counter');
    if (counterEl) counterEl.innerText = this.moveCount;

    if (this.activeGame === 'route_planner') {
      const starIdx = this.starsRemaining.findIndex(s => s.row === move.to.row && s.col === move.to.col);
      if (starIdx !== -1) {
        window.soundFx.playStar();
        this.starsRemaining.splice(starIdx, 1);

        const overlays = {};
        this.starsRemaining.forEach(s => {
          overlays[`${s.row},${s.col}`] = { icon: '⭐', class: 'star-item-pulse' };
        });
        this.boardUI.setCustomOverlays(overlays);

        if (this.starsRemaining.length === 0) {
          window.soundFx.playVictory();
          const xp = Math.max(50, 100 - (this.moveCount * 4));
          this.notebookManager.addXP(xp);
          this.notebookManager.recordMinigameWin('route_planner');

          if (this.onGameComplete) {
            this.onGameComplete({
              game: 'route_planner',
              moves: this.moveCount,
              xp,
              message: `¡Completado en ${this.moveCount} movimientos! (+${xp} XP)`
            });
          }
          return;
        }
      }

      // Mantener el turno de las blancas para permitir movimientos consecutivos
      this.boardUI.engine.turn = 'w';
      this.boardUI.render();

    } else if (this.activeGame === 'knight_maze') {
      if (move.to.row === this.mazeGoal.row && move.to.col === this.mazeGoal.col) {
        window.soundFx.playVictory();
        const xp = 100;
        this.notebookManager.addXP(xp);
        this.notebookManager.recordMinigameWin('knight_maze');

        if (this.onGameComplete) {
          this.onGameComplete({
            game: 'knight_maze',
            moves: this.moveCount,
            xp,
            message: `¡Llegaste al Cofre Dorado con saltos perfectos en ${this.moveCount} jugadas! (+${xp} XP)`
          });
        }
        return;
      }

      // Mantener el turno de las blancas para seguir navegando el laberinto
      this.boardUI.engine.turn = 'w';
      this.boardUI.render();

    } else if (this.activeGame === 'space_invaders') {
      let enemyCount = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = this.boardUI.engine.getPiece(r, c);
          if (p && p[0] === 'b') enemyCount++;
        }
      }

      if (enemyCount === 0) {
        window.soundFx.playVictory();
        const xp = 80;
        this.notebookManager.addXP(xp);
        this.notebookManager.recordMinigameWin('space_invaders');

        if (this.onGameComplete) {
          this.onGameComplete({
            game: 'space_invaders',
            moves: this.moveCount,
            xp,
            message: `¡Invasores neutralizados con éxito! (+${xp} XP)`
          });
        }
      } else {
        setTimeout(() => this.advanceInvaders(), 300);
      }

    } else if (this.activeGame === 'sumo_battle') {
      if (move.to.row === this.sumoGoal.row && move.to.col === this.sumoGoal.col) {
        window.soundFx.playVictory();
        const xp = 90;
        this.notebookManager.addXP(xp);
        this.notebookManager.recordMinigameWin('sumo_battle');

        if (this.onGameComplete) {
          this.onGameComplete({
            game: 'sumo_battle',
            moves: this.moveCount,
            xp,
            message: `¡Dominio total del centro y la oposición! (+${xp} XP)`
          });
        }
        return;
      }

      // Respuesta automática del Rey rival en Sumo
      this.boardUI.options.interactive = false;
      setTimeout(() => {
        const engine = this.boardUI.engine;
        const bkPos = engine.findKing('b');
        if (bkPos) {
          const moves = engine.getLegalMoves(bkPos.row, bkPos.col);
          if (moves.length > 0) {
            // Escoger movimiento hacia la meta o bloqueando
            moves.sort((a, b) => {
              const distA = Math.hypot(a.to.row - this.sumoGoal.row, a.to.col - this.sumoGoal.col);
              const distB = Math.hypot(b.to.row - this.sumoGoal.row, b.to.col - this.sumoGoal.col);
              return distA - distB;
            });
            this.boardUI.executeMove(moves[0], true, () => {
              engine.turn = 'w';
              this.boardUI.options.interactive = true;
            });
            return;
          }
        }
        engine.turn = 'w';
        this.boardUI.options.interactive = true;
        this.boardUI.render();
      }, 500);
    }
  }

  advanceInvaders() {
    const engine = this.boardUI.engine;
    let anyPassed = false;

    for (let r = 6; r >= 0; r--) {
      for (let c = 0; c < 8; c++) {
        const p = engine.getPiece(r, c);
        if (p && p === 'bp') {
          if (!engine.getPiece(r + 1, c)) {
            engine.setPiece(r + 1, c, p);
            engine.setPiece(r, c, null);
            if (r + 1 === 7) anyPassed = true;
          }
        }
      }
    }

    engine.turn = 'w';
    this.boardUI.render();

    if (anyPassed) {
      window.soundFx.playWrong();
      if (this.onGameComplete) {
        this.onGameComplete({
          game: 'space_invaders',
          failed: true,
          message: '¡Un invasor cruzó la línea! Reintenta el desafío.'
        });
      }
    }
  }

  getPieceName(type) {
    const names = { p: 'Peón', n: 'Llama (Caballo)', b: 'Orquídea (Alfil)', r: 'Torre', q: 'Reina', k: 'Rey' };
    return names[type] || 'Pieza';
  }
}

window.MinigamesManager = MinigamesManager;
