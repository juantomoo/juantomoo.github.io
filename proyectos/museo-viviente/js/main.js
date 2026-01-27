// main.js

import { fetchExpositionsData } from './data.js'; // o { loadExpositions } si prefieres
import { setupLightboxZoomPan } from './lightbox.js';
import {
  initSliderEvents,
  setupCarrusel,
  exitSlider,
  setTtsRate,
  setScrollDuration
} from './slider.js';

/*******************************************************
 * 1. REFERENCIAS A ELEMENTOS DEL DOM
 *******************************************************/
const body = document.body;

// Secciones/Pantallas
const pantallaInicio = document.getElementById('pantallaInicio');
const pantallaExposiciones = document.getElementById('pantallaExposiciones');
const pantallaDetalleExpo = document.getElementById('pantallaDetalleExpo');
const pantallaCarrusel = document.getElementById('pantallaCarrusel');

// Contenedores dinámicos
const exposicionesGrid = document.getElementById('exposicionesGrid');
const detalleExpoBg = document.getElementById('detalleExpoBg');
const detalleExpoTitulo = document.getElementById('detalleExpoTitulo');
const detalleExpoDescripcion = document.getElementById('detalleExpoDescripcion');

// Botones
const ingresaBtn = document.getElementById('ingresaBtn');
const iniciarExpoBtn = document.getElementById('iniciarExpoBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const configBtn = document.getElementById('configBtn');

// Botones de íconos inferiores
const creditosBtn = document.getElementById('creditosBtn');
const apoyarBtn = document.getElementById('apoyarBtn');
const popupCreditos = document.getElementById('popupCreditos');
const popupApoyar = document.getElementById('popupApoyar');

// Controles de velocidad
const ttsRateRange = document.getElementById('ttsRateRange');
const scrollSpeedRange = document.getElementById('scrollSpeedRange');
const musicVolumeRange = document.getElementById('musicVolumeRange');
const controlesVelocidad = document.getElementById('controlesVelocidad');

// Variables globales
let expositions = [];
let currentExposition = null;

/*******************************************************
 * 2. INICIALIZACIÓN PRINCIPAL
 *******************************************************/
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos de exposiciones (async/await)
  expositions = await fetchExpositionsData();
  renderExpositionsGrid(expositions);

  // Inicializar Lightbox (zoom/pan)
  setupLightboxZoomPan();

  // Inicializar slider (flechas)
  initSliderEvents(() => {
    // Callback cuando llega al último slide
    exitSlider();
    mostrarPantallaExposiciones();
  });

  // Listeners para los rangos de velocidad/volumen
  ttsRateRange.addEventListener('input', (e) => {
    setTtsRate(parseFloat(e.target.value));
  });
  scrollSpeedRange.addEventListener('input', (e) => {
    setScrollDuration(parseFloat(e.target.value));
  });
  musicVolumeRange.addEventListener('input', (e) => {
    // Ajustar el volumen de la música si existiera
    // (Se maneja en slider.js con expositionAudio)
    // En caso de necesitar manipularlo aquí, se puede exportar la referencia
    // de expositionAudio o usar un método en slider.js
  });

  // Mostrar/ocultar panel de configuración
  configBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    controlesVelocidad.classList.toggle('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!controlesVelocidad.contains(e.target) && !configBtn.contains(e.target)) {
      controlesVelocidad.classList.add('hidden');
    }
  });
});

/*******************************************************
 * 3. RENDERIZADO DE EXPOSICIONES
 *******************************************************/
function renderExpositionsGrid(expoList) {
  expoList.forEach(expo => {
    const card = document.createElement('div');
    card.classList.add('expo-card');
    card.dataset.expoId = expo.id;

    // Tomamos la "portada" (imagen o video)
    const portada = expo.media[0]?.file || '';
    let imgSrc = portada.endsWith('.mp4') ? 'video.png'
               : `exposiciones/${expo.folder}/${portada}`;

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = expo.title;

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('expo-title');
    titleDiv.textContent = expo.title;

    card.appendChild(img);
    card.appendChild(titleDiv);

    card.addEventListener('click', () => {
      currentExposition = expo;
      showExpositionDetail(expo);
    });

    exposicionesGrid.appendChild(card);
  });
}

/*******************************************************
 * 4. NAVEGACIÓN DE PANTALLAS
 *******************************************************/
function mostrarPantallaInicio() {
  pantallaInicio.classList.remove('hidden');
  pantallaExposiciones.classList.add('hidden');
  pantallaDetalleExpo.classList.add('hidden');
  pantallaCarrusel.classList.add('hidden');
  window.scrollTo(0, 0);
}

function mostrarPantallaExposiciones() {
  pantallaInicio.classList.add('hidden');
  pantallaExposiciones.classList.remove('hidden');
  pantallaDetalleExpo.classList.add('hidden');
  pantallaCarrusel.classList.add('hidden');
  window.scrollTo(0, 0);
}

function mostrarPantallaDetalleExpo() {
  pantallaInicio.classList.add('hidden');
  pantallaExposiciones.classList.add('hidden');
  pantallaDetalleExpo.classList.remove('hidden');
  pantallaCarrusel.classList.add('hidden');
  window.scrollTo(0, 0);
}

function mostrarPantallaCarrusel() {
  pantallaInicio.classList.add('hidden');
  pantallaExposiciones.classList.add('hidden');
  pantallaDetalleExpo.classList.add('hidden');
  pantallaCarrusel.classList.remove('hidden');
  window.scrollTo(0, 0);
}

/*******************************************************
 * 5. EVENTOS PRINCIPALES
 *******************************************************/
// Botón "Ingresa al museo"
ingresaBtn.addEventListener('click', () => {
  mostrarPantallaExposiciones();
});

// Logo principal -> volver al inicio
document.getElementById('logoMuseo').addEventListener('click', () => {
  exitSlider();
  mostrarPantallaInicio();
});

// Botón "Iniciar" en detalle de la exposición
iniciarExpoBtn.addEventListener('click', () => {
  if (currentExposition) {
    setupCarrusel(currentExposition);
    mostrarPantallaCarrusel();
  }
});

// Botón modo claro/oscuro
toggleModeBtn.addEventListener('click', () => {
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  }
});

// Créditos y Apoyar
creditosBtn.addEventListener('click', () => {
  abrirPopup('popupCreditos');
});
apoyarBtn.addEventListener('click', () => {
  abrirPopup('popupApoyar');
});

// Cerrar popups al hacer clic en el overlay
popupCreditos.addEventListener('click', (e) => {
  if (e.target === popupCreditos) {
    cerrarPopup('popupCreditos');
  }
});
popupApoyar.addEventListener('click', (e) => {
  if (e.target === popupApoyar) {
    cerrarPopup('popupApoyar');
  }
});

/*******************************************************
 * 6. MANEJO DE POPUPS
 *******************************************************/
function abrirPopup(popupId) {
  document.getElementById(popupId).style.display = 'flex';
}
function cerrarPopup(popupId) {
  document.getElementById(popupId).style.display = 'none';
}

/*******************************************************
 * 7. MOSTRAR DETALLE DE EXPOSICIÓN
 *******************************************************/
function showExpositionDetail(expo) {
  mostrarPantallaDetalleExpo();
  const portada = expo.media[0]?.file || '';
  detalleExpoBg.style.backgroundImage = `url('exposiciones/${expo.folder}/${portada}')`;
  detalleExpoTitulo.textContent = expo.title;
  detalleExpoDescripcion.innerHTML = expo.description;
}
