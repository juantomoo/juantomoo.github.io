// NOTA: Utilizar este archivo como punto de entrada principal. Se recomienda eliminar "principal.js" para evitar redundancias.
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import PlayScene from './scenes/PlayScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  // Fuerza Canvas en lugar de AUTO
  type: Phaser.CANVAS,
  width: 220,
  height: 220, // Revertir altura del área jugable
  scale: {
    mode: Phaser.Scale.NONE,
    zoom: 1.6
  },
  backgroundColor: '#000000', // Revertir color de fondo a negro
  pixelArt: true,
  canvas: document.getElementById('game-canvas'),
  scene: [BootScene, PreloadScene, MenuScene, PlayScene, GameOverScene],
  fps: { target: 30 },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});
