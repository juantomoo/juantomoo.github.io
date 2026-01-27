// pdfGenerator.js - Exportación PDF WYSIWYG usando html2canvas
// Estrategia: Renderizar la hoja completa en alta resolución y capturarla como imagen.

window.ZineR = window.ZineR || {};

/**
 * Generador de PDF
 */
window.ZineR.GeneradorPDF = function () {
    if (typeof window.jspdf === 'undefined') {
        console.error('La biblioteca jsPDF no está cargada');
    }
    if (typeof window.html2canvas === 'undefined') {
        console.error('La biblioteca html2canvas no está cargada');
    }
};

/**
 * Pre-procesar imagen aplicando filtros mediante Canvas
 * Esto garantiza que los filtros se apliquen correctamente en el PDF
 */
window.ZineR.GeneradorPDF.prototype.procesarImagenConFiltro = function (dataUrl, filtro, opacidad) {
    return new Promise((resolve) => {
        if (!filtro || filtro === 'none') {
            resolve(dataUrl);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // Aplicar filtro CSS al canvas
            const mapaFiltros = {
                'grayscale': 'grayscale(100%)',
                'sepia': 'sepia(100%)',
                'contrast': 'contrast(150%)',
                'brightness': 'brightness(150%)',
                'invert': 'invert(100%)'
            };
            
            ctx.filter = mapaFiltros[filtro] || 'none';
            ctx.globalAlpha = opacidad !== undefined ? opacidad : 1;
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(dataUrl); // Fallback si falla
        img.src = dataUrl;
    });
};

/**
 * Generar PDF desde datos de maquetación (Estrategia Visual)
 */
window.ZineR.GeneradorPDF.prototype.generarPDF = async function (maquetacion, opciones, esPreview) {
    opciones = opciones || {};
    const { jsPDF } = window.jspdf;

    console.log('[GeneradorPDF] Iniciando generación WYSIWYG...');

    // 1. Configurar dimensiones del papel
    const esHorizontal = maquetacion.esquema.diseño.columnas > maquetacion.esquema.diseño.filas;
    const orientacion = esHorizontal ? 'landscape' : 'portrait';

    let anchoPapelMm, altoPapelMm;
    if (esHorizontal) {
        anchoPapelMm = Math.max(maquetacion.tamañoPapel.ancho, maquetacion.tamañoPapel.alto);
        altoPapelMm = Math.min(maquetacion.tamañoPapel.ancho, maquetacion.tamañoPapel.alto);
    } else {
        anchoPapelMm = Math.min(maquetacion.tamañoPapel.ancho, maquetacion.tamañoPapel.alto);
        altoPapelMm = Math.max(maquetacion.tamañoPapel.ancho, maquetacion.tamañoPapel.alto);
    }

    // 2. Crear contenedor temporal para renderizado de alta resolución
    // Usamos un factor de escala para asegurar calidad (ej. 2 = 200%, aprox 192 DPI si base es 96)
    // Para impresión decente queremos al menos 150-300 DPI.
    // html2canvas tiene opción 'scale'.
    // Vamos a dimensionar el contenedor en píxeles basándonos en mm a 96 DPI (pantalla)
    // y luego html2canvas lo escalará.
    const MM_TO_PX = 3.7795275591; // 1mm = 3.78px aprox a 96 DPI
    const anchoPx = anchoPapelMm * MM_TO_PX;
    const altoPx = altoPapelMm * MM_TO_PX;

    const contenedorExport = document.createElement('div');
    contenedorExport.style.width = `${anchoPx}px`;
    contenedorExport.style.height = `${altoPx}px`;
    contenedorExport.style.position = 'absolute';
    contenedorExport.style.top = '0';
    contenedorExport.style.left = '0';
    contenedorExport.style.zIndex = '-9999';
    contenedorExport.style.backgroundColor = '#ffffff'; // Fondo blanco papel

    // Importante: Layout Grid
    contenedorExport.style.display = 'grid';
    contenedorExport.style.gridTemplateRows = `repeat(${maquetacion.esquema.diseño.filas}, 1fr)`;
    contenedorExport.style.gridTemplateColumns = `repeat(${maquetacion.esquema.diseño.columnas}, 1fr)`;
    contenedorExport.style.gap = '0'; // Sin gap para impresión, las guías se dibujan encima
    contenedorExport.style.boxSizing = 'border-box';

    document.body.appendChild(contenedorExport);

    try {
        // Esperar a que las fuentes estén completamente cargadas antes de capturar
        await document.fonts.ready;
        console.log('[GeneradorPDF] Fuentes cargadas, procediendo con renderizado...');
        
        // 3. Pre-procesar imágenes con filtros (para compatibilidad con html2canvas)
        console.log('[GeneradorPDF] Pre-procesando imágenes con filtros...');
        const carasConImagenesProcesadas = await Promise.all(
            maquetacion.caras.map(async (cara) => {
                if (cara.imagen && cara.imagen.dataUrl) {
                    const imagenProcesada = await this.procesarImagenConFiltro(
                        cara.imagen.dataUrl,
                        cara.imagen.filtro,
                        cara.imagen.opacidad
                    );
                    return {
                        ...cara,
                        imagen: {
                            ...cara.imagen,
                            dataUrl: imagenProcesada,
                            filtro: 'none' // Ya aplicado en el canvas
                        }
                    };
                }
                return cara;
            })
        );

        // 4. Renderizar contenido usando el Motor de Maquetación
        const opcionesMotor = window.aplicacionZineR ? window.aplicacionZineR.estado.opciones : {};
        const motor = new window.ZineR.MotorMaquetacion(window.aplicacionZineR.gestorImagenes, opcionesMotor);

        // Renderizar caras con imágenes ya procesadas
        carasConImagenesProcesadas.forEach(cara => {
            const elemCara = motor.crearElementoCara(cara);
            elemCara.style.border = 'none';
            contenedorExport.appendChild(elemCara);
        });

        // 5. Agregar guías de corte/doblez (superpuestas)
        if (opciones.mostrarMarcas) {
            this.agregarGuiasVisuales(contenedorExport, maquetacion, anchoPx, altoPx);
        }

        // 6. Capturar con html2canvas
        // Escala 2.5 para buena calidad (aprox 240 DPI)
        const escala = 2.5;

        const canvas = await html2canvas(contenedorExport, {
            scale: escala,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // 6. Generar PDF con la imagen capturada
        const pdf = new jsPDF({
            orientation: orientacion,
            unit: 'mm',
            format: [anchoPapelMm, altoPapelMm],
            compress: true
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Agregar imagen ajustada al tamaño del papel
        pdf.addImage(imgData, 'JPEG', 0, 0, anchoPapelMm, altoPapelMm);

        // 7. Salida
        if (esPreview) {
            // Usar datauristring para evitar problemas de seguridad con blob en file://
            return pdf.output('datauristring');
        } else {
            const marcaTiempo = new Date().toISOString().slice(0, 10);
            pdf.save(`zine_${maquetacion.esquema.id}_${marcaTiempo}.pdf`);
        }

    } catch (error) {
        console.error('Error generando PDF WYSIWYG:', error);
        throw error;
    } finally {
        // Limpieza
        document.body.removeChild(contenedorExport);
    }
};

/**
 * Agregar guías visuales al contenedor HTML de exportación
 */
window.ZineR.GeneradorPDF.prototype.agregarGuiasVisuales = function (contenedor, maquetacion, anchoTotal, altoTotal) {
    const divGuias = document.createElement('div');
    divGuias.style.position = 'absolute';
    divGuias.style.top = '0';
    divGuias.style.left = '0';
    divGuias.style.width = '100%';
    divGuias.style.height = '100%';
    divGuias.style.pointerEvents = 'none';
    divGuias.style.zIndex = '999'; // Encima de todo

    const filas = maquetacion.esquema.diseño.filas;
    const cols = maquetacion.esquema.diseño.columnas;
    const pasoX = anchoTotal / cols;
    const pasoY = altoTotal / filas;

    // Estilo de línea
    const estiloLinea = '1px dashed #999';

    // Verticales
    for (let i = 1; i < cols; i++) {
        const linea = document.createElement('div');
        linea.style.position = 'absolute';
        linea.style.left = `${pasoX * i}px`;
        linea.style.top = '0';
        linea.style.height = '100%';
        linea.style.borderLeft = estiloLinea;
        divGuias.appendChild(linea);
    }

    // Horizontales
    for (let i = 1; i < filas; i++) {
        const linea = document.createElement('div');
        linea.style.position = 'absolute';
        linea.style.top = `${pasoY * i}px`;
        linea.style.left = '0';
        linea.style.width = '100%';
        linea.style.borderTop = estiloLinea;
        divGuias.appendChild(linea);
    }

    // Marca de corte específica para 8-caras (Línea roja central horizontal)
    if (maquetacion.esquema.id === '8-caras') {
        const lineaCorte = document.createElement('div');
        lineaCorte.style.position = 'absolute';
        lineaCorte.style.top = '50%';
        lineaCorte.style.left = '25%'; // Empieza en col 2
        lineaCorte.style.width = '50%'; // Abarca col 2 y 3
        lineaCorte.style.height = '1px';
        lineaCorte.style.borderTop = '2px dashed red';

        const textoCorte = document.createElement('div');
        textoCorte.textContent = '✂ CORTAR';
        textoCorte.style.position = 'absolute';
        textoCorte.style.top = 'calc(50% - 15px)';
        textoCorte.style.left = '50%';
        textoCorte.style.transform = 'translateX(-50%)';
        textoCorte.style.color = 'red';
        textoCorte.style.fontSize = '10px';
        textoCorte.style.fontWeight = 'bold';

        divGuias.appendChild(lineaCorte);
        divGuias.appendChild(textoCorte);
    }

    // Marca de corte para 6-caras (Línea horizontal central)
    if (maquetacion.esquema.id === '6-caras') {
        const lineaCorte = document.createElement('div');
        lineaCorte.style.position = 'absolute';
        lineaCorte.style.top = '50%';
        lineaCorte.style.left = '0';
        lineaCorte.style.width = '100%';
        lineaCorte.style.height = '1px';
        lineaCorte.style.borderTop = '2px dashed red';

        const textoCorte = document.createElement('div');
        textoCorte.textContent = '✂ CORTAR';
        textoCorte.style.position = 'absolute';
        textoCorte.style.top = 'calc(50% - 15px)';
        textoCorte.style.left = '50%';
        textoCorte.style.transform = 'translateX(-50%)';
        textoCorte.style.color = 'red';
        textoCorte.style.fontSize = '10px';
        textoCorte.style.fontWeight = 'bold';

        divGuias.appendChild(lineaCorte);
        divGuias.appendChild(textoCorte);
    }

    // Marcas de corte para 16-caras (3 líneas horizontales)
    if (maquetacion.esquema.id === '16-caras') {
        for (let i = 1; i < filas; i++) {
            const lineaCorte = document.createElement('div');
            lineaCorte.style.position = 'absolute';
            lineaCorte.style.top = `${(100 / filas) * i}%`;
            lineaCorte.style.left = '0';
            lineaCorte.style.width = '100%';
            lineaCorte.style.height = '1px';
            lineaCorte.style.borderTop = '2px dashed red';
            divGuias.appendChild(lineaCorte);
        }

        const textoCorte = document.createElement('div');
        textoCorte.textContent = '✂ CORTAR las 3 líneas rojas';
        textoCorte.style.position = 'absolute';
        textoCorte.style.top = '5px';
        textoCorte.style.right = '5px';
        textoCorte.style.color = 'red';
        textoCorte.style.fontSize = '9px';
        textoCorte.style.fontWeight = 'bold';
        textoCorte.style.backgroundColor = 'rgba(255,255,255,0.8)';
        textoCorte.style.padding = '2px 4px';
        textoCorte.style.borderRadius = '2px';
        divGuias.appendChild(textoCorte);
    }

    contenedor.appendChild(divGuias);
};
