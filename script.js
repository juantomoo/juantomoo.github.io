/**
 * JUAN TOMOO - Portfolio Digital
 * Sistema de navegación y experiencia inmersiva
 * Adaptado de Helios 99
 */

// =============================================
// CONFIGURACIÓN GLOBAL
// =============================================
const CONFIG = {
    sections: ['inicio', 'proyectos', 'galeria', 'media', 'about', 'servicios', 'contacto'],
    colors: {
        background: 0x0a0a12,
        grid: 0xff00ff,
        sun: 0xff9e00,
        cyan: 0x00ffff,
        pink: 0xff00ff
    },
    animationSpeed: 0.001,
    warpSpeed: 0.02
};

// Estado de la aplicación
let appState = {
    currentSection: 0,
    isLoading: true,
    isNavigating: false,
    audioEnabled: false,
    mouseX: 0,
    mouseY: 0
};

// =============================================
// THREE.JS - ESCENA 3D
// =============================================
let scene, camera, renderer;
let gridMesh, sunMesh, stars = [];
let warpTunnel;
let animationId;

// Inicializar la escena 3D
function init3D() {
    const canvas = document.getElementById('canvas-3d');

    // Crear escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.background);
    scene.fog = new THREE.FogExp2(CONFIG.colors.background, 0.008);

    // Crear cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 2, 0);

    // Crear renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Añadir elementos 3D
    createGrid();
    createSun();
    createStars();
    createWarpTunnel();

    // Añadir iluminación
    addLighting();

    // Manejar redimensionamiento
    window.addEventListener('resize', onWindowResize);

    // Iniciar animación
    animate();
}

// Crear grid infinito estilo vaporwave
function createGrid() {
    const gridGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.grid,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -2;

    scene.add(gridMesh);
}

// Crear sol poniente estilo vaporwave
function createSun() {
    const sunGeometry = new THREE.CircleGeometry(8, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.sun
    });
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(0, 5, -50);

    // Añadir franjas al sol
    const stripesGeometry = new THREE.PlaneGeometry(20, 0.5);
    const stripesMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.background
    });

    for (let i = 0; i < 12; i++) {
        const stripe = new THREE.Mesh(stripesGeometry, stripesMaterial);
        stripe.position.y = -3 + i * 0.6;
        stripe.position.z = 0.1;
        sunMesh.add(stripe);
    }

    scene.add(sunMesh);
}

// Crear estrellas de fondo
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = Math.random() * 100 + 10;
        positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: CONFIG.colors.cyan,
        size: 0.2,
        transparent: true,
        opacity: 0.8
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    stars.push(starField);
}

// Crear túnel de warp para transiciones
function createWarpTunnel() {
    const tunnelGeometry = new THREE.CylinderGeometry(5, 2, 50, 32, 10, true);
    const tunnelMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.pink,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });

    warpTunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    warpTunnel.rotation.x = Math.PI / 2;
    warpTunnel.visible = false;

    scene.add(warpTunnel);
}

// Añadir iluminación a la escena
function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(CONFIG.colors.cyan, 1, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    const pinkLight = new THREE.PointLight(CONFIG.colors.pink, 0.5, 50);
    pinkLight.position.set(-10, 5, -10);
    scene.add(pinkLight);
}

// Función de animación principal
function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animar grid
    if (gridMesh) {
        gridMesh.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.1;
    }

    // Animar sol
    if (sunMesh) {
        sunMesh.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
    }

    // Animar estrellas
    if (stars[0]) {
        stars[0].rotation.y += 0.0002;
    }

    // Seguimiento del mouse
    if (camera && !appState.isNavigating) {
        camera.position.x += (appState.mouseX * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (2 + appState.mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 2, 0);
    }

    renderer.render(scene, camera);
}

// Manejar redimensionamiento
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// =============================================
// NAVEGACIÓN
// =============================================
function navigateToSection(sectionIndex) {
    if (appState.isNavigating || sectionIndex === appState.currentSection) return;
    if (sectionIndex < 0 || sectionIndex >= CONFIG.sections.length) return;

    appState.isNavigating = true;

    // Ocultar sección actual
    const currentSectionEl = document.getElementById(`section-${CONFIG.sections[appState.currentSection]}`);
    if (currentSectionEl) {
        currentSectionEl.classList.remove('active');
    }

    // Mostrar efecto warp
    showWarpEffect();

    setTimeout(() => {
        appState.currentSection = sectionIndex;

        // Mostrar nueva sección
        const newSectionEl = document.getElementById(`section-${CONFIG.sections[sectionIndex]}`);
        if (newSectionEl) {
            newSectionEl.classList.add('active');
            window.scrollTo(0, 0);
        }

        hideWarpEffect();
        appState.isNavigating = false;
    }, 500);
}


function showWarpEffect() {
    // Remover warp overlay existente si hay uno
    const existingWarp = document.querySelector('.warp-overlay');
    if (existingWarp) {
        existingWarp.remove();
    }

    // Crear nuevo warp overlay
    const warpOverlay = document.createElement('div');
    warpOverlay.className = 'warp-overlay';
    warpOverlay.id = 'warp-overlay';
    document.body.appendChild(warpOverlay);
}

