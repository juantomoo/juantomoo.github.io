/*
 * EN EL NIDO - Lógica principal de la experiencia interactiva
 * -----------------------------------------------------------------------------
 * Este archivo centraliza toda la interacción de la obra y consume los datos
 * externos definidos en stories-data.js y glossary-data.js.
 *
 * Objetivos de esta implementación:
 * 1) Cargar los 30 cuentos completos desde datos externos.
 * 2) Cargar y renderizar un glosario híbrido completo.
 * 3) Mantener compatibilidad con la UI/clases/funciones existentes.
 * 4) Añadir mejoras UX: resaltado, persistencia, búsqueda robusta, deep-link,
 *    y feedback no intrusivo.
 */

// -----------------------------------------------------------------------------
// Configuración persistente en almacenamiento local
// -----------------------------------------------------------------------------
const STORAGE_KEYS = {
    fontSize: 'en_el_nido_font_size',
    lastStoryId: 'en_el_nido_last_story_id'
};

// -----------------------------------------------------------------------------
// Metadatos de categorías del glosario (mantiene secciones existentes)
// -----------------------------------------------------------------------------
const GLOSSARY_CATEGORY_META = {
    personajes: { title: 'Personajes y Entidades', icon: '👤' },
    conceptos_tecnologicos: { title: 'Conceptos Tecnológicos y Científicos', icon: '⚙️' },
    conceptos_biologicos: { title: 'Conceptos Biológicos', icon: '🌿' },
    conceptos_quimicos: { title: 'Conceptos Químicos y Atmosféricos', icon: '🧪' },
    conceptos_filosoficos: { title: 'Conceptos Filosóficos y Sociológicos', icon: '🧠' },
    conceptos_economicos: { title: 'Conceptos Económicos y Políticos', icon: '📊' },
    conceptos_fisicos: { title: 'Conceptos Físicos y Cosmológicos', icon: '🌌' },
    conceptos_neurologicos: { title: 'Conceptos Neurológicos', icon: '🔬' },
    elementos_literarios: { title: 'Elementos Literarios y Estéticos', icon: '📚' }
};

// -----------------------------------------------------------------------------
// Estado global de interacción
// -----------------------------------------------------------------------------
let currentStoryId = null;
let currentGlossaryItem = null;
let fontSize = loadPersistedFontSize();
let currentTheme = 'dark';

// -----------------------------------------------------------------------------
// Normalización y sanitización de datos de cuentos
// -----------------------------------------------------------------------------
function sanitizeSignature(signature) {
    // El dataset trae firmas con guiones bajos externos; aquí limpiamos para
    // evitar dobles guiones bajos al mostrar en modal y al copiar.
    return String(signature || '')
        .replace(/^_+/u, '')
        .replace(/_+$/u, '')
        .trim();
}

function sanitizeStoryContent(content) {
    // El proceso de extracción del markdown puede arrastrar separadores "---"
    // al final. Este limpiador los elimina sin tocar el cuerpo del cuento.
    return String(content || '')
        .replace(/\n*\s*---\s*$/u, '')
        .trim();
}

function normalizeStory(rawStory, index) {
    // Garantiza contrato estable de cada historia para toda la app.
    return {
        id: Number(rawStory?.id) || index + 1,
        title: String(rawStory?.title || '¿Pequeñas ficciones?').trim(),
        date: String(rawStory?.date || `EN EL NIDO_${String(index + 1).padStart(6, '0')}`).trim(),
        signature: sanitizeSignature(rawStory?.signature),
        content: sanitizeStoryContent(rawStory?.content)
    };
}

// -----------------------------------------------------------------------------
// Carga de datasets externos
// -----------------------------------------------------------------------------
const stories = (Array.isArray(window.EN_EL_NIDO_STORIES) ? window.EN_EL_NIDO_STORIES : []).map(normalizeStory);
const glossary = window.EN_EL_NIDO_GLOSSARY && typeof window.EN_EL_NIDO_GLOSSARY === 'object'
    ? window.EN_EL_NIDO_GLOSSARY
    : {};

