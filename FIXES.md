# 🔧 Correcciones de Código - juantomoo.github.io

Este documento contiene las correcciones de código específicas para los problemas identificados en el análisis.

---

## 1. 🛡️ Manejo de Errores en script.js

### Problema
El código actual no maneja errores, causando crashes silenciosos.

### Solución: Agregar Error Handling

Agregar al inicio de `script.js`:

```javascript
// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Safe fetch wrapper con manejo de errores
 */
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
        
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error);
        throw error; // Re-throw para que el caller pueda manejarlo
    }
}

/**
 * Muestra notificación de error al usuario
 */
function showErrorNotification(message, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="error-icon">⚠️</div>
        <div class="error-message">${escapeHtml(message)}</div>
        <button class="error-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss después de duración
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Configuración de media por defecto (fallback)
 */
function getDefaultMediaConfig() {
    return {
        gallery: [
            {
                image: 'assets/fallback-gallery.jpg',
                title: 'Galería en construcción',
                description: 'Contenido próximamente disponible'
            }
        ],
        videos: [],
        audio: []
    };
}
```

---

## 2. 📦 Carga Segura de Media Config

### Reemplazar la función de carga actual

```javascript
// ============================================
// MEDIA LOADING CON ERROR HANDLING
// ============================================

let mediaConfig = null;

async function loadMediaConfig() {
    try {
        mediaConfig = await safeFetch('media-config.json');
        console.log('✅ Media config cargada correctamente');
        return mediaConfig;
        
    } catch (error) {
        console.error('⚠️ Usando configuración por defecto debido a error:', error);
        showErrorNotification('No se pudo cargar el contenido multimedia. Usando valores por defecto.');
        mediaConfig = getDefaultMediaConfig();
        return mediaConfig;
    }
}

/**
 * Inicializa galería con manejo de errores
 */
async function initGallery() {
    try {
        const config = await loadMediaConfig();
        const galleryData = config.gallery || [];
        
        if (galleryData.length === 0) {
            console.warn('⚠️ No hay elementos en la galería');
            showEmptyGalleryMessage();
            return;
        }
        
        renderGallery(galleryData);
        setupImageErrorHandling();
        
    } catch (error) {
        console.error('❌ Error inicializando galería:', error);
        showErrorNotification('Error al cargar la galería');
        showEmptyGalleryMessage();
    }
}

function showEmptyGalleryMessage() {
    const galleryContainer = document.querySelector('.gallery-grid');
    if (galleryContainer) {
        galleryContainer.innerHTML = `
            <div class="empty-gallery-message">
                <p>📷 La galería estará disponible próximamente</p>
            </div>
        `;
    }
}
```

---

## 3. 🖼️ Manejo de Errores de Imágenes

```javascript
// ============================================
// IMAGE ERROR HANDLING
// ============================================

/**
 * Configura manejo de errores para todas las imágenes
 */
function setupImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        // Si ya tiene listener, no agregar duplicado
        if (img.dataset.errorHandled) return;
        
        img.addEventListener('error', function handleImageError() {
            console.warn(`⚠️ Error cargando imagen: ${this.src}`);
            
            // Prevenir loops infinitos
            if (this.dataset.fallbackUsed) {
                console.error('❌ Fallback image también falló');
                this.style.display = 'none';
                return;
            }
            
            // Usar imagen de fallback
            this.dataset.fallbackUsed = 'true';
            this.src = 'assets/fallback-image.jpg';
            this.alt = 'Imagen no disponible';
            this.classList.add('fallback-image');
        }, { once: true }); // Solo trigger una vez
        
        img.dataset.errorHandled = 'true';
    });
}

/**
 * Pre-carga imagen de fallback al inicio
 */
function preloadFallbackImage() {
    const fallback = new Image();
    fallback.src = 'assets/fallback-image.jpg';
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    preloadFallbackImage();
    setupImageErrorHandling();
});
```

---

## 4. 🎨 Lazy Loading de Imágenes

### HTML: Agregar data-src a imágenes

```html
<!-- ANTES -->
<img src="assets/gallery/image1.jpg" alt="Arte">

<!-- DESPUÉS -->
<img 
    class="lazy"
    src="assets/placeholder-tiny.jpg" 
    data-src="assets/gallery/image1.jpg" 
    loading="lazy"
    alt="Arte Digital - Descripción completa y descriptiva"
>
```

