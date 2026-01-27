// app.js - Controlador principal de la aplicación

window.ZineR = window.ZineR || {};

/**
 * Aplicación Principal ZineR
 */
window.ZineR.Aplicacion = function () {
    // Inicializar módulos
    this.analizador = new window.ZineR.AnalizadorMarkdown();
    this.paginacion = new window.ZineR.Paginacion();
    this.gestorImagenes = new window.ZineR.GestorImagenes();
    this.motorMaquetacion = new window.ZineR.MotorMaquetacion(this.gestorImagenes);
    this.generadorPDF = new window.ZineR.GeneradorPDF();
    this.almacenamiento = new window.ZineR.Almacenamiento();

    // Estado actual
    this.estado = {
        idEsquema: '4-caras',
        tamañoPapel: window.ZineR.CONFIG.TAMAÑOS_PAPEL.a4,
        textoMarkdown: '',
        maquetacion: null,
        opciones: {
            embeberFuentes: true,
            mostrarMarcas: false,
            mostrarNumerosPagina: true,
            fuentes: {
                titulo: 'serif',
                subtitulo: 'serif',
                cuerpo: 'serif',
                firma: 'serif'
            },
            tamañosFuente: {
                titulo: 24,
                subtitulo: 18,
                cuerpo: 11,
                firma: 10
            }
        }
    };

    // Elementos DOM
    this.elementos = {};

    // Inicializar
    this.inicializar();
};

/**
 * Inicializar aplicación
 */
window.ZineR.Aplicacion.prototype.inicializar = function () {
    // Cachear elementos DOM
    this.cachearElementos();

    // Configurar event listeners
    this.configurarEventListeners();

    // Cargar borrador si existe
    this.cargarBorradorSiExiste();

    // Asegurar que los controles de imagen se inicialicen (si no se cargaron del borrador)
    if (!this.elementos.controlesImagen.hasChildNodes()) {
        this.actualizarControlesImagen();
    }

    // Renderizado inicial
    this.actualizarVistaPrevia();

    console.log('ZineR inicializado exitosamente');
};

/**
 * Cachear referencias de elementos DOM
 */
window.ZineR.Aplicacion.prototype.cachearElementos = function () {
    this.elementos = {
        // Selector de formato
        radiosFormato: document.querySelectorAll('input[name="format"]'),
        selectTamañoPapel: document.getElementById('paper-size'),

        // Editor
        editorMarkdown: document.getElementById('markdown-editor'),
        vistaPreMarkdown: document.getElementById('markdown-preview'),
        btnAlternarVista: document.getElementById('btn-toggle-preview'),
        btnImportarMd: document.getElementById('btn-import-md'),
        importarArchivo: document.getElementById('file-import'),

        // Toolbar de edición Markdown
        toolbarEditor: document.querySelector('.editor-toolbar'),

        // Vista previa
        lienzoVistaPrevia: document.getElementById('preview-canvas'),
        infoVistaPrevia: document.getElementById('preview-info'),

        // Opciones
        checkboxEmbeberFuentes: document.getElementById('embed-fonts'),
        checkboxMostrarMarcas: document.getElementById('show-marks'),
        checkboxMostrarNumerosPagina: document.getElementById('show-page-numbers'),

        // Controles de imagen (poblados dinámicamente)
        controlesImagen: document.getElementById('image-controls'),

        // Modal PDF
        modalVistaPrevia: document.getElementById('pdf-preview-modal'),
        frameVistaPrevia: document.getElementById('pdf-preview-frame'),
        btnCerrarModal: document.getElementById('btn-close-modal'),
        btnDescargarModal: document.getElementById('btn-download-pdf-modal'),

        // Modal Información
        modalInfo: document.getElementById('info-modal'),
        tituloModalInfo: document.getElementById('info-modal-title'),
        contenidoModalInfo: document.getElementById('info-modal-content'),
        btnCerrarInfoModal: document.getElementById('btn-close-info-modal'),
        btnCerrarInfoFooter: document.getElementById('btn-close-info-footer'),

        // Botones de información
        btnInfoPlegado: document.getElementById('btn-info-folding'),
        btnInfoUso: document.getElementById('btn-info-usage'),
        btnInfoMensaje: document.getElementById('btn-info-message'),

        // Acciones
        btnExportarPdf: document.getElementById('btn-export-pdf'),
        btnGuardarBorrador: document.getElementById('btn-save-draft'),

        // Toast
        contenedorToast: document.getElementById('toast-container')
    };
};

/**
 * Configurar event listeners
 */
