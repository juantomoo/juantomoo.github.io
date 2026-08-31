/**
 * i18n.js - Sistema de Internacionalización (Español & English) para Jaque al Rey
 * Soporta cambio dinámico de idioma en tiempo real con persistencia en localStorage.
 */

const I18N_DATA = {
  es: {
    appTitle: "Jaque al Rey — Aventura en los Andes",
    hud: {
      sound: "Audio",
      dialogue: "Diálogo",
      backpack: "🎒 MENÚ",
      minimize: "▼ MINIMIZAR",
      expand: "▲ VER DIÁLOGO"
    },
    menu: {
      title: "🎒 Mochila de Aventuras",
      learnTitle: "Academia",
      learnSub: "10 pasos y piezas",
      miniTitle: "Minijuegos",
      miniSub: "Entrenamiento",
      puzzlesTitle: "Puzzles",
      puzzlesSub: "Gimnasio táctico",
      playTitle: "Duelo vs IA",
      playSub: "3 Guardianes",
      trophiesTitle: "Salón de Medallas & Rango",
      trophiesSub: "Tus logros y bitácora",
      decksTitle: "Mazos de Fichas",
      decksSub: "Sets y estilos",
      chooseDeck: "🎴 Elige tu Set de Piezas (Mazo):",
      customDeckTitle: "🎨 Diseña tu Mazo Personalizado:",
      whitePieces: "Piezas Blancas (Luz)",
      blackPieces: "Piezas Negras (Sombra)",
      activeDeck: "Mazo Activo",
      useDeck: "Usar este Mazo",
      customizeDeck: "Personalizar Ficha a Ficha",
      tabSets: "🎴 Sets de Fichas",
      tabTerrains: "🗺️ Terrenos de Tablero",
      chooseBoardPreset: "🗺️ Preajustes de Terreno:",
      customizeTiles: "🎨 Personalizar Casillas Claras y Oscuras:",
      lightTilesTitle: "☀️ Casillas Claras (Luz):",
      darkTilesTitle: "🌙 Casillas Oscuras (Sombra):",
      useBoard: "Usar este Tablero",
      activeBoard: "Tablero Activo",
      choosePiece: "🌿 Elige una Pieza para Aprender:",
      stepsList: "📜 Lecciones del Método de los Pasos:",
      chooseMinigame: "⭐ Elige un Desafío de Selva:",
      choosePuzzle: "🧩 Puzzles Tácticos Graduados:",
      chooseBot: "⚔️ Elige a tu Rival Guardián:",
      unlocked: "✨ Desbloqueada",
      locked: "🔒 Bloqueada",
      xpGained: "XP",
      points: "puntos",
      point: "punto",
      invaluable: "¡Invaluable!",
      tryOnBoard: "🎯 ¡PROBAR EN TABLERO!"
    },
    speaker: {
      owl: "Maestro Búho",
      jungleTraining: "Entrenamiento de Selva",
      victory: "¡VICTORIA!",
      defeat: "Fin de la Batalla",
      draw: "Tablas"
    },
    actions: {
      continue: "▶ CONTINUAR",
      nextStep: "¡SIGUIENTE PASO! 🚀",
      lessons: "📜 LECCIONES",
      otherGame: "⭐ OTRO JUEGO",
      replay: "🔄 REINTENTAR",
      hint: "💡 PEDIR PISTA",
      puzzlesMenu: "🧩 RETOS",
      nextPuzzle: "¡SIGUIENTE RETO! 🏆",
      whatToDo: "🦉 ¿QUÉ HAGO?",
      undo: "↩️ DESHACER",
      rival: "⚔️ RIVAL",
      newGame: "🔄 NUEVA PARTIDA",
      viewMedals: "🎒 VER MEDALLAS"
    },
    dialogues: {
      welcome: "¡Bienvenido a la <strong>Academia de los Andes</strong>! Toca las casillas secretas del centro del tablero: <strong>e4</strong>, <strong>d4</strong> y <strong>e5</strong>.",
      welcomeHint: "🎯 Toca las casillas en el tablero",
      missionAccomplished: "🌟 <strong>¡MISIÓN CUMPLIDA!</strong>",
      movesCount: "🎮 Jugadas realizadas:",
      allLessonsComplete: "🎉 ¡Felicidades! Has completado todas las lecciones de la Academia Andina.",
      allPuzzlesComplete: "🏆 ¡Has superado todos los desafíos tácticos del Reino!",
      puzzleSolved: "🎉 <strong>¡JUGADA MAESTRA!</strong>",
      puzzleFailed: "❌ <strong>Casi...</strong> Esa jugada no resuelve la táctica. ¡Inténtalo de nuevo!",
      coachTip: "💡 <strong>Consejo del Maestro Búho:</strong>",
      moveUndone: "↩️ <strong>Jugada deshecha.</strong> Piensa tu estrategia con calma.",
      yourTurn: "¡Tu turno! Mueve tus piezas para controlar el centro.",
      checkAlert: "⚠️ <strong>¡JAQUE!</strong> Tu Rey está amenazado. Aplica el escudo <strong>C-I-M</strong>: Capturar, Interponer o Mover.",
      checkmateWin: "🎉 <strong>¡¡JAQUE MATE!!</strong> Has vencido a",
      defeatMsg: "ha ganado la partida. ¡Buen esfuerzo! Revisa la posición para aprender.",
      drawMsg: "¡Empate!",
      trophyWelcome: "¡Bienvenido al <strong>Salón de la Fama</strong>! Tu rango actual es",
      withXP: "con",
      accumulatedXP: "XP acumulados.",
      medalsUnlockedText: "Medallas desbloqueadas",
      calculating: "(Calculando...)"
    },
    promotion: {
      title: "👑 ¡Coronación del Colibrí!",
      desc: "Tu peón ha cruzado todo el reino. Elige su nueva forma:",
      queen: "Reina",
      knight: "Llama",
      rook: "Torre",
      bishop: "Orquídea"
    },
    ranks: [
      { minXP: 0, title: "Aprendiz del Valle", badge: "🌱" },
      { minXP: 100, title: "Explorador de la Selva", badge: "🌿" },
      { minXP: 250, title: "Guardián de los Andes", badge: "🏔️" },
      { minXP: 450, title: "Táctico de la Neblina", badge: "🦅" },
      { minXP: 700, title: "Maestro del Cóndor", badge: "👑" },
      { minXP: 1000, title: "Gran Chamán del Tablero", badge: "⚡" },
      { minXP: 1500, title: "Inca Inmortal", badge: "☀️" }
    ],
    medals: [
      { id: "first_lesson", name: "Primeros Pasos", desc: "Completaste tu primera lección en la Academia", icon: "🌟" },
      { id: "all_lessons", name: "Maestro Graduado", desc: "Superaste las 10 lecciones completas", icon: "🎓" },
      { id: "route_star", name: "Cazador de Estrellas", desc: "Completaste el Planificador de Rutas", icon: "⭐" },
      { id: "knight_maze", name: "Jinete del Laberinto", desc: "Superaste el Laberinto de la Llama", icon: "🦙" },
      { id: "tactics_hero", name: "Mente Táctica", desc: "Resolviste 5 puzzles tácticos", icon: "🧩" },
      { id: "first_win", name: "¡Jaque Mate!", desc: "Ganaste tu primera partida contra un bot", icon: "⚔️" },
      { id: "beat_hard", name: "Vencedor del Oso", desc: "Derrotaste al Oso Guardián en nivel Maestro", icon: "🐻" }
    ],
    pieces: {
      p: {
        name: "Pajarito Guardián (Peón)",
        whiteName: "Colibrí de los Valles",
        blackName: "Cuervo de la Nieve",
        desc: "Avanza 1 casilla hacia adelante (o 2 en su salida) y captura en diagonal.",
        fact: "¡Si cruza todo el tablero se transforma en una Reina!",
        emoji: "🐤"
      },
      n: {
        name: "Corcel Andino (Caballo)",
        whiteName: "Llama Mágica",
        blackName: "Oso de Anteojos",
        desc: "Salta en forma de 'L' (2 casillas en una dirección y 1 al costado).",
        fact: "¡Es la única pieza que salta sobre aliados y enemigos!",
        emoji: "🦙"
      },
      b: {
        name: "Flor Sagrada (Alfil)",
        whiteName: "Orquídea Blanca",
        blackName: "Orquídea Morada",
        desc: "Se desliza velozmente por las diagonales del color en que nació.",
        fact: "Nunca puede pisar casillas del color opuesto.",
        emoji: "🌸"
      },
      r: {
        name: "Fortaleza Esmeralda (Torre)",
        whiteName: "Torre de Cristal",
        blackName: "Torre de Obsidiana",
        desc: "Domina columnas y filas rectas sin límite de distancia.",
        fact: "Junto al Rey puede realizar el movimiento especial de Enroque.",
        emoji: "🏰"
      },
      q: {
        name: "Reina de la Selva (Dama)",
        whiteName: "Reina de la Primavera",
        blackName: "Reina del Bosque",
        desc: "Combina el poder de la Torre y el Alfil: ¡se mueve hacia donde quiera!",
        fact: "Es la defensora y atacante más valiosa de tu ejército.",
        emoji: "👑"
      },
      k: {
        name: "Rey Sabio (Rey)",
        whiteName: "Rey de la Flora",
        blackName: "Rey de la Noche",
        desc: "Se mueve 1 casilla en cualquier dirección. ¡Nunca debe ser capturado!",
        fact: "El objetivo del juego es dejar al Rey rival en Jaque Mate.",
        emoji: "🌿"
      }
    },
    lessons: [
      {
        id: 1,
        title: "1. El Tablero y las Coordenadas",
        subtitle: "¡Aprende el mapa del reino!",
        character: "🦉 Maestro Búho",
        dialogue: "¡Bienvenido a la Academia! El tablero tiene 64 casillas (32 de luz y 32 de sombra). Las letras (a-h) son **columnas** y los números (1-8) son **filas**. La casilla de tu esquina derecha SIEMPRE debe ser clara.",
        instruction: "Toca las 3 casillas secretas del **Centro del Tablero: e4, d4 y e5**.",
        explanation: "¡Excelente! Quien domina las 4 casillas del centro (e4, d4, e5, d5), domina todo el reino."
      },
      {
        id: 2,
        title: "2. El Colibrí Guardián (El Peón)",
        subtitle: "¡Pequeño pero imparable!",
        character: "🦉 Maestro Búho",
        dialogue: "El **Colibrí (Peón)** avanza siempre hacia adelante: 2 pasos en su primer vuelo o 1 paso después. ¡Pero atención! Captura en **diagonal** hacia adelante.",
        instruction: "Haz volar a tu Colibrí dos pasos hacia adelante hasta la casilla **e4**.",
        explanation: "¡Perfecto! Avanzar el peón de Rey dos pasos es la apertura clásica para liberar tus piezas."
      },
      {
        id: 3,
        title: "3. La Llama Mágica (El Caballo)",
        subtitle: "¡El saltador de obstáculos!",
        character: "🦉 Maestro Búho",
        dialogue: "La **Llama Mágica (Caballo)** se mueve formando una letra **'L'** (2 casillas en una dirección y 1 al lado). ¡Es la única criatura capaz de saltar por encima de otras piezas!",
        instruction: "Haz que tu Llama salte desde b1 hasta la casilla central **c3**.",
        explanation: "¡Magnífico salto! En c3, la Llama vigila el centro y está lista para defender el reino."
      },
      {
        id: 4,
        title: "4. La Fortaleza Esmeralda (La Torre)",
        subtitle: "¡Líneas rectas y gran poder!",
        character: "🦉 Maestro Búho",
        dialogue: "La **Fortaleza (Torre)** se desliza en **línea recta**: tantas casillas libres como quiera por filas o columnas. ¡Es un cañón de largo alcance!",
        instruction: "Usa tu Fortaleza en c5 para capturar a los **3 cuervos negros** en línea recta.",
        explanation: "¡Limpieza total! Las torres son implacables dominando columnas abiertas."
      },
      {
        id: 5,
        title: "5. La Orquídea Sagrada (El Alfil)",
        subtitle: "¡El guardián de las diagonales!",
        character: "🦉 Maestro Búho",
        dialogue: "La **Orquídea (Alfil)** viaja exclusivamente por las **diagonales** del color en el que nació. Nunca cambiará de color de casilla en toda la partida.",
        instruction: "Desliza tu Orquídea desde d5 hasta la esquina superior derecha en **h1** (o g8).",
        explanation: "¡Gran diagonal! Una pareja de alfiles coordinados puede cortar el tablero por completo."
      },
      {
        id: 6,
        title: "6. La Reina y la Coronación",
        subtitle: "¡El poder máximo y la transformación!",
        character: "🦉 Maestro Búho",
        dialogue: "La **Reina** combina los poderes de la Torre y el Alfil: ¡se mueve en cualquier dirección! Además, si un Colibrí llega a la última fila rival, ¡se **corona** en Reina!",
        instruction: "Avanza tu Colibrí hasta la casilla e8 y corónalo como una gloriosa Reina.",
        explanation: "¡Viva la nueva Reina! Hasta la pieza más pequeña puede decidir el destino del reino."
      },
      {
        id: 7,
        title: "7. El Rey Sabio y la Seguridad",
        subtitle: "¡El corazón de tu ejército!",
        character: "🦉 Maestro Búho",
        dialogue: "El **Rey** es la pieza más importante: se mueve 1 sola casilla hacia cualquier dirección. ¡El Rey nunca se captura! Si no tiene salida, termina la partida.",
        instruction: "Mueve a tu Rey Sabio un paso hacia el centro a la casilla e5.",
        explanation: "¡Bien hecho! Regla de oro: tu Rey **NUNCA** puede pisar una casilla donde quede atacado por el rival."
      },
      {
        id: 8,
        title: "8. El Jaque y el Escudo C-I-M",
        subtitle: "¡Alerta en el castillo!",
        character: "🦉 Maestro Búho",
        dialogue: "Cuando una pieza enemiga amenaza capturar a tu Rey, se llama **¡JAQUE!**. Salva a tu Rey con la regla mágica **C-I-M**:\n1. **C**apturar la pieza atacante.\n2. **I**nterponer una pieza defensora.\n3. **M**over al Rey a un lugar seguro.",
        instruction: "La Torre negra en e8 da jaque al Rey en e1. Usa el escudo **I (Interponer)** moviendo tu Alfil de f1 a e2.",
        explanation: "¡Escudo perfecto! Interponer el Alfil bloquea la columna y deja al Rey completamente a salvo."
      },
      {
        id: 9,
        title: "9. ¡Jaque Mate! La Victoria Definitiva",
        subtitle: "¡Sin escapatoria, sin defensa!",
        character: "🦉 Maestro Búho",
        dialogue: "El **Jaque Mate** ocurre cuando el Rey está en jaque y **NO puede** Capturar, Interponer ni Moverse. ¡Es el fin de la partida y ganas el trofeo!",
        instruction: "El Rey rival está atrapado detrás de sus propios peones (el mate del pasillo). ¡Lleva tu Reina a e8 y da Jaque Mate!",
        explanation: "¡¡JAQUE MATE!! Las piezas rivales no pudieron defender a su Rey. ¡Victoria indiscutible!"
      },
      {
        id: 10,
        title: "10. El Enroque: El Refugio Secreto",
        subtitle: "¡El único movimiento doble del ajedrez!",
        character: "🦉 Maestro Búho",
        dialogue: "El **Enroque** es una jugada especial donde el Rey y la Torre se mueven juntos: el Rey avanza 2 pasos hacia la Torre y la Torre salta al otro lado. ¡Protege a tu Rey y activa tu Torre a la vez!",
        instruction: "Realiza el **Enroque Corto**: mueve tu Rey dos pasos a la derecha (casilla g1).",
        explanation: "¡Enroque magistral! Ahora tu Rey descansa seguro y tu Torre está lista para la batalla."
      }
    ],
    minigames: {
      routePlanner: { title: "⭐ Planificador de Rutas", subtitle: "Recolecta todas las estrellas con tu pieza." },
      knightMaze: { title: "🦙 El Laberinto de la Llama", subtitle: "Llega al Cofre Dorado 🏆 esquivando centinelas usando saltos en 'L'." },
      spaceInvaders: { title: "👾 Space Invaders Táctico", subtitle: "¡Captura a las piezas invasoras con tu Torre antes de que avancen!" },
      sumoBattle: { title: "🥊 La Lucha de Reyes", subtitle: "Avanza con tu Rey hacia la corona central dominando la oposición." },
      invaderCrossed: "¡Un invasor cruzó la línea! Reintenta el desafío.",
      knightWon: "¡Llegaste al Cofre Dorado con saltos perfectos!",
      spaceWon: "¡Invasores neutralizados con éxito!",
      sumoWon: "¡Dominio total del centro y la oposición!"
    },
    puzzles: [
      {
        id: 1,
        title: "El Beso de la Reina 👑",
        category: "Jaque Mate en 1",
        description: "Tu Reina de la Primavera tiene el respaldo de la Orquídea en c4. ¡Asesta el golpe final!",
        hint: "Busca la casilla f7, el punto más vulnerable del Rey rival respaldado por tu Reina y Alfil.",
        explanation: "¡Jaque Mate! La Reina ataca al Rey cara a cara ('el beso') y el Alfil la protege, así que no puede ser capturada."
      },
      {
        id: 2,
        title: "El Mate del Pasillo 🏰",
        category: "Jaque Mate en 1",
        description: "Los peones rivales encierran a su propio Rey en la octava fila. ¡Aprovecha el pasillo!",
        hint: "Lleva tu Fortaleza Esmeralda a la última fila rival. Los peones negros le impiden huir.",
        explanation: "¡Mate del pasillo! Como no avanzaron ningún peón de escape ('ventana'), el Rey quedó acorralado."
      },
      {
        id: 3,
        title: "El Tenedor de la Llama 🦙",
        category: "Tácticas: Ataque Doble",
        description: "¡Ataque doble! Tu Llama Mágica puede amenazar al Rey y a la Torre rival al mismo tiempo.",
        hint: "Salta con la Llama a la casilla c7. ¡Atacarás al Rey y a la Torre a la vez!",
        explanation: "¡Tenedor real! El Rey tiene que huir del jaque y en la siguiente jugada capturarás la Torre gratis."
      },
      {
        id: 4,
        title: "El Mate Árabe 🌙",
        category: "Jaque Mate en 1",
        description: "La Llama y la Torre coordinadas en la esquina del tablero.",
        hint: "La Torre blanca puede ir a h7. La Llama en f6 la defenderá y sellará la casilla g8.",
        explanation: "¡Mate Árabe! Uno de los mates más antiguos y elegantes de la historia del ajedrez."
      },
      {
        id: 5,
        title: "La Clavada de la Orquídea 🎯",
        category: "Tácticas: Clavada",
        description: "La Reina rival está en la misma diagonal que su Rey. ¡Inmovilízala!",
        hint: "Mueve tu Orquídea a b5. Como el Rey está detrás de su Reina, ¡la Reina no puede moverse!",
        explanation: "¡Clavada absoluta! La Reina rival no puede escapar sin dejar a su Rey en jaque ilegal."
      },
      {
        id: 6,
        title: "El Doble Ataque del Colibrí 🐤",
        category: "Tácticas: Tenedor",
        description: "Un valiente peón puede poner en apuros a dos gigantes.",
        hint: "Avanza tu peón un paso a d4 para amenazar a la Torre de c5 y al Alfil de e5 al mismo tiempo.",
        explanation: "¡Tenedor de peón! Las negras solo pueden salvar una de sus dos piezas valiosas."
      },
      {
        id: 7,
        title: "El Mate de la Coz (Asfixiado) 💨",
        category: "Jaque Mate en 1",
        description: "El Rey rival está rodeado por sus propios guardianes. ¡Un salto basta!",
        hint: "Salta con tu Llama a f7. ¡El Rey rival está tan encerrado que no tiene a dónde escapar!",
        explanation: "¡Mate de la coz! Las propias piezas rivales le impiden respirar a su Rey."
      },
      {
        id: 8,
        title: "La Batería de Primavera ⚡",
        category: "Jaque Mate en 1",
        description: "Torre y Reina alineadas en la columna 'h'. ¡Lanza el ataque frontal!",
        hint: "Lleva tu Reina a h7 con captura. Tu Torre en h1 la respalda como un cañón detrás.",
        explanation: "¡Impacto directo! Cuando la Torre respalda a la Reina en la misma columna, forman una batería pesada imparable."
      }
    ],
    bots: {
      easy: {
        name: "Pajarito Curioso",
        elo: "Elo ~400 (Principiante)",
        quotes: ["¡Pío! ¡Qué jugada tan interesante!", "Aún estoy aprendiendo a volar...", "¡Cuidado con las esquinas!"]
      },
      medium: {
        name: "Llama Sabia",
        elo: "Elo ~900 (Intermedio)",
        quotes: ["Cada salto en 'L' esconde un misterio.", "El centro del tablero es mi montaña.", "Piensa dos pasos antes de mover."]
      },
      hard: {
        name: "Oso Guardián",
        elo: "Elo ~1400 (Maestro)",
        quotes: ["Ninguna debilidad escapa a mi mirada.", "La paciencia forja la victoria.", "Demuestra que dominas la selva."]
      }
    }
  },

  en: {
    appTitle: "Checkmate to the King — Andes Adventure",
    hud: {
      sound: "Audio",
      dialogue: "Dialogue",
      backpack: "🎒 MENU",
      minimize: "▼ MINIMIZE",
      expand: "▲ VIEW DIALOGUE"
    },
    menu: {
      title: "🎒 Adventure Backpack",
      learnTitle: "Academy",
      learnSub: "10 steps and pieces",
      miniTitle: "Minigames",
      miniSub: "Training grounds",
      puzzlesTitle: "Puzzles",
      puzzlesSub: "Tactics gym",
      playTitle: "Duel vs AI",
      playSub: "3 Guardians",
      trophiesTitle: "Medal Hall & Rank",
      trophiesSub: "Achievements & log",
      decksTitle: "Piece Decks",
      decksSub: "Sets & styles",
      chooseDeck: "🎴 Choose your Piece Set (Deck):",
      customDeckTitle: "🎨 Design your Custom Deck:",
      whitePieces: "White Pieces (Light)",
      blackPieces: "Black Pieces (Shadow)",
      activeDeck: "Active Deck",
      useDeck: "Use this Deck",
      customizeDeck: "Customize Piece by Piece",
      tabSets: "🎴 Piece Sets",
      tabTerrains: "🗺️ Board Terrains",
      chooseBoardPreset: "🗺️ Terrain Presets:",
      customizeTiles: "🎨 Customize Light & Dark Tiles:",
      lightTilesTitle: "☀️ Light Squares (Sun):",
      darkTilesTitle: "🌙 Dark Squares (Shadow):",
      useBoard: "Use this Board",
      activeBoard: "Active Board",
      choosePiece: "🌿 Choose a Piece to Learn:",
      stepsList: "📜 Step-by-Step Method Lessons:",
      chooseMinigame: "⭐ Choose a Jungle Challenge:",
      choosePuzzle: "🧩 Graduated Tactical Puzzles:",
      chooseBot: "⚔️ Choose Your Guardian Rival:",
      unlocked: "✨ Unlocked",
      locked: "🔒 Locked",
      xpGained: "XP",
      points: "points",
      point: "point",
      invaluable: "Invaluable!",
      tryOnBoard: "🎯 TRY ON BOARD!"
    },
    speaker: {
      owl: "Master Owl",
      jungleTraining: "Jungle Training",
      victory: "VICTORY!",
      defeat: "Battle Finished",
      draw: "Draw"
    },
    actions: {
      continue: "▶ CONTINUE",
      nextStep: "NEXT STEP! 🚀",
      lessons: "📜 LESSONS",
      otherGame: "⭐ OTHER GAME",
      replay: "🔄 REPLAY",
      hint: "💡 GET HINT",
      puzzlesMenu: "🧩 PUZZLES",
      nextPuzzle: "NEXT PUZZLE! 🏆",
      whatToDo: "🦉 WHAT SHOULD I DO?",
      undo: "↩️ UNDO",
      rival: "⚔️ RIVAL",
      newGame: "🔄 NEW GAME",
      viewMedals: "🎒 VIEW MEDALS"
    },
    dialogues: {
      welcome: "Welcome to the <strong>Andes Academy</strong>! Touch the 3 secret squares in the center of the board: <strong>e4</strong>, <strong>d4</strong> and <strong>e5</strong>.",
      welcomeHint: "🎯 Touch the squares on the board",
      missionAccomplished: "🌟 <strong>MISSION ACCOMPLISHED!</strong>",
      movesCount: "🎮 Moves made:",
      allLessonsComplete: "🎉 Congratulations! You completed all lessons in the Andes Academy.",
      allPuzzlesComplete: "🏆 You conquered all tactical challenges in the Kingdom!",
      puzzleSolved: "🎉 <strong>MASTER MOVE!</strong>",
      puzzleFailed: "❌ <strong>Almost...</strong> That move doesn't solve the tactic. Try again!",
      coachTip: "💡 <strong>Master Owl's Tip:</strong>",
      moveUndone: "↩️ <strong>Move undone.</strong> Think your strategy through calmly.",
      yourTurn: "Your turn! Move your pieces to control the center.",
      checkAlert: "⚠️ <strong>CHECK!</strong> Your King is threatened. Apply the <strong>C-I-M</strong> shield: Capture, Interpose or Move.",
      checkmateWin: "🎉 <strong>CHECKMATE!!</strong> You defeated",
      defeatMsg: "won the match. Good effort! Review the position to learn.",
      drawMsg: "It's a draw!",
      trophyWelcome: "Welcome to the <strong>Hall of Fame</strong>! Your current rank is",
      withXP: "with",
      accumulatedXP: "accumulated XP.",
      medalsUnlockedText: "Medals unlocked",
      calculating: "(Calculating...)"
    },
    promotion: {
      title: "👑 Hummingbird Coronation!",
      desc: "Your pawn reached the end of the kingdom. Choose its new form:",
      queen: "Queen",
      knight: "Llama",
      rook: "Rook",
      bishop: "Orchid"
    },
    ranks: [
      { minXP: 0, title: "Valley Apprentice", badge: "🌱" },
      { minXP: 100, title: "Jungle Explorer", badge: "🌿" },
      { minXP: 250, title: "Andes Guardian", badge: "🏔️" },
      { minXP: 450, title: "Mist Tactician", badge: "🦅" },
      { minXP: 700, title: "Condor Master", badge: "👑" },
      { minXP: 1000, title: "Grand Board Shaman", badge: "⚡" },
      { minXP: 1500, title: "Immortal Inca", badge: "☀️" }
    ],
    medals: [
      { id: "first_lesson", name: "First Steps", desc: "Completed your first Academy lesson", icon: "🌟" },
      { id: "all_lessons", name: "Graduated Master", desc: "Mastered all 10 Academy lessons", icon: "🎓" },
      { id: "route_star", name: "Star Hunter", desc: "Completed the Route Planner", icon: "⭐" },
      { id: "knight_maze", name: "Maze Rider", desc: "Conquered the Llama Maze", icon: "🦙" },
      { id: "tactics_hero", name: "Tactical Mind", desc: "Solved 5 tactical chess puzzles", icon: "🧩" },
      { id: "first_win", name: "Checkmate!", desc: "Won your first game against a bot", icon: "⚔️" },
      { id: "beat_hard", name: "Bear Vanquisher", desc: "Defeated the Guardian Bear on Master level", icon: "🐻" }
    ],
    pieces: {
      p: {
        name: "Guardian Bird (Pawn)",
        whiteName: "Valley Hummingbird",
        blackName: "Snow Crow",
        desc: "Advances 1 square forward (or 2 on its first move) and captures diagonally.",
        fact: "If it crosses the entire board, it transforms into a Queen!",
        emoji: "🐤"
      },
      n: {
        name: "Andean Steed (Knight)",
        whiteName: "Magic Llama",
        blackName: "Spectacled Bear",
        desc: "Jumps in an 'L' shape (2 squares one way and 1 to the side).",
        fact: "It's the only piece that can jump over allies and enemies!",
        emoji: "🦙"
      },
      b: {
        name: "Sacred Flower (Bishop)",
        whiteName: "White Orchid",
        blackName: "Purple Orchid",
        desc: "Glides swiftly along diagonals of its starting color.",
        fact: "It can never land on squares of the opposite color.",
        emoji: "🌸"
      },
      r: {
        name: "Emerald Fortress (Rook)",
        whiteName: "Crystal Tower",
        blackName: "Obsidian Tower",
        desc: "Dominates straight ranks and files with unlimited range.",
        fact: "Together with the King, it can perform the special Castling move.",
        emoji: "🏰"
      },
      q: {
        name: "Jungle Queen (Queen)",
        whiteName: "Spring Queen",
        blackName: "Forest Queen",
        desc: "Combines the powers of Rook and Bishop: moves anywhere!",
        fact: "The most valuable defender and attacker in your entire army.",
        emoji: "👑"
      },
      k: {
        name: "Wise King (King)",
        whiteName: "King of Flora",
        blackName: "King of Night",
        desc: "Moves 1 square in any direction. Must never be captured!",
        fact: "The goal of chess is putting the enemy King in Checkmate.",
        emoji: "🌿"
      }
    },
    lessons: [
      {
        id: 1,
        title: "1. The Board & Coordinates",
        subtitle: "Learn the map of the kingdom!",
        character: "🦉 Master Owl",
        dialogue: "Welcome to the Academy! The chessboard has 64 squares (32 light and 32 dark). Letters (a-h) are **files (columns)** and numbers (1-8) are **ranks (rows)**. Your bottom-right corner square must ALWAYS be light.",
        instruction: "Touch the 3 secret squares in the **Center of the Board: e4, d4, and e5**.",
        explanation: "Excellent! Whoever controls the 4 center squares (e4, d4, e5, d5) controls the entire kingdom."
      },
      {
        id: 2,
        title: "2. The Guardian Hummingbird (The Pawn)",
        subtitle: "Small but unstoppable!",
        character: "🦉 Master Owl",
        dialogue: "The **Hummingbird (Pawn)** always moves forward: 2 steps on its first flight or 1 step afterwards. But take note: it captures **diagonally** forward.",
        instruction: "Fly your Hummingbird two steps forward to the **e4** square.",
        explanation: "Perfect! Advancing the King's pawn two steps is the classic opening to free your army."
      },
      {
        id: 3,
        title: "3. The Magic Llama (The Knight)",
        subtitle: "The obstacle jumper!",
        character: "🦉 Master Owl",
        dialogue: "The **Magic Llama (Knight)** moves in an **'L' shape** (2 squares in one direction, 1 to the side). It is the only creature that can jump over other pieces!",
        instruction: "Make your Llama jump from b1 to the central **c3** square.",
        explanation: "Magnificent jump! On c3, the Llama watches over the center and guards the kingdom."
      },
      {
        id: 4,
        title: "4. The Emerald Fortress (The Rook)",
        subtitle: "Straight lines and mighty power!",
        character: "🦉 Master Owl",
        dialogue: "The **Fortress (Rook)** glides in **straight lines**: as many open squares as it wants along rows or columns. It's a long-range cannon!",
        instruction: "Use your Fortress on c5 to capture the **3 black crows** in straight lines.",
        explanation: "Total sweep! Rooks are relentless at controlling open files."
      },
      {
        id: 5,
        title: "5. The Sacred Orchid (The Bishop)",
        subtitle: "Guardian of the diagonals!",
        character: "🦉 Master Owl",
        dialogue: "The **Orchid (Bishop)** travels exclusively along the **diagonals** of the color it started on. It will never change square color in the entire game.",
        instruction: "Slide your Orchid from d5 to the top-right corner on **h1** (or g8).",
        explanation: "Great diagonal! A coordinated pair of bishops can slice through the entire board."
      },
      {
        id: 6,
        title: "6. The Queen & Coronation",
        subtitle: "Maximum power and transformation!",
        character: "🦉 Master Owl",
        dialogue: "The **Queen** combines the powers of Rook and Bishop: she moves anywhere! Also, if a Hummingbird reaches the enemy's last rank, it **promotes** into a Queen!",
        instruction: "Advance your Hummingbird to the e8 square and crown it as a glorious Queen.",
        explanation: "Long live the Queen! Even the smallest piece can decide the fate of the realm."
      },
      {
        id: 7,
        title: "7. The Wise King & Safety",
        subtitle: "The heart of your army!",
        character: "🦉 Master Owl",
        dialogue: "The **King** is the most vital piece: it moves 1 square in any direction. The King is never captured! If it cannot escape attack, the game ends.",
        instruction: "Move your Wise King one step towards the center to the e5 square.",
        explanation: "Well done! Golden rule: your King can **NEVER** step onto a square attacked by the enemy."
      },
      {
        id: 8,
        title: "8. Check & The C-I-M Shield",
        subtitle: "Alert in the castle!",
        character: "🦉 Master Owl",
        dialogue: "When an enemy piece threatens your King, it is called **CHECK!**. Save your King with the magic **C-I-M** shield:\n1. **C**apture the attacking piece.\n2. **I**nterpose a defending piece.\n3. **M**ove the King to a safe square.",
        instruction: "The black Rook on e8 checks the King on e1. Use the **I (Interpose)** shield by moving your Bishop from f1 to e2.",
        explanation: "Perfect shield! Interposing the Bishop blocks the file and keeps the King safe."
      },
      {
        id: 9,
        title: "9. Checkmate! The Ultimate Victory",
        subtitle: "No escape, no defense!",
        character: "🦉 Master Owl",
        dialogue: "**Checkmate** happens when the King is in check and **CANNOT** Capture, Interpose, or Move. The game ends and you win the trophy!",
        instruction: "The enemy King is trapped behind its own pawns (the back-rank mate). Move your Queen to e8 and deliver Checkmate!",
        explanation: "CHECKMATE!! The enemy army could not defend their King. Decisive victory!"
      },
      {
        id: 10,
        title: "10. Castling: The Secret Sanctuary",
        subtitle: "The only double move in chess!",
        character: "🦉 Master Owl",
        dialogue: "**Castling** is a special move where King and Rook move together: King steps 2 squares towards Rook, and Rook jumps to the other side. Protect your King and activate your Rook at once!",
        instruction: "Perform **Kingside Castling**: move your King two steps to the right (g1 square).",
        explanation: "Masterful castling! Now your King rests safely and your Rook is ready for battle."
      }
    ],
    minigames: {
      routePlanner: { title: "⭐ Route Planner", subtitle: "Collect all stars with your piece." },
      knightMaze: { title: "🦙 Llama Maze", subtitle: "Reach the Golden Chest 🏆 dodging sentinels with 'L' jumps." },
      spaceInvaders: { title: "👾 Tactical Space Invaders", subtitle: "Capture invading pieces with your Rook before they advance!" },
      sumoBattle: { title: "🥊 Battle of Kings", subtitle: "Advance your King to the central crown mastering opposition." },
      invaderCrossed: "An invader crossed the line! Try again.",
      knightWon: "You reached the Golden Chest with perfect jumps!",
      spaceWon: "Invaders neutralized successfully!",
      sumoWon: "Total mastery of the center and opposition!"
    },
    puzzles: [
      {
        id: 1,
        title: "Queen's Kiss 👑",
        category: "Mate in 1",
        description: "Your Spring Queen is backed by the Orchid on c4. Deliver the final blow!",
        hint: "Target f7, the opponent King's weakest point, supported by your Queen and Bishop.",
        explanation: "Checkmate! The Queen attacks the King face-to-face ('the kiss') protected by the Bishop, so she cannot be captured."
      },
      {
        id: 2,
        title: "Back-Rank Mate 🏰",
        category: "Mate in 1",
        description: "Enemy pawns trap their own King on the 8th rank. Take advantage of the hallway!",
        hint: "Move your Emerald Fortress to the enemy back rank. Their pawns block any escape.",
        explanation: "Back-rank mate! Because they never created an escape 'window' (luft), the King is cornered."
      },
      {
        id: 3,
        title: "The Llama Fork 🦙",
        category: "Tactics: Double Attack",
        description: "Double attack! Your Magic Llama can threaten King and enemy Rook at the same time.",
        hint: "Jump with the Llama to c7. You'll attack King and Rook simultaneously!",
        explanation: "Royal fork! The King must flee the check, and next turn you'll capture the Rook for free."
      },
      {
        id: 4,
        title: "The Arabian Mate 🌙",
        category: "Mate in 1",
        description: "The Llama and Rook working together in the corner of the board.",
        hint: "The white Rook can move to h7. The Llama on f6 defends it and seals off g8.",
        explanation: "Arabian Mate! One of the oldest and most elegant mates in chess history."
      },
      {
        id: 5,
        title: "The Orchid Pin 🎯",
        category: "Tactics: Absolute Pin",
        description: "The enemy Queen is on the same diagonal as her King. Freeze her in place!",
        hint: "Move your Orchid to b5. With the King directly behind her, the Queen cannot move!",
        explanation: "Absolute pin! The enemy Queen cannot move without putting her King into illegal check."
      },
      {
        id: 6,
        title: "Hummingbird Double Attack 🐤",
        category: "Tactics: Pawn Fork",
        description: "A brave pawn can challenge two giants at once.",
        hint: "Push your pawn one step to d4 to threaten both the c5 Rook and the e5 Bishop.",
        explanation: "Pawn fork! Black can only save one of their two valuable pieces."
      },
      {
        id: 7,
        title: "Smothered Mate 💨",
        category: "Mate in 1",
        description: "The enemy King is boxed in by its own defenders. A single jump will do!",
        hint: "Jump with your Llama to f7. The enemy King is so cramped it has nowhere to go!",
        explanation: "Smothered mate! The enemy's own pieces prevent their King from breathing."
      },
      {
        id: 8,
        title: "Spring Battery ⚡",
        category: "Mate in 1",
        description: "Rook and Queen aligned on the 'h' file. Launch the frontal assault!",
        hint: "Move your Queen to h7 with capture. Your Rook on h1 supports her like a cannon.",
        explanation: "Direct hit! When Rook backs Queen on an open file, they form an unstoppable heavy battery."
      }
    ],
    bots: {
      easy: {
        name: "Curious Bird",
        elo: "Elo ~400 (Beginner)",
        quotes: ["Chirp! What an interesting move!", "I'm still learning how to fly...", "Watch out for the corners!"]
      },
      medium: {
        name: "Wise Llama",
        elo: "Elo ~900 (Intermediate)",
        quotes: ["Every 'L' jump conceals a mystery.", "The center of the board is my mountain.", "Think two steps ahead."]
      },
      hard: {
        name: "Guardian Bear",
        elo: "Elo ~1400 (Master)",
        quotes: ["No weakness escapes my gaze.", "Patience crafts victory.", "Prove you can master the jungle."]
      }
    }
  }
};

