export function isOutOfBounds(head, tileSize, gameWidth, gameHeight) {
  const maxTilesW = Math.floor(gameWidth / tileSize);
  const maxTilesH = Math.floor(gameHeight / tileSize);
  return head.x < 0 || head.x >= maxTilesW || head.y < 0 || head.y >= maxTilesH;
}

export function checkSelfCollision(head, snake) {
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}

export function checkCollisionWithArray(head, arr, tileSize = 1) {
  return arr.some(item => head.x < item.x + ((item.width || 1) / tileSize) &&
                          head.x + 1 > item.x &&
                          head.y < item.y + ((item.height || 1) / tileSize) &&
                          head.y + 1 > item.y);
}

export function isOccupied(x, y, snake, residues, contenedors, tileSize) {
  if (snake.some(part => part.x === x && part.y === y)) return true;
  if (residues.some(r => x < r.x + r.width / tileSize &&
                         x + 1 > r.x &&
                         y < r.y + r.height / tileSize &&
                         y + 1 > r.y)) return true;
  if (contenedors.some(c => x < c.x + c.width / tileSize &&
                            x + 1 > c.x &&
                            y < c.y + c.height / tileSize &&
                            y + 1 > c.y)) return true;
  return false;
}
