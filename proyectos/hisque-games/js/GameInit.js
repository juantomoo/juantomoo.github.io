export function initializeGame(scene) {
  scene.serpiente = [];
  scene.serpienteLength = 3;
  scene.direction = 'RIGHT';
  scene.tileSize = 8;
  scene.speed = Math.max(50, 100 - (scene.initialLevel - 1) * 10);
  scene.lastMoveTime = 0;
  scene.residues = [];
  scene.contenedors = [];
  scene.collectedResidues = [];
  scene.score = 0;
  scene.hasEaten = false;
  scene.level = scene.initialLevel;
  scene.obstacles = [];
  scene.powerUps = [];
  scene.slowPowerUpActive = false;
  scene.cursors = scene.input.keyboard.createCursorKeys();
  // Posición inicial de la serpiente
  const startX = Math.floor(220 / (2 * scene.tileSize));
  const startY = Math.floor(220 / (2 * scene.tileSize));
  for (let i = 0; i < scene.serpienteLength; i++) {
    scene.serpiente.push({ x: startX - i, y: startY });
  }
}