window.ZineR.Aplicacion.prototype.configurarEventListeners = function () {
    const self = this;

    // Cambio de formato
    this.elementos.radiosFormato.forEach(radio => {
        radio.addEventListener('change', function (e) {
            console.log(`[ZineR] Cambio de formato: ${e.target.value}`);
            self.estado.idEsquema = e.target.value;
            self.actualizarControlesImagen();
            self.actualizarVistaPrevia();
        });
    });

    // Cambio de tamaño de papel
    this.elementos.selectTamañoPapel.addEventListener('change', function (e) {
        const claveTamaño = e.target.value;
        console.log(`[ZineR] Cambio de tamaño de papel: ${claveTamaño}`);
        self.estado.tamañoPapel = window.ZineR.CONFIG.TAMAÑOS_PAPEL[claveTamaño];
        self.actualizarVistaPrevia();
    });

    // Entrada en editor Markdown (con debounce)
    let temporizadorEditor;
    this.elementos.editorMarkdown.addEventListener('input', function (e) {
        clearTimeout(temporizadorEditor);
        temporizadorEditor = setTimeout(function () {
            console.log('[ZineR] Contenido actualizado (debounce)');
            self.estado.textoMarkdown = e.target.value;
            self.actualizarVistaPrevia();
            self.autoGuardarBorrador();
        }, 500);
    });

    // Alternar vista previa
    this.elementos.btnAlternarVista.addEventListener('click', function () {
        console.log('[ZineR] Alternando vista previa Markdown');
        self.alternarVistaPreMarkdown();
    });

    // Importar archivo markdown
    this.elementos.btnImportarMd.addEventListener('click', function () {
        self.elementos.importarArchivo.click();
    });

    this.elementos.importarArchivo.addEventListener('change', function (e) {
        console.log('[ZineR] Archivo seleccionado para importación');
        self.importarArchivoMarkdown(e.target.files[0]);
    });

    // Opciones
    this.elementos.checkboxEmbeberFuentes.addEventListener('change', function (e) {
        console.log(`[ZineR] Opción Embeber Fuentes: ${e.target.checked}`);
        self.estado.opciones.embeberFuentes = e.target.checked;
    });

    this.elementos.checkboxMostrarMarcas.addEventListener('change', function (e) {
        console.log(`[ZineR] Opción Mostrar Marcas: ${e.target.checked}`);
        self.estado.opciones.mostrarMarcas = e.target.checked;
    });

    this.elementos.checkboxMostrarNumerosPagina.addEventListener('change', function (e) {
        console.log(`[ZineR] Opción Mostrar Números de Página: ${e.target.checked}`);
        self.estado.opciones.mostrarNumerosPagina = e.target.checked;
        self.actualizarVistaPrevia();
    });

    // Selectores de fuentes granulares
    // Mapeo de IDs HTML (inglés) a claves de estado (español)
    const mapeoFuentes = {
        'title': 'titulo',
        'subtitle': 'subtitulo',
        'body': 'cuerpo',
        'signature': 'firma'
    };
    
    Object.entries(mapeoFuentes).forEach(([idHtml, claveEstado]) => {
        const selector = document.getElementById(`font-${idHtml}`);
        if (selector) {
            selector.addEventListener('change', function (e) {
                console.log(`[ZineR] Cambio de fuente para ${claveEstado}: ${e.target.value}`);
                self.estado.opciones.fuentes[claveEstado] = e.target.value;
                self.actualizarVistaPrevia();
            });
        } else {
            console.warn(`[ZineR] Selector font-${idHtml} no encontrado`);
        }
    });

    // Controles de tamaño de fuente
    Object.entries(mapeoFuentes).forEach(([idHtml, claveEstado]) => {
        const inputTamaño = document.getElementById(`size-${idHtml}`);
        if (inputTamaño) {
            // Asegurar que tamañosFuente existe
            if (!self.estado.opciones.tamañosFuente) {
                self.estado.opciones.tamañosFuente = {
                    titulo: 24,
                    subtitulo: 18,
                    cuerpo: 11,
                    firma: 10
                };
            }
            
            // Sincronizar valor inicial desde el estado
            inputTamaño.value = self.estado.opciones.tamañosFuente[claveEstado];
            
            // Listener para cambios directos en el input
            inputTamaño.addEventListener('change', function (e) {
                // Asegurar que tamañosFuente existe (por si se cargó borrador antiguo)
                if (!self.estado.opciones.tamañosFuente) {
                    self.estado.opciones.tamañosFuente = {
                        titulo: 24,
                        subtitulo: 18,
                        cuerpo: 11,
                        firma: 10
                    };
                }
                
                let valor = parseInt(e.target.value, 10);
                const min = parseInt(inputTamaño.min, 10);
                const max = parseInt(inputTamaño.max, 10);
                
                // Validar rango
                if (isNaN(valor)) valor = self.estado.opciones.tamañosFuente[claveEstado] || 11;
                if (valor < min) valor = min;
                if (valor > max) valor = max;
                
                inputTamaño.value = valor;
                console.log(`[ZineR] Cambio de tamaño para ${claveEstado}: ${valor}px`);
                self.estado.opciones.tamañosFuente[claveEstado] = valor;
                self.actualizarVistaPrevia();
            });
        }
    });

    // Botones +/- para tamaño de fuente
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const action = this.dataset.action;
            const input = document.getElementById(targetId);
            
            if (!input) return;
            
            let valor = parseInt(input.value, 10);
            const min = parseInt(input.min, 10);
            const max = parseInt(input.max, 10);
            const step = parseInt(input.step, 10) || 1;
            
            if (action === 'increase' && valor < max) {
                valor += step;
            } else if (action === 'decrease' && valor > min) {
                valor -= step;
            }
            
            input.value = valor;
            input.dispatchEvent(new Event('change')); // Disparar evento change
        });
    });

    // Exportar PDF (Ahora abre modal de vista previa)
    this.elementos.btnExportarPdf.addEventListener('click', function () {
        console.log('[ZineR] Abriendo vista previa PDF...');
        self.mostrarVistaPreviaPDF();
    });

    // Botones del Modal
    this.elementos.btnCerrarModal.addEventListener('click', function () {
        self.elementos.modalVistaPrevia.classList.add('hidden');
    });

    this.elementos.btnDescargarModal.addEventListener('click', function () {
        console.log('[ZineR] Descargando PDF final...');
        self.exportarPDF(false); // false = no preview, descargar
    });

    // Cerrar modal al hacer clic fuera
    this.elementos.modalVistaPrevia.addEventListener('click', function (e) {
        if (e.target === self.elementos.modalVistaPrevia) {
            self.elementos.modalVistaPrevia.classList.add('hidden');
        }
    });

    // Guardar borrador
    this.elementos.btnGuardarBorrador.addEventListener('click', function () {
        console.log('[ZineR] Guardando borrador manualmente...');
        self.guardarBorrador();
    });

    // Nuevo Proyecto
    const btnNuevoProyecto = document.getElementById('btn-new-project');
    if (btnNuevoProyecto) {
        btnNuevoProyecto.addEventListener('click', function () {
            if (confirm('¿Estás seguro de iniciar un nuevo proyecto? Se borrará el borrador actual.')) {
                console.log('[ZineR] Iniciando nuevo proyecto...');
                self.nuevoProyecto();
            }
        });
    }

    // ========================================
    // Toolbar de Edición Markdown
    // ========================================
    if (this.elementos.toolbarEditor) {
        this.elementos.toolbarEditor.addEventListener('click', function (e) {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;

            const action = btn.dataset.action;
            if (action) {
                self.aplicarFormatoMarkdown(action);
            }
        });
    }

    // Atajos de teclado para el editor
    this.elementos.editorMarkdown.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    self.aplicarFormatoMarkdown('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    self.aplicarFormatoMarkdown('italic');
                    break;
            }
        }
    });

    // ========================================
    // Modal de Información
    // ========================================
    if (this.elementos.btnInfoPlegado) {
        this.elementos.btnInfoPlegado.addEventListener('click', function () {
            self.mostrarModalInfo('plegado');
        });
    }

    if (this.elementos.btnInfoUso) {
        this.elementos.btnInfoUso.addEventListener('click', function () {
            self.mostrarModalInfo('uso');
        });
    }

    if (this.elementos.btnInfoMensaje) {
        this.elementos.btnInfoMensaje.addEventListener('click', function () {
            self.mostrarModalInfo('mensaje');
        });
    }

    // Cerrar modal de información
    if (this.elementos.btnCerrarInfoModal) {
        this.elementos.btnCerrarInfoModal.addEventListener('click', function () {
            self.elementos.modalInfo.classList.add('hidden');
        });
    }

    if (this.elementos.btnCerrarInfoFooter) {
        this.elementos.btnCerrarInfoFooter.addEventListener('click', function () {
            self.elementos.modalInfo.classList.add('hidden');
        });
    }

    // Cerrar modal info al hacer clic fuera
    if (this.elementos.modalInfo) {
        this.elementos.modalInfo.addEventListener('click', function (e) {
            if (e.target === self.elementos.modalInfo) {
                self.elementos.modalInfo.classList.add('hidden');
            }
        });
    }
};

