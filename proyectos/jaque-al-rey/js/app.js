/**
 * app.js - Controlador de Pantalla Completa & Sistema de Diálogos Flotantes y Minimizables
 * Totalmente internacionalizado (Español & English).
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Motores Centrales
  const engine = new ChessEngine();
  const notebookManager = new StudyNotebookManager();
  const ai = new ChessAI(engine);

  let currentTab = 'learn';
  let activeBot = 'easy';
  let isAiThinking = false;
  let currentLearnPiece = 'p';
  let currentChapterId = 1;

  // 2. Inicializar Tablero de Ajedrez Majestuoso
  const boardUI = new ChessBoardUI('main-game-board', {
    orientation: 'w',
    interactive: true,
    showCoordinates: true,
    onMove: handleBoardMove
  });
  boardUI.setEngine(engine);

  // 3. Inicializar Gestores de Módulos
  const academyManager = new AcademyManager(boardUI, notebookManager, onLessonFinished);
  const minigamesManager = new MinigamesManager(boardUI, notebookManager, onMinigameFinished);
  const puzzlesManager = new PuzzlesManager(boardUI, notebookManager, onPuzzleFinished);

  // Elementos UI Clave
  const speakerName = document.getElementById('dialogue-speaker-name');
  const avatarBox = document.getElementById('dialogue-avatar-box');
  const textContent = document.getElementById('dialogue-text-content');
  const actionsContainer = document.getElementById('dialogue-actions-container');
  const extraHint = document.getElementById('dialogue-extra-hint');
  const dialogueBox = document.getElementById('floating-dialogue-box');
  const btnMinimizeDialogue = document.getElementById('btn-minimize-dialogue');
  const btnLangToggle = document.getElementById('btn-lang-toggle');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');

  let decksSubTab = 'sets'; // 'sets' | 'terrains'

  // Control de Minimizado / Expansión del Diálogo Flotante
  function toggleDialogue(forceState = null) {
    const shouldExpand = forceState !== null ? forceState : dialogueBox.classList.contains('minimized');
    if (shouldExpand) {
      dialogueBox.classList.remove('minimized');
      btnMinimizeDialogue.innerText = window.i18n ? window.i18n.t('hud.minimize') : '▼ MINIMIZAR';
    } else {
      dialogueBox.classList.add('minimized');
      btnMinimizeDialogue.innerText = window.i18n ? window.i18n.t('hud.expand') : '▲ VER DIÁLOGO';
    }
  }

  btnMinimizeDialogue.addEventListener('click', () => toggleDialogue());

  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      if (window.soundFx) {
        window.soundFx.enabled = !window.soundFx.enabled;
        btnSoundToggle.innerText = window.soundFx.enabled ? '🔊' : '🔇';
        if (window.soundFx.enabled) window.soundFx.playSelect();
      }
    });
  }

  // 4. Sistema de Menú Mochila (Drawer Modal)
  const backpackModal = document.getElementById('backpack-menu-modal');
  const openBackpackBtn = document.getElementById('btn-open-backpack');
  const closeBackpackBtn = document.getElementById('btn-close-backpack');
  const openTrophiesHudBtn = document.getElementById('btn-open-trophies-hud');
  const backpackSubcontent = document.getElementById('backpack-subcontent');
  const modeCards = document.querySelectorAll('.menu-mode-card');

  function updateStaticUI() {
    if (!window.i18n) return;
    const lang = window.i18n.getLang();
    if (btnLangToggle) btnLangToggle.innerText = `🌐 ${lang.toUpperCase()}`;

    // Actualizar títulos de la mochila
    const titleEl = document.getElementById('backpack-sheet-title');
    if (titleEl) titleEl.innerText = window.i18n.t('menu.title');

    const lT = document.getElementById('tab-title-learn');
    const lS = document.getElementById('tab-desc-learn');
    if (lT) lT.innerText = window.i18n.t('menu.learnTitle');
    if (lS) lS.innerText = window.i18n.t('menu.learnSub');

    const mT = document.getElementById('tab-title-minigames');
    const mS = document.getElementById('tab-desc-minigames');
    if (mT) mT.innerText = window.i18n.t('menu.miniTitle');
    if (mS) mS.innerText = window.i18n.t('menu.miniSub');

    const pT = document.getElementById('tab-title-puzzles');
    const pS = document.getElementById('tab-desc-puzzles');
    if (pT) pT.innerText = window.i18n.t('menu.puzzlesTitle');
    if (pS) pS.innerText = window.i18n.t('menu.puzzlesSub');

    const plT = document.getElementById('tab-title-play');
    const plS = document.getElementById('tab-desc-play');
    if (plT) plT.innerText = window.i18n.t('menu.playTitle');
    if (plS) plS.innerText = window.i18n.t('menu.playSub');

    const dT = document.getElementById('tab-title-decks');
    const dS = document.getElementById('tab-desc-decks');
    if (dT) dT.innerText = window.i18n.t('menu.decksTitle');
    if (dS) dS.innerText = window.i18n.t('menu.decksSub');

    const nT = document.getElementById('tab-title-notebook');
    const nS = document.getElementById('tab-desc-notebook');
    if (nT) nT.innerText = window.i18n.t('menu.trophiesTitle');
    if (nS) nS.innerText = window.i18n.t('menu.trophiesSub');

    const bBtn = document.getElementById('btn-open-backpack');
    if (bBtn) bBtn.innerText = window.i18n.t('hud.backpack');

    notebookManager.updateHeaderUI();
  }

  // Escuchar cambios de mazo para actualizar tablero inmediatamente
  if (window.pieceDeckManager) {
    window.pieceDeckManager.onChange(() => {
      boardUI.render();
    });
  }

  if (window.boardThemeManager) {
    window.boardThemeManager.onChange(() => {
      boardUI.render();
    });
  }

  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', () => {
      window.i18n.toggleLang();
      window.soundFx.playSelect();
      updateStaticUI();
      renderBackpackSubcontent();
      switchTab(currentTab, false);
    });
  }

  window.i18n.onLanguageChange(() => {
    updateStaticUI();
  });

  function openBackpack(defaultTab = null) {
    if (defaultTab) switchTab(defaultTab, false);
    renderBackpackSubcontent();
    backpackModal.classList.remove('hidden');
    window.soundFx.playSelect();
  }

  function closeBackpack() {
    backpackModal.classList.add('hidden');
    window.soundFx.playSelect();
  }

  window.openBackpack = openBackpack;
  window.closeBackpack = closeBackpack;

  openBackpackBtn.addEventListener('click', () => openBackpack());
  if (openTrophiesHudBtn) {
    openTrophiesHudBtn.addEventListener('click', () => openBackpack('notebook'));
  }
  closeBackpackBtn.addEventListener('click', closeBackpack);

  backpackModal.addEventListener('click', (e) => {
    if (e.target === backpackModal) closeBackpack();
  });

  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      const tab = card.dataset.tab;
      switchTab(tab, false);
      renderBackpackSubcontent();
    });
  });

  // 5. Cambio de Modo / Mundo
  function switchTab(tabId, shouldCloseBackpack = true) {
    currentTab = tabId;

    if (window.location.hash !== '#' + tabId) {
      history.replaceState(null, null, '#' + tabId);
    }

    modeCards.forEach(card => {
      card.classList.toggle('active', card.dataset.tab === tabId);
    });

    boardUI.clearArrows();
    boardUI.setCustomOverlays({});
    boardUI.options.interactive = true;
    boardUI.options.onSquareClick = null;

    toggleDialogue(true);

    if (tabId === 'learn') {
      academyManager.startLesson(academyManager.currentLessonIndex || 0);
      updateAcademyDialogue();
    } else if (tabId === 'minigames') {
      startMinigame('route_planner', 'n');
    } else if (tabId === 'puzzles') {
      puzzlesManager.loadPuzzle(puzzlesManager.currentPuzzleIndex || 0);
      updatePuzzleDialogue();
    } else if (tabId === 'play') {
      startPlayMatch(activeBot);
    } else if (tabId === 'notebook') {
      updateNotebookDialogue();
    } else if (tabId === 'decks') {
      // Pestaña de Mazos & Terrenos
    }

    notebookManager.updateHeaderUI();
    if (shouldCloseBackpack) closeBackpack();
  }

  // Renderizar Sub-Contenido de la Mochila según el Modo Activo
  function renderBackpackSubcontent() {
    if (!backpackSubcontent) return;
    backpackSubcontent.innerHTML = '';
    const isEn = window.i18n && window.i18n.getLang() === 'en';

    if (currentTab === 'learn') {
      // 1. Selector de Piezas
      const piecePickerEl = document.createElement('div');
      piecePickerEl.innerHTML = `<h4 style="font-family:var(--font-hero); font-size:13px; margin-bottom:6px; color:var(--jungle-canopy);">${window.i18n.t('menu.choosePiece')}</h4>`;
      const grid = document.createElement('div');
      grid.className = 'piece-picker-grid';

      const piecesMeta = window.i18n.getPieces();
      ['p', 'n', 'b', 'r', 'q', 'k'].forEach(type => {
        const meta = piecesMeta[type];
        const chip = document.createElement('div');
        chip.className = `piece-picker-chip piece-white ${currentLearnPiece === type ? 'active' : ''}`;
        chip.innerHTML = `
          <img src="${window.PIECE_IMAGES['w' + type]}" alt="${meta.name}">
          <span>${meta.name.split(' ')[0]}</span>
        `;
        chip.addEventListener('click', () => {
          currentLearnPiece = type;
          renderBackpackSubcontent();
          showPieceDetailModal(type);
        });
        grid.appendChild(chip);
      });
      piecePickerEl.appendChild(grid);
      backpackSubcontent.appendChild(piecePickerEl);

      // 2. Selector de los 10 Cuadernos de Estudio (100 Lecciones)
      const cuadernosTitle = document.createElement('h4');
      cuadernosTitle.style.cssText = 'font-family:var(--font-hero); font-size:13px; margin:10px 0 6px; color:var(--jungle-canopy);';
      cuadernosTitle.innerText = isEn ? '📚 Study Notebooks (100 Lessons):' : '📚 Cuadernos de Estudio (100 Lecciones):';
      backpackSubcontent.appendChild(cuadernosTitle);

      const cuadernosNav = document.createElement('div');
      cuadernosNav.className = 'cuadernos-nav-container';

      const chapterIcons = ['🌱', '🛡️', '⚔️', '👑', '🏰', '🏛️', '⚡', '🏔️', '🌊', '🦅'];
      for (let chId = 1; chId <= 10; chId++) {
        const prog = notebookManager.getChapterProgress(chId);
        const tabBtn = document.createElement('div');
        tabBtn.className = `cuaderno-tab-btn ${currentChapterId === chId ? 'active' : ''}`;
        tabBtn.innerHTML = `
          <span class="cuaderno-tab-icon">${chapterIcons[chId - 1]}</span>
          <span class="cuaderno-tab-label">C${chId}</span>
          <span class="cuaderno-tab-badge">${prog.completed}/10</span>
        `;
        tabBtn.addEventListener('click', () => {
          currentChapterId = chId;
          window.soundFx.playSelect();
          renderBackpackSubcontent();
        });
        cuadernosNav.appendChild(tabBtn);
      }
      backpackSubcontent.appendChild(cuadernosNav);

      // 3. Banner del Cuaderno Seleccionado
      const allLessons = window.i18n.getLessons();
      const chapterLessons = allLessons.filter(l => l.chapterId === currentChapterId);
      const chMeta = chapterLessons[0] || {};
      const chProg = notebookManager.getChapterProgress(currentChapterId);

      const chapterBanner = document.createElement('div');
      chapterBanner.className = 'cuaderno-chapter-banner';
      chapterBanner.innerHTML = `
        <div class="cuaderno-banner-info">
          <h4>${chMeta.chapterTitle || `Cuaderno ${currentChapterId}`}</h4>
          <p>${isEn ? '10 progressive master lessons' : '10 lecciones pedagógicas maestras'}</p>
        </div>
        <div class="cuaderno-progress-pill">
          ${chProg.completed}/10 (${chProg.percent}%)
        </div>
      `;
      backpackSubcontent.appendChild(chapterBanner);

      // 4. Lista de 10 Lecciones del Cuaderno Activo
      chapterLessons.forEach((lesson) => {
        const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
        const isDone = notebookManager.data.completedLessons.includes(lesson.id);
        const isCur = academyManager.currentLessonIndex === globalIndex;
        const item = document.createElement('div');
        item.className = `sub-list-item ${isCur ? 'active' : ''} ${isDone ? 'done' : ''}`;
        item.innerHTML = `
          <span style="font-size:1.2rem;">${isDone ? '✅' : '📖'}</span>
          <div style="flex:1;">
            <div style="font-family:var(--font-hero); font-weight:800; font-size:13px;">${lesson.title}</div>
            <div style="font-size:11px; color:#556B63;">${lesson.subtitle}</div>
          </div>
          <span style="font-family:var(--font-mono-stats); font-weight:800; font-size:11.5px; color:var(--gold-amber);">+${lesson.rewardXP} XP</span>
        `;
        item.addEventListener('click', () => {
          academyManager.startLesson(globalIndex);
          updateAcademyDialogue();
          closeBackpack();
        });
        backpackSubcontent.appendChild(item);
      });

    } else if (currentTab === 'minigames') {
      const title = document.createElement('h4');
      title.style.cssText = 'font-family:var(--font-hero); font-size:13px; margin-bottom:8px; color:var(--jungle-canopy);';
      title.innerText = window.i18n.t('menu.chooseMinigame');
      backpackSubcontent.appendChild(title);

      const mg = window.i18n.getMinigames();
      const minigameOptions = [
        { game: 'route_planner', piece: 'n', icon: '⭐', name: mg.routePlanner.title, desc: mg.routePlanner.subtitle },
        { game: 'knight_maze', piece: 'n', icon: '🦙', name: mg.knightMaze.title, desc: mg.knightMaze.subtitle },
        { game: 'space_invaders', piece: 'r', icon: '👾', name: mg.spaceInvaders.title, desc: mg.spaceInvaders.subtitle },
        { game: 'sumo_battle', piece: 'k', icon: '🥊', name: mg.sumoBattle.title, desc: mg.sumoBattle.subtitle }
      ];

      minigameOptions.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'sub-list-item';
        item.innerHTML = `
          <span style="font-size:1.4rem;">${opt.icon}</span>
          <div style="flex:1;">
            <div style="font-family:var(--font-hero); font-weight:800; font-size:13px;">${opt.name}</div>
            <div style="font-size:11px; color:#556B63;">${opt.desc}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          startMinigame(opt.game, opt.piece);
          closeBackpack();
        });
        backpackSubcontent.appendChild(item);
      });

    } else if (currentTab === 'puzzles') {
      const title = document.createElement('h4');
      title.style.cssText = 'font-family:var(--font-hero); font-size:13px; margin-bottom:8px; color:var(--jungle-canopy);';
      title.innerText = window.i18n.t('menu.choosePuzzle');
      backpackSubcontent.appendChild(title);

      const puzzles = window.i18n.getPuzzles();
      puzzles.forEach((puzzle, index) => {
        const isDone = notebookManager.data.solvedPuzzles.includes(puzzle.id);
        const isCur = puzzlesManager.currentPuzzleIndex === index;
        const item = document.createElement('div');
        item.className = `sub-list-item ${isCur ? 'active' : ''} ${isDone ? 'done' : ''}`;
        item.innerHTML = `
          <span style="font-size:1.2rem;">${isDone ? '🏆' : '🧩'}</span>
          <div style="flex:1;">
            <div style="font-family:var(--font-hero); font-weight:800; font-size:13px;">${puzzle.title}</div>
            <div style="font-size:11px; color:#556B63;">${puzzle.category}</div>
          </div>
          <span style="font-family:var(--font-mono-stats); font-weight:800; font-size:11.5px; color:var(--gold-amber);">+${CHESS_PUZZLES[index].rewardXP} XP</span>
        `;
        item.addEventListener('click', () => {
          puzzlesManager.loadPuzzle(index);
          updatePuzzleDialogue();
          closeBackpack();
        });
        backpackSubcontent.appendChild(item);
      });

    } else if (currentTab === 'play') {
      const title = document.createElement('h4');
      title.style.cssText = 'font-family:var(--font-hero); font-size:13px; margin-bottom:8px; color:var(--jungle-canopy);';
      title.innerText = window.i18n.t('menu.chooseBot');
      backpackSubcontent.appendChild(title);

      const bots = window.i18n.getBots();
      ['easy', 'medium', 'hard'].forEach(botKey => {
        const bot = bots[botKey];
        const avatar = BOT_PERSONALITIES[botKey].avatarImg;
        const isCur = activeBot === botKey;
        const item = document.createElement('div');
        item.className = `sub-list-item ${isCur ? 'active' : ''}`;
        item.innerHTML = `
          <img src="${window.PIECE_IMAGES[avatar]}" style="width:36px; height:36px; object-fit:contain; image-rendering:pixelated;" alt="${bot.name}">
          <div style="flex:1;">
            <div style="font-family:var(--font-hero); font-weight:800; font-size:13px;">${bot.name}</div>
            <div style="font-size:11px; color:#556B63;">${bot.elo}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          startPlayMatch(botKey);
          closeBackpack();
        });
        backpackSubcontent.appendChild(item);
      });

    } else if (currentTab === 'notebook') {
      const rank = notebookManager.getCurrentRank();
      const rankBox = document.createElement('div');
      rankBox.className = 'backpack-rank-box';
      rankBox.innerHTML = `
        <div class="backpack-rank-badge-icon">${rank.badge}</div>
        <div class="backpack-rank-meta">
          <div class="backpack-rank-title">${rank.title}</div>
          <div class="backpack-rank-xp">${window.i18n.t('dialogues.accumulatedXP')}: <strong>${notebookManager.data.xp} XP</strong></div>
        </div>
      `;
      backpackSubcontent.appendChild(rankBox);

      const medalsTitle = document.createElement('h4');
      medalsTitle.className = 'backpack-section-title';
      medalsTitle.innerText = `🏅 ${window.i18n.t('menu.trophiesTitle')}:`;
      backpackSubcontent.appendChild(medalsTitle);

      const medalsGrid = document.createElement('div');
      medalsGrid.className = 'backpack-medals-grid';

      const medals = window.i18n.getMedals();
      medals.forEach(m => {
        const isUnlocked = notebookManager.data.unlockedMedals.includes(m.id);
        const card = document.createElement('div');
        card.className = `backpack-medal-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <span class="backpack-medal-icon">${m.icon}</span>
          <div class="backpack-medal-meta">
            <div class="backpack-medal-name">${m.name}</div>
            <div class="backpack-medal-status">${isUnlocked ? window.i18n.t('menu.unlocked') : window.i18n.t('menu.locked')}</div>
          </div>
        `;
        medalsGrid.appendChild(card);
      });
      backpackSubcontent.appendChild(medalsGrid);

    } else if (currentTab === 'decks') {
      const isEn = window.i18n.getLang() === 'en';

      // ── BARRA DE SUB-PESTAÑAS (SETS / TERRENOS) ──
      const subTabBar = document.createElement('div');
      subTabBar.className = 'decks-subtab-bar';
      subTabBar.innerHTML = `
        <button type="button" class="decks-subtab-btn ${decksSubTab === 'sets' ? 'active' : ''}" id="btn-subtab-sets">
          ${window.i18n.t('menu.tabSets') || '🎴 Sets de Fichas'}
        </button>
        <button type="button" class="decks-subtab-btn ${decksSubTab === 'terrains' ? 'active' : ''}" id="btn-subtab-terrains">
          ${window.i18n.t('menu.tabTerrains') || '🗺️ Terrenos de Tablero'}
        </button>
      `;
      backpackSubcontent.appendChild(subTabBar);

      subTabBar.querySelector('#btn-subtab-sets').addEventListener('click', () => {
        decksSubTab = 'sets';
        window.soundFx.playSelect();
        renderBackpackSubcontent();
      });
      subTabBar.querySelector('#btn-subtab-terrains').addEventListener('click', () => {
        decksSubTab = 'terrains';
        window.soundFx.playSelect();
        renderBackpackSubcontent();
      });

      if (decksSubTab === 'sets') {
        // ── 1. SETS DE FICHAS ──
        const title = document.createElement('h4');
        title.className = 'backpack-section-title';
        title.innerText = window.i18n.t('menu.chooseDeck') || '🎴 Elige tu Set de Piezas (Mazo):';
        backpackSubcontent.appendChild(title);

        const decksContainer = document.createElement('div');
        decksContainer.className = 'decks-container';

        const activeDeckId = window.pieceDeckManager.currentDeckId;

        // Renderizar Mazos Predefinidos
        const deckKeys = ['classic', 'paramo', 'selva', 'mistico'];
        deckKeys.forEach(dKey => {
          const deck = window.PIECE_DECKS[dKey];
          const isActive = activeDeckId === dKey;

          const card = document.createElement('div');
          card.className = `deck-card ${isActive ? 'active' : ''}`;

          const name = isEn ? deck.nameEn : deck.nameEs;
          const desc = isEn ? deck.descEn : deck.descEs;

          card.innerHTML = `
            <div class="deck-card-header">
              <span class="deck-card-title">🎴 ${name}</span>
              ${isActive ? `<span class="deck-badge-active">⭐ ${window.i18n.t('menu.activeDeck') || 'ACTIVO'}</span>` : ''}
            </div>
            <div class="deck-card-desc">${desc}</div>
            <div class="deck-pieces-preview-row">
              <div class="deck-preview-slot piece-white"><img src="${window.PIECE_CATALOG[deck.pieces.wp].img}" title="Peón Blanco"></div>
              <div class="deck-preview-slot piece-white"><img src="${window.PIECE_CATALOG[deck.pieces.wn].img}" title="Caballo Blanco"></div>
              <div class="deck-preview-slot piece-white"><img src="${window.PIECE_CATALOG[deck.pieces.wb].img}" title="Alfil Blanco"></div>
              <div class="deck-preview-slot piece-white"><img src="${window.PIECE_CATALOG[deck.pieces.wr].img}" title="Torre Blanca"></div>
              <div class="deck-preview-slot piece-white"><img src="${window.PIECE_CATALOG[deck.pieces.wq].img}" title="Dama Blanca"></div>
              <div class="deck-preview-slot piece-white"><img src="${window.PIECE_CATALOG[deck.pieces.wk].img}" title="Rey Blanco"></div>
              <div style="width:2px; height:28px; background:var(--brass); margin:0 4px; opacity:0.5;"></div>
              <div class="deck-preview-slot piece-black"><img src="${window.PIECE_CATALOG[deck.pieces.bp].img}" title="Peón Negro"></div>
              <div class="deck-preview-slot piece-black"><img src="${window.PIECE_CATALOG[deck.pieces.bn].img}" title="Caballo Negro"></div>
              <div class="deck-preview-slot piece-black"><img src="${window.PIECE_CATALOG[deck.pieces.bb].img}" title="Alfil Negro"></div>
              <div class="deck-preview-slot piece-black"><img src="${window.PIECE_CATALOG[deck.pieces.br].img}" title="Torre Negra"></div>
              <div class="deck-preview-slot piece-black"><img src="${window.PIECE_CATALOG[deck.pieces.bq].img}" title="Dama Negra"></div>
              <div class="deck-preview-slot piece-black"><img src="${window.PIECE_CATALOG[deck.pieces.bk].img}" title="Rey Negro"></div>
            </div>
            <div class="deck-actions-row">
              <button type="button" class="btn-game-tablet ${isActive ? 'gold' : 'emerald'} btn-select-deck">
                ${isActive ? '✓ ' + (window.i18n.t('menu.activeDeck') || 'ACTIVO') : '⚡ ' + (window.i18n.t('menu.useDeck') || 'USAR ESTE MAZO')}
              </button>
            </div>
          `;

          card.querySelector('.btn-select-deck').addEventListener('click', (e) => {
            e.stopPropagation();
            window.pieceDeckManager.setDeck(dKey);
            window.soundFx.playSelect();
            renderBackpackSubcontent();
          });

          decksContainer.appendChild(card);
        });

        // Mazo Personalizado (Deck Builder)
        const customCard = document.createElement('div');
        const isCustomActive = activeDeckId === 'custom';
        customCard.className = `deck-card ${isCustomActive ? 'active' : ''}`;
        customCard.innerHTML = `
          <div class="deck-card-header">
            <span class="deck-card-title">🎨 ${window.i18n.t('menu.customDeckTitle') || 'Mazo Personalizado'}</span>
            ${isCustomActive ? `<span class="deck-badge-active">⭐ ${window.i18n.t('menu.activeDeck') || 'ACTIVO'}</span>` : ''}
          </div>
          <div class="deck-card-desc">${isEn ? 'Choose each piece individually from the entire Andean catalog!' : '¡Elige cada ficha individualmente de todo el catálogo andino!'}</div>
        `;

        const builderPanel = document.createElement('div');
        builderPanel.className = 'custom-deck-builder-panel';

        // Ranuras Blancas
        const whiteTitle = document.createElement('div');
        whiteTitle.className = 'custom-deck-color-title';
        whiteTitle.innerHTML = `☀️ <strong>${window.i18n.t('menu.whitePieces') || 'Piezas Blancas (Luz)'}:</strong>`;
        builderPanel.appendChild(whiteTitle);

        const whiteGrid = document.createElement('div');
        whiteGrid.className = 'custom-slots-grid';
        ['wp', 'wn', 'wb', 'wr', 'wq', 'wk'].forEach(slot => {
          const currentCatId = window.pieceDeckManager.customDeck[slot] || window.PIECE_DECKS.classic.pieces[slot];
          const meta = window.PIECE_CATALOG[currentCatId];
          const slotEl = document.createElement('div');
          slotEl.className = 'custom-slot-card piece-white';
          slotEl.innerHTML = `
            <img src="${meta ? meta.img : ''}" alt="${slot}">
            <span>${meta ? (isEn ? meta.nameEn : meta.nameEs).split(' ')[0] : slot}</span>
          `;
          slotEl.addEventListener('click', () => showPieceCatalogPicker(slot));
          whiteGrid.appendChild(slotEl);
        });
        builderPanel.appendChild(whiteGrid);

        // Ranuras Negras
        const blackTitle = document.createElement('div');
        blackTitle.className = 'custom-deck-color-title';
        blackTitle.style.marginTop = '8px';
        blackTitle.innerHTML = `🌙 <strong>${window.i18n.t('menu.blackPieces') || 'Piezas Negras (Sombra)'}:</strong>`;
        builderPanel.appendChild(blackTitle);

        const blackGrid = document.createElement('div');
        blackGrid.className = 'custom-slots-grid';
        ['bp', 'bn', 'bb', 'br', 'bq', 'bk'].forEach(slot => {
          const currentCatId = window.pieceDeckManager.customDeck[slot] || window.PIECE_DECKS.classic.pieces[slot];
          const meta = window.PIECE_CATALOG[currentCatId];
          const slotEl = document.createElement('div');
          slotEl.className = 'custom-slot-card piece-black';
          slotEl.innerHTML = `
            <img src="${meta ? meta.img : ''}" alt="${slot}">
            <span>${meta ? (isEn ? meta.nameEn : meta.nameEs).split(' ')[0] : slot}</span>
          `;
          slotEl.addEventListener('click', () => showPieceCatalogPicker(slot));
          blackGrid.appendChild(slotEl);
        });
        builderPanel.appendChild(blackGrid);

        customCard.appendChild(builderPanel);
        decksContainer.appendChild(customCard);
        backpackSubcontent.appendChild(decksContainer);

      } else {
        // ── 2. TERRENOS DE TABLERO ──
        const title = document.createElement('h4');
        title.className = 'backpack-section-title';
        title.innerText = window.i18n.t('menu.chooseBoardPreset') || '🗺️ Preajustes de Terreno:';
        backpackSubcontent.appendChild(title);

        const presetsGrid = document.createElement('div');
        presetsGrid.className = 'terrain-presets-grid';

        const activePreset = window.boardThemeManager.currentPresetId;
        const curLight = window.boardThemeManager.currentLightTile;
        const curDark = window.boardThemeManager.currentDarkTile;

        Object.values(window.BOARD_PRESETS).forEach(preset => {
          const isActive = activePreset === preset.id || (curLight === preset.light && curDark === preset.dark);
          const pName = isEn ? preset.nameEn : preset.nameEs;
          const pDesc = isEn ? preset.descEn : preset.descEs;
          const lightMeta = window.LIGHT_TILES[preset.light];
          const darkMeta = window.DARK_TILES[preset.dark];

          const pCard = document.createElement('div');
          pCard.className = `terrain-preset-card ${isActive ? 'active' : ''}`;
          pCard.innerHTML = `
            <div class="terrain-mini-checker">
              <div class="terrain-mini-cell" style="background-image:url('${lightMeta.img}'); background-color:${lightMeta.color}"></div>
              <div class="terrain-mini-cell" style="background-image:url('${darkMeta.img}'); background-color:${darkMeta.color}"></div>
              <div class="terrain-mini-cell" style="background-image:url('${darkMeta.img}'); background-color:${darkMeta.color}"></div>
              <div class="terrain-mini-cell" style="background-image:url('${lightMeta.img}'); background-color:${lightMeta.color}"></div>
            </div>
            <div class="terrain-card-info">
              <div class="terrain-card-title">
                <span>${pName}</span>
                ${isActive ? `<span class="deck-badge-active">⭐ ${window.i18n.t('menu.activeBoard') || 'ACTIVO'}</span>` : ''}
              </div>
              <div class="terrain-card-desc">${pDesc}</div>
            </div>
          `;

          pCard.addEventListener('click', () => {
            window.boardThemeManager.setPreset(preset.id);
            window.soundFx.playSelect();
            renderBackpackSubcontent();
          });

          presetsGrid.appendChild(pCard);
        });
        backpackSubcontent.appendChild(presetsGrid);

        // Panel de Personalización Independiente Casilla por Casilla
        const customTilePanel = document.createElement('div');
        customTilePanel.className = 'tile-customizer-panel';

        // 1. Selector de Casillas Claras
        const lightGroup = document.createElement('div');
        lightGroup.className = 'tile-picker-group';
        lightGroup.innerHTML = `<div class="tile-group-title">☀️ <strong>${window.i18n.t('menu.lightTilesTitle') || 'Casillas Claras (Luz)'}:</strong></div>`;

        const lightChoices = document.createElement('div');
        lightChoices.className = 'tile-choices-grid';
        Object.values(window.LIGHT_TILES).forEach(tile => {
          const isSelected = curLight === tile.id;
          const name = isEn ? tile.nameEn : tile.nameEs;
          const chip = document.createElement('div');
          chip.className = `tile-choice-chip ${isSelected ? 'active' : ''}`;
          chip.innerHTML = `
            <div class="tile-chip-sample" style="background-image:url('${tile.img}'); background-color:${tile.color}"></div>
            <span class="tile-chip-label">${name}</span>
          `;
          chip.addEventListener('click', () => {
            window.boardThemeManager.setLightTile(tile.id);
            window.soundFx.playSelect();
            renderBackpackSubcontent();
          });
          lightChoices.appendChild(chip);
        });
        lightGroup.appendChild(lightChoices);
        customTilePanel.appendChild(lightGroup);

        // 2. Selector de Casillas Oscuras
        const darkGroup = document.createElement('div');
        darkGroup.className = 'tile-picker-group';
        darkGroup.style.marginTop = '6px';
        darkGroup.innerHTML = `<div class="tile-group-title">🌙 <strong>${window.i18n.t('menu.darkTilesTitle') || 'Casillas Oscuras (Sombra)'}:</strong></div>`;

        const darkChoices = document.createElement('div');
        darkChoices.className = 'tile-choices-grid';
        Object.values(window.DARK_TILES).forEach(tile => {
          const isSelected = curDark === tile.id;
          const name = isEn ? tile.nameEn : tile.nameEs;
          const chip = document.createElement('div');
          chip.className = `tile-choice-chip ${isSelected ? 'active' : ''}`;
          chip.innerHTML = `
            <div class="tile-chip-sample" style="background-image:url('${tile.img}'); background-color:${tile.color}"></div>
            <span class="tile-chip-label">${name}</span>
          `;
          chip.addEventListener('click', () => {
            window.boardThemeManager.setDarkTile(tile.id);
            window.soundFx.playSelect();
            renderBackpackSubcontent();
          });
          darkChoices.appendChild(chip);
        });
        darkGroup.appendChild(darkChoices);
        customTilePanel.appendChild(darkGroup);

        backpackSubcontent.appendChild(customTilePanel);
      }
    }
  }

  // 6. Manejador Central de Movimientos
  function handleBoardMove(move, gameStatus) {
    if (currentTab === 'learn') {
      academyManager.handleLessonMove(move);
    } else if (currentTab === 'minigames') {
      minigamesManager.handleMinigameMove(move);
    } else if (currentTab === 'puzzles') {
      puzzlesManager.handlePuzzleMove(move);
    } else if (currentTab === 'play') {
      handlePlayMatchMove(move, gameStatus);
    }
  }

  // ==========================================
  // DIÁLOGOS SECUENCIALES: MUNDO 1 (ACADEMIA)
  // ==========================================
  function updateAcademyDialogue() {
    const lessons = window.i18n.getLessons();
    const lesson = lessons[academyManager.currentLessonIndex];
    if (!lesson) return;

    speakerName.innerText = window.i18n.t('speaker.owl');
    avatarBox.innerHTML = '🦉';
    textContent.innerHTML = lesson.dialogue.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    extraHint.innerHTML = `🎯 ` + lesson.instruction.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet emerald" id="btn-open-lesson-picker">${window.i18n.t('actions.lessons')}</button>
    `;

    document.getElementById('btn-open-lesson-picker').onclick = () => openBackpack('learn');
  }

  function onLessonFinished(rawLesson) {
    notebookManager.triggerConfetti();
    toggleDialogue(true);
    speakerName.innerText = window.i18n.t('speaker.owl');
    avatarBox.innerHTML = '🦉';

    const lessons = window.i18n.getLessons();
    const localizedLesson = lessons[academyManager.currentLessonIndex] || rawLesson;

    textContent.innerHTML = `${window.i18n.t('dialogues.missionAccomplished')} ${localizedLesson.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}`;

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet gold" id="btn-next-lesson-step">
        ${window.i18n.t('actions.nextStep')}
      </button>
    `;

    document.getElementById('btn-next-lesson-step').onclick = () => {
      const allLessons = window.i18n.getLessons();
      const nextIdx = academyManager.currentLessonIndex + 1;
      if (nextIdx < allLessons.length) {
        currentChapterId = Math.ceil((nextIdx + 1) / 10);
        academyManager.startLesson(nextIdx);
        updateAcademyDialogue();
      } else {
        alert(window.i18n.t('dialogues.allLessonsComplete'));
        openBackpack('notebook');
      }
    };
  }

  function showPieceDetailModal(type) {
    const meta = window.i18n.getPieces()[type];
    const valRaw = window.PIECE_META[type].value;
    const valText = type === 'k' 
      ? window.i18n.t('menu.invaluable') 
      : `${valRaw} ${valRaw === 1 ? window.i18n.t('menu.point') : window.i18n.t('menu.points')}`;

    const whiteLabel = window.i18n.getLang() === 'en' ? 'White' : 'Blancas';
    const blackLabel = window.i18n.getLang() === 'en' ? 'Black' : 'Negras';

    speakerName.innerText = meta.name;
    avatarBox.innerHTML = `<img src="${window.PIECE_IMAGES['w' + type]}" alt="${meta.name}">`;
    textContent.innerHTML = `
      <strong>${meta.whiteName}</strong> (${whiteLabel}) / <strong>${meta.blackName}</strong> (${blackLabel}) — <span style="background:var(--gold-sun); color:#12211C; padding:1px 6px; border-radius:999px; font-weight:800; font-size:11px;">${valText}</span><br>
      ${meta.desc}<br>
      💡 <em>${meta.fact}</em>
    `;

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet emerald" onclick="document.getElementById('backpack-menu-modal').classList.add('hidden')">
        ${window.i18n.t('menu.tryOnBoard')}
      </button>
    `;
  }

  function showPieceCatalogPicker(slot) {
    const isEn = window.i18n.getLang() === 'en';
    const pieces = window.pieceDeckManager.getAvailablePiecesForSlot(slot);
    if (!pieces || pieces.length === 0) return;

    const overlay = document.createElement('div');
    overlay.className = 'piece-catalog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'piece-catalog-dialog';

    const slotTitle = slot[0] === 'w' 
      ? (isEn ? 'Choose White Piece' : 'Elige Pieza Blanca') 
      : (isEn ? 'Choose Black Piece' : 'Elige Pieza Negra');

    dialog.innerHTML = `
      <div class="piece-catalog-header">
        <h3>🎴 ${slotTitle}</h3>
        <button type="button" class="btn-close-sheet" id="btn-close-catalog-modal">✕</button>
      </div>
      <div class="catalog-pieces-grid" id="catalog-pieces-list"></div>
    `;

    const listEl = dialog.querySelector('#catalog-pieces-list');
    pieces.forEach(p => {
      const card = document.createElement('div');
      card.className = 'catalog-piece-card';
      const name = isEn ? p.nameEn : p.nameEs;
      const desc = isEn ? p.descEn : p.descEs;
      card.innerHTML = `
        <img src="${p.img}" alt="${name}">
        <div class="catalog-piece-info">
          <h4>${name}</h4>
          <p>${desc}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        window.pieceDeckManager.setCustomPiece(slot, p.id);
        window.soundFx.playSelect();
        boardUI.render();
        renderBackpackSubcontent();
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      });
      listEl.appendChild(card);
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.querySelector('#btn-close-catalog-modal').onclick = () => {
      if (document.body.contains(overlay)) document.body.removeChild(overlay);
    };
    overlay.onclick = (e) => {
      if (e.target === overlay && document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    };
  }

  window.showPieceCatalogPicker = showPieceCatalogPicker;

  // ==========================================
  // DIÁLOGOS SECUENCIALES: MUNDO 2 (MINIJUEGOS)
  // ==========================================
  function startMinigame(gameType, piece = 'n') {
    let info;
    if (gameType === 'route_planner') {
      info = minigamesManager.startRoutePlanner(piece, 1);
    } else if (gameType === 'knight_maze') {
      info = minigamesManager.startKnightMaze(1);
    } else if (gameType === 'space_invaders') {
      info = minigamesManager.startSpaceInvaders();
    } else if (gameType === 'sumo_battle') {
      info = minigamesManager.startSumoBattle();
    }

    const mg = window.i18n.getMinigames();
    let title = info.title;
    let subtitle = info.subtitle;

    if (gameType === 'route_planner') { title = mg.routePlanner.title; subtitle = mg.routePlanner.subtitle; }
    else if (gameType === 'knight_maze') { title = mg.knightMaze.title; subtitle = mg.knightMaze.subtitle; }
    else if (gameType === 'space_invaders') { title = mg.spaceInvaders.title; subtitle = mg.spaceInvaders.subtitle; }
    else if (gameType === 'sumo_battle') { title = mg.sumoBattle.title; subtitle = mg.sumoBattle.subtitle; }

    speakerName.innerText = window.i18n.t('speaker.jungleTraining');
    avatarBox.innerHTML = '⭐';
    textContent.innerHTML = `<strong>${title}</strong><br>${subtitle}`;
    extraHint.innerHTML = `${window.i18n.t('dialogues.movesCount')} <strong id="mini-moves-counter">0</strong>`;

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet emerald" id="btn-change-minigame">${window.i18n.t('actions.otherGame')}</button>
    `;

    document.getElementById('btn-change-minigame').onclick = () => openBackpack('minigames');
  }

  function onMinigameFinished(result) {
    toggleDialogue(true);
    const mg = window.i18n.getMinigames();
    let localizedMsg = result.message;

    if (result.game === 'route_planner') {
      localizedMsg = window.i18n.getLang() === 'en' 
        ? `Completed in ${result.moves} moves! (+${result.xp} XP)`
        : `¡Completado en ${result.moves} movimientos! (+${result.xp} XP)`;
    } else if (result.game === 'knight_maze') {
      localizedMsg = mg.knightWon + ` (+${result.xp} XP)`;
    } else if (result.game === 'space_invaders') {
      localizedMsg = result.failed ? mg.invaderCrossed : (mg.spaceWon + ` (+${result.xp} XP)`);
    } else if (result.game === 'sumo_battle') {
      localizedMsg = mg.sumoWon + ` (+${result.xp} XP)`;
    }

    if (!result.failed) {
      notebookManager.triggerConfetti();
      textContent.innerHTML = `🎉 <strong>${window.i18n.t('dialogues.missionAccomplished')}</strong><br>${localizedMsg}`;
    } else {
      textContent.innerHTML = `❌ <strong>¡CUIDADO!</strong><br>${localizedMsg}`;
    }

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet gold" id="btn-replay-minigame">${window.i18n.t('actions.replay')}</button>
    `;

    document.getElementById('btn-replay-minigame').onclick = () => {
      startMinigame(minigamesManager.activeGame, minigamesManager.currentPiece);
    };
  }

  // ==========================================
  // DIÁLOGOS SECUENCIALES: MUNDO 3 (PUZZLES)
  // ==========================================
  function updatePuzzleDialogue() {
    const puzzles = window.i18n.getPuzzles();
    const puzzle = puzzles[puzzlesManager.currentPuzzleIndex];
    if (!puzzle) return;

    speakerName.innerText = window.i18n.t('speaker.owl');
    avatarBox.innerHTML = '🦉';
    textContent.innerHTML = `<strong>${puzzle.title}</strong> (${puzzle.category})<br>${puzzle.description}`;
    extraHint.innerHTML = window.i18n.getLang() === 'en' ? '💡 Find the winning move' : '💡 Encuentra la jugada ganadora';

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet gold" id="btn-ask-puzzle-hint">
        ${window.i18n.t('actions.hint')}
      </button>
      <button type="button" class="btn-game-tablet emerald" id="btn-open-puzzles-menu">
        ${window.i18n.t('actions.puzzlesMenu')}
      </button>
    `;

    document.getElementById('btn-ask-puzzle-hint').onclick = () => {
      puzzlesManager.showHint();
      const pz = window.i18n.getPuzzles()[puzzlesManager.currentPuzzleIndex];
      textContent.innerHTML = `${window.i18n.t('dialogues.coachTip')} ${pz.hint}`;
    };

    document.getElementById('btn-open-puzzles-menu').onclick = () => openBackpack('puzzles');
  }

  function onPuzzleFinished(rawPuzzle, success) {
    toggleDialogue(true);
    const puzzles = window.i18n.getPuzzles();
    const puzzle = puzzles[puzzlesManager.currentPuzzleIndex] || rawPuzzle;

    if (success) {
      notebookManager.triggerConfetti();
      textContent.innerHTML = `${window.i18n.t('dialogues.puzzleSolved')}<br>${puzzle.explanation}`;

      actionsContainer.innerHTML = `
        <button type="button" class="btn-game-tablet gold" id="btn-next-puzzle-step">
          ${window.i18n.t('actions.nextPuzzle')}
        </button>
      `;

      document.getElementById('btn-next-puzzle-step').onclick = () => {
        const nextIdx = puzzlesManager.currentPuzzleIndex + 1;
        if (nextIdx < CHESS_PUZZLES.length) {
          puzzlesManager.loadPuzzle(nextIdx);
          updatePuzzleDialogue();
        } else {
          alert(window.i18n.t('dialogues.allPuzzlesComplete'));
          openBackpack('notebook');
        }
      };
    } else {
      textContent.innerHTML = window.i18n.t('dialogues.puzzleFailed');
    }
  }

  // ==========================================
  // DIÁLOGOS SECUENCIALES: MUNDO 4 (DUELO VS IA)
  // ==========================================
  function updatePlayDialogue() {
    const bot = BOT_PERSONALITIES[activeBot];
    speakerName.innerText = bot.name;
    avatarBox.innerHTML = `<img src="${window.PIECE_IMAGES[bot.avatarImg]}" alt="${bot.name}" class="piece-black">`;
    textContent.innerHTML = `<strong>${bot.name} (${bot.title})</strong><br><em>"${bot.quotes[0]}"</em>`;
    extraHint.innerHTML = `⚔️ ` + (window.i18n.getLang() === 'en' ? 'Game in progress. Your turn with white pieces.' : 'Partida en curso. Tu turno con las piezas blancas.');

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet emerald" id="btn-ask-coach-tip">
        ${window.i18n.t('actions.coachTip')}
      </button>
      <button type="button" class="btn-game-tablet wood" id="btn-undo-move">
        ${window.i18n.t('actions.undo')}
      </button>
      <button type="button" class="btn-game-tablet ruby" id="btn-change-bot">
        ${window.i18n.t('actions.rival')}
      </button>
    `;

    document.getElementById('btn-ask-coach-tip').onclick = () => {
      if (engine.turn !== 'w') return;
      const hint = ai.getCoachHint('w');
      if (hint && hint.move) {
        boardUI.clearArrows();
        boardUI.drawVectorArrow(hint.move.from.row, hint.move.from.col, hint.move.to.row, hint.move.to.col, '#2EB886');
        boardUI.highlightSquares([hint.move.from, hint.move.to]);
        speakerName.innerText = window.i18n.t('speaker.owl');
        avatarBox.innerHTML = '🦉';
        textContent.innerHTML = `${window.i18n.t('dialogues.coachTip')} ${hint.explanation}`;
      }
    };

    document.getElementById('btn-undo-move').onclick = () => {
      engine.undoMove();
      engine.undoMove();
      boardUI.options.interactive = true;
      boardUI.lastMove = null;
      boardUI.clearArrows();
      boardUI.render();
      textContent.innerHTML = window.i18n.t('dialogues.moveUndone');
    };

    document.getElementById('btn-change-bot').onclick = () => openBackpack('play');
  }

  function handlePlayMatchMove(move, gameStatus) {
    if (gameStatus.gameOver) {
      handleMatchOver(gameStatus);
      return;
    }

    // Turno de la IA
    if (engine.turn === 'b') {
      isAiThinking = true;
      boardUI.options.interactive = false;

      const bot = BOT_PERSONALITIES[activeBot];
      speakerName.innerText = bot.name;
      avatarBox.innerHTML = `<img src="${window.PIECE_IMAGES[bot.avatarImg]}" alt="${bot.name}" class="piece-black">`;
      const q = bot.quotes[Math.floor(Math.random() * bot.quotes.length)];
      textContent.innerHTML = `<em>"${q}"</em> <span style="color:#F6C138; margin-left:6px; font-weight:700;">⏳ ${window.i18n.t('dialogues.calculating')}</span>`;

      // Retraso natural y visible del oponente (850ms a 1150ms)
      const thinkTime = 850 + Math.floor(Math.random() * 300);

      setTimeout(() => {
        const aiMove = ai.getBestMove(activeBot, 'b');
        isAiThinking = false;

        if (aiMove) {
          boardUI.executeMove(aiMove, true, () => {
            boardUI.options.interactive = true;
            const postStatus = engine.getGameStatus();
            if (postStatus.gameOver) {
              handleMatchOver(postStatus);
            } else if (postStatus.inCheck) {
              toggleDialogue(true);
              speakerName.innerText = window.i18n.t('speaker.owl');
              avatarBox.innerHTML = '🦉';
              textContent.innerHTML = window.i18n.t('dialogues.checkAlert');
            } else {
              textContent.innerHTML = window.i18n.t('dialogues.yourTurn');
            }
          });
        } else {
          boardUI.options.interactive = true;
          boardUI.render();
          const postStatus = engine.getGameStatus();
          if (postStatus.gameOver) {
            handleMatchOver(postStatus);
          }
        }
      }, thinkTime);
    }
  }

  function handleMatchOver(status) {
    const winner = status.winner;
    notebookManager.recordBattle(activeBot, winner, engine.fullMoves);

    toggleDialogue(true);

    if (winner === 'w') {
      window.soundFx.playVictory();
      notebookManager.triggerConfetti();
      const xp = activeBot === 'hard' ? 200 : (activeBot === 'medium' ? 120 : 80);
      notebookManager.addXP(xp);

      speakerName.innerText = window.i18n.t('speaker.victory');
      avatarBox.innerHTML = '👑';
      const moveWord = window.i18n.getLang() === 'en' ? 'moves' : 'jugadas';
      textContent.innerHTML = `${window.i18n.t('dialogues.checkmateWin')} <strong>${BOT_PERSONALITIES[activeBot].name}</strong> (${engine.fullMoves} ${moveWord}). (+${xp} XP)`;
    } else if (winner === 'b') {
      window.soundFx.playWrong();
      speakerName.innerText = window.i18n.t('speaker.defeat');
      avatarBox.innerHTML = '⚔️';
      textContent.innerHTML = `⚔️ <strong>${BOT_PERSONALITIES[activeBot].name}</strong> ${window.i18n.t('dialogues.defeatMsg')}`;
    } else {
      speakerName.innerText = window.i18n.t('speaker.draw');
      avatarBox.innerHTML = '🤝';
      textContent.innerHTML = `🤝 <strong>${window.i18n.t('dialogues.drawMsg')}</strong> ${status.message}`;
    }

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet gold" onclick="location.reload()">${window.i18n.t('actions.newGame')}</button>
    `;
  }

  // ==========================================
  // DIÁLOGOS SECUENCIALES: MUNDO 5 (TROFEOS)
  // ==========================================
  function updateNotebookDialogue() {
    const rank = notebookManager.getCurrentRank();
    speakerName.innerText = window.i18n.t('menu.trophiesTitle');
    avatarBox.innerHTML = '🏆';
    textContent.innerHTML = `${window.i18n.t('dialogues.trophyWelcome')} <strong>${rank.title}</strong> ${window.i18n.t('dialogues.withXP')} <strong>${notebookManager.data.xp} XP</strong> ${window.i18n.t('dialogues.accumulatedXP')}`;
    extraHint.innerHTML = `🏅 ${notebookManager.data.unlockedMedals.length} ${window.i18n.t('dialogues.medalsUnlockedText')}`;

    actionsContainer.innerHTML = `
      <button type="button" class="btn-game-tablet gold" id="btn-open-medals-sheet">${window.i18n.t('actions.viewMedals')}</button>
    `;

    document.getElementById('btn-open-medals-sheet').onclick = () => openBackpack('notebook');
  }

  // ==========================================
  // TEMA DÍA / NOCHE (FONDOS ILUSTRADOS)
  // ==========================================
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  let isNightTheme = false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const themeQ = urlParams.get('theme');
    if (themeQ === 'night') isNightTheme = true;
    else if (themeQ === 'day') isNightTheme = false;
    else isNightTheme = localStorage.getItem('jaque_theme') === 'night';
  } catch (e) {
    isNightTheme = false;
  }

  function updateThemeUI() {
    if (isNightTheme) {
      document.body.classList.add('theme-night');
      if (btnThemeToggle) btnThemeToggle.innerText = '🌙';
    } else {
      document.body.classList.remove('theme-night');
      if (btnThemeToggle) btnThemeToggle.innerText = '☀️';
    }
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      isNightTheme = !isNightTheme;
      localStorage.setItem('jaque_theme', isNightTheme ? 'night' : 'day');
      updateThemeUI();
      window.soundFx.playSelect();
    });
  }
  updateThemeUI();

  // Iniciar configuración estática e idioma
  updateStaticUI();

  // Iniciar en la pestaña según URL hash o por defecto en Academia
  const validTabs = ['learn', 'minigames', 'puzzles', 'play', 'decks', 'notebook'];
  const hashTab = (window.location.hash || '').replace('#', '');
  const initialTab = validTabs.includes(hashTab) ? hashTab : 'learn';
  switchTab(initialTab, true);

  const urlParams = new URLSearchParams(window.location.search);
  const backpackParam = urlParams.get('backpack');
  if (backpackParam && validTabs.includes(backpackParam)) {
    openBackpack(backpackParam);
  }
});
