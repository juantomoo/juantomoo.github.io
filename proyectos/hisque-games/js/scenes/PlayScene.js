// NOTA: Se repite lógica de carga de assets y manejo de colisiones similar a ChapterScene.
// Considerar refactorizar funciones comunes en un módulo utilitario.
import { loadCommonAssets, loadChapterAssets } from '../AssetLoader.js';
import { initializeGame } from '../GameInit.js';
import { showMessage, showDialog } from '../GameUI.js'; // <-- Agregar showDialog aquí
import { isOutOfBounds, checkSelfCollision, checkCollisionWithArray, isOccupied } from '../GameCollisions.js';
import { getTextStyle } from '../StyleManager.js';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayScene' });
  }

  init(data) {
    this.chapterNumber = data.chapterNumber || 1;
    this.showDialogOnStart = data.showDialog || false;
    // Si se recibe "Tutorial", se asigna capítulo 1
    if (this.chapterNumber === 'Tutorial') {
      this.chapterNumber = 1;
    }
    if (this.chapterNumber === 1) {
      this.chapterTitle = "Residuos en el Jardín";
      this.introImage = "bg_chapter_01_intro";
      this.introMission = "Misión: Recoge y recicla los residuos en el jardín para restaurar su belleza.";
      this.outroImage = "serpiente_cap01-02.png";
      this.outroTip = "Consejo: Un jardín limpio es el primer paso para un planeta sano.";
      this.initialLevel = 1;
      this.residueTypes = ['papel', 'plastico', 'vidrio', 'organico'];
      this.bgGameImage = 'bg_chapter_01';
    } else if (this.chapterNumber === 2) {
      this.chapterTitle = "Residuos en el Garaje";
      this.introImage = "bg_chapter_02_intro";
      this.introMission = "Misión: Ordena y recicla los residuos en el garaje para evitar la contaminación.";
      this.outroImage = "serpiente_cap02-02.png";
      this.outroTip = "Consejo: Reciclar en el garaje ayuda a prevenir desastres ambientales.";
      this.initialLevel = 3;
      this.residueTypes = ['bateria', 'metal', 'madera', 'plastico'];
      this.bgGameImage = 'bg_chapter_02';
    }
    // Fin del capítulo al llegar a 100 puntos
    this.chapterEndScore = 100;
    // Estado inicial: INTRO
    this.state = "INTRO";
    this.npcMessages = [
      "Cada residuo tiene su lugar.",
      "Reciclar es fácil y divertido.",
      "Tus acciones marcan la diferencia.",
      "El planeta te lo agradecerá.",
      "Eco, ¡sigue así!"
    ];
    this.dialogAreaHeight = 30;
  }

  preload() {
    // Refactorización: uso centralizado para cargar assets
    loadCommonAssets(this);
    loadChapterAssets(this, this.chapterNumber, this.introImage, this.outroImage, this.residueTypes);
    // Cargar contenedores adicionales para el Capítulo 3
    if (this.chapterNumber === 2 || this.chapterNumber === 1) { // <--- agregar chapterNumber === 1
      this.load.image('contenedor_bateria', 'assets/contenedor_bateria.png');
      this.load.image('contenedor_metal', 'assets/contenedor_metal.png');
      this.load.image('contenedor_madera', 'assets/contenedor_madera.png');
    }
    if (this.chapterNumber === 1 && !this.textures.exists(this.bgGameImage)) {
      this.load.image(this.bgGameImage, `assets/${this.bgGameImage}.png`);
    }
  }

  create() {
    // Eliminar cualquier diálogo previo
    if (this.dialogContainer) { 
        this.dialogContainer.destroy(); 
        this.dialogContainer = null; 
    }
    // Creamos contenedores para objetos de juego y UI
    this.gameObjectsContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);

    // Avanza de pantalla con SPACE
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.state === "INTRO") {
        this.startGame();
      } 
    });

    // Siempre se muestra la pantalla de introducción
    this.showIntroScreen();
    if (this.showDialogOnStart) {
      const randomMsg = Phaser.Utils.Array.GetRandom(this.npcMessages);
      showDialog(this, randomMsg);
      this.showDialogOnStart = false;
    }
  }

  showIntroScreen() {
    this.gameObjectsContainer.removeAll(true);
    this.uiContainer.removeAll(true);

    // Fondo: imagen de introducción
    this.gameObjectsContainer.add(this.add.image(0, 0, this.introImage).setOrigin(0));
    // Título centrado en la parte superior
    let titleText = this.add.text(this.cameras.main.width / 2, 20, this.chapterTitle, getTextStyle('h1')).setOrigin(0.5, 0);
    // Párrafo de misión alineado a la izquierda
    let missionText = this.add.text(20, 60, this.introMission, getTextStyle('p'));
    this.uiContainer.add([titleText, missionText]);
    // Instrucciones para comenzar
    let instrText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 60, "Presiona [ESPACIO] para comenzar", getTextStyle('p')).setOrigin(0.5);
    this.uiContainer.add(instrText);

    this.state = "INTRO";
  }

  startGame() {
    // Se limpia la pantalla de introducción
    this.gameObjectsContainer.removeAll(true);
    this.uiContainer.removeAll(true);

    // Inicializamos variables del juego
    initializeGame(this);

    // Crear contenedores (posicionados igual que antes)
    let maxTiles = Math.floor(220 / this.tileSize);
    this.contenedors = [];
    if (this.chapterNumber === 1) {
      // Contenedores para "Residuos en el Jardín"
      this.contenedors.push({ x: 2, y: 2, type: 'papel', width: 16, height: 16 });
      this.contenedors.push({ x: maxTiles - 5, y: 2, type: 'plastico', width: 16, height: 16 });
      this.contenedors.push({ x: 2, y: maxTiles - 9, type: 'vidrio', width: 16, height: 16 });
      this.contenedors.push({ x: maxTiles - 5, y: maxTiles - 9, type: 'organico', width: 16, height: 16 });
    } else if (this.chapterNumber === 2) {
      // Contenedores para "Residuos en el Garaje"
      this.contenedors.push({ x: 2, y: 2, type: 'bateria', width: 16, height: 16 });
      this.contenedors.push({ x: maxTiles - 5, y: 2, type: 'metal', width: 16, height: 16 });
      this.contenedors.push({ x: 2, y: maxTiles - 9, type: 'madera', width: 16, height: 16 });
      this.contenedors.push({ x: maxTiles - 5, y: maxTiles - 9, type: 'plastico', width: 16, height: 16 });
    }

    // Generamos el primer residuo (se usaba spawnTutorialResidue para chapter 1, ahora siempre spawnResidue)
    this.spawnResidue();

    // Creamos la UI de juego: puntaje, nivel y mensajes del NPC
    this.scoreText = this.add.text(2, 2, 'Puntos: 0', { ...getTextStyle('p1'), fill: '#FFFF00' });
    this.levelText = this.add.text(2, 10, 'Nivel: ' + this.level, getTextStyle('p'));
    this.uiContainer.add([this.scoreText, this.levelText]);

    // Posición inicial de la serpiente
    const gameWidth = 220;
    const gameHeight = 220 - this.dialogAreaHeight;
    const startX = Math.floor(gameWidth / (2 * this.tileSize));
    const startY = Math.floor(gameHeight / (2 * this.tileSize));
    for (let i = 0; i < this.serpienteLength; i++) {
      this.serpiente.push({ x: startX - i, y: startY });
    }

    // Configuramos bgGameImage para que se repita como patrón
    if (this.textures.exists(this.bgGameImage)) {
      let texture = this.textures.get(this.bgGameImage);
      if (typeof texture.setWrap === 'function') {
        texture.setWrap('repeat', 'repeat');
      }
    }
    // Usamos tileSprite para que bgGameImage se repita como patrón
    let bgTile = this.add.tileSprite(0, 0, gameWidth, gameHeight, this.bgGameImage).setOrigin(0);
    this.gameObjectsContainer.add(bgTile);

    // Mostrar un diálogo narrativo inicial usando el NPC
    const randomMsg = Phaser.Utils.Array.GetRandom(this.npcMessages);
    showDialog(this, randomMsg);

    this.state = "GAME";
    // Se genera un residuo adicional según la lógica de juego
  }

  update(time) {
    // Evitar ejecutar la actualización si el estado ya no es GAME o el juego está en pausa.
    if(this.state !== "GAME" || this.isPaused) return;
  
    // ...existing update code...
    if (this.cursors.left.isDown && this.direction !== 'RIGHT') this.direction = 'LEFT';
    if (this.cursors.right.isDown && this.direction !== 'LEFT') this.direction = 'RIGHT';
    if (this.cursors.up.isDown && this.direction !== 'DOWN') this.direction = 'UP';
    if (this.cursors.down.isDown && this.direction !== 'UP') this.direction = 'DOWN';

    if (time - this.lastMoveTime > this.speed) {
      this.lastMoveTime = time;
      this.moveSerpiente();
      this.handleCollisions();
    }
    this.drawGame();

    // Finaliza el capítulo al alcanzar 100 puntos
    if (this.score >= this.chapterEndScore) {
      this.finishChapter();
    }
  }

  moveSerpiente() {
    let head = { ...this.serpiente[0] };
    if (this.direction === 'LEFT') head.x--;
    else if (this.direction === 'RIGHT') head.x++;
    else if (this.direction === 'UP') head.y--;
    else if (this.direction === 'DOWN') head.y++;
    this.serpiente.unshift(head);
    if (!this.hasEaten) {
      this.serpiente.pop();
    } else {
      this.hasEaten = false;
    }
  }

  handleCollisions() {
    // ...existing collision code para capítulos normales...
    let head = this.serpiente[0];
    if (
      isOutOfBounds(head, this.tileSize, 220, 220 - this.dialogAreaHeight) ||
      checkSelfCollision(head, this.serpiente) ||
      checkCollisionWithArray(head, this.obstacles, this.tileSize)
    ) {
      this.gameOver();
      return;
    }
    // Colisiones con power ups
    for (let i = 0; i < this.powerUps.length; i++) {
      if (checkCollisionWithArray(head, [this.powerUps[i]], this.tileSize)) {
        this.powerUps.splice(i, 1);
        this.activateSlowPowerUp();
        break;
      }
    }
    // Colisiones con residuos
    for (let i = 0; i < this.residues.length; i++) {
      if (checkCollisionWithArray(head, [this.residues[i]], this.tileSize)) {
        this.collectedResidues.push(this.residues[i].type);
        this.residues.splice(i, 1);
        this.hasEaten = true;
        this.spawnResidue();
        this.showMessage('¡Buen trabajo! Has recogido un residuo.');
        break;
      }
    }
    // Colisiones con contenedores (se elimina la verificación basada en tutorialIndex)
    for (let i = 0; i < this.contenedors.length; i++) {
      let contenedor = this.contenedors[i];
      if (checkCollisionWithArray(head, [contenedor], this.tileSize)) {
        if (this.collectedResidues.length > 0) {
          let index = this.collectedResidues.indexOf(contenedor.type);
          if (index !== -1) {
            this.collectedResidues.splice(index, 1);
            this.score += 10;
            this.showMessage('¡Correcto! Has reciclado bien.');
          } else {
            this.score -= 5;
            this.showMessage('Te has equivodcado de contenedor.');
          }
          this.scoreText.setText(`Puntos: ${this.score}`);
          this.updateLevel();
        }
      }
    }
  }

  updateLevel() {
    let newLevel = Math.max(this.initialLevel, Math.floor(this.score / 50) + 1);
    if (newLevel !== this.level) {
      this.level = newLevel;
      this.levelText.setText('Nivel: ' + this.level);
      this.speed = Math.max(50, 100 - (this.level - 1) * 10);
      this.showMessage(`¡Nivel ${this.level}!`);
      this.spawnObstacle();
    }
  }

  spawnResidue() {
    const gameWidth = 220;
    const gameHeight = 220 - this.dialogAreaHeight;
    const maxTilesW = Math.floor(gameWidth / this.tileSize);
    const maxTilesH = Math.floor(gameHeight / this.tileSize);
    const x = Phaser.Math.Between(0, maxTilesW - 1);
    const y = Phaser.Math.Between(0, maxTilesH - 1);
    if (isOccupied(x, y, this.serpiente, this.residues, this.contenedors, this.tileSize) ||
        checkCollisionWithArray({x, y}, this.obstacles, this.tileSize) ||
        checkCollisionWithArray({x, y}, this.powerUps, this.tileSize)) {
      this.spawnResidue();
      return;
    }
    // Definir randomType usando residueTypes
    const randomType = Phaser.Utils.Array.GetRandom(this.residueTypes);
    this.residues.push({ x, y, type: randomType, width: this.tileSize, height: this.tileSize });
  }

  spawnPowerUp() {
    const gameWidth = 220;
    const gameHeight = 220 - this.dialogAreaHeight;
    const maxTilesW = Math.floor(gameWidth / this.tileSize);
    const maxTilesH = Math.floor(gameHeight / this.tileSize);
    const x = Phaser.Math.Between(0, maxTilesW - 1);
    const y = Phaser.Math.Between(0, maxTilesH - 1);
    if (isOccupied(x, y, this.serpiente, this.residues, this.contenedors, this.tileSize) ||
        checkCollisionWithArray({x, y}, this.obstacles, this.tileSize) ||
        checkCollisionWithArray({x, y}, this.powerUps, this.tileSize)) {
      this.spawnPowerUp();
      return;
    }
    this.powerUps.push({ x, y });
  }

  spawnObstacle() {
    const gameWidth = 220;
    const gameHeight = 220 - this.dialogAreaHeight;
    const maxTilesW = Math.floor(gameWidth / this.tileSize);
    const maxTilesH = Math.floor(gameHeight / this.tileSize);
    const x = Phaser.Math.Between(0, maxTilesW - 1);
    const y = Phaser.Math.Between(0, maxTilesH - 1);
    if (isOccupied(x, y, this.serpiente, this.residues, this.contenedors, this.tileSize) ||
        checkCollisionWithArray({x, y}, this.obstacles, this.tileSize) ||
        checkCollisionWithArray({x, y}, this.powerUps, this.tileSize)) {
      this.spawnObstacle();
      return;
    }
    this.obstacles.push({ x, y });
  }

  activateSlowPowerUp() {
    if (this.slowPowerUpActive) return;
    this.slowPowerUpActive = true;
    let originalSpeed = this.speed;
    this.speed += 50;
    this.showMessage('Power Up: ¡Más calma!');
    this.time.delayedCall(5000, () => {
      this.speed = originalSpeed;
      this.slowPowerUpActive = false;
      this.showMessage('Power Up finalizado.');
    });
  }

  drawGame() {
    this.gameObjectsContainer.removeAll(true);
    // Calculamos dimensiones del área de juego
    const gameWidth = 220;
    const gameHeight = 220 - this.dialogAreaHeight;
    // Configuramos bgGameImage para que se repita como patrón
    if (this.textures.exists(this.bgGameImage)) {
      let texture = this.textures.get(this.bgGameImage);
      if (typeof texture.setWrap === 'function') {
        texture.setWrap('repeat', 'repeat');
      }
      // Se reemplaza la imagen estática por tileSprite con patrón repetido
      let bgTile = this.add.tileSprite(0, 0, gameWidth, gameHeight, this.bgGameImage).setOrigin(0).setDepth(-1);
      if (bgTile) {
        this.gameObjectsContainer.add(bgTile);
      } else {
        console.error(`bgTile is null for texture ${this.bgGameImage}`);
      }
    } else {
      console.error(`Texture ${this.bgGameImage} does not exist.`);
    }

    for (let i = 0; i < this.serpiente.length; i++) {
      const part = this.serpiente[i];
      const sprite = i === 0 ? 'serpiente_cabeza' : 'serpiente_cuerpo';
      if (this.textures.exists(sprite)) {
        const snakePart = this.add.image(part.x * this.tileSize, part.y * this.tileSize, sprite).setOrigin(0).setDepth(1);
        if (snakePart) {
          this.gameObjectsContainer.add(snakePart);
        } else {
          console.error(`snakePart is null for sprite ${sprite}`);
        }
      } else {
        console.error(`Texture ${sprite} does not exist.`);
      }
    }

    for (let residue of this.residues) {
      if (this.textures.exists(residue.type)) {
        const residueImage = this.add.image(residue.x * this.tileSize, residue.y * this.tileSize, residue.type).setOrigin(0).setDepth(1);
        if (residueImage) {
          this.gameObjectsContainer.add(residueImage);
        } else {
          console.error(`residueImage is null for texture ${residue.type}`);
        }
      } else {
        console.error(`Texture ${residue.type} does not exist.`);
      }
    }

    for (let contenedor of this.contenedors) {
      const contenedorTexture = `contenedor_${contenedor.type}`;
      if (this.textures.exists(contenedorTexture)) {
        const contenedorImage = this.add.image(contenedor.x * this.tileSize, contenedor.y * this.tileSize, contenedorTexture).setOrigin(0).setDepth(1);
        if (contenedorImage) {
          this.gameObjectsContainer.add(contenedorImage);
        } else {
          console.error(`contenedorImage is null for texture ${contenedorTexture}`);
        }
      } else {
        console.error(`Texture ${contenedorTexture} does not exist.`);
      }
    }

    for (let obs of this.obstacles) {
      if (this.textures.exists('obstacle')) {
        const obstacleImage = this.add.image(obs.x * this.tileSize, obs.y * this.tileSize, 'obstacle').setOrigin(0).setDepth(1);
        if (obstacleImage) {
          this.gameObjectsContainer.add(obstacleImage);
        } else {
          console.error(`obstacleImage is null for texture obstacle`);
        }
      } else {
        console.error(`Texture obstacle does not exist.`);
      }
    }

    for (let pu of this.powerUps) {
      if (this.textures.exists('power_up')) {
        const powerUpImage = this.add.image(pu.x * this.tileSize, pu.y * this.tileSize, 'power_up').setOrigin(0).setDepth(1);
        if (powerUpImage) {
          this.gameObjectsContainer.add(powerUpImage);
        } else {
          console.error(`powerUpImage is null for texture power_up`);
        }
      } else {
        console.error(`Texture power_up does not exist.`);
      }
    }

    if (this.scoreText && this.scoreText.setText) {
      this.scoreText.setText(`Puntos: ${this.score}`).setStyle({ ...getTextStyle('p1'), fill: '#FFFF00' });
    } else {
      console.error('this.scoreText is null or undefined');
    }
  }

  finishChapter() {
    this.state = "OUTRO";
    this.gameObjectsContainer.removeAll(true);
    this.uiContainer.removeAll(true);
    // Mostramos la pantalla final del capítulo
    if (this.textures.exists(this.outroImage)) { // Verificar si la textura existe
      this.gameObjectsContainer.add(this.add.image(0, 0, this.outroImage).setOrigin(0));
    } else {
      console.error(`Texture ${this.outroImage} does not exist.`);
    }
    let outroText = this.add.text(this.cameras.main.width / 2, 20, this.outroTip, getTextStyle('p')).setOrigin(0.5, 0);
    this.uiContainer.add(outroText);
    let instrText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 60, "Presiona [ESPACIO] para continuar", getTextStyle('p')).setOrigin(0.5);
    this.uiContainer.add(instrText);
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.chapterNumber === 1) {
        // Se cambia la key de la escena a 'PlayScene' para pasar al capítulo 2
        this.scene.start('PlayScene', { chapterNumber: 2 });
      } else {
        this.scene.start('MenuScene');
      }
    });
  }

  gameOver() {
    // Al producirse Game Over, reiniciamos el capítulo pasando la información, sin intentar mostrar el diálogo aquí.
    this.scene.start('GameOverScene', { score: this.score, chapterNumber: this.chapterNumber });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.showMessage('Juego en pausa. Presiona espacio para continuar.');
    }
  }

  // Se actualiza showMessage para usar exclusivamente dialogContainer
  showMessage(message) {
    if (!this.dialogContainer) {
      const width = this.cameras.main.width;
      const height = 30;
      const dialogBg = this.add.rectangle(width/2, this.cameras.main.height - height/2, width, height, 0x000000, 0.7);
      const npcSprite = this.add.image(20, this.cameras.main.height - height/2, 'serpiente_npc').setOrigin(0.5);
      let textStyle = getTextStyle('p');
      const dialogText = this.add.text(40, this.cameras.main.height - height/2, message, textStyle).setOrigin(0, 0.5);
      this.dialogContainer = this.add.container(0, 0, [dialogBg, npcSprite, dialogText]);
    } else {
      let dialogText = this.dialogContainer.getAt(2);
      if (dialogText) {
        dialogText.setText(message);
      }
    }
    this.time.delayedCall(2000, () => {
      const dt = this.dialogContainer ? this.dialogContainer.getAt(2) : null;
      if (dt && dt.active) {
        dt.setText('');  // Se limpia el contenido en lugar de destruir el elemento.
      }
    });
  }
}