/**
 * Aplicar formato Markdown a la selección del editor
 */
window.ZineR.Aplicacion.prototype.aplicarFormatoMarkdown = function (accion) {
    const editor = this.elementos.editorMarkdown;
    const inicioSeleccion = editor.selectionStart;
    const finSeleccion = editor.selectionEnd;
    const textoSeleccionado = editor.value.substring(inicioSeleccion, finSeleccion);
    const textoAntes = editor.value.substring(0, inicioSeleccion);
    const textoDespues = editor.value.substring(finSeleccion);

    let textoNuevo = '';
    let cursorOffset = 0;

    switch (accion) {
        case 'h1':
            textoNuevo = `# ${textoSeleccionado || 'Título'}`;
            cursorOffset = 2;
            break;
        case 'h2':
            textoNuevo = `## ${textoSeleccionado || 'Subtítulo'}`;
            cursorOffset = 3;
            break;
        case 'h3':
            textoNuevo = `### ${textoSeleccionado || 'Encabezado'}`;
            cursorOffset = 4;
            break;
        case 'h4':
            textoNuevo = `#### ${textoSeleccionado || 'Encabezado'}`;
            cursorOffset = 5;
            break;
        case 'h5':
            textoNuevo = `##### ${textoSeleccionado || 'Encabezado'}`;
            cursorOffset = 6;
            break;
        case 'bold':
            textoNuevo = `**${textoSeleccionado || 'texto en negrita'}**`;
            cursorOffset = 2;
            break;
        case 'italic':
            textoNuevo = `*${textoSeleccionado || 'texto en cursiva'}*`;
            cursorOffset = 1;
            break;
        case 'underline':
            // Markdown estándar no tiene subrayado, usamos HTML
            textoNuevo = `<u>${textoSeleccionado || 'texto subrayado'}</u>`;
            cursorOffset = 3;
            break;
        case 'ul':
            if (textoSeleccionado) {
                // Convertir líneas seleccionadas en lista
                textoNuevo = textoSeleccionado.split('\n').map(linea => `- ${linea}`).join('\n');
            } else {
                textoNuevo = '- Elemento de lista';
            }
            cursorOffset = 2;
            break;
        case 'ol':
            if (textoSeleccionado) {
                // Convertir líneas seleccionadas en lista numerada
                textoNuevo = textoSeleccionado.split('\n').map((linea, i) => `${i + 1}. ${linea}`).join('\n');
            } else {
                textoNuevo = '1. Elemento de lista';
            }
            cursorOffset = 3;
            break;
        case 'pagebreak':
            // Insertar salto de página
            textoNuevo = '\n\n----\n\n';
            cursorOffset = 6;
            break;
        default:
            return;
    }

    // Aplicar el cambio
    editor.value = textoAntes + textoNuevo + textoDespues;

    // Posicionar cursor
    if (textoSeleccionado) {
        editor.selectionStart = inicioSeleccion;
        editor.selectionEnd = inicioSeleccion + textoNuevo.length;
    } else {
        const nuevaPosicion = inicioSeleccion + cursorOffset;
        editor.selectionStart = nuevaPosicion;
        editor.selectionEnd = nuevaPosicion + (textoNuevo.length - cursorOffset * 2);
    }

    // Enfocar editor y disparar actualización
    editor.focus();
    this.estado.textoMarkdown = editor.value;
    this.actualizarVistaPrevia();
    this.autoGuardarBorrador();
};

/**
 * Mostrar modal de información
 */