### JavaScript: Implementar IntersectionObserver

```javascript
// ============================================
// LAZY LOADING
// ============================================

/**
 * Inicializa lazy loading para imágenes
 */
function initLazyLoading() {
    // Verificar soporte de IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        console.warn('⚠️ IntersectionObserver no soportado, cargando todas las imágenes');
        loadAllImages();
        return;
    }
    
    const imageObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadLazyImage(img);
                    observer.unobserve(img); // Dejar de observar una vez cargada
                }
            });
        },
        {
            root: null, // Viewport
            rootMargin: '50px', // Cargar 50px antes de entrar al viewport
            threshold: 0.01
        }
    );
    
    // Observar todas las imágenes lazy
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Carga una imagen lazy
 */
function loadLazyImage(img) {
    const src = img.dataset.src;
    
    if (!src) {
        console.warn('⚠️ Imagen lazy sin data-src:', img);
        return;
    }
    
    // Crear nueva imagen para pre-cargar
    const tempImg = new Image();
    
    tempImg.onload = function() {
        img.src = src;
        img.classList.remove('lazy');
        img.classList.add('lazy-loaded');
    };
    
    tempImg.onerror = function() {
        console.error(`❌ Error cargando imagen lazy: ${src}`);
        img.classList.remove('lazy');
        img.classList.add('lazy-error');
    };
    
    tempImg.src = src;
}

/**
 * Fallback: cargar todas las imágenes si no hay soporte
 */
function loadAllImages() {
    document.querySelectorAll('img.lazy').forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        }
    });
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', initLazyLoading);
```

### CSS: Estilos para lazy loading

```css
/* Agregar a styles.css */

/* Imagen lazy aún no cargada */
img.lazy {
    filter: blur(5px);
    opacity: 0.6;
    transition: filter 0.3s ease, opacity 0.3s ease;
}

/* Imagen lazy cargada */
img.lazy-loaded {
    filter: blur(0);
    opacity: 1;
}

/* Imagen lazy con error */
img.lazy-error {
    background: linear-gradient(135deg, #240046 0%, #3c096c 100%);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

img.lazy-error::after {
    content: '⚠️ Error de carga';
    color: var(--color-cyan);
    font-family: var(--font-mono);
}

/* Fallback image */
img.fallback-image {
    opacity: 0.5;
    filter: grayscale(100%);
}
```

---

## 5. 📱 Optimización para Móviles

```javascript
// ============================================
// MOBILE & PERFORMANCE OPTIMIZATIONS
// ============================================

/**
 * Detecta y configura optimizaciones para móviles
 */
function setupMobileOptimizations() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                     window.matchMedia('(max-width: 768px)').matches;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile) {
        console.log('📱 Modo móvil detectado - Aplicando optimizaciones');
        
        // Reducir quality de Three.js renderer
        if (window.renderer) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }
        
        // Reducir conteo de estrellas
        CONFIG.starCount = 100; // En lugar de 500
        
        // Deshabilitar sombras
        if (window.renderer) {
            renderer.shadowMap.enabled = false;
        }
    }
    
    if (prefersReducedMotion) {
        console.log('♿ Reducción de movimiento preferida - Desactivando animaciones');
        
        // Detener animaciones complejas
        CONFIG.enableAnimations = false;
        
        // Detener renderizado de Three.js o reducir a mínimo
        if (window.animationId) {
            cancelAnimationFrame(window.animationId);
        }
        
        // Agregar clase al body para CSS
        document.body.classList.add('reduced-motion');
    }
}

// Ejecutar al inicio
setupMobileOptimizations();

// Re-evaluar en resize (orientación de dispositivo)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupMobileOptimizations, 250);
});
```

### CSS para Reduced Motion

```css
/* Agregar a styles.css */

/* Deshabilitar animaciones si el usuario lo prefiere */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    /* Ocultar canvas 3D */
    #three-canvas {
        display: none;
    }
    
    /* Mostrar fondo estático alternativo */
    body {
        background: linear-gradient(135deg, #0d0221 0%, #240046 100%);
    }
}

/* Optimizaciones para móvil */
@media (max-width: 768px) {
    /* Reducir efectos costosos */
    .crt-overlay {
        opacity: 0.3; /* Menos intenso */
    }
    
    .scanlines {
        display: none; /* Deshabilitar scanlines */
    }
    
    /* Simplificar glow effects */
    .glow-text {
        text-shadow: 0 0 5px currentColor; /* Versión simple */
    }
}
```