class I18nManager {
  constructor() {
    let initial = 'es';
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('lang');
      if (q && I18N_DATA[q]) initial = q;
      else initial = localStorage.getItem('jaque_lang') || 'es';
    } catch (e) {
      initial = 'es';
    }
    this.currentLang = I18N_DATA[initial] ? initial : 'es';
    this.listeners = [];
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    if (I18N_DATA[lang]) {
      this.currentLang = lang;
      localStorage.setItem('jaque_lang', lang);
      this.notifyListeners();
    }
  }

  toggleLang() {
    this.setLang(this.currentLang === 'es' ? 'en' : 'es');
  }

  t(path) {
    const keys = path.split('.');
    let cur = I18N_DATA[this.currentLang];
    for (const k of keys) {
      if (!cur || cur[k] === undefined) {
        // Fallback to spanish if missing
        let fallback = I18N_DATA['es'];
        for (const fk of keys) {
          if (!fallback || fallback[fk] === undefined) return path;
          fallback = fallback[fk];
        }
        return fallback;
      }
      cur = cur[k];
    }
    return cur;
  }

  getLessons() {
    return I18N_DATA[this.currentLang].lessons;
  }

  getMinigames() {
    return I18N_DATA[this.currentLang].minigames;
  }

  getPuzzles() {
    return I18N_DATA[this.currentLang].puzzles;
  }

  getBots() {
    return I18N_DATA[this.currentLang].bots;
  }

  getRanks() {
    return I18N_DATA[this.currentLang].ranks;
  }

  getMedals() {
    return I18N_DATA[this.currentLang].medals;
  }

  getPieces() {
    return I18N_DATA[this.currentLang].pieces;
  }

  onLanguageChange(fn) {
    this.listeners.push(fn);
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(this.currentLang); } catch (e) { console.error('i18n listener error:', e); }
    });
  }
}

window.I18N_DATA = I18N_DATA;
window.i18n = new I18nManager();
