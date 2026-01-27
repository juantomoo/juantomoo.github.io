// slider.js

import { openLightbox } from './lightbox.js';

/*******************************************************
 * ESTADO GLOBAL DEL SLIDER
 *******************************************************/
let slides = [];
let currentSlideIndex = 0;
let autoScrollInterval = null;

// Control de TTS
let isTtsEnabled = true;
let isSpeaking = false;
let speechSynthesisUtterance = null;
let ttsRate = 1; // Velocidad de lectura TTS

// Velocidad de desplazamiento (px/s), controlada por la UI
let textScrollSpeed = 20; // Interpreta este valor como "px/s"

// Referencias a elementos del DOM
const slidesContainer = document.getElementById('slidesContainer');
const flechaIzq = document.getElementById('flechaIzq');
const flechaDer = document.getElementById('flechaDer');
const musicVolumeRange = document.getElementById('musicVolumeRange');

// Audio de la exposición actual
let expositionAudio = null;
let currentExposition = null;

/*******************************************************
 * 1. INICIALIZAR EVENTOS DE FLECHAS
 *******************************************************/
export function initSliderEvents(onLastSlideExit) {
  flechaIzq.addEventListener('click', () => changeSlide(-1, onLastSlideExit));
  flechaDer.addEventListener('click', () => changeSlide(1, onLastSlideExit));
}

/*******************************************************
 * 2. CONFIGURAR EL CARRUSEL
 *******************************************************/
export function setupCarrusel(expo) {
  currentExposition = expo;
  slidesContainer.innerHTML = '';
  slides = [];
  currentSlideIndex = 0;

  // Detener audio previo
  if (expositionAudio) {
    expositionAudio.pause();
    expositionAudio = null;
  }

  // Crear el audio de esta exposición, si existe
  if (expo.musicFile) {
    expositionAudio = new Audio(`exposiciones/${expo.folder}/${expo.musicFile}`);
    expositionAudio.loop = true;
    expositionAudio.volume = parseFloat(musicVolumeRange.value) || 0.5;
    expositionAudio.play().catch(() => {
      console.warn("Autoplay bloqueado. El usuario debe interactuar.");
    });
  }

  // Generar slides
  expo.media.forEach((item, index) => {
    const slideElement = document.createElement('div');
    slideElement.classList.add('slide');

    // Determinar si es imagen o video
    const fileType = getFileType(item.file);
    if (fileType === 'image') {
      slideElement.style.backgroundImage = `url('exposiciones/${expo.folder}/${item.file}')`;
      slideElement.style.backgroundSize = 'cover';
      slideElement.style.backgroundPosition = 'center';
    } else if (fileType === 'video') {
      const videoEl = document.createElement('video');
      videoEl.src = `exposiciones/${expo.folder}/${item.file}`;
      videoEl.loop = true;
      videoEl.controls = false;
      videoEl.style.maxWidth = '80%';
      videoEl.style.maxHeight = '60%';
      slideElement.appendChild(videoEl);
    }

    // Contenedor de texto
    const textoDiv = document.createElement('div');
    textoDiv.classList.add('texto');

    // Título de sección
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = item.sectionTitle || '';
    textoDiv.appendChild(sectionTitle);

    // Párrafo
    const paragraph = document.createElement('p');
    paragraph.innerHTML = item.text || '';
    textoDiv.appendChild(paragraph);

    slideElement.appendChild(textoDiv);

    // Botones de acción en cada slide
    const iconsDiv = document.createElement('div');
    iconsDiv.classList.add('slide-icons');

    // Botón de Lightbox
    const lightboxBtn = createIconButton('&#128065;', 'btn-lightbox', () => {
      if (fileType === 'image') {
        openLightbox(`exposiciones/${expo.folder}/${item.file}`);
      } else {
        alert("Lightbox no implementado para videos.");
      }
    });

    // Botón mostrar/ocultar texto
    const toggleTextBtn = createIconButton('&#128196;', 'btn-toggle-text', () => {
      handleTextToggle(textoDiv, index);
    });

    // Botón voz (TTS on/off)
    const voiceToggleBtn = createIconButton('🔊', 'btn-toggle-voice', () => {
      handleTtsToggle(voiceToggleBtn, textoDiv, index);
    });

    // Botón música (activar/desactivar)
    const audioToggleBtn = createIconButton('&#127925;', 'btn-audio-toggle', () => {
      if (expositionAudio) {
        expositionAudio.paused ? expositionAudio.play() : expositionAudio.pause();
      }
    });

    // Botón de Referencias (si expo.referencias existe)
    const referenciasBtn = createIconButton('&#128196;', 'btn-referencias', () => {
      abrirPopup('popupReferencias', expo.referencias);
    });

    // Botón de Glosario (si expo.glosario existe)
    const glosarioBtn = createIconButton('&#128218;', 'btn-glosario', () => {
      abrirPopup('popupGlosario', expo.glosario);
    });

    // Añadir botones al contenedor
    iconsDiv.appendChild(lightboxBtn);
    iconsDiv.appendChild(toggleTextBtn);
    iconsDiv.appendChild(voiceToggleBtn);

    // Agregar botón de música solo si hay archivo musicFile
    if (expo.musicFile) {
      iconsDiv.appendChild(audioToggleBtn);
    }

    // Agregar botones de Referencias y Glosario solo si existen
    if (expo.referencias) {
      iconsDiv.appendChild(referenciasBtn);
    }
    if (expo.glosario) {
      iconsDiv.appendChild(glosarioBtn);
    }

    // Añadir contenedor de íconos y slide al DOM
    slideElement.appendChild(iconsDiv);
    slidesContainer.appendChild(slideElement);
    slides.push(slideElement);

    // Detener auto-scroll si el usuario hace pointerdown (o scroll)
    textoDiv.addEventListener('pointerdown', () => stopAutoScroll(), { once: false });
    // textoDiv.addEventListener('scroll', () => stopAutoScroll(), { once: false });
  });

  // Activar primer slide
  if (slides.length > 0) {
    slides[0].classList.add('active');
    startAutoScroll(0);
  }
}

