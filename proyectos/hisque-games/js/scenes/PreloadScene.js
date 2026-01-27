import { getTextStyle } from '../StyleManager.js'; // Moved import to top

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Cargar recursos
    this.load.image('bg_001', 'assets/bg_001.png');
    this.load.image('bg_002', 'assets/bg_002.png');
    this.load.image('bg_menu', 'assets/bg_menu.png');
    this.load.image('bg_gameover', 'assets/bg_gameover.png');
    this.load.image('bg_chapter_01_intro', 'assets/bg_chapter_01_intro.png');
    this.load.image('bg_chapter_02_intro', 'assets/bg_chapter_02_intro.png');
    this.load.image('bg_chapter_01', 'assets/bg_chapter_01.png');
    this.load.image('bg_chapter_02', 'assets/bg_chapter_02.png');
  }

  create() {
    this.showIntro();
  }

  showIntro() {
    this.add.image(0, 0, 'bg_001').setOrigin(0);
    // Texto principal usando estilo h1 dinámico
    this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 40, 'HISQUE Games', getTextStyle('h1')).setOrigin(0.5);
    // Subtítulo usando estilo 'p'
    this.add.text(this.game.config.width / 2, this.game.config.height / 2 - -80, 'Hecho por HISQUE Estudio © 2025', getTextStyle('p')).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.showGameTitle();
      });
    });
  }

  showGameTitle() {
    this.cameras.main.fadeIn(1000);
    this.add.image(0, 0, 'bg_002').setOrigin(0);
    // Subtítulo usando estilo 'p'
    this.add.text(this.game.config.width / 2, this.game.config.height / 2 - -80, 'Hecho por HISQUE Estudio © 2025', getTextStyle('p')).setOrigin(0.5);
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