window.ZineR.Aplicacion.prototype.mostrarModalInfo = function (tipo) {
    const contenido = this.obtenerContenidoModal(tipo);
    
    this.elementos.tituloModalInfo.textContent = contenido.titulo;
    this.elementos.contenidoModalInfo.innerHTML = contenido.html;
    this.elementos.modalInfo.classList.remove('hidden');
};

/**
 * Obtener contenido para el modal de información
 */
window.ZineR.Aplicacion.prototype.obtenerContenidoModal = function (tipo) {
    const contenidos = {
        plegado: this.obtenerInstruccionesPlegado(),
        uso: this.obtenerManualUso(),
        mensaje: this.obtenerMensajeBotella()
    };

    return contenidos[tipo] || { titulo: 'Información', html: '<p>Contenido no disponible.</p>' };
};

/**
 * Obtener instrucciones de plegado para el formato actual
 */
window.ZineR.Aplicacion.prototype.obtenerInstruccionesPlegado = function () {
    const esquema = window.ZineR.obtenerEsquema(this.estado.idEsquema);
    
    let html = `<h3>📐 ${esquema.nombre}</h3>`;
    
    // Indicadores
    html += '<p><strong>Características:</strong></p>';
    html += '<ul>';
    html += `<li>Número de caras/páginas: <strong>${esquema.caras}</strong></li>`;
    html += `<li>Requiere corte: <strong>${esquema.requiereCorte ? 'Sí ✂️' : 'No'}</strong></li>`;
    html += `<li>Requiere impresión doble cara: <strong>${esquema.requiereDuplex ? 'Sí' : 'No'}</strong></li>`;
    html += '</ul>';
    
    // Instrucciones
    html += '<h3>Pasos para plegar</h3>';
    html += '<ol>';
    esquema.instrucciones.forEach(instruccion => {
        // Quitar el número del inicio si existe (ej: "1. Dobla..." -> "Dobla...")
        const textoLimpio = instruccion.replace(/^\d+\.\s*/, '');
        html += `<li>${textoLimpio}</li>`;
    });
    html += '</ol>';
    
    // Tips según formato
    if (esquema.id === '8-caras') {
        html += '<h3>💡 Consejos</h3>';
        html += '<ul>';
        html += '<li>Usa una regla para marcar los dobleces antes de doblar.</li>';
        html += '<li>El corte central debe ser preciso: ni muy corto ni muy largo.</li>';
        html += '<li>Practica primero con una hoja de prueba.</li>';
        html += '</ul>';
    } else if (esquema.id === '16-caras') {
        html += '<h3>💡 Consejos</h3>';
        html += '<ul>';
        html += '<li>Usa papel Legal o Oficio para mejores resultados.</li>';
        html += '<li>Numera las tiras antes de cortar para no confundirte.</li>';
        html += '<li>Usa grapas o hilo para encuadernar las tiras.</li>';
        html += '</ul>';
    }
    
    return {
        titulo: 'Instrucciones de Plegado',
        html: html
    };
};

/**
 * Obtener manual de uso de ZineR
 */
window.ZineR.Aplicacion.prototype.obtenerManualUso = function () {
    const html = `
        <h3>🎨 ¿Qué es ZineR?</h3>
        <p>ZineR es una herramienta libre y gratuita para crear fanzines a partir de texto en formato Markdown. 
        Genera automáticamente la <strong>imposición</strong> (distribución de páginas) para que al imprimir 
        y plegar tu hoja obtengas un librito listo para leer y compartir.</p>
        
        <h3>📝 Panel Central: Editor de Contenido</h3>
        <p>Aquí escribes el contenido de tu fanzine usando <strong>Markdown</strong>, un formato de texto simple:</p>
        <ul>
            <li><code># Título</code> — Título principal (portada)</li>
            <li><code>## Subtítulo</code> — Subtítulo</li>
            <li><code>**negrita**</code> — Texto en <strong>negrita</strong></li>
            <li><code>*cursiva*</code> — Texto en <em>cursiva</em></li>
            <li><code>- item</code> — Lista con viñetas</li>
            <li><code>1. item</code> — Lista numerada</li>
            <li><code>----</code> — Salto de página (4 guiones)</li>
            <li><code>_Tu firma_</code> — Firma al final (cursiva con guión bajo)</li>
        </ul>
        <p>La <strong>barra de herramientas</strong> sobre el editor te permite aplicar estos formatos 
        sin necesidad de recordar la sintaxis.</p>
        
        <h3>⚙️ Panel Izquierdo: Configuración</h3>
        <ul>
            <li><strong>Formato de Plegado:</strong> Elige cuántas caras tendrá tu fanzine (4, 6, 8 o 16).</li>
            <li><strong>Tamaño de Papel:</strong> Selecciona el tamaño de la hoja para imprimir (Carta, A4, Oficio, etc.).</li>
            <li><strong>Imágenes de Fondo:</strong> Añade imágenes de fondo a cada página. Haz clic en "Elegir archivo" 
            junto al número de página donde quieres la imagen.</li>
            <li><strong>Opciones de Exportación:</strong>
                <ul>
                    <li><em>Embeber fuentes:</em> Incluye las fuentes en el PDF (útil si usas fuentes especiales).</li>
                    <li><em>Marcas de corte/doblez:</em> Añade guías visuales para saber dónde cortar y doblar.</li>
                    <li><em>Números de página:</em> Muestra u oculta la numeración en las páginas.</li>
                </ul>
            </li>
        </ul>
        
        <h3>🔤 Fuentes y Tamaños</h3>
        <p>Sobre el editor hay controles para personalizar las fuentes:</p>
        <ul>
            <li><strong>Título:</strong> Fuente y tamaño del título principal.</li>
            <li><strong>Subtítulo:</strong> Fuente y tamaño del subtítulo.</li>
            <li><strong>Cuerpo:</strong> Fuente y tamaño del texto principal.</li>
            <li><strong>Firma:</strong> Fuente y tamaño de la firma.</li>
        </ul>
        <p>Usa los botones <code>+</code> y <code>-</code> o escribe directamente el tamaño en píxeles.</p>
        
        <h3>👁️ Panel Derecho: Vista de Imposición</h3>
        <p>Muestra cómo quedará tu fanzine al imprimirlo. Cada rectángulo representa una página 
        en su posición final después del plegado. Los números indican el orden de lectura.</p>
        
        <h3>📥 Exportar y Guardar</h3>
        <ul>
            <li><strong>Descargar PDF:</strong> Genera el PDF listo para imprimir. Se abrirá una vista previa 
            antes de descargar.</li>
            <li><strong>Guardar Borrador:</strong> Guarda tu trabajo en el navegador para continuar después. 
            El borrador se carga automáticamente al volver a abrir ZineR.</li>
            <li><strong>Nuevo Proyecto:</strong> Borra el borrador actual y empieza de cero.</li>
        </ul>
        
        <h3>🖨️ Imprimir tu Fanzine</h3>
        <ol>
            <li>Descarga el PDF generado.</li>
            <li>Imprime en el tamaño de papel que seleccionaste.</li>
            <li>Sigue las <strong>Instrucciones de Plegado</strong> según el formato elegido.</li>
            <li>¡Comparte tu fanzine!</li>
        </ol>
        
        <h3>💾 Importar Contenido</h3>
        <p>Puedes importar un archivo <code>.md</code> o <code>.txt</code> haciendo clic en el botón 📂 
        junto al editor. El contenido del archivo reemplazará lo que tengas escrito.</p>
    `;
    
    return {
        titulo: 'Uso de ZineR',
        html: html
    };
};

