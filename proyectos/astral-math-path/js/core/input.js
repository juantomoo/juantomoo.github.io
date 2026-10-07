/**
 * input.js — Manejador de Entrada Táctil Mobile-First y Teclado
 * 
 * Permite cambiar de carril (0: Izquierda, 1: Centro, 2: Derecha):
 * 1. Toque directo en tercio de pantalla (Touch Tap zonificado)
 * 2. Deslizamiento gestual (Swipe Left / Swipe Right)
 * 3. Teclado Físico (Flechas: ←, ↓, → | Teclas: A, S, D / J, K, L)
 */

class PulseInputManager {
  constructor(onLaneChangeCallback) {
    this.onLaneChange = onLaneChangeCallback;
    this.currentLane = 1; // Inicia al centro
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;

    this.bindKeyboard();
    this.bindTouch();
  }

  setLane(newLane) {
    const target = Math.max(0, Math.min(2, newLane));
    if (target !== this.currentLane) {
      this.currentLane = target;
      if (this.onLaneChange) {
        this.onLaneChange(this.currentLane);
      }
    }
  }

  shiftLane(delta) {
    this.setLane(this.currentLane + delta);
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Ignorar teclas repetidas continuas para evitar descontrol
      if (e.repeat) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'j':
        case 'J':
          e.preventDefault();
          this.setLane(0);
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
        case 'k':
        case 'K':
          e.preventDefault();
          this.setLane(1);
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'l':
        case 'L':
          e.preventDefault();
          this.setLane(2);
          break;
      }
    });
  }

  bindTouch() {
    const canvas = document.getElementById('pulseCanvas');
    const target = canvas || window;

    target.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
      }
    }, { passive: true });

    target.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - this.touchStartX;
      const diffY = endY - this.touchStartY;
      const elapsed = Date.now() - this.touchStartTime;

      const winWidth = window.innerWidth;

      // 1. Detección de Swipe Rápido (<250ms con desplazamiento > 40px)
      if (elapsed < 300 && Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          this.shiftLane(-1); // Swipe hacia la izquierda
        } else {
          this.shiftLane(1);  // Swipe hacia la derecha
        }
        return;
      }

      // 2. Detección de Tap Zonificado en 3 Columnas (Left / Center / Right)
      // Especialmente cómodo para pulgares en móvil vertical u horizontal
      const colWidth = winWidth / 3;
      if (endX < colWidth) {
        this.setLane(0);
      } else if (endX < colWidth * 2) {
        this.setLane(1);
      } else {
        this.setLane(2);
      }
    }, { passive: true });

    // Soporte para clics de ratón en escritorio como taps zonificados
    target.addEventListener('mousedown', (e) => {
      const winWidth = window.innerWidth;
      const colWidth = winWidth / 3;
      if (e.clientX < colWidth) {
        this.setLane(0);
      } else if (e.clientX < colWidth * 2) {
        this.setLane(1);
      } else {
        this.setLane(2);
      }
    });
  }
}

window.PulseInputManager = PulseInputManager;