---

## 6. ♿ Mejoras de Accesibilidad

### HTML: Actualizar elementos interactivos

```html
<!-- ============================= -->
<!-- MENU BUTTON -->
<!-- ============================= -->

<!-- ANTES -->
<button class="menu-btn" id="menu-btn">
    <span></span>
    <span></span>
    <span></span>
</button>

<!-- DESPUÉS -->
<button 
    class="menu-btn" 
    id="menu-btn"
    aria-label="Abrir menú de navegación"
    aria-expanded="false"
    aria-controls="nav-menu"
    aria-haspopup="true"
>
    <span class="sr-only">Línea 1 de menú</span>
    <span aria-hidden="true"></span>
    <span class="sr-only">Línea 2 de menú</span>
    <span aria-hidden="true"></span>
    <span class="sr-only">Línea 3 de menú</span>
    <span aria-hidden="true"></span>
</button>

<!-- ============================= -->
<!-- NAVIGATION MENU -->
<!-- ============================= -->

<!-- DESPUÉS -->
<nav 
    id="nav-menu" 
    class="nav-menu"
    role="navigation"
    aria-label="Menú principal"
>
    <ul role="list">
        <li><a href="#inicio" aria-current="page">Inicio</a></li>
        <li><a href="#proyectos">Proyectos</a></li>
        <!-- ... más items ... -->
    </ul>
</nav>

<!-- ============================= -->
<!-- SKIP LINK (agregar al inicio del body) -->
<!-- ============================= -->

<a href="#main-content" class="skip-link">
    Saltar al contenido principal
</a>

<!-- ============================= -->
<!-- MAIN CONTENT con ID -->
<!-- ============================= -->

<main id="main-content" role="main">
    <!-- Contenido aquí -->
</main>
```

### JavaScript: Gestión de Focus

```javascript
// ============================================
// ACCESSIBILITY UTILITIES
// ============================================

/**
 * Gestiona el estado ARIA del menú
 */
function toggleMenuAria() {
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
        // Enfocar primer elemento del menú cuando se abre
        const firstLink = navMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
}

/**
 * Trap focus dentro del modal
 */
function trapFocusInModal(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modalElement.addEventListener('keydown', function(e) {
        const isTabPressed = e.key === 'Tab';
        
        if (!isTabPressed) return;
        
        // Shift + Tab (reversa)
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } 
        // Tab normal
        else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
    
    // Enfocar primer elemento al abrir
    firstElement.focus();
}

/**
 * Manejo de teclado para navegación
 */
function setupKeyboardNavigation() {
    // ESC para cerrar modales/menús
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeActiveModal();
            closeMenu();
        }
    });
    
    // Navegación de secciones con flechas
    const sections = document.querySelectorAll('section[id]');
    let currentSectionIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
                navigateToSection(sections[currentSectionIndex].id);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
                navigateToSection(sections[currentSectionIndex].id);
            }
        }
    });
}

// Inicializar
setupKeyboardNavigation();
```

### CSS: Screen Reader Only & Focus Styles

```css
/* ============================= */
/* ACCESSIBILITY UTILITIES */
/* ============================= */

/* Screen reader only (ocultar visualmente pero accesible) */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

/* Skip link (visible al enfocar) */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    z-index: 100000;
    padding: 8px 16px;
    background: var(--color-cyan);
    color: var(--color-dark);
    text-decoration: none;
    font-family: var(--font-mono);
    transition: top 0.3s ease;
}

.skip-link:focus {
    top: 0;
    outline: 3px solid var(--color-pink);
    outline-offset: 2px;
}

/* Focus styles visibles para navegación por teclado */
*:focus {
    outline: 2px solid var(--color-cyan);
    outline-offset: 2px;
}

*:focus:not(:focus-visible) {
    outline: none;
}

*:focus-visible {
    outline: 2px solid var(--color-cyan);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.2);
}

/* Focus para elementos interactivos */
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
    outline: 3px solid var(--color-cyan);
    outline-offset: 3px;
    box-shadow: var(--glow-cyan);
}

/* Mejoras de contraste */
@media (prefers-contrast: high) {
    :root {
        --color-cyan: #00ffff;
        --color-pink: #ff00ff;
        --color-light: #ffffff;
    }
    
    .crt-overlay,
    .scanlines {
        opacity: 0.1; /* Reducir efectos que afectan legibilidad */
    }
}
```

