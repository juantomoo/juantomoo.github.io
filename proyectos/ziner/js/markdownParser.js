// markdownParser.js - Procesamiento de Markdown con análisis semántico

window.ZineR = window.ZineR || {};

/**
 * Analizar contenido markdown y extraer secciones semánticas
 * Detecta: portada (# título), subtítulo (## subtítulo), párrafos de contenido, firma
 */
window.ZineR.AnalizadorMarkdown = function () {
    // Verificar si marked.js está cargado
    if (typeof marked === 'undefined') {
        console.error('La biblioteca marked.js no está cargada');
    }
};

/**
 * Analizar texto markdown en secciones estructuradas
 */
window.ZineR.AnalizadorMarkdown.prototype.analizar = function (textoMarkdown) {
    if (!textoMarkdown || !textoMarkdown.trim()) {
        return {
            portada: null,
            subtitulo: null,
            contenido: [],
            firma: null,
            htmlCrudo: ''
        };
    }

    // Convertir markdown a HTML
    const html = marked.parse(textoMarkdown);

    // Analizar en secciones
    const secciones = this.extraerSecciones(textoMarkdown);

    return {
        ...secciones,
        htmlCrudo: html
    };
};

/**
 * Extraer secciones semánticas del texto markdown
 */
window.ZineR.AnalizadorMarkdown.prototype.extraerSecciones = function (texto) {
    const lineas = texto.split('\n');
    const resultado = {
        portada: null,
        subtitulo: null,
        contenido: [],
        firma: null
    };

    let parrafoActual = [];

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();

        // Saltar líneas vacías
        if (!linea) {
            if (parrafoActual.length > 0) {
                resultado.contenido.push({
                    tipo: 'parrafo',
                    texto: parrafoActual.join(' '),
                    html: marked.parse(parrafoActual.join('\n'))
                });
                parrafoActual = [];
            }
            continue;
        }

        // Detectar salto de página manual: ---- (4 o más guiones)
        if (/^-{4,}$/.test(linea)) {
            // Cerrar párrafo actual si existe
            if (parrafoActual.length > 0) {
                resultado.contenido.push({
                    tipo: 'parrafo',
                    texto: parrafoActual.join(' '),
                    html: marked.parse(parrafoActual.join('\n'))
                });
                parrafoActual = [];
            }
            // Agregar marcador de salto de página
            resultado.contenido.push({
                tipo: 'salto',
                texto: '',
                html: ''
            });
            continue;
        }

        // Título de portada (# Título)
        if (linea.startsWith('# ') && !resultado.portada) {
            resultado.portada = {
                texto: linea.substring(2).trim(),
                html: marked.parse(linea)
            };
            continue;
        }

        // Subtítulo (## Subtítulo)
        if (linea.startsWith('## ') && !resultado.subtitulo) {
            resultado.subtitulo = {
                texto: linea.substring(3).trim(),
                html: marked.parse(linea)
            };
            continue;
        }

        // Detección de firma (cursiva envolviendo toda la línea)
        if (this.esFirma(linea)) {
            resultado.firma = {
                texto: linea.replace(/^_|_$/g, '').replace(/^\*|\*$/g, '').trim(),
                html: marked.parse(linea)
            };
            continue;
        }

        // Contenido regular
        parrafoActual.push(linea);
    }

    // Agregar párrafo restante
    if (parrafoActual.length > 0) {
        resultado.contenido.push({
            tipo: 'parrafo',
            texto: parrafoActual.join(' '),
            html: marked.parse(parrafoActual.join('\n'))
        });
    }

    return resultado;
};

/**
 * Verificar si una línea es una firma (línea en cursiva, generalmente al final)
 */
window.ZineR.AnalizadorMarkdown.prototype.esFirma = function (linea) {
    // Verificar _texto_ o *texto* que envuelve toda la línea
    const patronCursiva = /^[_*](.+)[_*]$/;
    return patronCursiva.test(linea);
};

/**
 * Convertir secciones analizadas en un array plano de bloques de contenido  para páginas
 */
window.ZineR.AnalizadorMarkdown.prototype.aBloquesContenido = function (secciones) {
    const bloques = [];

    // Página de portada (página 1) - Combinar título y subtítulo si existen
    if (secciones.portada) {
        let contenidoPortada = secciones.portada.html;
        let textoPortada = secciones.portada.texto;

        // Si hay subtítulo, agregarlo inmediatamente después del título en la misma portada
        if (secciones.subtitulo) {
            contenidoPortada += secciones.subtitulo.html;
            textoPortada += ' ' + secciones.subtitulo.texto;
        }

        bloques.push({
            tipo: 'portada',
            contenido: contenidoPortada,
            texto: textoPortada
        });
    }

    // Párrafos de contenido (incluyendo saltos de página)
    secciones.contenido.forEach(parrafo => {
        if (parrafo.tipo === 'salto') {
            bloques.push({
                tipo: 'salto',
                contenido: '',
                texto: ''
            });
        } else {
            bloques.push({
                tipo: 'contenido',
                contenido: parrafo.html,
                texto: parrafo.texto
            });
        }
    });

    // Firma (generalmente en última página)
    if (secciones.firma) {
        bloques.push({
            tipo: 'firma',
            contenido: secciones.firma.html,
            texto: secciones.firma.texto
        });
    }

    return bloques;
};