/*******************************************************
 * 3. CAMBIO DE SLIDE
 *******************************************************/
function changeSlide(direction, onLastSlideExit) {
  detenerLectura();
  stopAutoScroll();
  pauseAllVideosInCurrentSlide();

  slides[currentSlideIndex].classList.remove('active');

  currentSlideIndex += direction;
  if (currentSlideIndex < 0) {
    currentSlideIndex = 0;
  } else if (currentSlideIndex >= slides.length) {
    // Llega al final => salir
    if (onLastSlideExit) onLastSlideExit();
    return;
  }

  slides[currentSlideIndex].classList.add('active');
  startAutoScroll(currentSlideIndex);
}

/*******************************************************
 * 4. AUTO-SCROLL DEL TEXTO
 *******************************************************/
/**
 * Desplaza el texto de arriba hacia abajo a velocidad constante (px/s).
 */
function startAutoScroll(index) {
  const slide = slides[index];
  if (!slide) return;

  const textoDiv = slide.querySelector('.texto');
  if (!textoDiv || textoDiv.style.display === 'none') return;

  const totalHeight = textoDiv.scrollHeight - textoDiv.clientHeight;
  if (totalHeight <= 0) return;

  // Iniciar en la parte superior
  textoDiv.scrollTop = 0;

  // Velocidad en píxeles por segundo
  const speedPxPerSecond = textScrollSpeed;

  // Intervalo de actualización (ms)
  const stepMs = 50; // ~20fps
  const pxPerStep = (speedPxPerSecond * stepMs) / 1000;

  autoScrollInterval = setInterval(() => {
    textoDiv.scrollTop += pxPerStep;
    if (textoDiv.scrollTop >= totalHeight) {
      stopAutoScroll();
    }
  }, stepMs);
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

/*******************************************************
 * 5. TEXT-TO-SPEECH (TTS)
 *******************************************************/
function startTts(index) {
  if (!isTtsEnabled) return;
  const slide = slides[index];
  if (!slide) return;

  const textoDiv = slide.querySelector('.texto');
  if (!textoDiv || textoDiv.style.display === 'none') return;

  const textContent = textoDiv.textContent;
  speechSynthesisUtterance = new SpeechSynthesisUtterance(textContent);
  speechSynthesisUtterance.lang = 'es-ES';
  speechSynthesisUtterance.rate = ttsRate;
  window.speechSynthesis.speak(speechSynthesisUtterance);
  isSpeaking = true;

  speechSynthesisUtterance.onend = () => {
    isSpeaking = false;
  };
}

function detenerLectura() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
}