// -----------------------------------------------------------------------------
// Helpers generales de texto y seguridad HTML
// -----------------------------------------------------------------------------
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeText(value) {
    // Normaliza para búsqueda robusta: minúsculas, sin tildes/diacríticos.
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function escapeHtml(value) {
    // Escapa caracteres especiales para prevenir inyección accidental.
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    // Alias semántico cuando el texto escapa para atributos HTML.
    return escapeHtml(value);
}

function escapeRegExp(value) {
    // Escapa para construir expresiones regulares dinámicas seguras.
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isWordCharacter(char) {
    // Determina si un carácter forma parte de palabra/identificador.
    return /[\p{L}\p{N}_]/u.test(char || '');
}

// -----------------------------------------------------------------------------
// Persistencia de preferencias
// -----------------------------------------------------------------------------
function loadPersistedFontSize() {
    try {
        const parsed = Number(localStorage.getItem(STORAGE_KEYS.fontSize));
        if (!Number.isFinite(parsed)) {
            return 16;
        }
        return clamp(parsed, 12, 24);
    } catch (_error) {
        return 16;
    }
}

function persistFontSize(value) {
    try {
        localStorage.setItem(STORAGE_KEYS.fontSize, String(value));
    } catch (_error) {
        // Si localStorage no está disponible, la app sigue funcionando.
    }
}

function loadPersistedLastStoryId() {
    try {
        const parsed = Number(localStorage.getItem(STORAGE_KEYS.lastStoryId));
        if (!Number.isFinite(parsed)) {
            return null;
        }
        return parsed;
    } catch (_error) {
        return null;
    }
}

function persistLastStoryId(storyId) {
    try {
        localStorage.setItem(STORAGE_KEYS.lastStoryId, String(storyId));
    } catch (_error) {
        // Si falla persistencia, no bloqueamos la interacción.
    }
}

// -----------------------------------------------------------------------------
// Sistema de notificaciones no intrusivas (toasts)
// -----------------------------------------------------------------------------
function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'success') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 220);
    }, 2500);
}

// -----------------------------------------------------------------------------
// Utilidades de navegación y selección de historias
// -----------------------------------------------------------------------------
function getStoryById(storyId) {
    return stories.find((story) => story.id === storyId) || null;
}

