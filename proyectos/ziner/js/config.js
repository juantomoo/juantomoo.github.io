// config.js - Configuración de la Aplicación

// Namespace global para evitar conflictos
window.ZineR = window.ZineR || {};

// Configuración de la aplicación
window.ZineR.CONFIG = {
    // Tamaños de papel en mm
    TAMAÑOS_PAPEL: {
        a4: {
            ancho: 210,
            alto: 297,
            etiqueta: 'A4 (210 × 297 mm)'
        },
        carta: {
            ancho: 215.9,
            alto: 279.4,
            etiqueta: 'Carta (8.5 × 11 in)'
        },
        oficio: {
            ancho: 215.9,
            alto: 355.6,
            etiqueta: 'Oficio (8.5 × 14 in)'
        }
    },

    // Márgenes (en mm) - márgenes de seguridad para impresoras domésticas
    MARGENES: {
        predeterminado: 5,
        profesional: 3,
        sangrado: 3
    },

    // Resolución para exportación PDF
    DPI: 300,

    // Fuentes disponibles (usando Google Fonts)
    FUENTES: {
        'serif': "'Merriweather', 'Georgia', serif",
        'sans': "'Inter', 'Arial', sans-serif",
        'mono': "'Courier Prime', 'Courier New', monospace",
        'hand': "'Caveat', 'Comic Sans MS', cursive",
        'ruda': "'Ruda', 'Arial', sans-serif",
        'exo': "'Exo', 'Arial', sans-serif",
        'audiowide': "'Audiowide', 'Impact', sans-serif"
    },

    // Opciones de ajuste de imagen
    AJUSTES_IMAGEN: {
        cover: 'Cubrir (Recortar)',
        contain: 'Contener (Ajustar)',
        fill: 'Rellenar (Estirar)'
    },

    // Filtros de imagen
    FILTROS_IMAGEN: {
        none: 'Normal',
        grayscale: 'Escala de Grises',
        sepia: 'Sepia',
        contrast: 'Alto Contraste',
        brightness: 'Brillo Alto',
        invert: 'Invertir'
    },

    // Estilos de texto predeterminados (Valores iniciales)
    ESTILOS_TEXTO: {
        titulo: {
            familiaFuente: 'serif',
            tamaño: 24,
            peso: 'bold'
        },
        subtitulo: {
            familiaFuente: 'serif',
            tamaño: 18,
            peso: 'normal'
        },
        cuerpo: {
            familiaFuente: 'serif',
            tamaño: 11,
            peso: 'normal'
        },
        firma: {
            familiaFuente: 'serif',
            tamaño: 10,
            peso: 'italic'
        }
    },

    // Claves de almacenamiento
    CLAVES_ALMACENAMIENTO: {
        borrador: 'ziner_borrador_actual',
        proyectos: 'ziner_proyectos_guardados',
        configuracion: 'ziner_configuracion_usuario'
    }
};