/**
 * Obtener carta "Mensaje en la Botella"
 */
window.ZineR.Aplicacion.prototype.obtenerMensajeBotella = function () {
    const html = `
        <h3>💌 Mensaje en la Botella</h3>
        
        <p>Querida persona que lee esto,</p>
        
        <p>Este mensaje viaja desde algún rincón del Sur Global —desde territorios donde las luchas cotidianas 
        se mezclan con el polvo de los caminos y la esperanza de los que resisten— hasta tus manos, 
        tu pantalla, tu habitación. ZineR existe porque creemos que <strong>la cultura es un derecho, 
        no un privilegio</strong>.</p>
        
        <p>Vivimos tiempos oscuros. El fascismo crece como hierba mala en todos los continentes, alimentado 
        por algoritmos que amplifican el odio, por medios de comunicación que confunden deliberadamente, 
        por tecnologías generativas que fabrican mentiras a escala industrial. Nos quieren aislados, 
        desconfiados, temerosos. Quieren que olvidemos que somos comunidad.</p>
        
        <blockquote>
            "Vivimos en el capitalismo. Su poder parece ineludible. También lo parecía el derecho divino 
            de los reyes. Todo poder humano puede ser resistido y cambiado por los seres humanos. 
            La resistencia y el cambio a menudo comienzan en el arte, y muy a menudo en nuestro arte, 
            el arte de las palabras."
            <cite>— Ursula K. Le Guin, Discurso en los National Book Awards, 2014</cite>
        </blockquote>
        
        <p>El fanzine es una tecnología de resistencia. Nació en los márgenes, en las comunidades punk, 
        en los movimientos feministas, en los colectivos de ciencia ficción, en las manos de quienes 
        no tenían acceso a las imprentas ni a los medios masivos. Un fanzine es un acto de rebeldía 
        contra la idea de que solo los poderosos pueden comunicar.</p>
        
        <blockquote>
            "Es nuestro sufrimiento lo que nos une. No es el amor. El amor no obedece a la mente, 
            y se convierte en odio cuando se le fuerza. El vínculo que nos une está más allá de la elección. 
            Somos hermanos. Somos hermanos en lo que compartimos. En el dolor, que cada uno debe sufrir solo, 
            en el hambre, en la pobreza, en la esperanza, conocemos nuestra hermandad."
            <cite>— Ursula K. Le Guin, Los Desposeídos (1974)</cite>
        </blockquote>
        
        <p>Ponemos ZineR en tus manos de forma libre, abierta y gratuita porque creemos en la cultura 
        como bien común. Porque la imaginación no debería tener precio. Porque cada persona, 
        desde su habitación, desde su territorio, desde sus capacidades —siempre limitadas, siempre 
        suficientes— tiene algo que aportar al mundo.</p>
        
        <p>La filósofa Martha Nussbaum nos recuerda que la educación humanística —las artes, la literatura, 
        el pensamiento crítico— es fundamental para la democracia. Sin ella, producimos máquinas utilitarias 
        en lugar de ciudadanos capaces de pensar por sí mismos, de empatizar con los otros, de imaginar 
        futuros diferentes.</p>
        
        <blockquote>
            "No puedes comprar la revolución. No puedes hacer la revolución. Solo puedes ser la revolución. 
            Está en tu espíritu, o no está en ningún lugar."
            <cite>— Ursula K. Le Guin, Los Desposeídos (1974)</cite>
        </blockquote>
        
        <p>Los oscurantistas de hoy —con sus ejércitos de bots, sus teorías conspirativas, su odio 
        hacia la ciencia y hacia todo lo que no comprenden— quieren hacernos creer que estamos solos, 
        que nada de lo que hagamos importa, que el futuro ya está escrito.</p>
        
        <p><strong>No pasarán.</strong></p>
        
        <p>No pasarán porque cada fanzine que circule de mano en mano es un acto de fe en la humanidad. 
        Porque cada historia contada es una semilla que puede germinar en quien la lea. Porque la 
        cultura compartida construye lazos que ningún algoritmo puede romper.</p>
        
        <blockquote>
            "Un escritor es una persona que le importa lo que significan las palabras, lo que dicen, 
            cómo lo dicen. Los escritores saben que las palabras son su camino hacia la verdad y la libertad, 
            y por eso las usan con cuidado, con pensamiento, con miedo, con deleite."
            <cite>— Ursula K. Le Guin, "A Few Words to a Young Writer" (2006)</cite>
        </blockquote>
        
        <p>Toma esta herramienta. Úsala. Comparte tus ideas, tus historias, tus luchas, tus sueños. 
        Haz fanzines para tus amigos, para desconocidos, para ti mismo. Déjalos en el transporte público, 
        en bancos del parque, en bibliotecas. Cada uno es una botella lanzada al mar del tiempo, 
        esperando llegar a alguien que necesite leerlo.</p>
        
        <p>Y recuerda: la luz siempre encuentra grietas por donde colarse, incluso en la noche más cerrada.</p>
        
        <p class="signature">
            Con esperanza rebelde,<br>
            <em>Desde algún lugar del Sur Global, 2025</em>
        </p>
        
        <hr style="margin: 2em 0; border-color: var(--color-border);">
        
        <p style="font-size: 0.85em; color: var(--color-text-secondary);">
            <strong>Sobre las citas:</strong><br>
            • Ursula K. Le Guin (1929-2018) fue una escritora estadounidense de ciencia ficción y fantasía, 
            conocida por su obra profundamente humanista y su compromiso con la imaginación como herramienta de cambio social.<br>
            • Martha Nussbaum (1947-) es una filósofa estadounidense cuyo trabajo sobre las capacidades humanas, 
            las emociones y la educación liberal ha influido en debates sobre justicia social y desarrollo humano en todo el mundo.
        </p>
    `;
    
    return {
        titulo: 'Mensaje en la Botella',
        html: html
    };
};