function parseStoryIdFromHash(hashValue = window.location.hash) {
    const match = String(hashValue || '').match(/^#story-(\d+)$/u);
    if (!match) {
        return null;
    }

    const parsedId = Number(match[1]);
    if (!Number.isFinite(parsedId)) {
        return null;
    }

    return parsedId;
}

function activateSection(sectionId) {
    // Mantiene el patrón de tabs existente, solo centraliza su lógica.
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section');

    tabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.section === sectionId);
    });

    sections.forEach((section) => {
        section.classList.toggle('active', section.id === sectionId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -----------------------------------------------------------------------------
// Construcción de índice del glosario para búsqueda y resaltado
// -----------------------------------------------------------------------------
function collectGlossaryItems(glossaryData) {
    // Convierte estructura por categorías en un arreglo plano de items.
    const items = [];

    Object.entries(glossaryData || {}).forEach(([category, categoryItems]) => {
        if (!Array.isArray(categoryItems)) {
            return;
        }

        categoryItems.forEach((rawItem) => {
            if (!rawItem || !rawItem.term) {
                return;
            }

            items.push({
                category,
                term: String(rawItem.term).trim(),
                narrative: String(rawItem.narrative || '').trim(),
                scientific: String(rawItem.scientific || '').trim(),
                related: Array.isArray(rawItem.related) ? rawItem.related.map(String) : [],
                aliases: Array.isArray(rawItem.aliases) ? rawItem.aliases.map(String) : [],
                quote: String(rawItem.quote || '').trim()
            });
        });
    });

    return items;
}

const glossaryItems = collectGlossaryItems(glossary);
const glossaryItemByTerm = new Map();

function buildGlossaryLookup(items) {
    // Permite resolver rápidamente un término o cualquiera de sus alias.
    items.forEach((item) => {
        const variants = [item.term, ...item.aliases];

        variants.forEach((variant) => {
            const normalized = normalizeText(variant);
            if (!normalized || glossaryItemByTerm.has(normalized)) {
                return;
            }

            glossaryItemByTerm.set(normalized, item);
        });
    });
}

buildGlossaryLookup(glossaryItems);

function buildInlineTermCandidates(items) {
    // Prepara variantes para resaltado contextual dentro de cuentos.
    const candidates = [];
    const seen = new Set();

    items.forEach((item) => {
        const variants = [item.term, ...item.aliases];

        variants.forEach((variant) => {
            const cleaned = String(variant || '').trim();
            const normalized = normalizeText(cleaned);

            if (!normalized || cleaned.length < 3 || seen.has(normalized)) {
                return;
            }

            seen.add(normalized);
            candidates.push({
                variant: cleaned,
                canonical: item.term
            });
        });
    });

    // Se ordena por longitud para priorizar términos compuestos sobre subcadenas.
    candidates.sort((a, b) => b.variant.length - a.variant.length);
    return candidates;
}

const inlineTermCandidates = buildInlineTermCandidates(glossaryItems);

function findTermMatches(text) {
    // Encuentra coincidencias de términos sin romper palabras adyacentes.
    const matches = [];

    inlineTermCandidates.forEach((candidate) => {
        const regex = new RegExp(escapeRegExp(candidate.variant), 'giu');
        let result = regex.exec(text);

        while (result) {
            const start = result.index;
            const end = start + result[0].length;

            const before = start === 0 ? ' ' : text[start - 1];
            const after = end >= text.length ? ' ' : text[end];

            if (!isWordCharacter(before) && !isWordCharacter(after)) {
                matches.push({
                    start,
                    end,
                    canonical: candidate.canonical
                });
            }

            if (regex.lastIndex === result.index) {
                regex.lastIndex += 1;
            }
            result = regex.exec(text);
        }
    });

    // Para coincidencias con mismo inicio, prioriza la más larga.
    matches.sort((a, b) => {
        if (a.start !== b.start) {
            return a.start - b.start;
        }
        return (b.end - b.start) - (a.end - a.start);
    });

    // Mantiene solo coincidencias no solapadas para HTML limpio.
    const selected = [];
    let lastEnd = -1;

    matches.forEach((match) => {
        if (match.start >= lastEnd) {
            selected.push(match);
            lastEnd = match.end;
        }
    });

    return selected;
}

function formatEscapedText(text) {
    // Conserva saltos de línea internos cuando se inyecta HTML seguro.
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function renderParagraphWithHighlights(paragraphText) {
    // Inserta botones de términos sin exponer HTML arbitrario.
    const matches = findTermMatches(paragraphText);
    if (matches.length === 0) {
        return formatEscapedText(paragraphText);
    }

    let html = '';
    let cursor = 0;

    matches.forEach((match) => {
        html += formatEscapedText(paragraphText.slice(cursor, match.start));

        const visibleLabel = paragraphText.slice(match.start, match.end);
        html += `<button type="button" class="inline-term" data-term="${escapeAttribute(match.canonical)}" title="Abrir glosario contextual">${formatEscapedText(visibleLabel)}</button>`;

        cursor = match.end;
    });

    html += formatEscapedText(paragraphText.slice(cursor));
    return html;
}

function renderStoryBody(content) {
    // Convierte texto en párrafos HTML preservando ritmo narrativo.
    const paragraphs = String(content || '')
        .split(/\n{2,}/u)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return paragraphs
        .map((paragraph) => `<p>${renderParagraphWithHighlights(paragraph)}</p>`)
        .join('');
}

// -----------------------------------------------------------------------------
// Renderizadores de UI
// -----------------------------------------------------------------------------
function renderStories() {
    const grid = document.getElementById('storiesGrid');
    if (!grid) {
        return;
    }

    grid.innerHTML = stories.map((story) => {
        const preview = story.content.replace(/\s+/g, ' ').trim().slice(0, 150);
        return `
            <div class="story-card" onclick="openStory(${story.id})">
                <div class="story-date">${escapeHtml(story.date)}</div>
                <div class="story-title">${escapeHtml(story.title)}</div>
                <div class="story-preview">${escapeHtml(preview)}...</div>
            </div>
        `;
    }).join('');
}

function renderTOC() {
    const toc = document.getElementById('tocList');
    if (!toc) {
        return;
    }

    toc.innerHTML = stories.map((story) => `
        <div class="toc-item" onclick="openStory(${story.id})">
            <span class="toc-item-title">${escapeHtml(story.date)}</span>
            <span class="toc-item-date">${escapeHtml(story.signature)}</span>
        </div>
    `).join('');
}

function renderGlossary() {
    const container = document.getElementById('glossaryContent');
    if (!container) {
        return;
    }

    container.innerHTML = Object.entries(glossary).map(([key, items]) => {
        const meta = GLOSSARY_CATEGORY_META[key] || { title: key, icon: '' };
        const normalizedItems = Array.isArray(items) ? items : [];

        const itemsHtml = normalizedItems.map((item) => {
            const aliases = Array.isArray(item.aliases) ? item.aliases : [];
            const related = Array.isArray(item.related) ? item.related : [];

            const searchIndex = normalizeText([
                item.term,
                item.narrative,
                item.scientific,
                item.quote,
                ...aliases,
                ...related
            ].join(' '));

            return `
                <div class="glossary-item" data-term="${escapeAttribute(normalizeText(item.term))}" data-search-index="${escapeAttribute(searchIndex)}">
                    <h4 class="term-name">${escapeHtml(item.term)}</h4>
                    ${item.narrative ? `<p class="term-narrative">${escapeHtml(item.narrative)}</p>` : ''}
                    ${item.scientific ? `<p class="term-scientific">${escapeHtml(item.scientific)}</p>` : ''}
                    ${related.length > 0 ? `<p class="term-related"><strong>Relacionados:</strong> ${escapeHtml(related.join(', '))}</p>` : ''}
                    ${item.quote ? `<p class="term-quote">"${escapeHtml(item.quote)}"</p>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="glossary-category" data-category="${escapeAttribute(key)}">
                <h3 class="category-title">${meta.icon} ${escapeHtml(meta.title)}</h3>
                ${itemsHtml}
            </div>
        `;
    }).join('');
}

function getGlossaryItem(term) {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) {
        return null;
    }

    return glossaryItemByTerm.get(normalizedTerm) || null;
}

function renderGlossaryItemDetails(item) {
    const aliases = Array.isArray(item.aliases) ? item.aliases.filter(Boolean) : [];
    const related = Array.isArray(item.related) ? item.related.filter(Boolean) : [];

    return `
        <div class="glossary-modal-kicker">Glosario contextual</div>
        <h3 class="glossary-modal-title" id="glossaryModalTerm">${escapeHtml(item.term)}</h3>
        ${item.narrative ? `<p class="glossary-modal-narrative">${escapeHtml(item.narrative)}</p>` : ''}
        ${item.scientific ? `<p class="glossary-modal-scientific">${escapeHtml(item.scientific)}</p>` : ''}
        ${aliases.length > 0 ? `<p class="glossary-modal-aliases"><strong>Alias:</strong> ${escapeHtml(aliases.join(', '))}</p>` : ''}
        ${related.length > 0 ? `<p class="glossary-modal-related"><strong>Relacionados:</strong> ${escapeHtml(related.join(', '))}</p>` : ''}
        ${item.quote ? `<blockquote class="glossary-modal-quote">${escapeHtml(item.quote)}</blockquote>` : ''}
    `;
}

function syncBodyScrollLock() {
    const storyModalActive = document.getElementById('storyModal').classList.contains('active');
    const glossaryModalActive = document.getElementById('glossaryTermModal').classList.contains('active');

    document.body.style.overflow = storyModalActive || glossaryModalActive ? 'hidden' : '';
}

function openGlossaryModal(term, options = {}) {
    const item = getGlossaryItem(term);
    if (!item) {
        if (options.silent !== true) {
            showToast('No se encontró ese término en el glosario.', 'warning');
        }
        return;
    }

    currentGlossaryItem = item;
    document.getElementById('glossaryModalBody').innerHTML = renderGlossaryItemDetails(item);
    document.getElementById('glossaryTermModal').classList.add('active');
    syncBodyScrollLock();
}

function closeGlossaryModal() {
    currentGlossaryItem = null;
    document.getElementById('glossaryTermModal').classList.remove('active');
    syncBodyScrollLock();
}

function updateStoryCount() {
    const countNode = document.getElementById('storyCount');
    if (!countNode) {
        return;
    }
    countNode.textContent = String(stories.length);
}

// -----------------------------------------------------------------------------
// Apertura/cierre de modal con navegación, hash y persistencia
// -----------------------------------------------------------------------------
function openStory(id, options = {}) {
    const story = getStoryById(Number(id));
    if (!story) {
        showToast('No se encontró el cuento solicitado.', 'warning');
        return;
    }

    const modalBody = document.getElementById('modalBody');
    const updateHistory = options.updateHistory !== false;

    closeGlossaryModal();
    currentStoryId = story.id;

    document.getElementById('modalTitle').textContent = story.title;
    document.getElementById('modalDate').textContent = story.date;
    modalBody.style.fontSize = `${fontSize}px`;
    modalBody.innerHTML = renderStoryBody(story.content);
    document.getElementById('modalSignature').textContent = `_${story.signature}_`;
    document.getElementById('storyModal').classList.add('active');
    syncBodyScrollLock();

    persistLastStoryId(story.id);

    if (updateHistory) {
        history.pushState({ storyId: story.id }, '', `#story-${story.id}`);
    }
}

function closeStoryModal(options = {}) {
    const clearHash = options.clearHash !== false;

    document.getElementById('storyModal').classList.remove('active');
    currentStoryId = null;
    closeGlossaryModal();
    syncBodyScrollLock();

    if (clearHash && /^#story-\d+$/u.test(window.location.hash)) {
        history.pushState({}, '', `${window.location.pathname}${window.location.search}`);
    }
}

function navigateStory(direction) {
    if (currentStoryId == null) {
        return;
    }

    const targetId = currentStoryId + Number(direction);
    if (targetId >= 1 && targetId <= stories.length) {
        openStory(targetId);
    }
}

function changeFontSize(delta) {
    fontSize = clamp(fontSize + Number(delta), 12, 24);
    persistFontSize(fontSize);

    const modalBody = document.getElementById('modalBody');
    modalBody.style.fontSize = `${fontSize}px`;

    showToast(`Tamaño de lectura: ${fontSize}px`, 'success');
}

function printStory() {
    window.print();
}

async function copyTextToClipboard(text) {
    // Ruta principal: API Clipboard.
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_error) {
            // Continuamos con fallback si la API falla.
        }
    }

    // Fallback legacy para navegadores sin permisos modernos.
    try {
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'absolute';
        tmp.style.left = '-9999px';
        document.body.appendChild(tmp);
        tmp.select();
        const copied = document.execCommand('copy');
        tmp.remove();
        return copied;
    } catch (_error) {
        return false;
    }
}

async function copyStory() {
    const story = getStoryById(currentStoryId);
    if (!story) {
        showToast('Abre un cuento antes de copiar.', 'warning');
        return;
    }

    const text = `${story.date}\n\n${story.content}\n\n_${story.signature}_`;
    const copied = await copyTextToClipboard(text);

    if (copied) {
        showToast('Cuento copiado al portapapeles.', 'success');
    } else {
        showToast('No fue posible copiar el cuento.', 'error');
    }
}

async function shareStory() {
    const story = getStoryById(currentStoryId);
    if (!story) {
        showToast('Abre un cuento antes de compartir.', 'warning');
        return;
    }

    const payload = {
        title: `${story.date} - ${story.title}`,
        text: `${story.content.slice(0, 220)}...`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(payload);
            showToast('Compartido correctamente.', 'success');
            return;
        } catch (error) {
            if (error && error.name === 'AbortError') {
                return;
            }
        }
    }

    await copyStory();
}

// -----------------------------------------------------------------------------
// Búsqueda robusta del glosario
// -----------------------------------------------------------------------------
function filterGlossary(rawQuery) {
    const query = normalizeText(rawQuery);

    document.querySelectorAll('.glossary-category').forEach((category) => {
        let visibleItems = 0;

        category.querySelectorAll('.glossary-item').forEach((item) => {
            const searchIndex = item.dataset.searchIndex || '';
            const shouldShow = !query || searchIndex.includes(query);

            item.classList.toggle('hidden', !shouldShow);
            if (shouldShow) {
                visibleItems += 1;
            }
        });

        category.classList.toggle('hidden', visibleItems === 0);
    });
}

function jumpToGlossaryTerm(term) {
    openGlossaryModal(term);
}

// -----------------------------------------------------------------------------
// Progreso de lectura, navegación y hash routing
// -----------------------------------------------------------------------------
function initNavigation() {
    document.querySelectorAll('.nav-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            activateSection(tab.dataset.section);
        });
    });
}

function initReadingProgress() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight <= 0) {
            document.getElementById('readingProgress').style.width = '0%';
            return;
        }

        const progress = (scrollTop / docHeight) * 100;
        document.getElementById('readingProgress').style.width = `${progress}%`;
    });
}

