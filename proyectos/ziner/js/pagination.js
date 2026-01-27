// pagination.js - Paginación dinámica de texto y flujo de contenido
// Este módulo se encarga de distribuir el contenido en las páginas disponibles,
// midiendo la altura real de los elementos para asegurar que caben.

window.ZineR = window.ZineR || {};

/**
 * Motor de Paginación
 * Divide el contenido en fragmentos del tamaño de página que caben en cada cara.
 */
window.ZineR.Paginacion = function () {
    this.lienzoMedicion = this.crearLienzoMedicion();
};

/**
 * Crear un lienzo fuera de pantalla para medición de texto.
 * Es crucial que este lienzo tenga los mismos estilos que el renderizado final.
 */
window.ZineR.Paginacion.prototype.crearLienzoMedicion = function () {
    const div = document.createElement('div');
    div.id = 'ziner-medicion';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.top = '-9999px';
    div.style.left = '-9999px';
    div.style.backgroundColor = 'white';
    // Importante: Resetear estilos para evitar herencias no deseadas
    div.style.margin = '0';
    div.style.padding = '0';
    div.style.boxSizing = 'border-box';
    div.style.pointerEvents = 'none';

    // IMPORTANTE: Agregar siempre a document.body, NO a preview-canvas
    // porque renderizarEnLienzo() limpia preview-canvas con innerHTML = ''
    // lo cual destruiría este elemento de medición después del primer render
    document.body.appendChild(div);

    return div;
};

/**
 * Dividir bloques de contenido en páginas basándose en el esquema y tamaño de papel.
 * Implementa un algoritmo de "llenado de contenedores" (bin packing) secuencial.
 * Async para esperar carga de fuentes antes de medir.
 */
window.ZineR.Paginacion.prototype.dividirEnPaginas = async function (bloquesContenido, esquema, tamañoPapel) {
    // Esperar a que las fuentes estén cargadas para mediciones precisas
    await document.fonts.ready;
    
    const paginas = [];

    // 1. Calcular dimensiones de cada cara en milímetros (físicas)
    const anchoCaraMm = tamañoPapel.ancho / esquema.diseño.columnas;
    const altoCaraMm = tamañoPapel.alto / esquema.diseño.filas;
    
    // Aspect ratio real de cada cara (basado en dimensiones físicas)
    const aspectRatioCara = anchoCaraMm / altoCaraMm;
    
    // 2. Definir un ancho de referencia fijo para medición en pantalla
    // Usamos un ancho fijo que simule el espacio disponible de forma consistente
    const ANCHO_REFERENCIA_PX = 200; // Ancho de referencia constante para medición
    
    // Calcular alto proporcional basado en el aspect ratio real de la cara
    const altoReferenciaPx = ANCHO_REFERENCIA_PX / aspectRatioCara;
    
    // Padding proporcional (5% del espacio - mismo que layoutEngine)
    const PADDING_HORIZONTAL = ANCHO_REFERENCIA_PX * 0.05;
    const PADDING_VERTICAL = altoReferenciaPx * 0.05;
    
    const anchoUtil = ANCHO_REFERENCIA_PX - (PADDING_HORIZONTAL * 2);
    const altoUtil = altoReferenciaPx - (PADDING_VERTICAL * 2);
    
    console.log(`[Paginacion] Esquema: ${esquema.id}`);
    console.log(`[Paginacion] Cara física: ${anchoCaraMm.toFixed(1)}x${altoCaraMm.toFixed(1)}mm (ratio: ${aspectRatioCara.toFixed(3)})`);
    console.log(`[Paginacion] Referencia: ${ANCHO_REFERENCIA_PX}x${altoReferenciaPx.toFixed(1)}px`);
    console.log(`[Paginacion] Área útil: ${anchoUtil.toFixed(1)}x${altoUtil.toFixed(1)}px`);

    // Configurar lienzo de medición con el ancho de referencia
    this.lienzoMedicion.style.width = `${anchoUtil}px`;

    let paginaActual = [];
    let alturaActual = 0;

    // 2. Iterar sobre bloques y distribuirlos
    bloquesContenido.forEach(bloque => {
        // Caso especial: Salto de página manual (----)
        if (bloque.tipo === 'salto') {
            // Cerrar página actual y empezar nueva
            if (paginaActual.length > 0) {
                paginas.push(paginaActual);
            } else {
                // Si no hay contenido, agregar página vacía
                paginas.push([]);
            }
            paginaActual = [];
            alturaActual = 0;
            return; // Continuar con siguiente bloque
        }

        // Configurar estilos en el lienzo de medición según el tipo de bloque
        const estilo = this.obtenerEstiloBloque(bloque);
        this.aplicarEstiloMedicion(estilo);

        // Medir bloque
        this.lienzoMedicion.innerHTML = bloque.contenido;
        const alturaBloque = this.lienzoMedicion.offsetHeight + estilo.marginBottom; // Incluir margen

        // Caso especial: Portada
        if (bloque.tipo === 'portada') {
            // Si ya hay contenido en la página actual, cerrar esa página
            if (paginaActual.length > 0) {
                paginas.push(paginaActual);
                paginaActual = [];
                alturaActual = 0;
            }
            // La portada va sola en su página (generalmente)
            paginaActual.push(bloque);
            paginas.push(paginaActual);
            paginaActual = [];
            alturaActual = 0;
            return;
        }

        // Verificar si cabe en la página actual
        // Tolerancia de 5px
        if (alturaActual + alturaBloque <= altoUtil + 5) {
            paginaActual.push(bloque);
            alturaActual += alturaBloque;
        } else {
            // No cabe, pasar a siguiente página
            if (paginaActual.length > 0) {
                paginas.push(paginaActual);
            }

            // Iniciar nueva página con este bloque
            paginaActual = [bloque];
            alturaActual = alturaBloque;
        }
    });

    // Agregar la última página si tiene contenido
    if (paginaActual.length > 0) {
        paginas.push(paginaActual);
    }

    // 3. Rellenar páginas vacías si sobran caras en el esquema
    while (paginas.length < esquema.caras) {
        paginas.push([]);
    }

    // 4. Advertencia de desbordamiento
    if (paginas.length > esquema.caras) {
        console.warn(`El contenido excede la capacidad del fanzine (${paginas.length} páginas generadas para ${esquema.caras} caras).`);
        if (window.aplicacionZineR) {
            window.aplicacionZineR.mostrarToast(`Texto excede capacidad. Se muestran ${esquema.caras} de ${paginas.length} páginas.`, 'warning');
        }
    }

    return paginas.slice(0, esquema.caras);
};

