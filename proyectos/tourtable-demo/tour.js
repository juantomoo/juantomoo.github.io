import { Viewer }             from '@photo-sphere-viewer/core';
import { VirtualTourPlugin }  from '@photo-sphere-viewer/virtual-tour-plugin';
import { MarkersPlugin }      from '@photo-sphere-viewer/markers-plugin';
import { GalleryPlugin }      from '@photo-sphere-viewer/gallery-plugin';
import { PlanPlugin }         from '@photo-sphere-viewer/plan-plugin';
import { AutorotatePlugin }   from '@photo-sphere-viewer/autorotate-plugin';

/* ═══════════════════════════════════════════════════════
   NODE DATA
   GPS en formato [longitud, latitud] (convención GeoJSON / PSV v5).
   Coordenadas separadas ~60 m en triángulo para que las flechas
   3D apunten en direcciones claramente distintas.
   ═══════════════════════════════════════════════════════ */

const NODES = [
    {
        id: 'pano-01',
        panorama: 'assets/panoramas/pano-01.jpg',
        thumbnail: 'assets/thumbnails/thumb-01.jpg',
        name: 'Zona de Piscinas',
        caption: 'Zona de Piscinas — 18 Trinitarios',
        gps: [-73.36640, 7.00640],          // ← NW del predio
        markers: [
            {
                id: 'info-piscinas',
                position: { yaw: '45deg', pitch: '-5deg' },
                html: `<div class="marker-info">
                    <h3><i class="ph ph-waves" style="font-size:16px"></i> Zona Acuática</h3>
                    <p>Piscinas para adultos y niños con toboganes</p>
                </div>`,
                anchor: 'center center',
                data: { modal: 'piscinas' },
            },
            {
                id: 'badge-restaurante',
                position: { yaw: '160deg', pitch: '-8deg' },
                html: `<div class="marker-badge">
                    <i class="ph ph-fork-knife" style="font-size:14px"></i> Restaurante
                </div>`,
                anchor: 'center center',
                data: { modal: 'restaurante' },
            },
        ],
        links: [
            { nodeId: 'pano-02' },   // → Este  (~90°, auto-calculado por GPS)
            { nodeId: 'pano-03' },   // → SE    (~150°, auto-calculado por GPS)
        ],
    },
    {
        id: 'pano-02',
        panorama: 'assets/panoramas/pano-02.jpg',
        thumbnail: 'assets/thumbnails/thumb-02.jpg',
        name: 'Canchas Deportivas',
        caption: 'Canchas Deportivas — 18 Trinitarios',
        gps: [-73.36580, 7.00640],          // ← NE del predio
        markers: [
            {
                id: 'info-canchas',
                position: { yaw: '-30deg', pitch: '-5deg' },
                html: `<div class="marker-info">
                    <h3><i class="ph ph-trophy" style="font-size:16px"></i> Canchas Múltiples</h3>
                    <p>Fútbol, baloncesto y voleibol disponibles</p>
                </div>`,
                anchor: 'center center',
                data: { modal: 'canchas' },
            },
            {
                id: 'badge-juegos',
                position: { yaw: '120deg', pitch: '-10deg' },
                html: `<div class="marker-badge accent">
                    <i class="ph ph-puzzle-piece" style="font-size:14px"></i> Zona Infantil
                </div>`,
                anchor: 'center center',
                data: { modal: 'juegos' },
            },
        ],
        links: [
            { nodeId: 'pano-01' },   // → Oeste (~270°)
            { nodeId: 'pano-03' },   // → SW   (~210°)
        ],
    },
    {
        id: 'pano-03',
        panorama: 'assets/panoramas/pano-03.jpg',
        thumbnail: 'assets/thumbnails/thumb-03.jpg',
        name: 'Zonas Verdes',
        caption: 'Zonas Verdes y Senderos — 18 Trinitarios',
        gps: [-73.36610, 7.00580],          // ← Sur centro del predio
        markers: [
            {
                id: 'info-senderos',
                position: { yaw: '0deg', pitch: '-8deg' },
                html: `<div class="marker-info">
                    <h3><i class="ph ph-tree" style="font-size:16px"></i> Senderos Ecológicos</h3>
                    <p>Recorridos guiados por la naturaleza del centro</p>
                </div>`,
                anchor: 'center center',
                data: { modal: 'senderos' },
            },
            {
                id: 'cta-reservas',
                position: { yaw: '-120deg', pitch: '0deg' },
                html: `<div class="marker-cta">
                    <i class="ph ph-calendar-check" style="font-size:16px"></i> Reserva tu visita
                </div>`,
                anchor: 'center center',
                data: { modal: 'reservas' },
            },
        ],
        links: [
            { nodeId: 'pano-01' },   // → NW  (~330°)
            { nodeId: 'pano-02' },   // → NE  (~30°)
        ],
    },
];

/* ═══════════════════════════════════════════════════════
   MODAL CONTENT
   ═══════════════════════════════════════════════════════ */

