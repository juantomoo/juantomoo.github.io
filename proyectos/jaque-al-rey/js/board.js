/**
 * board.js - Tablero de Ajedrez de Alta Fidelidad Visual (Luxury Wood & Brass Frame)
 * Tablero unificado con marco de madera grabado, coordenadas en latón dorado y piezas en 512x512
 */

class ChessBoardUI {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign({
      orientation: 'w',
      interactive: true,
      showCoordinates: true,
      onMove: null,
      onSquareClick: null
    }, options);

    this.engine = null;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.lastMove = null;
    this.hintSquares = [];
    this.customOverlays = {};
    this.draggedPiece = null;

    this.initDOM();
  }

  setEngine(engine) {
    this.engine = engine;
    this.render();
  }

  setOrientation(color) {
    this.options.orientation = color;
    this.render();
  }

  initDOM() {
    this.container.innerHTML = '';

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'luxury-board-wrapper';

    this.boardFrame = document.createElement('div');
    this.boardFrame.className = 'luxury-board-frame';

    // Fila superior de coordenadas (A-H)
    this.topFileLabels = document.createElement('div');
    this.topFileLabels.className = 'frame-file-labels top';

    // Fila central: rango izquierdo, grilla 8x8, rango derecho
    this.middleRow = document.createElement('div');
    this.middleRow.className = 'frame-middle-row';

    this.leftRankLabels = document.createElement('div');
    this.leftRankLabels.className = 'frame-rank-labels left';

    this.boardElement = document.createElement('div');
    this.boardElement.className = 'luxury-board-grid';

    this.rightRankLabels = document.createElement('div');
    this.rightRankLabels.className = 'frame-rank-labels right';

    // Fila inferior de coordenadas (A-H)
    this.bottomFileLabels = document.createElement('div');
    this.bottomFileLabels.className = 'frame-file-labels bottom';

    // Capa SVG para flechas de vectores tácticos
    this.svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgOverlay.setAttribute('class', 'luxury-board-svg-overlay');

    // Modal de coronación
    this.promotionModal = document.createElement('div');
    this.promotionModal.className = 'luxury-promotion-modal hidden';

    this.boardElement.appendChild(this.svgOverlay);
    this.boardElement.appendChild(this.promotionModal);

    this.middleRow.appendChild(this.leftRankLabels);
    this.middleRow.appendChild(this.boardElement);
    this.middleRow.appendChild(this.rightRankLabels);

    this.boardFrame.appendChild(this.topFileLabels);
    this.boardFrame.appendChild(this.middleRow);
    this.boardFrame.appendChild(this.bottomFileLabels);

    // 4 Esquinas ornamentales con flora y enredaderas
    ['tl', 'tr', 'bl', 'br'].forEach(c => {
      const cornerEl = document.createElement('div');
      cornerEl.className = `board-corner-bracket ${c}`;
      this.boardFrame.appendChild(cornerEl);
    });

    this.wrapper.appendChild(this.boardFrame);
    this.container.appendChild(this.wrapper);
  }

  renderLabels() {
    const isWhite = this.options.orientation === 'w';
    const files = 'abcdefgh';

    // Etiquetas de columnas (a-h)
    this.topFileLabels.innerHTML = '';
    this.bottomFileLabels.innerHTML = '';
    for (let j = 0; j < 8; j++) {
      const colChar = isWhite ? files[j] : files[7 - j];

      const sTop = document.createElement('span');
      sTop.innerText = colChar;
      this.topFileLabels.appendChild(sTop);

      const sBottom = document.createElement('span');
      sBottom.innerText = colChar;
      this.bottomFileLabels.appendChild(sBottom);
    }

    // Etiquetas de filas (1-8)
    this.leftRankLabels.innerHTML = '';
    this.rightRankLabels.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const r = isWhite ? 8 - i : 1 + i;

      const sLeft = document.createElement('span');
      sLeft.innerText = r;
      this.leftRankLabels.appendChild(sLeft);

      const sRight = document.createElement('span');
      sRight.innerText = r;
      this.rightRankLabels.appendChild(sRight);
    }
  }

  render() {
    if (!this.engine) return;

    this.renderLabels();

    // Limpiar casillas existentes excepto svgOverlay y promotionModal
    const elementsToRemove = this.boardElement.querySelectorAll('.luxury-tile');
    elementsToRemove.forEach(el => el.remove());

    this.clearArrows();

    const isWhite = this.options.orientation === 'w';
    const kingInCheck = this.engine.isCheck(this.engine.turn) ? this.engine.findKing(this.engine.turn) : null;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const r = isWhite ? i : 7 - i;
        const c = isWhite ? j : 7 - j;

        const tile = document.createElement('button');
        tile.type = 'button';
        const isLight = (r + c) % 2 === 0;
        tile.className = `luxury-tile ${isLight ? 'light' : 'dark'}`;
        tile.dataset.row = r;
        tile.dataset.col = c;

        // Selección
        if (this.selectedSquare && this.selectedSquare.row === r && this.selectedSquare.col === c) {
          tile.classList.add('selected');
        }

        // Último movimiento
        if (this.lastMove) {
          if (this.lastMove.from.row === r && this.lastMove.from.col === c) tile.classList.add('last-from');
          if (this.lastMove.to.row === r && this.lastMove.to.col === c) tile.classList.add('last-to');
        }

        // Jaque
        if (kingInCheck && kingInCheck.row === r && kingInCheck.col === c) {
          tile.classList.add('in-check');
        }

        // Pista
        if (this.hintSquares.some(h => h.row === r && h.col === c)) {
          tile.classList.add('hint-highlight');
        }

        // Overlays personalizados (estrellas, trofeos)
        const key = `${r},${c}`;
        if (this.customOverlays[key]) {
          const ov = document.createElement('div');
          ov.className = `tile-overlay-icon ${this.customOverlays[key].class || ''}`;
          ov.innerHTML = this.customOverlays[key].icon || '⭐';
          tile.appendChild(ov);
        }

        // Renderizar pieza pixel art 512x512
        const piece = this.engine.getPiece(r, c);
        if (piece) {
          const img = document.createElement('img');
          img.src = window.PIECE_IMAGES[piece] || '';
          img.alt = piece;
          img.className = 'luxury-piece-img';
          img.draggable = true;
          tile.appendChild(img);

          this.setupDragAndDrop(tile, img, r, c);
        } else {
          this.setupDropTarget(tile, r, c);
        }

        // Indicador de jugada legal (chalk dot / capture ring)
        const isLegal = this.legalMovesForSelected.find(m => m.to.row === r && m.to.col === c);
        if (isLegal) {
          const indicator = document.createElement('div');
          if (piece || isLegal.isEnPassant) {
            indicator.className = 'luxury-indicator capture';
          } else {
            indicator.className = 'luxury-indicator move';
          }
          tile.appendChild(indicator);
        }

        // Event listener permanente para clics
        tile.addEventListener('click', (e) => this.handleTileClick(r, c, e));

        this.boardElement.appendChild(tile);
      }
    }
  }

  handleTileClick(r, c, e) {
    if (!this.options.interactive) return;

    if (this.options.onSquareClick) {
      const handled = this.options.onSquareClick(r, c);
      if (handled) return;
    }

    const clickedPiece = this.engine.getPiece(r, c);

    if (this.selectedSquare) {
      const matched = this.legalMovesForSelected.find(m => m.to.row === r && m.to.col === c);
      if (matched) {
        const movingPiece = this.engine.getPiece(this.selectedSquare.row, this.selectedSquare.col);
        const isPawnPromo = movingPiece && movingPiece[1] === 'p' && (r === 0 || r === 7);

        if (isPawnPromo) {
          this.showPromotionModal(movingPiece[0], (chosen) => {
            matched.promotion = chosen;
            this.executeMove(matched);
          });
        } else {
          this.executeMove(matched);
        }
        return;
      }
    }

    if (clickedPiece && clickedPiece[0] === this.engine.turn) {
      window.soundFx.playSelect();
      this.selectedSquare = { row: r, col: c };
      this.legalMovesForSelected = this.engine.getLegalMoves(r, c);
      this.render();
    } else {
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.render();
    }
  }

  setupDragAndDrop(tileEl, imgEl, r, c) {
    imgEl.addEventListener('dragstart', (e) => {
      if (!this.options.interactive) {
        e.preventDefault();
        return;
      }
      if (this.engine.getPiece(r, c)?.[0] !== this.engine.turn) {
        e.preventDefault();
        return;
      }
      this.draggedPiece = { row: r, col: c };
      this.selectedSquare = { row: r, col: c };
      this.legalMovesForSelected = this.engine.getLegalMoves(r, c);
      e.dataTransfer.setData('text/plain', JSON.stringify({ row: r, col: c }));
    });

    this.setupDropTarget(tileEl, r, c);
  }

  setupDropTarget(tileEl, r, c) {
    tileEl.addEventListener('dragover', (e) => e.preventDefault());

    tileEl.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!this.options.interactive) return;
      if (!this.draggedPiece) return;

      const matched = this.legalMovesForSelected.find(m => m.to.row === r && m.to.col === c);
      if (matched) {
        const movingPiece = this.engine.getPiece(this.draggedPiece.row, this.draggedPiece.col);
        const isPawnPromo = movingPiece && movingPiece[1] === 'p' && (r === 0 || r === 7);

        if (isPawnPromo) {
          this.showPromotionModal(movingPiece[0], (chosen) => {
            matched.promotion = chosen;
            this.executeMove(matched);
          });
        } else {
          this.executeMove(matched);
        }
      }
      this.draggedPiece = null;
    });
  }

  showPromotionModal(color, callback) {
    this.promotionModal.innerHTML = `
      <div class="luxury-promotion-dialog">
        <h3>Coronación Real 👑</h3>
        <p>¡Elige tu nueva pieza!</p>
        <div class="luxury-promo-grid">
          <button type="button" class="luxury-promo-btn" data-piece="q">
            <img src="${window.PIECE_IMAGES[color+'q']}" alt="Reina">
            <span>Reina</span>
          </button>
          <button type="button" class="luxury-promo-btn" data-piece="r">
            <img src="${window.PIECE_IMAGES[color+'r']}" alt="Torre">
            <span>Torre</span>
          </button>
          <button type="button" class="luxury-promo-btn" data-piece="b">
            <img src="${window.PIECE_IMAGES[color+'b']}" alt="Alfil">
            <span>Alfil</span>
          </button>
          <button type="button" class="luxury-promo-btn" data-piece="n">
            <img src="${window.PIECE_IMAGES[color+'n']}" alt="Caballo">
            <span>Caballo</span>
          </button>
        </div>
      </div>
    `;
    this.promotionModal.classList.remove('hidden');

    this.promotionModal.querySelectorAll('.luxury-promo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.piece;
        this.promotionModal.classList.add('hidden');
        callback(p);
      });
    });
  }

  executeMove(move) {
    const isCapture = !!this.engine.getPiece(move.to.row, move.to.col) || move.isEnPassant;
    this.engine.makeMove(move);
    this.lastMove = move;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.hintSquares = [];

    if (this.engine.isCheck(this.engine.turn)) {
      window.soundFx.playCheck();
    } else if (isCapture) {
      window.soundFx.playCapture();
    } else {
      window.soundFx.playMove();
    }

    this.render();

    if (this.options.onMove) {
      this.options.onMove(move, this.engine.getGameStatus());
    }
  }

  setCustomOverlays(overlays) {
    this.customOverlays = overlays || {};
    this.render();
  }

  highlightSquares(squares) {
    this.hintSquares = squares || [];
    this.render();
  }

  drawVectorArrow(fromRow, fromCol, toRow, toCol, color = '#E8B84B') {
    const isWhite = this.options.orientation === 'w';
    const fR = isWhite ? fromRow : 7 - fromRow;
    const fC = isWhite ? fromCol : 7 - fromCol;
    const tR = isWhite ? toRow : 7 - toRow;
    const tC = isWhite ? toCol : 7 - toCol;

    const x1 = (fC + 0.5) * 12.5 + '%';
    const y1 = (fR + 0.5) * 12.5 + '%';
    const x2 = (tC + 0.5) * 12.5 + '%';
    const y2 = (tR + 0.5) * 12.5 + '%';

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '4');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-dasharray', '6,4');

    this.svgOverlay.appendChild(line);
  }

  clearArrows() {
    if (this.svgOverlay) this.svgOverlay.innerHTML = '';
  }
}

window.ChessBoardUI = ChessBoardUI;
