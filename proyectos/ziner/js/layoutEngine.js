// layoutEngine.js - Generación de maquetación y renderizado

window.ZineR = window.ZineR || {};

/**
 * Motor de Maquetación
 * Genera el diseño de imposición y lo renderiza en el lienzo de vista previa
 * @param {Object} gestorImagenes - Gestor de imágenes
 * @param {Object} opciones - Opciones de configuración (fuentes, etc.)
 */
window.ZineR.MotorMaquetacion = function (gestorImagenes, opciones) {
    this.gestorImagenes = gestorImagenes;
    this.opciones = opciones || {};
};

/**
 * Generar maquetación completa desde páginas y esquema
 */
window.ZineR.MotorMaquetacion.prototype.generarMaquetacion = function (paginas, idEsquema, tamañoPapel) {
    const esquema = window.ZineR.obtenerEsquema(idEsquema);
    const dimsCara = window.ZineR.calcularDimensionesCara(tamañoPapel, esquema);

    const maquetacion = {
        esquema,
        tamañoPapel,
        dimsCara,
        caras: []
    };

    // Crear objetos de cara para cada página
    for (let numPag = 1; numPag <= esquema.caras; numPag++) {
        const posicion = window.ZineR.obtenerPosicionPagina(esquema, numPag);
        const paginaData = paginas[numPag - 1];
        const bloquesPagina = Array.isArray(paginaData) ? paginaData : (paginaData ? paginaData.bloques : []);
        const imagen = this.gestorImagenes.obtenerImagen(numPag);

        maquetacion.caras.push({
            numeroPagina: numPag,
            posicion,
            bloques: bloquesPagina,
            imagen,
            ancho: dimsCara.ancho,
            alto: dimsCara.alto,
            esPortada: paginaData && paginaData.esPortada,
            mostrarNumero: paginaData && paginaData.mostrarNumero
        });
    }

    return maquetacion;
};

/**
 * Renderizar maquetación al lienzo de vista previa (DOM)
 */
window.ZineR.MotorMaquetacion.prototype.renderizarEnLienzo = function (maquetacion, elementoLienzo) {
    elementoLienzo.innerHTML = '';

    // Usar opciones del constructor si existen, sino obtener del global como fallback
    if (!this.opciones || Object.keys(this.opciones).length === 0) {
        this.opciones = window.aplicacionZineR ? window.aplicacionZineR.estado.opciones : {};
    }

    const { esquema, tamañoPapel } = maquetacion;

    // Configurar diseño de cuadrícula del lienzo
    elementoLienzo.style.gridTemplateRows = `repeat(${esquema.diseño.filas}, 1fr)`;
    elementoLienzo.style.gridTemplateColumns = `repeat(${esquema.diseño.columnas}, 1fr)`;
    elementoLienzo.style.gap = '2px';

    // Ajustar relación de aspecto basado en orientación del papel
    const esHorizontal = esquema.diseño.columnas > esquema.diseño.filas;
    if (esHorizontal) {
        elementoLienzo.style.aspectRatio = `${tamañoPapel.alto / tamañoPapel.ancho}`;
    } else {
        elementoLienzo.style.aspectRatio = `${tamañoPapel.ancho / tamañoPapel.alto}`;
    }

    // Crear elementos de cara
    maquetacion.caras.forEach(cara => {
        const elemCara = this.crearElementoCara(cara);
        elementoLienzo.appendChild(elemCara);
    });
};

/**
 * Crear elemento DOM para una sola cara
 */