/**
 * Mostrar vista previa PDF en modal
 */
window.ZineR.Aplicacion.prototype.mostrarVistaPreviaPDF = async function () {
    if (!this.estado.maquetacion) {
        this.mostrarToast('No hay contenido para exportar', 'error');
        return;
    }

    try {
        this.mostrarToast('Generando vista previa...', 'info');
        // Generar blob URL
        const blobUrl = await this.generadorPDF.generarPDF(this.estado.maquetacion, this.estado.opciones, true);

        // Mostrar en iframe
        this.elementos.frameVistaPrevia.src = blobUrl;
        this.elementos.modalVistaPrevia.classList.remove('hidden');

    } catch (error) {
        this.mostrarToast('Error al generar vista previa', 'error');
        console.error(error);
    }
};

/**
 * Exportar a PDF (Descargar)
 */
window.ZineR.Aplicacion.prototype.exportarPDF = async function (esPreview) {
    if (!this.estado.maquetacion) {
        this.mostrarToast('No hay contenido para exportar', 'error');
        return;
    }

    try {
        this.mostrarToast('Generando PDF...', 'info');
        await this.generadorPDF.generarPDF(this.estado.maquetacion, this.estado.opciones, false);
        this.mostrarToast('PDF descargado correctamente', 'success');
        this.elementos.modalVistaPrevia.classList.add('hidden');
    } catch (error) {
        this.mostrarToast('Error al generar PDF', 'error');
        console.error(error);
    }
};

/**
 * Iniciar nuevo proyecto (resetear estado)
 */
window.ZineR.Aplicacion.prototype.nuevoProyecto = function () {
    // Limpiar almacenamiento local explícitamente
    this.almacenamiento.limpiarBorrador();

    // También limpiar cualquier otra clave relacionada si es necesario
    localStorage.removeItem(window.ZineR.CONFIG.CLAVES_ALMACENAMIENTO.borrador);

    // Recargar la página para un reinicio limpio y completo
    // Usamos location.href para forzar una navegación real y no solo un reload de caché
    window.location.href = window.location.href.split('?')[0];
};

/**
 * Actualizar controles de carga de imagen basado en formato actual
 */