---

## 7. 🔐 Sanitización de Input (Prevenir XSS)

```javascript
// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        unsafe = String(unsafe);
    }
    
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Sanitiza atributos HTML
 */
function sanitizeAttribute(value) {
    // Remover cualquier cosa que parezca un evento o script
    return value.replace(/on\w+\s*=|javascript:/gi, '');
}

/**
 * Valida y sanitiza URLs
 */
function sanitizeUrl(url) {
    try {
        const parsed = new URL(url);
        
        // Solo permitir protocolos seguros
        const allowedProtocols = ['http:', 'https:', 'mailto:'];
        
        if (!allowedProtocols.includes(parsed.protocol)) {
            console.warn(`⚠️ Protocolo no permitido: ${parsed.protocol}`);
            return '#';
        }
        
        return url;
        
    } catch (error) {
        console.warn('⚠️ URL inválida:', url);
        return '#';
    }
}

/**
 * Render seguro de contenido dinámico
 */
function safeRender(container, data) {
    // Usar textContent en lugar de innerHTML cuando sea posible
    const safeElement = document.createElement('div');
    safeElement.textContent = data.text;
    
    // Si necesitas HTML, sanitízalo primero
    if (data.html) {
        safeElement.innerHTML = escapeHtml(data.html);
    }
    
    container.appendChild(safeElement);
}

/**
 * Ejemplo de uso en la galería
 */
function renderGalleryItem(item) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    // ❌ NUNCA HAGAS ESTO:
    // galleryItem.innerHTML = `<p>${item.description}</p>`;
    
    // ✅ HAZ ESTO:
    galleryItem.innerHTML = `
        <img 
            class="lazy"
            src="${sanitizeUrl(item.thumbnail)}" 
            data-src="${sanitizeUrl(item.image)}"
            alt="${escapeHtml(item.title)}"
            loading="lazy"
        >
        <div class="gallery-item-overlay">
            <h3 class="gallery-item-title">${escapeHtml(item.title)}</h3>
            <p class="gallery-item-description">${escapeHtml(item.description)}</p>
        </div>
    `;
    
    return galleryItem;
}
```

---

## 8. 📊 SEO: Meta Tags Completas

### Actualizar index.html <head>

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- ============================= -->
    <!-- SEO BÁSICO -->
    <!-- ============================= -->
    <title>Juan Tomoo | Artista Visual & Desarrollador</title>
    <meta name="description" content="Portfolio de Juan Gómez Rivera (Juan Tomoo) - Artista visual y desarrollador especializado en arte digital, diseño web vaporwave, y experiencias interactivas con Three.js">
    <meta name="keywords" content="Juan Tomoo, artista visual, desarrollador web, arte digital, vaporwave, Three.js, diseño interactivo">
    <meta name="author" content="Juan Gómez Rivera">
    <meta name="robots" content="index, follow">
    <meta name="language" content="Spanish">
    <link rel="canonical" href="https://juantomoo.github.io/">
    
    <!-- ============================= -->
    <!-- OPEN GRAPH (Facebook, LinkedIn) -->
    <!-- ============================= -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://juantomoo.github.io/">
    <meta property="og:title" content="Juan Tomoo | Artista Visual & Desarrollador">
    <meta property="og:description" content="Portfolio de arte digital y desarrollo web con estética vaporwave y experiencias interactivas">
    <meta property="og:image" content="https://juantomoo.github.io/assets/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Juan Tomoo Portfolio">
    <meta property="og:locale" content="es_ES">
    
    <!-- ============================= -->
    <!-- TWITTER CARDS -->
    <!-- ============================= -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@juantomoo">
    <meta name="twitter:creator" content="@juantomoo">
    <meta name="twitter:title" content="Juan Tomoo | Artista Visual & Desarrollador">
    <meta name="twitter:description" content="Portfolio de arte digital y desarrollo web con estética vaporwave">
    <meta name="twitter:image" content="https://juantomoo.github.io/assets/twitter-card.jpg">
    
    <!-- ============================= -->
    <!-- THEME COLOR -->
    <!-- ============================= -->
    <meta name="theme-color" content="#00ffff">
    <meta name="msapplication-TileColor" content="#240046">
    
    <!-- ============================= -->
    <!-- ICONS -->
    <!-- ============================= -->
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="manifest" href="manifest.json">
    
    <!-- Resto del head... -->