function openInitialStoryContext() {
    // Prioridad 1: hash explícito en URL.
    const hashStoryId = parseStoryIdFromHash();
    if (hashStoryId != null && getStoryById(hashStoryId)) {
        openStory(hashStoryId, { updateHistory: false });
        return;
    }

    // Prioridad 2: último cuento leído persistido.
    const lastStoryId = loadPersistedLastStoryId();
    if (lastStoryId != null && getStoryById(lastStoryId)) {
        openStory(lastStoryId, { updateHistory: false });
    }
}

function initHashSynchronization() {
    // Mantiene sincronía al navegar con atrás/adelante del navegador.
    window.addEventListener('hashchange', () => {
        const targetStoryId = parseStoryIdFromHash();

        if (targetStoryId != null && getStoryById(targetStoryId)) {
            if (currentStoryId !== targetStoryId) {
                openStory(targetStoryId, { updateHistory: false });
            }
            return;
        }

        if (document.getElementById('storyModal').classList.contains('active')) {
            closeStoryModal({ clearHash: false });
        }
    });
}

// -----------------------------------------------------------------------------
// Animación de fondo (Hyphae) preservada y encapsulada
// -----------------------------------------------------------------------------
function initHyphaeAnimation() {
    const canvas = document.getElementById('hyphae-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Hypha {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.life = Math.random() * 100 + 50;
            this.maxLife = this.life;
            this.hue = 280 + Math.random() * 40;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 1;

            if (
                this.life <= 0
                || this.x < 0
                || this.x > canvas.width
                || this.y < 0
                || this.y > canvas.height
            ) {
                this.reset();
            }
        }

        draw() {
            const alpha = (this.life / this.maxLife) * 0.6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
            ctx.fill();
        }
    }

    class Connection {
        constructor(h1, h2) {
            this.h1 = h1;
            this.h2 = h2;
            this.maxDistance = 150;
        }

        draw() {
            const dx = this.h1.x - this.h2.x;
            const dy = this.h1.y - this.h2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.maxDistance) {
                const alpha = (1 - (distance / this.maxDistance)) * 0.3;
                ctx.beginPath();
                ctx.moveTo(this.h1.x, this.h1.y);
                ctx.lineTo(this.h2.x, this.h2.y);
                ctx.strokeStyle = `hsla(290, 100%, 50%, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    const hyphae = Array.from({ length: 80 }, () => new Hypha());
    const connections = [];

    function animate() {
        ctx.fillStyle = 'rgba(5, 10, 5, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        hyphae.forEach((hypha) => {
            hypha.update();
            hypha.draw();
        });

        if (Math.random() < 0.1) {
            connections.length = 0;
            for (let i = 0; i < hyphae.length; i += 1) {
                for (let j = i + 1; j < hyphae.length; j += 1) {
                    connections.push(new Connection(hyphae[i], hyphae[j]));
                }
            }
        }

        connections.forEach((connection) => connection.draw());
        requestAnimationFrame(animate);
    }

    animate();
}

// -----------------------------------------------------------------------------
// Inicialización de eventos base
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderStories();
    renderTOC();
    renderGlossary();
    initHyphaeAnimation();
    initNavigation();
    initReadingProgress();
    initHashSynchronization();
    updateStoryCount();

    // Se inicializa búsqueda robusta de glosario con normalización.
    const glossarySearch = document.getElementById('glossarySearch');
    glossarySearch.addEventListener('input', (event) => {
        filterGlossary(event.target.value || '');
    });

    // Click contextual en términos resaltados dentro del cuerpo del cuento.
    document.getElementById('modalBody').addEventListener('click', (event) => {
        const button = event.target.closest('.inline-term');
        if (!button) {
            return;
        }

        const term = button.dataset.term;
        if (!term) {
            return;
        }

        openGlossaryModal(term);
    });

    // Click en términos relacionados del glosario (si el contenido los incluyera).
    document.getElementById('glossaryContent').addEventListener('click', (event) => {
        const button = event.target.closest('.glossary-link-term');
        if (!button) {
            return;
        }
        openGlossaryModal(button.dataset.term || '');
    });

    document.getElementById('glossaryModalClose').addEventListener('click', () => {
        closeGlossaryModal();
    });

    document.getElementById('glossaryTermModal').addEventListener('click', (event) => {
        if (event.target.id === 'glossaryTermModal') {
            closeGlossaryModal();
        }
    });

    // Cierre de modal por botón.
    document.getElementById('modalClose').addEventListener('click', () => {
        closeStoryModal();
    });

    // Atajos de teclado preservados: ESC y navegación lateral.
    document.addEventListener('keydown', (event) => {
        const glossaryModalActive = document.getElementById('glossaryTermModal').classList.contains('active');
        const modalActive = document.getElementById('storyModal').classList.contains('active');
        if (!modalActive && !glossaryModalActive) {
            return;
        }

        if (event.key === 'Escape') {
            if (glossaryModalActive) {
                closeGlossaryModal();
                return;
            }
            closeStoryModal();
            return;
        }

        if (glossaryModalActive) {
            return;
        } else if (event.key === 'ArrowLeft') {
            navigateStory(-1);
        } else if (event.key === 'ArrowRight') {
            navigateStory(1);
        }
    });

    // Toggle de tema: se conserva botón, se cambia a feedback no bloqueante.
    document.getElementById('themeToggle').addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'dark' : 'dark';
        showToast('El nido funciona mejor en la oscuridad...', 'warning');
    });

    if (stories.length === 0) {
        showToast('No se cargaron cuentos desde stories-data.js.', 'error');
    }

    if (glossaryItems.length === 0) {
        showToast('No se cargó el glosario desde glossary-data.js.', 'warning');
    }

    openInitialStoryContext();
});