/*******************************************************
 * 6. BOTONES DE TEXTO, TTS, AUDIO
 *******************************************************/
/**
 * Maneja el botón mostrar/ocultar texto.
 */
function handleTextToggle(textoDiv, index) {
  if (textoDiv.style.display === 'none') {
    textoDiv.style.display = 'block';
    stopAutoScroll();
    startAutoScroll(index);
  } else {
    textoDiv.style.display = 'none';
    stopAutoScroll();
  }
}

/**
 * Maneja el botón de encendido/apagado de TTS.
 */
function handleTtsToggle(voiceToggleBtn, textoDiv, index) {
  if (isTtsEnabled) {
    // Apagar TTS
    isTtsEnabled = false;
    detenerLectura();
    voiceToggleBtn.innerHTML = '🔇';
  } else {
    // Encender TTS
    isTtsEnabled = true;
    voiceToggleBtn.innerHTML = '🔊';
    if (textoDiv.style.display !== 'none') {
      startTts(index);
    }
  }
}

/*******************************************************
 * 7. CREAR BOTÓN DE ÍCONO REUTILIZABLE
 *******************************************************/
function createIconButton(htmlContent, extraClass, onClick) {
  const btn = document.createElement('button');
  btn.classList.add('icon-btn');
  if (extraClass) {
    btn.classList.add(extraClass);
  }
  btn.innerHTML = htmlContent;
  btn.addEventListener('click', onClick);
  return btn;
}

/*******************************************************
 * 8. POPUP PARA REFERENCIAS Y GLOSARIO
 *******************************************************/
/**
 * Llamar a esta función para abrir un popup con un array "referencias" o "glosario".
 * Cada elemento del array es un objeto con {sectionTitle, text}.
 */
function abrirPopup(popupId, contentArray) {
  if (!contentArray) {
    alert("No hay contenido disponible.");
    return;
  }
  const popup = document.getElementById(popupId);
  const popupContent = popup.querySelector('.popup-content');

  // Insertar contenido
  popupContent.innerHTML = `
    <button class="popup-close-btn" onclick="cerrarPopup('${popupId}')">X</button>
    ${contentArray.map(item => `
      <h2>${item.sectionTitle}</h2>
      <p>${item.text}</p>
    `).join('')}
  `;
  popup.style.display = 'flex';
}

/*******************************************************
 * 9. PAUSAR VIDEOS, DETENER SLIDER, ETC.
 *******************************************************/
function pauseAllVideosInCurrentSlide() {
  const slide = slides[currentSlideIndex];
  if (!slide) return;
  const videos = slide.querySelectorAll('video');
  videos.forEach(video => video.pause());
}

/**
 * Ajustar la velocidad del TTS.
 */
export function setTtsRate(rate) {
  ttsRate = rate;
  if (isSpeaking) {
    detenerLectura();
    if (isTtsEnabled) {
      startTts(currentSlideIndex);
    }
  }
}

/**
 * Ajustar la velocidad (px/s) del auto-scroll.
 */
export function setScrollDuration(newSpeed) {
  textScrollSpeed = newSpeed;
  if (autoScrollInterval) {
    stopAutoScroll();
    startAutoScroll(currentSlideIndex);
  }
}

/**
 * Detiene todo al salir de la exposición.
 */
export function exitSlider() {
  detenerLectura();
  stopAutoScroll();

  const allVideos = slidesContainer.querySelectorAll('video');
  allVideos.forEach(video => video.pause());

  if (expositionAudio) {
    expositionAudio.pause();
    expositionAudio = null;
  }
}

/*******************************************************
 * 10. DETECTAR TIPO DE ARCHIVO
 *******************************************************/
function getFileType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) return "image";
  if (ext === "mp4") return "video";
  return "unknown";
}