const MODAL_CONTENT = {
    piscinas: {
        title: 'Zona Acuática',
        body: `<div class="modal-content-card">
            <h2>Piscinas y Toboganes</h2>
            <p>Disfruta de nuestras piscinas diseñadas para toda la familia, con áreas diferenciadas para adultos y niños.</p>
            <ul>
                <li>Piscina semiolímpica para adultos</li>
                <li>Piscina recreativa con toboganes</li>
                <li>Piscina infantil con juegos acuáticos</li>
                <li>Zona de descanso con sillas y sombrillas</li>
            </ul>
            <div class="modal-tip">Recuerda usar gorro de baño obligatorio y pasar por el pediluvio antes de ingresar.</div>
        </div>`,
    },
    restaurante: {
        title: 'Restaurante',
        body: `<div class="modal-content-card">
            <h2>Gastronomía Local</h2>
            <p>Nuestro restaurante ofrece cocina tradicional santandereana y opciones para todos los gustos.</p>
            <ul>
                <li>Desayunos, almuerzos y cenas</li>
                <li>Platos típicos de la región</li>
                <li>Menú infantil disponible</li>
                <li>Cafetería y snacks</li>
            </ul>
        </div>`,
    },
    canchas: {
        title: 'Canchas Deportivas',
        body: `<div class="modal-content-card">
            <h2>Espacios Deportivos</h2>
            <p>Múltiples canchas disponibles para que disfrutes de tu deporte favorito con familia y amigos.</p>
            <ul>
                <li>Cancha de fútbol sintético</li>
                <li>Cancha de baloncesto</li>
                <li>Cancha de voleibol</li>
                <li>Zona de calentamiento</li>
            </ul>
        </div>`,
    },
    juegos: {
        title: 'Zona Infantil',
        body: `<div class="modal-content-card">
            <h2>Diversión para los Pequeños</h2>
            <p>Un espacio seguro y divertido diseñado especialmente para los más jóvenes de la familia.</p>
            <ul>
                <li>Parque infantil con columpios y deslizadores</li>
                <li>Zona de juegos de mesa</li>
                <li>Área de actividades dirigidas</li>
                <li>Supervisión permanente</li>
            </ul>
        </div>`,
    },
    senderos: {
        title: 'Senderos Ecológicos',
        body: `<div class="modal-content-card">
            <h2>Naturaleza Viva</h2>
            <p>Descubre la riqueza natural de los 18 Trinitarios a través de nuestros senderos guiados.</p>
            <ul>
                <li>Recorridos de 30 y 60 minutos</li>
                <li>Flora y fauna nativa</li>
                <li>Puntos de observación de aves</li>
                <li>Guías especializados disponibles</li>
            </ul>
        </div>`,
    },
    reservas: {
        title: 'Reserva tu Visita',
        body: `<div class="modal-content-card">
            <h2>Planifica tu Día</h2>
            <p>Reserva con anticipación para garantizar tu ingreso y disfrutar de todos nuestros servicios.</p>
            <ul>
                <li>Afiliados Comfenalco: ingreso preferencial</li>
                <li>Paquetes familiares con descuento</li>
                <li>Alojamiento en cabañas disponible</li>
                <li>Eventos empresariales y celebraciones</li>
            </ul>
            <div class="modal-tip">Contacta a Comfenalco Santander para tarifas actualizadas y disponibilidad.</div>
        </div>`,
    },
};

/* ═══════════════════════════════════════════════════════
   VIEWER INITIALIZATION
   ═══════════════════════════════════════════════════════ */

const viewer = new Viewer({
    container: document.getElementById('viewer'),
    loadingTxt: '',
    touchmoveTwoFingers: false,
    mousewheelCtrlKey: false,
    navbar: ['autorotate', 'zoom', 'gallery', 'caption', 'fullscreen'],
    plugins: [
        /* MarkersPlugin — requerido para los markers en cada nodo */
        MarkersPlugin,

        /* AutorotatePlugin — giro suave cuando el usuario está inactivo */
        AutorotatePlugin.withConfig({
            autostartDelay: 4000,
            autostartOnIdle: true,
            autorotatePitch: '-5deg',
        }),

        /* VirtualTourPlugin — navegación entre nodos con flechas 3D */
        VirtualTourPlugin.withConfig({
            dataMode: 'client',
            positionMode: 'gps',
            renderMode: '3d',
            nodes: NODES,
            startNodeId: 'pano-01',
            preload: true,
            transitionOptions: {
                showLoader: true,
                speed: '20rpm',
                effect: 'fade',
                rotation: true,
            },
        }),

        /* GalleryPlugin — carrusel de thumbnails */
        GalleryPlugin.withConfig({
            thumbnailSize: { width: 120, height: 80 },
        }),

        /* PlanPlugin — mini-mapa Leaflet con hotspots */
        PlanPlugin.withConfig({
            coordinates: [-73.36610, 7.00620],      // centro del triángulo
            bearing: '0deg',
            size: { width: '220px', height: '180px' },
            position: 'bottom left',
            defaultZoom: 17,
        }),
    ],
});

/* ═══════════════════════════════════════════════════════
   PLUGIN REFERENCES
   ═══════════════════════════════════════════════════════ */