function hideWarpEffect() {
    const warpOverlay = document.getElementById('warp-overlay');
    if (warpOverlay) {
        warpOverlay.classList.add('hiding');
        setTimeout(() => {
            warpOverlay.remove();
        }, 500);
    }
}

// =============================================
// UI INTERACTIONS
// =============================================
function initUI() {
    // Menú de navegación
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Elementos de navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            const sectionIndex = CONFIG.sections.indexOf(section);
            navigateToSection(sectionIndex);
            menuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Botones de navegación
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newIndex = (appState.currentSection - 1 + CONFIG.sections.length) % CONFIG.sections.length;
            navigateToSection(newIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newIndex = (appState.currentSection + 1) % CONFIG.sections.length;
            navigateToSection(newIndex);
        });
    }

    // Botón de inicio
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            navigateToSection(1); // Ir a proyectos
        });
    }

    // Tracking del mouse
    document.addEventListener('mousemove', (e) => {
        appState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        appState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // Filtros de proyectos
    initProjectFilters();

    // Modal de galería
    initGalleryModal();

    // Formulario de contacto
    initContactForm();

    // Actualizar reloj
    updateClock();
    setInterval(updateClock, 1000);
}

// Filtros de proyectos
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botón activo
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filtrar proyectos
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Actualizar reloj
function updateClock() {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        clockEl.textContent = timeString;
    }
}

// =============================================
// MODAL DE GALERÍA
// =============================================
function initGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    const modalClose = document.getElementById('modal-close');

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

function openGalleryModal(item) {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalYear = document.getElementById('modal-year');
    const modalDescription = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');

    if (modalImg) modalImg.src = item.image;
    if (modalTitle) modalTitle.textContent = item.title || 'Sin título';
    if (modalYear) modalYear.textContent = item.year || '';
    if (modalDescription) modalDescription.textContent = item.description || '';
    
    if (modalTags) {
        modalTags.innerHTML = '';
        if (item.tags && item.tags.length) {
            item.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'modal-tag';
                tagEl.textContent = tag;
                modalTags.appendChild(tagEl);
            });
        }
    }

    modal.classList.add('active');
}

// =============================================
// FORMULARIO DE CONTACTO
// =============================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'ENVIANDO...';
            submitBtn.disabled = true;

            // Si usas Formspree, el formulario se enviará normalmente
            // Esta es una simulación para desarrollo local
            try {
                // Intento de envío real a Formspree
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    form.classList.add('hidden');
                    formSuccess.classList.add('show');
                    form.reset();
                } else {
                    throw new Error('Error en el envío');
                }
            } catch (error) {
                // Fallback: mostrar éxito de todos modos en desarrollo
                console.log('Simulando envío exitoso');
                form.classList.add('hidden');
                formSuccess.classList.add('show');
                form.reset();
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

// =============================================
// CARGA DE CONTENIDO DINÁMICO
// =============================================
async function loadMediaConfig() {
    try {
        const response = await fetch('media-config.json');
        if (!response.ok) throw new Error('No se pudo cargar media-config.json');
        
        const config = await response.json();
        
        // Cargar galería
        if (config.gallery && config.gallery.length) {
            renderGallery(config.gallery);
        }
        
        // Cargar videos
        if (config.videos && config.videos.length) {
            renderVideos(config.videos);
        }
        
        // Cargar audio
        if (config.audio && config.audio.length) {
            renderAudio(config.audio);
        }
        
    } catch (error) {
        console.log('Usando contenido de demostración:', error.message);
        // Mostrar instrucciones si no hay config
        showMediaInstructions();
    }
}

function renderGallery(items) {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const article = document.createElement('article');
        article.className = 'gallery-item';
        article.innerHTML = `
            <img src="${item.image}" alt="${item.title || 'Obra'}" loading="lazy">
            <div class="gallery-item-overlay">
                <span class="gallery-item-title">${item.title || 'Sin título'}</span>
                ${item.description ? `<span class="gallery-item-desc">${item.description}</span>` : ''}
            </div>
        `;
        
        article.addEventListener('click', () => openGalleryModal(item));
        container.appendChild(article);
    });
}

function renderVideos(items) {
    const container = document.getElementById('videos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const article = document.createElement('article');
        article.className = 'media-item';
        article.innerHTML = `
            <div class="media-embed">
                <iframe src="${item.embed}" 
                        title="${item.title || 'Video'}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
            ${item.title || item.description ? `
            <div class="media-info">
                ${item.title ? `<h4 class="media-title">${item.title}</h4>` : ''}
                ${item.description ? `<p class="media-description">${item.description}</p>` : ''}
            </div>
            ` : ''}
        `;
        container.appendChild(article);
    });
}

