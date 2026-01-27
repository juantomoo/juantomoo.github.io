import { getTextStyle } from '../StyleManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.add.image(0, 0, 'bg_menu').setOrigin(0);
    this.add.text(this.game.config.width / 2, 40, 'ECO Serpiente', getTextStyle('h1')).setOrigin(0.5);
    this.add.text(this.game.config.width / 2, 80, 'Selecciona tu Capítulo', getTextStyle('h2')).setOrigin(0.5);

    // Se elimina la opción Tutorial
    this.chapters = [
      { number: 1, title: 'Capítulo 1: Residuos en el Jardín' },
      { number: 2, title: 'Capítulo 2: Residuos en el Garaje' }
    ];
    this.selectedChapterIndex = 0;

    this.chapterTexts = this.chapters.map((chapter, index) => {
      return this.add.text(this.game.config.width / 2, 100 + index * 20, chapter.title, getTextStyle('h3')).setOrigin(0.5);
    });

    this.updateChapterSelection();

    this.input.keyboard.on('keydown-UP', () => {
      this.selectedChapterIndex = (this.selectedChapterIndex - 1 + this.chapters.length) % this.chapters.length;
      this.updateChapterSelection();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectedChapterIndex = (this.selectedChapterIndex + 1) % this.chapters.length;
      this.updateChapterSelection();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      const selectedChapter = this.chapters[this.selectedChapterIndex];
      this.scene.start('PlayScene', { chapterNumber: selectedChapter.number });
    });
  }

  updateChapterSelection() {
    this.chapterTexts.forEach((text, index) => {
      text.setStyle({ fill: index === this.selectedChapterIndex ? '#88BB99' : '#337755' });
    });
  }
}
