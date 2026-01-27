import { getTextStyle } from '../StyleManager.js';

export default class ChapterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChapterScene' });
    }

    init(data) {
        // Configuración por defecto: capítulo 1 ("Residuos en el Jardín")
        this.chapterNumber = data.chapterNumber || 1;
        if (this.chapterNumber === 1) {
            this.chapterTitle = "Residuos en el Jardín";
            this.introImage = "serpiente_cap01-01.png";
            this.introMission = "Misión: Recoge y recicla los residuos en el jardín para restaurar su belleza.";
            this.outroImage = "serpiente_cap01-02.png";
            this.outroTip = "Consejo: Un jardín limpio es el primer paso para un planeta sano.";
            this.initialLevel = 1;
            this.residueTypes = ['papel', 'plastico', 'vidrio', 'organico'];
            this.bgImage = 'bg_chapter';
        } else if (this.chapterNumber === 2) {
            this.chapterTitle = "Residuos en el Garaje";
            this.introImage = "serpiente_cap02-01.png";
            this.introMission = "Misión: Ordena y recicla los residuos en el garaje para evitar la contaminación.";
            this.outroImage = "serpiente_cap02-02.png";
            this.outroTip = "Consejo: Reciclar en el garaje ayuda a prevenir desastres ambientales.";
            this.initialLevel = 3;
            this.residueTypes = ['bateria', 'metal', 'madera', 'plastico'];
            this.bgImage = 'bg_chapter_02';
        }
        // Fin del capítulo al llegar a 100 puntos
        this.chapterEndScore = 100;
        // Estado inicial
        this.state = "INTRO";
        // Asignamos la biblioteca de mensajes del NPC
        this.npcMessages = [
            "Cada residuo tiene su lugar.",
            "Reciclar es fácil y divertido.",
            "Tus acciones marcan la diferencia.",
            "El planeta te lo agradecerá.",
            "Eco, ¡sigue así!"
        ];
        this.dialogAreaHeight = 30; // reservar 30px para el área de diálogos
    }

    preload() {
        // Cargamos assets comunes y específicos del capítulo
        this.load.image('serpiente_npc', 'assets/serpiente_npc.png');
        this.load.image(this.introImage, `assets/${this.introImage}`);
        this.load.image(this.outroImage, `assets/${this.outroImage}`);
        this.load.image('serpiente_cabeza', 'assets/serpiente_cabeza.png');
        this.load.image('serpiente_cuerpo', 'assets/serpiente_cuerpo.png');
        this.load.image('bg_chapter_01', 'assets/bg_chapter_01.png');
        this.load.image('bg_chapter_02', 'assets/bg_chapter_02.png');
        // Cargamos cada tipo de residuo que use el capítulo
        this.residueTypes.forEach(type => {
            this.load.image(type, `assets/${type}.png`);
        });
        // Los contenedores (se mantienen iguales)
        this.load.image('contenedor_papel', 'assets/contenedor_papel.png');
        this.load.image('contenedor_plastico', 'assets/contenedor_plastico.png');
        this.load.image('contenedor_vidrio', 'assets/contenedor_vidrio.png');
        this.load.image('contenedor_organico', 'assets/contenedor_organico.png');
        // Contenedores adicionales para el Capítulo 3 y el Tutorial
        if (this.chapterNumber === 2 || this.chapterNumber === 1) {
            this.load.image('contenedor_bateria', 'assets/contenedor_bateria.png');
            this.load.image('contenedor_metal', 'assets/contenedor_metal.png');
            this.load.image('contenedor_madera', 'assets/contenedor_madera.png');
        }
        // Otros assets comunes
        this.load.image('obstacle', 'assets/obstacle.png');
        this.load.image('power_up', 'assets/power_up.png');
    }

    create() {
        this.add.image(0, 0, this.bgImage).setOrigin(0);
        // Creamos contenedores para objetos de juego y UI
        this.gameObjectsContainer = this.add.container(0, 0);
        this.uiContainer = this.add.container(0, 0);

        // Avanza de pantalla con SPACE
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.state === "INTRO") {
                this.startGame();
            } else if (this.state === "OUTRO") {
                // Si es capítulo 2, iniciamos el 3; si es 3, volvemos al menú
                if (this.chapterNumber === 2) {
                    this.scene.start('ChapterScene', { chapterNumber: 3 });
                } else {
                    this.scene.start('MenuScene');
                }
            }
        });

        // Mostramos la pantalla de introducción del capítulo
        this.showIntroScreen();
    }

    showIntroScreen() {
        this.gameObjectsContainer.removeAll(true);
        this.uiContainer.removeAll(true);

        // Fondo con la imagen de introducción
        this.gameObjectsContainer.add(this.add.image(0, 0, this.introImage).setOrigin(0));
        // Título de capítulo usando h1
        let titleText = this.add.text(this.cameras.main.width / 2, 20, this.chapterTitle, getTextStyle('h1')).setOrigin(0.5, 0);
        // Misión con estilo 'p'
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
        this.serpiente = [];
        this.serpienteLength = 3;
        this.direction = 'RIGHT';
        this.tileSize = 8;
        this.speed = Math.max(50, 100 - (this.initialLevel - 1) * 10);
        this.lastMoveTime = 0;

        this.residues = [];
        this.contenedors = [];
        this.collectedResidues = [];
        this.score = 0;
        this.hasEaten = false;
        this.level = this.initialLevel;
        this.obstacles = [];
        this.powerUps = [];
        this.slowPowerUpActive = false;

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Creamos contenedores (usando posiciones fijas, igual que antes)
        let maxTiles = Math.floor(220 / this.tileSize);
        this.contenedors = [];
        if (this.chapterNumber === 2) {
            this.contenedors.push({ x: 2, y: 2, type: 'plastico', width: 16, height: 16 });
            this.contenedors.push({ x: maxTiles - 5, y: 2, type: 'organico', width: 16, height: 16 });
            this.contenedors.push({ x: 2, y: maxTiles - 3, type: 'vidrio', width: 16, height: 16 });
            this.contenedors.push({ x: maxTiles - 3, y: maxTiles - 3, type: 'madera', width: 16, height: 16 });
        } else if (this.chapterNumber === 3) {
            this.contenedors.push({ x: 2, y: 2, type: 'plastico', width: 16, height: 16 });
            this.contenedors.push({ x: maxTiles - 5, y: 2, type: 'metal', width: 16, height: 16 });
            this.contenedors.push({ x: 2, y: maxTiles - 3, type: 'bateria', width: 16, height: 16 });
            this.contenedors.push({ x: maxTiles - 3, y: maxTiles - 3, type: 'madera', width: 16, height: 16 });
        }

        // Se genera el primer residuo
        this.spawnResidue();

        // Creamos la UI de juego: puntaje, nivel y mensajes del NPC
        this.scoreText = this.add.text(2, 2, 'Puntos: 0', { fontSize: '8px', fill: '#FFFFFF' });
        this.levelText = this.add.text(2, 10, 'Nivel: ' + this.level, { fontSize: '8px', fill: '#FFFFFF' });
        this.uiContainer.add([this.scoreText, this.levelText]);

        // Posición inicial de la serpiente
        const gameWidth = 220;
        const gameHeight = 220 - this.dialogAreaHeight;
        const startX = Math.floor(gameWidth / (2 * this.tileSize));
        const startY = Math.floor(gameHeight / (2 * this.tileSize));
        for (let i = 0; i < this.serpienteLength; i++) {
            this.serpiente.push({ x: startX - i, y: startY });
        }

        this.state = "GAME";
    }

    update(time) {
        if (this.state === "GAME" && !this.isPaused) {
            if (this.cursors.left.isDown && this.direction !== 'RIGHT') this.direction = 'LEFT';
            if (this.cursors.right.isDown && this.direction !== 'LEFT') this.direction = 'RIGHT';
            if (this.cursors.up.isDown && this.direction !== 'DOWN') this.direction = 'UP';
            if (this.cursors.down.isDown && this.direction !== 'UP') this.direction = 'DOWN';

            if (time - this.lastMoveTime > this.speed) {
                this.lastMoveTime = time;
                this.moveSerpiente();
                this.checkCollisions();
            }
            this.drawGame();

            // Si se alcanzan 100 puntos, se finaliza el capítulo
            if (this.score >= this.chapterEndScore) {
                this.finishChapter();
            }
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

    checkCollisions() {
        let head = this.serpiente[0];
        // Colisión con bordes
        if (head.x < 0 || head.x >= Math.floor(220 / this.tileSize) || head.y < 0 || head.y >= Math.floor((220 - this.dialogAreaHeight) / this.tileSize)) {
            this.gameOver();
            return;
        }
        // Colisión con el propio cuerpo
        for (let i = 1; i < this.serpiente.length; i++) {
            if (head.x === this.serpiente[i].x && head.y === this.serpiente[i].y) {
                this.gameOver();
                return;
            }
        }
        // Colisión con obstáculos
        for (let obs of this.obstacles) {
            if (checkCollisionWithArray(head, [obs])) {
                this.gameOver();
                return;
            }
        }
        // Colisión con power ups
        for (let i = 0; i < this.powerUps.length; i++) {
            if (checkCollisionWithArray(head, [this.powerUps[i]])) {
                this.powerUps.splice(i, 1);
                this.activateSlowPowerUp();
                break;
            }
        }
        // Colisión con residuos
        for (let i = 0; i < this.residues.length; i++) {
            if (checkCollisionWithArray(head, [this.residues[i]])) {
                this.collectedResidues.push(this.residues[i].type);
                this.residues.splice(i, 1);
                this.hasEaten = true;
                this.spawnResidue();
                this.showMessage('¡Buen trabajo! Has recogido un residuo.');
                if (this.powerUps.length === 0 && Phaser.Math.Between(0, 100) < 20) {
                    this.spawnPowerUp();
                }
                break;
            }
        }
        // Colisión con contenedores
        for (let i = 0; i < this.contenedors.length; i++) {
            let contenedor = this.contenedors[i];
            if (checkCollisionWithArray(head, [contenedor])) {
                if (this.collectedResidues.length > 0) {
                    let index = this.collectedResidues.indexOf(contenedor.type);
                    if (index !== -1) {
                        this.collectedResidues.splice(index, 1);
                        this.score += 10;
                        this.showMessage('¡Correcto! Has reciclado correctamente.');
                    } else {
                        this.score -= 5;
                        this.showMessage('¡Error! Has reciclado incorrectamente.');
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
        if (this.isOccupied(x, y) || this.isObstacleAt(x, y) || this.isPowerUpAt(x, y)) {
            this.spawnResidue();
            return;
        }
        // Definir randomType usando residueTypes
        const randomType = Phaser.Utils.Array.GetRandom(this.residueTypes);
        this.residues.push({ x, y, type: randomType });
    }

    spawnPowerUp() {
        const gameWidth = 220;
        const gameHeight = 220 - this.dialogAreaHeight;
        const maxTilesW = Math.floor(gameWidth / this.tileSize);
        const maxTilesH = Math.floor(gameHeight / this.tileSize);
        const x = Phaser.Math.Between(0, maxTilesW - 1);
        const y = Phaser.Math.Between(0, maxTilesH - 1);
        if (this.isOccupied(x, y) || this.isObstacleAt(x, y) || this.isPowerUpAt(x, y)) {
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
        if (this.isOccupied(x, y) || this.isObstacleAt(x, y) || this.isPowerUpAt(x, y)) {
            this.spawnObstacle();
            return;
        }
        this.obstacles.push({ x, y });
    }

    isOccupied(x, y) {
        for (let part of this.serpiente) {
            if (part.x === x && part.y === y) return true;
        }
        for (let r of this.residues) {
            if (r.x === x && r.y === y) return true;
        }
        for (let c of this.contenedors) {
            if (c.x === x && c.y === y) return true;
        }
        return false;
    }

    isObstacleAt(x, y) {
        for (let obs of this.obstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        return false;
    }

    isPowerUpAt(x, y) {
        for (let pu of this.powerUps) {
            if (pu.x === x && pu.y === y) return true;
        }
        return false;
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
        this.gameObjectsContainer.add(this.add.image(0, 0, this.bgImage).setOrigin(0).setDepth(-1));
        for (let i = 0; i < this.serpiente.length; i++) {
            const part = this.serpiente[i];
            const sprite = i === 0 ? 'serpiente_cabeza' : 'serpiente_cuerpo';
            this.gameObjectsContainer.add(this.add.image(part.x * this.tileSize, part.y * this.tileSize, sprite).setOrigin(0).setDepth(1));
        }
        for (let residue of this.residues) {
            this.gameObjectsContainer.add(this.add.image(residue.x * this.tileSize, residue.y * this.tileSize, residue.type).setOrigin(0).setDepth(1));
        }
        for (let contenedor of this.contenedors) {
            this.gameObjectsContainer.add(this.add.image(contenedor.x * this.tileSize, contenedor.y * this.tileSize, `contenedor_${contenedor.type}`).setOrigin(0).setDepth(1));
        }
        for (let obs of this.obstacles) {
            this.gameObjectsContainer.add(this.add.image(obs.x * this.tileSize, obs.y * this.tileSize, 'obstacle').setOrigin(0).setDepth(1));
        }
        for (let pu of this.powerUps) {
            this.gameObjectsContainer.add(this.add.image(pu.x * this.tileSize, pu.y * this.tileSize, 'power_up').setOrigin(0).setDepth(1));
        }
        this.scoreText.setText(`Puntos: ${this.score}`).setStyle({ fill: '#551166' });
    }

    finishChapter() {
        this.state = "OUTRO";
        this.gameObjectsContainer.removeAll(true);
        this.uiContainer.removeAll(true);
        // Mostramos la pantalla de final de capítulo
        this.gameObjectsContainer.add(this.add.image(0, 0, this.outroImage).setOrigin(0));
        let outroText = this.add.text(this.cameras.main.width / 2, 20, this.outroTip, getTextStyle('p')).setOrigin(0.5, 0);
        this.uiContainer.add(outroText);
        let instrText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 60, "Presiona [ESPACIO] para continuar", getTextStyle('p')).setOrigin(0.5);
        this.uiContainer.add(instrText);
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.chapterNumber === 1) {
                this.scene.start('ChapterScene', { chapterNumber: 2 });
            } else {
                this.scene.start('MenuScene');
            }
        });
    }

    // Se actualiza showMessage para incluir whiteSpace
    showMessage(message) {
        if (this.uiContainer) {
            let msgText = this.add.text(this.cameras.main.width / 2, 30, message, getTextStyle('p')).setOrigin(0.5);
            this.uiContainer.add(msgText);
            this.time.delayedCall(2000, () => {
                msgText.destroy();
            });
        }
    }

    gameOver() {
        // En caso de Game Over, reiniciamos el capítulo actual enviando también chapterNumber
        this.scene.start('GameOverScene', { score: this.score, chapterNumber: this.chapterNumber });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.showMessage('Juego en pausa. Presiona espacio para continuar.');
        }
    }
}
