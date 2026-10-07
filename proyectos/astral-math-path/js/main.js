/**
 * main.js — Coordinación UI, Modos de Juego, Dificultad y Salón de la Fama Arcade
 */

document.addEventListener('DOMContentLoaded', () => {
  const splashScreen = document.getElementById('splashScreen');
  const btnStartAdventure = document.getElementById('btnStartAdventure');
  const canvas = document.getElementById('pulseCanvas');
  const tracksCarousel = document.getElementById('tracksCarousel');
  const singleTablesGrid = document.getElementById('singleTablesGrid');
  const operationsGrid = document.getElementById('operationsGrid');
  const tabModeOperations = document.getElementById('tabModeOperations');
  const hudOpSym = document.getElementById('hudOpSym');
  const menuScreen = document.getElementById('menuScreen');
  const victoryScreen = document.getElementById('victoryScreen');
  const leaderboardModal = document.getElementById('leaderboardModal');
  const leaderboardBody = document.getElementById('leaderboardBody');
  const btnCloseLeaderboard = document.getElementById('btnCloseLeaderboard');
  const btnBackFromLeaderboard = document.getElementById('btnBackFromLeaderboard');
  const creditsModal = document.getElementById('creditsModal');
  const btnCloseCredits = document.getElementById('btnCloseCredits');
  const btnBackFromCredits = document.getElementById('btnBackFromCredits');

  // Pestañas de modo
  const tabModeFamilies = document.getElementById('tabModeFamilies');
  const tabModeSingle = document.getElementById('tabModeSingle');
  const tabModeLeaderboard = document.getElementById('tabModeLeaderboard');
  const tabModeCredits = document.getElementById('tabModeCredits');

  // Botones de dificultad y nivel andamiado
  const diffButtons = document.querySelectorAll('.diff-btn');
  const levelButtons = document.querySelectorAll('.level-step-btn');

  // Elementos HUD
  const hudTrackEmoji = document.getElementById('hudTrackEmoji');
  const hudTrackName = document.getElementById('hudTrackName');
  const hudMultiplier = document.getElementById('hudMultiplier');
  const hudScore = document.getElementById('hudScore');
  const trackProgressBar = document.getElementById('trackProgressBar');
  const hudFactorA = document.getElementById('hudFactorA');
  const hudFactorB = document.getElementById('hudFactorB');
  const hudQuestionBanner = document.getElementById('hudQuestionBanner');
  const btnBackToMenu = document.getElementById('btnBackToMenu');
  const btnAudioMute = document.getElementById('btnAudioMute');

  // Elementos Victoria & Arcade Initials
  const victoryTitle = document.getElementById('victoryTitle');
  const victoryScore = document.getElementById('victoryScore');
  const victoryMaxStreak = document.getElementById('victoryMaxStreak');
  const arcadeInitialsBox = document.getElementById('arcadeInitialsBox');
  const btnSaveInitials = document.getElementById('btnSaveInitials');
  const btnNextTrack = document.getElementById('btnNextTrack');

  // Estado del selector de letras arcade (AAA)
  const letters = ['A', 'A', 'A'];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789★';
  let lastGameStats = null;

  // 1. Instanciar Subsistemas
  const audio = new window.PulseAudioEngine();
  const curriculum = new window.CurriculumManager();
  const leaderboard = new window.LeaderboardManager();
  const input = new window.PulseInputManager(canvas);
  const particles = new window.ParticleSystem();
  const renderer = new window.TunnelRenderer(canvas);
  const engine = new window.PulseGameEngine(canvas, audio, curriculum, input, particles, renderer);

  // MANEJO DE LA PANTALLA DE BIENVENIDA (SPLASH SCREEN AISLADA)
  if (btnStartAdventure) {
    btnStartAdventure.addEventListener('click', () => {
      if (splashScreen) {
        splashScreen.classList.add('hidden');
      }
      menuScreen.classList.remove('hidden');
      // Iniciar contexto de audio en el primer gesto
      if (audio.ctx && audio.ctx.state === 'suspended') {
        audio.ctx.resume();
      }
      audio.playHitSuccess(1);
      setMode('operations');
    });
  }

  // 2. Modos de Juego y Pestañas
  function setMode(mode) {
    if (tabModeOperations) tabModeOperations.classList.toggle('active', mode === 'operations');
    if (tabModeSingle) tabModeSingle.classList.toggle('active', mode === 'single');
    if (tabModeFamilies) tabModeFamilies.classList.toggle('active', mode === 'families');
    if (tabModeLeaderboard) tabModeLeaderboard.classList.toggle('active', mode === 'leaderboard');
    if (tabModeCredits) tabModeCredits.classList.toggle('active', mode === 'credits');

    if (mode === 'operations') {
      if (operationsGrid) operationsGrid.classList.remove('hidden');
      if (singleTablesGrid) singleTablesGrid.classList.add('hidden');
      if (tracksCarousel) tracksCarousel.classList.add('hidden');
      leaderboardModal.classList.add('hidden');
      creditsModal.classList.add('hidden');
      curriculum.setGameMode('operations');
      renderOperations();
    } else if (mode === 'single') {
      if (operationsGrid) operationsGrid.classList.add('hidden');
      if (singleTablesGrid) singleTablesGrid.classList.remove('hidden');
      if (tracksCarousel) tracksCarousel.classList.add('hidden');
      leaderboardModal.classList.add('hidden');
      creditsModal.classList.add('hidden');
      curriculum.setGameMode('single_table');
      renderSingleTables();
    } else if (mode === 'families') {
      if (operationsGrid) operationsGrid.classList.add('hidden');
      if (singleTablesGrid) singleTablesGrid.classList.add('hidden');
      if (tracksCarousel) tracksCarousel.classList.remove('hidden');
      leaderboardModal.classList.add('hidden');
      creditsModal.classList.add('hidden');
      curriculum.setGameMode('families');
      renderCarousel();
    } else if (mode === 'leaderboard') {
      creditsModal.classList.add('hidden');
      openLeaderboard();
    } else if (mode === 'credits') {
      leaderboardModal.classList.add('hidden');
      creditsModal.classList.remove('hidden');
    }
  }

  if (tabModeOperations) tabModeOperations.addEventListener('click', () => setMode('operations'));
  if (tabModeSingle) tabModeSingle.addEventListener('click', () => setMode('single'));
  if (tabModeFamilies) tabModeFamilies.addEventListener('click', () => setMode('families'));
  if (tabModeLeaderboard) tabModeLeaderboard.addEventListener('click', () => setMode('leaderboard'));
  if (tabModeCredits) tabModeCredits.addEventListener('click', () => setMode('credits'));

  if (btnCloseCredits) btnCloseCredits.addEventListener('click', () => {
    creditsModal.classList.add('hidden');
    setMode(activeMenuMode);
  });
  if (btnBackFromCredits) btnBackFromCredits.addEventListener('click', () => {
    creditsModal.classList.add('hidden');
    setMode(activeMenuMode);
  });

  // Selector de Nivel de Progresión (Iniciación, Exploración, Maestría)
  levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      levelButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const level = parseInt(btn.getAttribute('data-level')) || 1;
      curriculum.setOperationLevel(level);
      if (activeMenuMode === 'operations') {
        renderOperations();
      }
    });
  });

  // 3. Selector de Dificultad
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const diffId = btn.getAttribute('data-diff');
      curriculum.setDifficulty(diffId);
    });
  });

  // 4. Renderizar Carrusel de Familias
  function renderCarousel() {
    tracksCarousel.innerHTML = '';
    const tracks = curriculum.getTracks();

    tracks.forEach(track => {
      const card = document.createElement('div');
      card.className = `track-card interactive ${track.unlocked ? '' : 'locked'}`;
      card.style.borderColor = track.unlocked ? track.color : 'rgba(255, 255, 255, 0.12)';

      card.innerHTML = `
        <div class="track-card-emoji">${track.emoji}</div>
        <div class="track-card-name">${track.name}</div>
        <div class="track-card-family" style="color: ${track.color};">${track.family}</div>
        <div class="track-card-desc">${track.desc}</div>
        <div class="track-card-bpm">
          <span>${track.bpm} BPM</span>
          <span>${track.unlocked ? (track.highScore > 0 ? `★ ${track.highScore}` : 'NUEVO') : '🔒 BLOQUEADO'}</span>
        </div>
      `;

      if (track.unlocked) {
        card.addEventListener('click', () => {
          startTrack(track, null);
        });
      }

      tracksCarousel.appendChild(card);
    });
  }

  // 5. Renderizar Grilla de Tablas Individuales (1..12)
  function renderSingleTables() {
    singleTablesGrid.innerHTML = '';
    const tables = curriculum.getSingleTables();

    tables.forEach(t => {
      const card = document.createElement('div');
      card.className = 'single-table-card interactive';
      card.style.borderColor = t.color;

      card.innerHTML = `
        <div class="num-badge" style="color: ${t.color};">${t.emoji}</div>
        <div class="table-title">${t.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">${t.desc}</div>
        <div class="table-score">
          ${t.highScore > 0 ? `Récord: ★ ${t.highScore}` : '¡Por Jugar!'}
        </div>
      `;

      card.addEventListener('click', () => {
        const customTrack = {
          id: `single-${t.table}`,
          name: t.name,
          emoji: t.emoji,
          bpm: t.bpm,
          color: t.color,
          secondaryColor: '#ffffff'
        };
        startTrack(customTrack, t.table);
      });

      singleTablesGrid.appendChild(card);
    });
  }


  // Renderizar las 4 Operaciones Aritméticas Básicas
  function renderOperations() {
    if (!operationsGrid) return;
    operationsGrid.innerHTML = '';
    const ops = curriculum.getArithmeticOperations();
    const currentLvl = curriculum.selectedOpLevel || 1;

    ops.forEach(item => {
      const card = document.createElement('div');
      card.className = 'operation-card interactive';
      card.style.borderColor = item.color;
      const lvlConfig = item.levels ? item.levels.find(l => l.id === currentLvl) : null;

      card.innerHTML = `
        <div class="operation-icon-badge" style="color: ${item.color}; background: rgba(255,255,255,0.06);">
          ${item.symbol}
        </div>
        <div class="operation-info">
          <div class="operation-name">${item.name}</div>
          <div class="operation-desc">${lvlConfig ? lvlConfig.desc : item.desc}</div>
          <div class="operation-tags">
            ${lvlConfig ? `<span class="operation-tag-pill" style="color: ${item.color}; font-weight: 900;">${lvlConfig.label}</span>` : ''}
            ${item.tags.map(t => `<span class="operation-tag-pill">${t}</span>`).join('')}
            <span class="operation-tag-pill" style="color: var(--gold-glow);">${item.highScore > 0 ? `★ ${item.highScore}` : '¡Comenzar!'}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        const customTrack = {
          id: `op-${item.op}-lvl${currentLvl}`,
          name: `${item.name} (${lvlConfig ? lvlConfig.name : 'Nivel ' + currentLvl})`,
          emoji: item.emoji,
          bpm: item.bpm,
          color: item.color,
          secondaryColor: '#3b82f6',
          isArithmetic: true,
          op: item.op
        };
        startTrack(customTrack, { operation: item.op, level: currentLvl, category: 'operations' });
      });

      operationsGrid.appendChild(card);
    });
  }

  // 6. Iniciar Partida
  function startTrack(track, options = {}) {
    menuScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    leaderboardModal.classList.add('hidden');
    creditsModal.classList.add('hidden');

    hudTrackEmoji.textContent = track.emoji;
    hudTrackName.textContent = track.name;
    hudMultiplier.textContent = '1x';
    hudScore.textContent = '0';
    trackProgressBar.style.width = '0%';
    hudQuestionBanner.style.opacity = '1';

    engine.startTrack(track, options);
  }

  // 7. Callbacks de Engine
  engine.onNewChallenge = (challenge) => {
    if (hudOpSym) hudOpSym.textContent = challenge.symbol || '×';
    if (window.PulseColors) {
      hudFactorA.textContent = challenge.a;
      hudFactorA.style.color = window.PulseColors.getNumberColor(challenge.a);
      hudFactorB.textContent = challenge.b;
      hudFactorB.style.color = window.PulseColors.getNumberColor(challenge.b);
    } else {
      hudFactorA.textContent = challenge.a;
      hudFactorB.textContent = challenge.b;
    }
  };

  engine.onScoreUpdate = ({ score, streak, multiplier, progress, isCorrect }) => {
    hudScore.textContent = score;
    hudMultiplier.textContent = `${multiplier}x`;
    trackProgressBar.style.width = `${Math.min(100, Math.round(progress * 100))}%`;

    if (isCorrect) {
      hudMultiplier.classList.add('pulse');
      setTimeout(() => hudMultiplier.classList.remove('pulse'), 150);
    }
  };

  engine.onTrackComplete = ({ track, singleTableNumber, score, maxStreak, unlockedNext, difficulty }) => {
    victoryTitle.textContent = `¡${track.name} Superada!`;
    victoryScore.textContent = score;
    victoryMaxStreak.textContent = maxStreak;

    lastGameStats = {
      score,
      maxStreak,
      mode: singleTableNumber !== null ? `Tabla x${singleTableNumber}` : 'Familias',
      detail: track.name,
      difficulty
    };

    // Si clasifica al Top 10, abrir caja de iniciales arcade
    if (leaderboard.isTopScore(score)) {
      arcadeInitialsBox.classList.remove('hidden');
      updateLetterDisplays();
    } else {
      arcadeInitialsBox.classList.add('hidden');
    }

    victoryScreen.classList.remove('hidden');
    renderCarousel();
    renderSingleTables();
  };

  // 8. Selector de Iniciales Arcade (3 Columnas)
  function updateLetterDisplays() {
    document.getElementById('letter0').textContent = letters[0];
    document.getElementById('letter1').textContent = letters[1];
    document.getElementById('letter2').textContent = letters[2];
  }

  document.querySelectorAll('.btn-letter-nav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const col = parseInt(btn.getAttribute('data-col'), 10);
      const dir = btn.getAttribute('data-dir');
      let idx = alphabet.indexOf(letters[col]);

      if (dir === 'up') {
        idx = (idx + 1) % alphabet.length;
      } else {
        idx = (idx - 1 + alphabet.length) % alphabet.length;
      }
      letters[col] = alphabet[idx];
      updateLetterDisplays();
    });
  });

  btnSaveInitials.addEventListener('click', () => {
    if (!lastGameStats) return;
    const initials = letters.join('');
    leaderboard.addEntry({
      initials,
      score: lastGameStats.score,
      maxStreak: lastGameStats.maxStreak,
      mode: lastGameStats.mode,
      detail: lastGameStats.detail,
      difficulty: lastGameStats.difficulty
    });
    arcadeInitialsBox.classList.add('hidden');
    openLeaderboard();
  });

  // 9. Salón de la Fama Modal
  function openLeaderboard() {
    leaderboardBody.innerHTML = '';
    const top10 = leaderboard.getTop10();

    top10.forEach(entry => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="rank-num">${entry.rank === 1 ? '🥇' : (entry.rank === 2 ? '🥈' : (entry.rank === 3 ? '🥉' : entry.rank))}</td>
        <td class="initials-col">${entry.initials}</td>
        <td class="score-col">${entry.score}</td>
        <td>${entry.mode}</td>
        <td><span style="font-size: 0.8rem; opacity: 0.85;">${entry.difficulty}</span></td>
        <td style="color: var(--text-muted); font-size: 0.78rem;">${entry.date}</td>
      `;
      leaderboardBody.appendChild(tr);
    });

    leaderboardModal.classList.remove('hidden');
  }

  let activeMenuMode = 'operations';

  // Al cambiar modo guardar activeMenuMode si no es modal
  const originalSetMode = setMode;
  setMode = function(mode) {
    if (mode !== 'leaderboard' && mode !== 'credits') {
      activeMenuMode = mode;
    }
    originalSetMode(mode);
  };

  btnCloseLeaderboard.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
    setMode(activeMenuMode);
  });

  btnBackFromLeaderboard.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
    setMode(activeMenuMode);
  });

  // 10. Botones de Regreso y Audio
  btnBackToMenu.addEventListener('click', () => {
    engine.stop();
    victoryScreen.classList.add('hidden');
    leaderboardModal.classList.add('hidden');
    creditsModal.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    setMode(activeMenuMode);
  });

  btnNextTrack.addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    setMode(activeMenuMode);
  });

  let isMuted = false;
  btnAudioMute.addEventListener('click', () => {
    isMuted = !isMuted;
    if (audio.masterGain) {
      audio.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.75, audio.ctx.currentTime);
    }
    btnAudioMute.textContent = isMuted ? '🔇' : '🔊';
  });

  // Inicialización
  setMode('operations');
});
