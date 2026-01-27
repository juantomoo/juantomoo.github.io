// NOTA: Verificar que solamente exista una copia de este archivo para evitar duplicaciones.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