</head>
```

### Crear Schema.org JSON-LD

Agregar antes de cerrar `</head>`:

```html
<!-- ============================= -->
<!-- SCHEMA.ORG STRUCTURED DATA -->
<!-- ============================= -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Juan Gómez Rivera",
  "alternateName": "Juan Tomoo",
  "url": "https://juantomoo.github.io",
  "image": "https://juantomoo.github.io/assets/profile.jpg",
  "jobTitle": "Artista Visual y Desarrollador Web",
  "worksFor": {
    "@type": "Organization",
    "name": "Freelance"
  },
  "description": "Artista visual y desarrollador especializado en arte digital, diseño web vaporwave, y experiencias interactivas",
  "sameAs": [
    "https://github.com/juantomoo",
    "https://instagram.com/juantomoo",
    "https://instagram.com/juantomooph",
    "https://artstation.com/juangomezrivera"
  ],
  "knowsAbout": [
    "Arte Digital",
    "Diseño Web",
    "Three.js",
    "JavaScript",
    "Desarrollo Frontend",
    "Estética Vaporwave"
  ]
}
</script>
```

---

## 9. 📄 Archivos Adicionales Necesarios

### robots.txt

Crear en la raíz del proyecto:

```txt
# robots.txt para juantomoo.github.io

User-agent: *
Allow: /

# Sitemap
Sitemap: https://juantomoo.github.io/sitemap.xml

# Optimización de crawling
Crawl-delay: 1
```

### sitemap.xml

Crear en la raíz:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://juantomoo.github.io/</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://juantomoo.github.io/#proyectos</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://juantomoo.github.io/#galeria</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Agregar más URLs según sea necesario -->
</urlset>
```

---

## 10. 🎨 CSS: Notificaciones de Error

Agregar a `styles.css`:

```css
/* ============================= */
/* ERROR NOTIFICATIONS */
/* ============================= */

.error-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    padding: 16px 20px;
    background: rgba(36, 0, 70, 0.95);
    border: 2px solid var(--color-pink);
    border-radius: 8px;
    box-shadow: 
        0 0 20px rgba(255, 0, 255, 0.5),
        0 8px 32px rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    font-family: var(--font-mono);
}

.error-notification.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
}

.error-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.error-message {
    flex: 1;
    color: var(--color-light);
    font-size: 14px;
    line-height: 1.4;
}

.error-close {
    background: none;
    border: none;
    color: var(--color-cyan);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    transition: color 0.2s ease, transform 0.2s ease;
}

.error-close:hover {
    color: var(--color-pink);
    transform: scale(1.2);
}

/* Animaciones */
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    to {
        opacity: 0;
        transform: translateY(-20px);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .error-notification {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
```

---

## 📋 Orden de Implementación Recomendado

1. **DÍA 1:** Manejo de errores básico (#1, #2, #3)
2. **DÍA 2:** Lazy loading y optimización de imágenes (#4)
3. **DÍA 3:** Optimizaciones móviles (#5)
4. **DÍA 4:** Accesibilidad (#6)
5. **DÍA 5:** Seguridad (#7)
6. **DÍA 6:** SEO (#8, #9)
7. **DÍA 7:** Testing y ajustes finales

---

## ✅ Testing

Después de implementar las correcciones:

```bash
# 1. Verificar errores de consola
# Abrir DevTools > Console
# No debe haber errores (excepto placeholders que se reemplazarán)

# 2. Testing de accesibilidad
# Navegación con Tab, Enter, Esc
# Screen reader (NVDA/JAWS/VoiceOver)

# 3. Performance
# Lighthouse audit (Performance > 85)

# 4. SEO
# Lighthouse audit (SEO > 95)
# Google Search Console

# 5. Seguridad
# Lighthouse audit (Security)
# Content Security Policy validator
```

---

**Última actualización:** 27 de Enero de 2026  
**Autor:** AI Agent con @ai-agent-efficiency
