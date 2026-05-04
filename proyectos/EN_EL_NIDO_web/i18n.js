/*
 * EN EL NIDO — Sistema de internacionalización (i18n)
 * -----------------------------------------------------------------------------
 * Gestiona las traducciones de la interfaz y el estado del idioma activo.
 * Soporta español (es) e inglés (en).
 */

const EN_EL_NIDO_I18N = {
    // -------------------------------------------------------------------------
    // Estado y persistencia
    // -------------------------------------------------------------------------
    STORAGE_KEY: 'en_el_nido_lang',
    _currentLang: null,

    getSupportedLangs() {
        return ['es', 'en'];
    },

    getCurrentLang() {
        if (this._currentLang) {
            return this._currentLang;
        }
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored && this.getSupportedLangs().includes(stored)) {
                this._currentLang = stored;
                return stored;
            }
        } catch (_e) {
            // localStorage unavailable
        }
        this._currentLang = 'es';
        return 'es';
    },

    setLang(lang) {
        if (!this.getSupportedLangs().includes(lang)) {
            return;
        }
        this._currentLang = lang;
        try {
            localStorage.setItem(this.STORAGE_KEY, lang);
        } catch (_e) {
            // localStorage unavailable
        }
    },

    toggleLang() {
        const current = this.getCurrentLang();
        const next = current === 'es' ? 'en' : 'es';
        this.setLang(next);
        return next;
    },

    // -------------------------------------------------------------------------
    // Traducción
    // -------------------------------------------------------------------------
    t(key) {
        const lang = this.getCurrentLang();
        const dict = this.strings[lang];
        if (dict && dict[key] !== undefined) {
            return dict[key];
        }
        // Fallback a español
        const fallback = this.strings['es'];
        if (fallback && fallback[key] !== undefined) {
            return fallback[key];
        }
        return key;
    },

    // -------------------------------------------------------------------------
    // Diccionario de cadenas de UI
    // -------------------------------------------------------------------------
    strings: {
        es: {
            // Header
            pageTitle: 'EN EL NIDO - Juan Tomoo',
            headerSubtitle: 'Cuentos de Ciencia Ficción Cyberpunk-Solarpunk',
            headerAuthor: 'Por Juan Tomoo',

            // Nav tabs
            navStories: 'Cuentos',
            navToc: 'Índice',
            navGlossary: 'Glosario',
            navAbout: 'Acerca de',

            // Stats
            statStories: 'Cuentos',
            statYear: 'Año',
            statConnections: 'Conexiones',

            // TOC
            tocTitle: 'Índice de Cuentos',

            // Glossary
            glossarySearchPlaceholder: 'Buscar en el glosario...',
            glossaryContextualKicker: 'Glosario contextual',
            glossaryRelated: 'Relacionados',
            glossaryAliases: 'Alias',

            // About
            aboutTitle: 'Acerca de la Obra',
            aboutP1: '<em>En el Nido</em> es una colección de cuentos de ciencia ficción que exploran los límites entre la realidad y la ficción, entre lo orgánico y lo digital, en un mundo donde un sistema neofascista intenta normalizar a todos los seres.',
            aboutP2: 'El protagonista, un ser híbrido orgánico-digital que experimenta fallas neurológicas, vive aislado en un apartamento urbano pero conectado a las redes. A través de estas conexiones, descubre una falla en el sistema: un simbionte de hongo, máquina y otras formas de vida que se filtra en la red y lucha por preservar la diversidad de la vida.',
            aboutP3: 'Esta falla representa la revolución silenciosa de cada ser en su nido —sus hogares, intimidades, soledades y mentes— una resistencia desde el amor y la interconexión que desafía la homogeneización del sistema.',
            aboutP4: 'Los cuentos funcionan como un diario que cruza los límites de la realidad del protagonista con el sistema que intenta controlarlo todo, creando una narrativa inmersiva donde lo personal se entrelaza con lo cósmico.',

            // Footer
            creditsTitle: 'Créditos',
            creditsBy: 'Una experiencia digital de',
            copyright: '© 2025 Juan Tomoo. Todos los derechos reservados.',
            creditsLove: 'Generado con amor desde el micelio',

            // Story modal
            fontSizeLabel: 'Tamaño:',
            btnPrevious: 'Anterior',
            btnNext: 'Siguiente',
            btnPrint: 'Imprimir',
            btnCopy: 'Copiar',
            btnShare: 'Compartir',
            closeGlossaryAria: 'Cerrar glosario contextual',

            // Toasts
            toastFontSize: 'Tamaño de lectura:',
            toastCopied: 'Cuento copiado al portapapeles.',
            toastCopyFail: 'No fue posible copiar el cuento.',
            toastCopyFirst: 'Abre un cuento antes de copiar.',
            toastShareFirst: 'Abre un cuento antes de compartir.',
            toastShared: 'Compartido correctamente.',
            toastStoryNotFound: 'No se encontró el cuento solicitado.',
            toastTermNotFound: 'No se encontró ese término en el glosario.',
            toastTheme: 'El nido funciona mejor en la oscuridad...',
            toastNoStories: 'No se cargaron cuentos desde stories-data.js.',
            toastNoGlossary: 'No se cargó el glosario desde glossary-data.js.',

            // Inline term tooltip
            inlineTermTooltip: 'Abrir glosario contextual',

            // Theme toggle
            themeToggleTitle: 'Cambiar tema',

            // Language toggle
            langToggleTitle: 'Switch to English',
            langLabel: 'ES',

            // Glossary category meta
            catPersonajes: 'Personajes y Entidades',
            catConceptosTecnologicos: 'Conceptos Tecnológicos y Científicos',
            catConceptosBiologicos: 'Conceptos Biológicos',
            catConceptosQuimicos: 'Conceptos Químicos y Atmosféricos',
            catConceptosFilosoficos: 'Conceptos Filosóficos y Sociológicos',
            catConceptosEconomicos: 'Conceptos Económicos y Políticos',
            catConceptosFisicos: 'Conceptos Físicos y Cosmológicos',
            catConceptosNeurologicos: 'Conceptos Neurológicos',
            catElementosLiterarios: 'Elementos Literarios y Estéticos'
        },

        en: {
            // Header
            pageTitle: 'IN THE NEST - Juan Tomoo',
            headerSubtitle: 'Cyberpunk-Solarpunk Science Fiction Stories',
            headerAuthor: 'By Juan Tomoo',

            // Nav tabs
            navStories: 'Stories',
            navToc: 'Index',
            navGlossary: 'Glossary',
            navAbout: 'About',

            // Stats
            statStories: 'Stories',
            statYear: 'Year',
            statConnections: 'Connections',

            // TOC
            tocTitle: 'Story Index',

            // Glossary
            glossarySearchPlaceholder: 'Search the glossary...',
            glossaryContextualKicker: 'Contextual glossary',
            glossaryRelated: 'Related',
            glossaryAliases: 'Aliases',

            // About
            aboutTitle: 'About the Work',
            aboutP1: '<em>In the Nest</em> is a collection of science fiction stories that explore the boundaries between reality and fiction, between the organic and the digital, in a world where a neo-fascist system tries to normalize every being.',
            aboutP2: 'The protagonist, an organic-digital hybrid being who experiences neurological glitches, lives isolated in an urban apartment yet connected to the networks. Through these connections, they discover a glitch in the system: a symbiont of fungus, machine, and other life forms that seeps into the network and fights to preserve the diversity of life.',
            aboutP3: 'This glitch represents the silent revolution of every being in their nest — their homes, intimacies, solitudes, and minds — a resistance born from love and interconnection that defies the system\'s homogenization.',
            aboutP4: 'The stories function as a diary that crosses the boundaries of the protagonist\'s reality with the system that attempts to control everything, creating an immersive narrative where the personal intertwines with the cosmic.',

            // Footer
            creditsTitle: 'Credits',
            creditsBy: 'A digital experience by',
            copyright: '© 2025 Juan Tomoo. All rights reserved.',
            creditsLove: 'Generated with love from the mycelium',

            // Story modal
            fontSizeLabel: 'Size:',
            btnPrevious: 'Previous',
            btnNext: 'Next',
            btnPrint: 'Print',
            btnCopy: 'Copy',
            btnShare: 'Share',
            closeGlossaryAria: 'Close contextual glossary',

            // Toasts
            toastFontSize: 'Reading size:',
            toastCopied: 'Story copied to clipboard.',
            toastCopyFail: 'Unable to copy the story.',
            toastCopyFirst: 'Open a story before copying.',
            toastShareFirst: 'Open a story before sharing.',
            toastShared: 'Shared successfully.',
            toastStoryNotFound: 'The requested story was not found.',
            toastTermNotFound: 'That term was not found in the glossary.',
            toastTheme: 'The nest works best in the dark...',
            toastNoStories: 'No stories loaded from stories-data.js.',
            toastNoGlossary: 'No glossary loaded from glossary-data.js.',

            // Inline term tooltip
            inlineTermTooltip: 'Open contextual glossary',

            // Theme toggle
            themeToggleTitle: 'Toggle theme',

            // Language toggle
            langToggleTitle: 'Cambiar a Español',
            langLabel: 'EN',

            // Glossary category meta
            catPersonajes: 'Characters & Entities',
            catConceptosTecnologicos: 'Technological & Scientific Concepts',
            catConceptosBiologicos: 'Biological Concepts',
            catConceptosQuimicos: 'Chemical & Atmospheric Concepts',
            catConceptosFilosoficos: 'Philosophical & Sociological Concepts',
            catConceptosEconomicos: 'Economic & Political Concepts',
            catConceptosFisicos: 'Physical & Cosmological Concepts',
            catConceptosNeurologicos: 'Neurological Concepts',
            catElementosLiterarios: 'Literary & Aesthetic Elements'
        }
    }
};