window.ZineR.Aplicacion.prototype.actualizarControlesImagen = function () {
    const esquema = window.ZineR.obtenerEsquema(this.estado.idEsquema);
    const contenedor = this.elementos.controlesImagen;
    contenedor.innerHTML = '';

    const self = this;

    for (let i = 1; i <= esquema.caras; i++) {
        const controlCara = document.createElement('div');
        controlCara.className = 'control-imagen-grupo';
        controlCara.style.marginBottom = '12px';
        controlCara.style.borderBottom = '1px solid var(--color-border)';
        controlCara.style.paddingBottom = '8px';

        const etiqueta = document.createElement('label');
        etiqueta.textContent = `Cara ${i}:`;
        etiqueta.style.display = 'block';
        etiqueta.style.fontSize = '12px';
        etiqueta.style.fontWeight = 'bold';
        etiqueta.style.marginBottom = '4px';

        // Input archivo
        const entrada = document.createElement('input');
        entrada.type = 'file';
        entrada.accept = 'image/*';
        entrada.dataset.numeroCara = i;
        entrada.addEventListener('change', function (e) {
            self.manejarCargaImagen(e, i);
        });

        // Controles adicionales (solo visibles si hay imagen, idealmente, pero los mostramos siempre por simplicidad)
        const contenedorOpciones = document.createElement('div');
        contenedorOpciones.style.marginTop = '4px';
        contenedorOpciones.style.display = 'grid';
        contenedorOpciones.style.gridTemplateColumns = '1fr 1fr';
        contenedorOpciones.style.gap = '4px';

        // Selector Ajuste
        const selectAjuste = document.createElement('select');
        selectAjuste.style.fontSize = '10px';
        for (const [clave, valor] of Object.entries(window.ZineR.CONFIG.AJUSTES_IMAGEN)) {
            const opcion = document.createElement('option');
            opcion.value = clave;
            opcion.textContent = valor;
            selectAjuste.appendChild(opcion);
        }
        selectAjuste.addEventListener('change', function (e) {
            self.gestorImagenes.actualizarPropiedadesImagen(i, { ajuste: e.target.value });
            self.actualizarVistaPrevia();
        });

        // Selector Filtro
        const selectFiltro = document.createElement('select');
        selectFiltro.style.fontSize = '10px';
        for (const [clave, valor] of Object.entries(window.ZineR.CONFIG.FILTROS_IMAGEN)) {
            const opcion = document.createElement('option');
            opcion.value = clave;
            opcion.textContent = valor;
            selectFiltro.appendChild(opcion);
        }
        selectFiltro.addEventListener('change', function (e) {
            self.gestorImagenes.actualizarPropiedadesImagen(i, { filtro: e.target.value });
            self.actualizarVistaPrevia();
        });

        // Slider Opacidad
        const contenedorOpacidad = document.createElement('div');
        contenedorOpacidad.style.display = 'flex';
        contenedorOpacidad.style.alignItems = 'center';

        const labelOpacidad = document.createElement('span');
        labelOpacidad.textContent = 'Op:';
        labelOpacidad.style.fontSize = '10px';
        labelOpacidad.style.marginRight = '4px';

        const sliderOpacidad = document.createElement('input');
        sliderOpacidad.type = 'range';
        sliderOpacidad.min = '0';
        sliderOpacidad.max = '1';
        sliderOpacidad.step = '0.1';
        sliderOpacidad.value = '1';
        sliderOpacidad.style.width = '60px';
        sliderOpacidad.addEventListener('input', function (e) {
            self.gestorImagenes.actualizarPropiedadesImagen(i, { opacidad: parseFloat(e.target.value) });
            self.actualizarVistaPrevia();
        });

        contenedorOpacidad.appendChild(labelOpacidad);
        contenedorOpacidad.appendChild(sliderOpacidad);

        contenedorOpciones.appendChild(selectAjuste);
        contenedorOpciones.appendChild(selectFiltro);
        contenedorOpciones.appendChild(contenedorOpacidad);

        controlCara.appendChild(etiqueta);
        controlCara.appendChild(entrada);
        controlCara.appendChild(contenedorOpciones);
        contenedor.appendChild(controlCara);

        // Restaurar valores si existe imagen
        const imagen = this.gestorImagenes.obtenerImagen(i);
        if (imagen) {
            selectAjuste.value = imagen.ajuste || 'cover';
            selectFiltro.value = imagen.filtro || 'none';
            sliderOpacidad.value = imagen.opacidad !== undefined ? imagen.opacidad : 1;
        }
    }
};

/**
 * Manejar carga de imagen para una cara
 */
window.ZineR.Aplicacion.prototype.manejarCargaImagen = async function (evento, numeroCara) {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const self = this;

    try {
        await this.gestorImagenes.subirImagen(archivo, numeroCara);
        this.actualizarVistaPrevia();
        this.mostrarToast('Imagen cargada correctamente', 'success');
    } catch (error) {
        this.mostrarToast('Error al cargar imagen', 'error');
        console.error(error);
    }
};

/**
 * Esperar a que las fuentes de Google Fonts estén cargadas
 * Usa Promise.race con timeout de 3 segundos para no bloquear indefinidamente
 */
window.ZineR.Aplicacion.prototype.esperarFuentes = function () {
    const timeout = new Promise((resolve) => {
        setTimeout(() => {
            console.warn('[ZineR] Timeout esperando fuentes, usando fallbacks');
            resolve('timeout');
        }, 3000);
    });
    
    const fontReady = document.fonts.ready.then(() => {
        console.log('[ZineR] Fuentes cargadas correctamente');
        return 'loaded';
    });
    
    return Promise.race([fontReady, timeout]);
};

/**
 * Actualizar lienzo de vista previa
 */
window.ZineR.Aplicacion.prototype.actualizarVistaPrevia = async function () {
    // Esperar a que las fuentes estén cargadas antes de renderizar
    await this.esperarFuentes();
    
    const idEsquema = this.estado.idEsquema;
    const tamañoPapel = this.estado.tamañoPapel;
    const textoMarkdown = this.estado.textoMarkdown;

    const esquema = window.ZineR.obtenerEsquema(idEsquema);

    // Actualizar badge de información
    this.elementos.infoVistaPrevia.innerHTML = `
        <span class="info-badge">${esquema.caras} caras</span>
        <span class="info-badge">${esquema.nombre}</span>
    `;

    // Analizar markdown
    const secciones = this.analizador.analizar(textoMarkdown);
    const bloquesContenido = this.analizador.aBloquesContenido(secciones);

    // Paginar contenido (async para esperar fuentes)
    const paginas = await this.paginacion.dividirEnPaginas(bloquesContenido, esquema, tamañoPapel);
    const paginasConNumeros = this.paginacion.agregarNumeroPaginas(paginas, this.estado.opciones.mostrarNumerosPagina);

    // Generar maquetación
    const maquetacion = this.motorMaquetacion.generarMaquetacion(paginasConNumeros, idEsquema, tamañoPapel);
    this.estado.maquetacion = maquetacion;

    // Renderizar al lienzo
    this.motorMaquetacion.renderizarEnLienzo(maquetacion, this.elementos.lienzoVistaPrevia);
};

/**
 * Alternar vista previa de markdown
 */