function renderAudio(items) {
    const container = document.getElementById('audio-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const article = document.createElement('article');
        article.className = 'media-item';
        article.innerHTML = `
            <div class="audio-embed">
                <iframe src="${item.embed}" 
                        title="${item.title || 'Audio'}"
                        scrolling="no" 
                        frameborder="no" 
                        allow="autoplay">
                </iframe>
            </div>
            ${item.title || item.description ? `
            <div class="media-info">
                ${item.title ? `<h4 class="media-title">${item.title}</h4>` : ''}
                ${item.description ? `<p class="media-description">${item.description}</p>` : ''}
            </div>
            ` : ''}
        `;
        container.appendChild(article);
    });
}

function showMediaInstructions() {
    // Las instrucciones ya están en el HTML como placeholders
    console.log('Crea el archivo media-config.json para agregar contenido');
}

// =============================================
// PANTALLA DE CARGA
// =============================================
function initLoading() {
    const loadingScreen = document.getElementById('loading-screen');

    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        appState.isLoading = false;
    }, 2500);
}

// =============================================
// AUDIO DE FONDO (SoundCloud)
// =============================================
let scPlayer;
let scWidget;

function initAudio() {
    const audioToggle = document.getElementById('audio-toggle');
    const scIframe = document.getElementById('soundcloud-player');
    
    if (!audioToggle || !scIframe) return;
    
    // Inicializar widget de SoundCloud
    if (window.SC && window.SC.Widget) {
        scWidget = SC.Widget(scIframe);
        
        scWidget.bind(SC.Widget.Events.READY, () => {
            console.log('SoundCloud widget ready');
        });
        
        scWidget.bind(SC.Widget.Events.PLAY, () => {
            appState.audioEnabled = true;
            audioToggle.classList.add('playing');
            audioToggle.querySelector('.audio-icon').textContent = '🔊';
        });
        
        scWidget.bind(SC.Widget.Events.PAUSE, () => {
            appState.audioEnabled = false;
            audioToggle.classList.remove('playing');
            audioToggle.querySelector('.audio-icon').textContent = '🔇';
        });
        
        scWidget.bind(SC.Widget.Events.FINISH, () => {
            // Loop
            scWidget.seekTo(0);
            scWidget.play();
        });
    }
    
    audioToggle.addEventListener('click', toggleAudio);
}

function toggleAudio() {
    const audioToggle = document.getElementById('audio-toggle');
    const scIframe = document.getElementById('soundcloud-player');
    
    if (scWidget) {
        if (appState.audioEnabled) {
            scWidget.pause();
        } else {
            scWidget.play();
        }
    } else {
        // Fallback: reiniciar iframe con autoplay
        if (!appState.audioEnabled) {
            const currentSrc = scIframe.src;
            scIframe.src = currentSrc.replace('auto_play=false', 'auto_play=true');
            appState.audioEnabled = true;
            audioToggle.classList.add('playing');
            audioToggle.querySelector('.audio-icon').textContent = '🔊';
        } else {
            scIframe.src = scIframe.src.replace('auto_play=true', 'auto_play=false');
            appState.audioEnabled = false;
            audioToggle.classList.remove('playing');
            audioToggle.querySelector('.audio-icon').textContent = '🔇';
        }
    }
}

// =============================================
// EFECTOS DE CURSOR
// =============================================
function initCursorEffects() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<span>◈</span>';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        pointer-events: none;
        z-index: 10000;
        color: #00ffff;
        font-size: 16px;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease, color 0.2s ease;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const interactiveElements = document.querySelectorAll('a, button, .project-card, .gallery-item, .nav-item, .filter-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.color = '#ff00ff';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.color = '#00ffff';
        });
    });

    // Ocultar en móviles
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
    }
}

// =============================================
// EFECTO DE TEXTO GLITCH
// =============================================
function initGlitchEffects() {
    const glitchElements = document.querySelectorAll('.loading-glitch, .title-glitch, .logo-glitch');

    glitchElements.forEach(el => {
        const originalText = el.dataset.text || el.textContent;

        setInterval(() => {
            if (Math.random() > 0.95) {
                const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
                let glitchedText = '';

                for (let i = 0; i < originalText.length; i++) {
                    if (Math.random() > 0.9) {
                        glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    } else {
                        glitchedText += originalText[i];
                    }
                }

                el.textContent = glitchedText;

                setTimeout(() => {
                    el.textContent = originalText;
                }, 100);
            }
        }, 2000);
    });
}

// =============================================
// INICIALIZACIÓN PRINCIPAL
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos 3D
    init3D();

    // Inicializar UI
    initUI();

    // Inicializar efectos de cursor
    initCursorEffects();

    // Inicializar efectos glitch
    initGlitchEffects();

    // Cargar contenido multimedia
    loadMediaConfig();

    // Inicializar audio
    setTimeout(() => {
        initAudio();
    }, 3000);

    // Iniciar pantalla de carga
    initLoading();
});

// =============================================
// EXPORTAR FUNCIONES GLOBALES
// =============================================
window.navigateToSection = navigateToSection;
window.appState = appState;
window.openGalleryModal = openGalleryModal;