window.ZineR.MotorMaquetacion.prototype.crearElementoCara = function (cara) {
    const div = document.createElement('div');
    div.className = 'cara';
    div.dataset.numeroPagina = cara.numeroPagina;

    // Aplicar posición en cuadrícula
    div.style.gridRow = cara.posicion.fila + 1;
    div.style.gridColumn = cara.posicion.columna + 1;

    // Aplicar rotación
    if (cara.posicion.rotacion) {
        div.style.transform = `rotate(${cara.posicion.rotacion}deg)`;
    }

    // Estilo base
    div.style.border = '1px solid #ddd';
    div.style.backgroundColor = '#fff';
    div.style.position = 'relative';
    div.style.overflow = 'hidden';
    div.style.padding = '0'; // Padding 0 para que la imagen llene todo
    div.style.fontSize = '6px';
    div.style.color = '#000';

    // Capa de Imagen de fondo (usando background-image para compatibilidad con html2canvas)
    if (cara.imagen) {
        const contenedorImagen = document.createElement('div');
        contenedorImagen.className = 'capa-imagen-fondo';
        contenedorImagen.style.position = 'absolute';
        contenedorImagen.style.top = '0';
        contenedorImagen.style.left = '0';
        contenedorImagen.style.width = '100%';
        contenedorImagen.style.height = '100%';
        contenedorImagen.style.zIndex = '0';

        // Usar background-image (mejor soporte en html2canvas)
        contenedorImagen.style.backgroundImage = `url(${cara.imagen.dataUrl})`;
        contenedorImagen.style.backgroundPosition = 'center';
        contenedorImagen.style.backgroundRepeat = 'no-repeat';
        contenedorImagen.style.opacity = cara.imagen.opacidad !== undefined ? cara.imagen.opacidad : 1;

        // Mapear valores de ajuste a background-size
        const ajuste = cara.imagen.ajuste || 'cover';
        if (ajuste === 'cover') {
            contenedorImagen.style.backgroundSize = 'cover';
        } else if (ajuste === 'contain') {
            contenedorImagen.style.backgroundSize = 'contain';
        } else if (ajuste === 'fill') {
            contenedorImagen.style.backgroundSize = '100% 100%';
        }

        // Aplicar filtros CSS (funcionará en preview; para PDF se pre-procesan)
        if (cara.imagen.filtro && cara.imagen.filtro !== 'none') {
            const mapaFiltros = {
                'grayscale': 'grayscale(100%)',
                'sepia': 'sepia(100%)',
                'contrast': 'contrast(150%)',
                'brightness': 'brightness(150%)',
                'invert': 'invert(100%)'
            };
            contenedorImagen.style.filter = mapaFiltros[cara.imagen.filtro];
        }

        div.appendChild(contenedorImagen);
    }

    // Agregar indicador de número de página (solo si mostrarNumero es true)
    if (cara.mostrarNumero) {
        const elemNumPag = document.createElement('div');
        elemNumPag.className = 'indicador-numero-pagina';
        elemNumPag.textContent = cara.numeroPagina;
        elemNumPag.style.position = 'absolute';
        elemNumPag.style.top = '2px';
        elemNumPag.style.right = '2px';
        elemNumPag.style.fontSize = '10px';
        elemNumPag.style.fontWeight = 'bold';
        elemNumPag.style.color = '#6366f1';
        elemNumPag.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        elemNumPag.style.padding = '2px 4px';
        elemNumPag.style.borderRadius = '2px';
        div.appendChild(elemNumPag);
    }

    // Agregar bloques de contenido
    const contenedorContenido = document.createElement('div');
    contenedorContenido.className = 'contenido-cara';
    contenedorContenido.style.position = 'relative'; // Para z-index
    contenedorContenido.style.zIndex = '1'; // Sobre la imagen
    contenedorContenido.style.height = '100%';
    contenedorContenido.style.width = '100%';
    contenedorContenido.style.boxSizing = 'border-box';
    contenedorContenido.style.display = 'flex';
    contenedorContenido.style.flexDirection = 'column';
    // Centrar verticalmente el contenido en TODAS las páginas
    contenedorContenido.style.justifyContent = 'center';
    contenedorContenido.style.textAlign = cara.esPortada ? 'center' : 'left';
    // Padding proporcional: 5% del contenedor para dar "aire" sin desperdiciar espacio
    contenedorContenido.style.padding = '5%';
    contenedorContenido.style.overflow = 'hidden'; // Evitar desbordamiento visual

    cara.bloques.forEach(bloque => {
        const elemBloque = document.createElement('div');
        elemBloque.className = `bloque bloque-${bloque.tipo}`;
        elemBloque.innerHTML = bloque.contenido;

        // Obtener tamaño de fuente desde opciones o config
        // Mapear tipo de bloque a clave de tamañosFuente (contenido -> cuerpo)
        const tipoParaTamaño = bloque.tipo === 'contenido' ? 'cuerpo' : bloque.tipo;
        let tamañoFuente;
        if (this.opciones && this.opciones.tamañosFuente && this.opciones.tamañosFuente[tipoParaTamaño]) {
            tamañoFuente = this.opciones.tamañosFuente[tipoParaTamaño];
        } else {
            const estiloBase = window.ZineR.CONFIG.ESTILOS_TEXTO[bloque.tipo] || window.ZineR.CONFIG.ESTILOS_TEXTO.cuerpo;
            tamañoFuente = estiloBase.tamaño;
        }

        // Aplicar estilos base según tipo
        const estiloBase = window.ZineR.CONFIG.ESTILOS_TEXTO[bloque.tipo] || window.ZineR.CONFIG.ESTILOS_TEXTO.cuerpo;

        elemBloque.style.fontSize = `${tamañoFuente}px`;
        elemBloque.style.fontWeight = estiloBase.peso;
        elemBloque.style.marginBottom = '0.8em';
        elemBloque.style.lineHeight = '1.5';
        elemBloque.style.position = 'relative';
        elemBloque.style.zIndex = '2';

        // Aplicar fuentes a elementos HTML específicos dentro del bloque
        if (this.opciones && this.opciones.fuentes) {
            // Para bloques de portada, aplicar fuentes a h1 (título) y h2 (subtítulo)
            if (bloque.tipo === 'portada') {
                const h1 = elemBloque.querySelector('h1');
                if (h1) {
                    if (this.opciones.fuentes.titulo) {
                        const fuenteTitulo = window.ZineR.CONFIG.FUENTES[this.opciones.fuentes.titulo];
                        h1.style.fontFamily = fuenteTitulo.replace(/'/g, '"');
                    }
                    // Aplicar tamaño de título al h1
                    if (this.opciones.tamañosFuente && this.opciones.tamañosFuente.titulo) {
                        h1.style.fontSize = `${this.opciones.tamañosFuente.titulo}px`;
                    }
                }

                const h2 = elemBloque.querySelector('h2');
                if (h2) {
                    if (this.opciones.fuentes.subtitulo) {
                        const fuenteSubtitulo = window.ZineR.CONFIG.FUENTES[this.opciones.fuentes.subtitulo];
                        h2.style.fontFamily = fuenteSubtitulo.replace(/'/g, '"');
                    }
                    // Aplicar tamaño de subtítulo al h2
                    if (this.opciones.tamañosFuente && this.opciones.tamañosFuente.subtitulo) {
                        h2.style.fontSize = `${this.opciones.tamañosFuente.subtitulo}px`;
                    }
                }
            }

            // Para bloques de contenido, aplicar fuente de cuerpo
            if (bloque.tipo === 'contenido' && this.opciones.fuentes.cuerpo) {
                const fuenteCuerpo = window.ZineR.CONFIG.FUENTES[this.opciones.fuentes.cuerpo];
                elemBloque.style.fontFamily = fuenteCuerpo.replace(/'/g, '"');
            }

            // Para bloques de firma, aplicar fuente de firma
            if (bloque.tipo === 'firma' && this.opciones.fuentes.firma) {
                const fuenteFirma = window.ZineR.CONFIG.FUENTES[this.opciones.fuentes.firma];
                elemBloque.style.fontFamily = fuenteFirma.replace(/'/g, '"');
            }
        }

        // Estilos específicos adicionales
        if (bloque.tipo === 'titulo' || bloque.tipo === 'portada') {
            elemBloque.style.textAlign = 'center';
            elemBloque.style.marginTop = '0';
            elemBloque.style.marginBottom = '0.5em';
        } else if (bloque.tipo === 'subtitulo') {
            // El tamaño ya viene definido desde opciones.tamañosFuente.subtitulo
            elemBloque.style.marginBottom = '1em';
            elemBloque.style.textAlign = 'center';
        } else if (bloque.tipo === 'firma') {
            // El tamaño ya viene definido desde opciones.tamañosFuente.firma
            elemBloque.style.fontStyle = 'italic';
            elemBloque.style.marginTop = '1em';
            elemBloque.style.textAlign = 'right';
        }

        contenedorContenido.appendChild(elemBloque);
    });

    div.appendChild(contenedorContenido);

    return div;
};

/**
 * Obtener datos de maquetación para exportación PDF
 */
window.ZineR.MotorMaquetacion.prototype.obtenerDatosMaquetacion = function (maquetacion) {
    return {
        esquema: maquetacion.esquema,
        tamañoPapel: maquetacion.tamañoPapel,
        caras: maquetacion.caras.map(cara => ({
            numeroPagina: cara.numeroPagina,
            posicion: cara.posicion,
            bloques: cara.bloques,
            imagen: cara.imagen,
            dimensiones: {
                ancho: cara.ancho,
                alto: cara.alto
            }
        }))
    };
};