window.ZineR.Aplicacion.prototype.alternarVistaPreMarkdown = function () {
    const editor = this.elementos.editorMarkdown;
    const vistaPrevia = this.elementos.vistaPreMarkdown;

    if (vistaPrevia.classList.contains('hidden')) {
        // Mostrar vista previa
        const secciones = this.analizador.analizar(this.estado.textoMarkdown);
        vistaPrevia.innerHTML = secciones.htmlCrudo;
        vistaPrevia.classList.remove('hidden');
        editor.style.display = 'none';
    } else {
        // Mostrar editor
        vistaPrevia.classList.add('hidden');
        editor.style.display = 'block';
    }
};

/**
 * Importar archivo markdown
 */
window.ZineR.Aplicacion.prototype.importarArchivoMarkdown = async function (archivo) {
    if (!archivo) return;

    const self = this;

    try {
        const texto = await archivo.text();
        this.estado.textoMarkdown = texto;
        this.elementos.editorMarkdown.value = texto;
        this.actualizarVistaPrevia();
        this.mostrarToast('Archivo importado correctamente', 'success');
    } catch (error) {
        this.mostrarToast('Error al importar archivo', 'error');
        console.error(error);
    }
};

/**
 * Exportar a PDF
 */
window.ZineR.Aplicacion.prototype.exportarPDF = async function () {
    if (!this.estado.maquetacion) {
        this.mostrarToast('No hay contenido para exportar', 'error');
        return;
    }

    try {
        this.mostrarToast('Generando PDF...', 'info');
        await this.generadorPDF.generarPDF(this.estado.maquetacion, this.estado.opciones);
        this.mostrarToast('PDF descargado correctamente', 'success');
    } catch (error) {
        this.mostrarToast('Error al generar PDF', 'error');
        console.error(error);
    }
};

/**
 * Guardar borrador
 */
window.ZineR.Aplicacion.prototype.guardarBorrador = function () {
    const datos = {
        idEsquema: this.estado.idEsquema,
        tamañoPapel: this.estado.tamañoPapel,
        textoMarkdown: this.estado.textoMarkdown,
        imagenes: this.gestorImagenes.exportarDatos(),
        opciones: this.estado.opciones
    };

    if (this.almacenamiento.guardarBorrador(datos)) {
        this.mostrarToast('Borrador guardado', 'success');
    } else {
        this.mostrarToast('Error al guardar borrador', 'error');
    }
};

/**
 * Auto-guardar borrador (con debounce)
 */
window.ZineR.Aplicacion.prototype.autoGuardarBorrador = function () {
    const self = this;
    clearTimeout(this.temporizadorAutoGuardado);
    this.temporizadorAutoGuardado = setTimeout(function () {
        self.guardarBorrador();
    }, 2000);
};

/**
 * Cargar borrador si existe
 */
window.ZineR.Aplicacion.prototype.cargarBorradorSiExiste = function () {
    const borrador = this.almacenamiento.cargarBorrador();
    if (borrador) {
        this.estado.idEsquema = borrador.idEsquema || '4-caras';
        this.estado.tamañoPapel = borrador.tamañoPapel || window.ZineR.CONFIG.TAMAÑOS_PAPEL.a4;
        this.estado.textoMarkdown = borrador.textoMarkdown || '';
        
        // Cargar opciones del borrador, asegurando que existan las propiedades nuevas
        if (borrador.opciones) {
            this.estado.opciones = borrador.opciones;
            
            // Asegurar que fuentes existe
            if (!this.estado.opciones.fuentes) {
                this.estado.opciones.fuentes = {
                    titulo: 'serif',
                    subtitulo: 'serif',
                    cuerpo: 'serif',
                    firma: 'serif'
                };
            }
            
            // Asegurar que tamañosFuente existe (para borradores antiguos)
            if (!this.estado.opciones.tamañosFuente) {
                this.estado.opciones.tamañosFuente = {
                    titulo: 24,
                    subtitulo: 18,
                    cuerpo: 11,
                    firma: 10
                };
            }
        }

        if (borrador.imagenes) {
            this.gestorImagenes.importarDatos(borrador.imagenes);
        }

        // Actualizar UI
        this.elementos.editorMarkdown.value = this.estado.textoMarkdown;
        const radioFormato = document.querySelector(`input[name="format"][value="${this.estado.idEsquema}"]`);
        if (radioFormato) {
            radioFormato.checked = true;
        }
        this.actualizarControlesImagen();

        // Mapeo de claves para sincronizar UI
        const mapeoUI = {
            'titulo': 'title',
            'subtitulo': 'subtitle',
            'cuerpo': 'body',
            'firma': 'signature'
        };

        // Restaurar selectores de fuentes en la UI
        if (this.estado.opciones.fuentes) {
            Object.entries(mapeoUI).forEach(([claveEstado, idHtml]) => {
                const selector = document.getElementById(`font-${idHtml}`);
                if (selector && this.estado.opciones.fuentes[claveEstado]) {
                    selector.value = this.estado.opciones.fuentes[claveEstado];
                }
            });
        }

        // Restaurar inputs de tamaño de fuente en la UI
        if (this.estado.opciones.tamañosFuente) {
            Object.entries(mapeoUI).forEach(([claveEstado, idHtml]) => {
                const input = document.getElementById(`size-${idHtml}`);
                if (input && this.estado.opciones.tamañosFuente[claveEstado]) {
                    input.value = this.estado.opciones.tamañosFuente[claveEstado];
                }
            });
        }

        console.log('Borrador cargado');
    }
};

/**
 * Mostrar notificación toast
 */
window.ZineR.Aplicacion.prototype.mostrarToast = function (mensaje, tipo) {
    tipo = tipo || 'info';
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;

    this.elementos.contenedorToast.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 3000);
};

// Inicializar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        window.aplicacionZineR = new window.ZineR.Aplicacion();
    });
} else {
    window.aplicacionZineR = new window.ZineR.Aplicacion();
}
