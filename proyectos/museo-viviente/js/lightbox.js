// lightbox.js

// Variables para el zoom/pan del lightbox
let scale = 1;
let posX = 0;
let posY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;

// Referencias al DOM
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImg');

/**
 * Inicializa eventos para zoom/pan en la imagen del lightbox.
 * Se llama una sola vez al cargar la aplicación.
 */
export function setupLightboxZoomPan() {
  // Zoom con la rueda del ratón
  lightboxImg.addEventListener('wheel', handleWheelZoom);

  // Arrastre con mouse/táctil
  lightboxImg.addEventListener('pointerdown', handlePointerDown);
  lightboxImg.addEventListener('pointermove', handlePointerMove);
  lightboxImg.addEventListener('pointerup', handlePointerUp);

  // Navegación con el teclado (+, -, flechas)
  document.addEventListener('keydown', handleKeyDown);

  // Cerrar lightbox si se hace click fuera de la imagen o en el botón "X"
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'lightboxOverlay' || e.target.classList.contains('popup-close-btn')) {
      closeLightbox();
    }
  });
}

/**
 * Abre el lightbox con la imagen dada.
 */
export function openLightbox(src) {
  // Reset de zoom/pan
  scale = 1;
  posX = 0;
  posY = 0;
  applyTransform();

  lightboxImg.src = src;
  lightboxOverlay.style.display = 'flex';
}

/**
 * Cierra el lightbox.
 */
function closeLightbox() {
  lightboxOverlay.style.display = 'none';
  lightboxImg.src = '';
}

/* ========================================================
   MANEJADORES DE EVENTOS (wheel, pointer, keydown)
   ======================================================== */
function handleWheelZoom(e) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  scale = Math.min(Math.max(0.1, scale + delta), 5);
  applyTransform();
}

function handlePointerDown(e) {
  // Evitar comportamiento por defecto (scroll, etc.)
  e.preventDefault();

  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;

  // Captura del puntero para que siga recibiendo eventos de move
  lightboxImg.setPointerCapture(e.pointerId);
  lightboxImg.style.cursor = 'grabbing';
}

function handlePointerMove(e) {
  // Si no se está arrastrando, salimos
  if (!isDragging) return;

  // Evitar comportamiento por defecto
  e.preventDefault();

  posX = e.clientX - startX;
  posY = e.clientY - startY;
  applyTransform();
}

function handlePointerUp(e) {
  // Evitar comportamiento por defecto
  e.preventDefault();

  isDragging = false;
  lightboxImg.releasePointerCapture(e.pointerId);
  lightboxImg.style.cursor = 'grab';
}


function handleKeyDown(e) {
  // Solo si el lightbox está abierto
  if (lightboxOverlay.style.display !== 'flex') return;

  switch (e.key) {
    case '+':
    case '=':
      scale = Math.min(scale + 0.1, 5);
      applyTransform();
      break;
    case '-':
      scale = Math.max(scale - 0.1, 0.1);
      applyTransform();
      break;
    case 'ArrowUp':
      posY -= 10;
      applyTransform();
      break;
    case 'ArrowDown':
      posY += 10;
      applyTransform();
      break;
    case 'ArrowLeft':
      posX -= 10;
      applyTransform();
      break;
    case 'ArrowRight':
      posX += 10;
      applyTransform();
      break;
    default:
      break;
  }
}

/* ========================================================
   APLICAR TRANSFORMACIONES (zoom/pan)
   ======================================================== */
function applyTransform() {
  lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}