const virtualTour = viewer.getPlugin(VirtualTourPlugin);
const markers     = viewer.getPlugin(MarkersPlugin);
const plan        = viewer.getPlugin(PlanPlugin);

/* ═══════════════════════════════════════════════════════
   NODE-CHANGED → toast + logging
   ═══════════════════════════════════════════════════════ */

virtualTour.addEventListener('node-changed', ({ node }) => {
    showNodeToast(node.name);
});

/* ═══════════════════════════════════════════════════════
   PLAN PLUGIN — Fallback: si la integración automática
   VirtualTourPlugin↔PlanPlugin no navega al hacer click,
   escuchamos 'select-hotspot' y forzamos la navegación.
   ═══════════════════════════════════════════════════════ */

if (plan) {
    plan.addEventListener('select-hotspot', ({ hotspotId }) => {
        const current = virtualTour.getCurrentNode();
        if (current && current.id !== hotspotId) {
            virtualTour.setCurrentNode(hotspotId);
        }
    });
}

/* ═══════════════════════════════════════════════════════
   LOADING SCREEN → INTRO
   ═══════════════════════════════════════════════════════ */

viewer.addEventListener('ready', () => {
    const loader = document.getElementById('loading-screen');
    loader.classList.add('fade-out');
    setTimeout(() => {
        loader.style.display = 'none';
        showIntro();
    }, 800);
}, { once: true });

/* ═══════════════════════════════════════════════════════
   INTRO / WELCOME SCREEN  (30 s auto-dismiss)
   ═══════════════════════════════════════════════════════ */

let introTimer = null;

function showIntro() {
    const intro = document.getElementById('intro-screen');
    const bar   = document.getElementById('intro-timer-bar');

    intro.classList.remove('hidden');
    intro.classList.remove('fade-out');

    /* Animate timer bar: 100 % → 0 % in 30 s */
    bar.style.transition = 'none';
    bar.style.width = '100%';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            bar.style.transition = 'width 30s linear';
            bar.style.width = '0%';
        });
    });

    clearTimeout(introTimer);
    introTimer = setTimeout(dismissIntro, 30000);
}

function dismissIntro() {
    const intro = document.getElementById('intro-screen');
    intro.classList.add('fade-out');
    clearTimeout(introTimer);
    setTimeout(() => {
        intro.classList.add('hidden');
        intro.classList.remove('fade-out');
    }, 600);
}

document.getElementById('intro-skip').addEventListener('click', dismissIntro);

/* ── Custom navbar button: re-open intro ── */
viewer.addEventListener('ready', () => {
    const navbar = document.querySelector('.psv-navbar');
    if (!navbar) return;

    const btn = document.createElement('button');
    btn.className = 'intro-navbar-btn';
    btn.title = 'Información del tour';
    btn.setAttribute('aria-label', 'Información del tour');
    btn.innerHTML = '<i class="ph ph-info" style="font-size:20px;color:white"></i>';
    navbar.appendChild(btn);
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showIntro();
    });
}, { once: true });

/* ═══════════════════════════════════════════════════════
   NODE TOAST
   ═══════════════════════════════════════════════════════ */

let toastTimeout = null;

function showNodeToast(name) {
    const toast = document.getElementById('node-toast');
    const text  = document.getElementById('node-toast-text');
    text.textContent = name;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3000);
}

/* ═══════════════════════════════════════════════════════
   MODAL SYSTEM
   ═══════════════════════════════════════════════════════ */

const overlay    = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody  = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openModal(title, bodyHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    overlay.classList.remove('hidden');
}

function closeModal() {
    overlay.classList.add('hidden');
    const vid = modalBody.querySelector('video');
    if (vid) vid.pause();
}

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
});

/* ── Marker click → open modal ── */
markers.addEventListener('select-marker', ({ marker }) => {
    const key = marker.data?.modal;
    if (key && MODAL_CONTENT[key]) {
        openModal(MODAL_CONTENT[key].title, MODAL_CONTENT[key].body);
    }
});

/* ═══════════════════════════════════════════════════════
   FAB ACTIONS
   ═══════════════════════════════════════════════════════ */

/* Video */
document.getElementById('fab-video').addEventListener('click', () => {
    openModal('Video de Presentación', `
        <video controls autoplay playsinline style="width:100%;border-radius:0 6px 0 0">
            <source src="assets/video/intro.mp4" type="video/mp4">
            Tu navegador no soporta video.
        </video>
    `);
});

/* Plano infográfico */
document.getElementById('fab-plan').addEventListener('click', () => {
    openModal('Plano del Centro Recreacional', `
        <img src="assets/img/plano-infografico.jpeg"
             alt="Plano 18 Trinitarios"
             style="width:100%;border-radius:0 6px 0 0">
    `);
});

/* ═══════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════ */

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'v' || e.key === 'V') document.getElementById('fab-video').click();
    if (e.key === 'm' || e.key === 'M') document.getElementById('fab-plan').click();
    if (e.key === 'i' || e.key === 'I') showIntro();
});
