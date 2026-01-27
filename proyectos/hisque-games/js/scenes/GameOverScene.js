import { getTextStyle } from '../StyleManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.chapterNumber = data.chapterNumber !== undefined ? data.chapterNumber : null;
  }

  create() {
    this.add.image(0, 0, 'bg_gameover').setOrigin(0);
    // Mensaje de Game Over con estilo h1
    this.add.text(10, 80, '¡Juego Terminado!', getTextStyle('h1'));
    // Puntuación usando estilo 'p'
    this.add.text(10, 120, `Puntuación: ${this.finalScore}`, getTextStyle('h3'));
    let restartMsg = 'Presiona [ESPACIO] para reiniciar';
    this.add.text(10, 160, restartMsg, getTextStyle('p'));

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.chapterNumber !== null) {
        this.scene.start('PlayScene', { chapterNumber: this.chapterNumber, showDialog: true });
      } else {
        this.scene.start('MenuScene');
      }
    });
  }
}