/**
 * Obtener configuración de estilo para medición
 */
window.ZineR.Paginacion.prototype.obtenerEstiloBloque = function (bloque) {
    const configEstilos = window.ZineR.CONFIG.ESTILOS_TEXTO;
    const estiloBase = configEstilos[bloque.tipo] || configEstilos.cuerpo;

    // Mapear tipo de bloque a clave de tamañosFuente (contenido -> cuerpo)
    const tipoParaTamaño = bloque.tipo === 'contenido' ? 'cuerpo' : bloque.tipo;

    // Obtener opciones de usuario si existen
    let familiaFuente = window.ZineR.CONFIG.FUENTES[estiloBase.familiaFuente];
    let tamañoFuente = estiloBase.tamaño;

    if (window.aplicacionZineR && window.aplicacionZineR.estado.opciones) {
        // Obtener familia de fuente personalizada
        if (window.aplicacionZineR.estado.opciones.fuentes) {
            // Mapear contenido -> cuerpo para fuentes también
            const tipoFuenteUsuario = window.aplicacionZineR.estado.opciones.fuentes[tipoParaTamaño];
            if (tipoFuenteUsuario) {
                familiaFuente = window.ZineR.CONFIG.FUENTES[tipoFuenteUsuario];
            }
        }
        
        // Obtener tamaño de fuente personalizado
        if (window.aplicacionZineR.estado.opciones.tamañosFuente) {
            const tamañoUsuario = window.aplicacionZineR.estado.opciones.tamañosFuente[tipoParaTamaño];
            if (tamañoUsuario) {
                tamañoFuente = tamañoUsuario;
            }
        }
    }

    // Para portada, usar tamaño de título
    if (bloque.tipo === 'portada') {
        if (window.aplicacionZineR && window.aplicacionZineR.estado.opciones.tamañosFuente) {
            tamañoFuente = window.aplicacionZineR.estado.opciones.tamañosFuente.titulo;
        }
    }

    return {
        fontFamily: familiaFuente,
        fontSize: `${tamañoFuente}px`,
        fontWeight: estiloBase.peso,
        lineHeight: '1.5', // Unificado con layoutEngine
        marginBottom: tamañoFuente * 0.5 // Margen inferior proporcional
    };
};

/**
 * Aplicar estilos al lienzo de medición
 */
window.ZineR.Paginacion.prototype.aplicarEstiloMedicion = function (estilo) {
    this.lienzoMedicion.style.fontFamily = estilo.fontFamily;
    this.lienzoMedicion.style.fontSize = estilo.fontSize;
    this.lienzoMedicion.style.fontWeight = estilo.fontWeight;
    this.lienzoMedicion.style.lineHeight = estilo.lineHeight;
};

/**
 * Agregar números de página a las páginas
 */
window.ZineR.Paginacion.prototype.agregarNumeroPaginas = function (paginas, mostrarNumeros) {
    return paginas.map((bloquesPagina, indice) => {
        // Primera página es portada - sin número
        const esPortada = indice === 0;

        return {
            bloques: bloquesPagina,
            numeroPagina: indice + 1,
            totalPaginas: paginas.length,
            esPortada: esPortada,
            mostrarNumero: mostrarNumeros && !esPortada // Numerar todas las páginas excepto portada, independientemente del contenido de texto
        };
    });
};

/**
 * Limpiar lienzo de medición
 */
window.ZineR.Paginacion.prototype.destruir = function () {
    if (this.lienzoMedicion && this.lienzoMedicion.parentNode) {
        this.lienzoMedicion.parentNode.removeChild(this.lienzoMedicion);
    }
};
