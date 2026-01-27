// foldingSchemes.js - Lógica de plegado y mapeo de páginas
// Este módulo define cómo las páginas lógicas (1, 2, 3...) se mapean a las posiciones físicas en la hoja de papel.

window.ZineR = window.ZineR || {};

/**
 * Los Esquemas de Plegado definen cómo las páginas lógicas se mapean a posiciones de impresión físicas.
 * Cada esquema incluye:
 * - id: Identificador único
 * - nombre: Nombre legible para el usuario
 * - caras: Número total de páginas/caras lógicas
 * - diseño: Dimensiones de la cuadrícula en la hoja {filas, columnas}
 * - mapeo: Array donde el índice es el número de página lógica (1-based) y el valor es un objeto {fila, columna, rotacion, lado}
 * - instrucciones: Array de strings con pasos para doblar/cortar
 * - requiereCorte: Booleano, si necesita tijeras
 * - requiereDuplex: Booleano, si necesita impresión doble cara
 */

window.ZineR.ESQUEMAS_PLEGADO = {
    '4-caras': {
        id: '4-caras',
        nombre: '4 Caras - Plegado Simple',
        caras: 4,
        diseño: { filas: 2, columnas: 2 },
        requiereCorte: false,
        requiereDuplex: false,

        // Mapeo: índice de página lógica -> {fila, columna, rotacion}
        // Diseño de impresión (vista frontal):
        // Fila 0 (arriba - rotada 180): [4↓] [1↓]
        // Fila 1 (abajo - normal):      [3]  [2]
        //
        // Explicación:
        // Pag 1 (Portada): Arriba Derecha (invertida para que al doblar quede al frente)
        // Pag 2: Abajo Derecha (interior derecha)
        // Pag 3: Abajo Izquierda (interior izquierda)
        // Pag 4 (Contraportada): Arriba Izquierda (invertida para que al doblar quede atrás)
        mapeo: [
            null, // índice 0 no usado
            { fila: 0, columna: 1, rotacion: 180 },   // Página 1 (Portada)
            { fila: 1, columna: 1, rotacion: 0 },     // Página 2
            { fila: 1, columna: 0, rotacion: 0 },     // Página 3
            { fila: 0, columna: 0, rotacion: 180 }    // Página 4 (Contraportada)
        ],

        instrucciones: [
            '1. Dobla la hoja por la mitad horizontalmente (el borde superior hacia atrás).',
            '2. Dobla nuevamente por la mitad verticalmente.',
            '3. ¡Listo! Tienes un fanzine de 4 caras: Portada, 2 páginas interiores y contraportada.'
        ]
    },

    '8-caras': {
        id: '8-caras',
        nombre: '8 Caras - Fanzine Clásico (1 Hoja)',
        caras: 8,
        diseño: { filas: 2, columnas: 4 },
        requiereCorte: true,
        requiereDuplex: false,

        // Esquema Estándar "One Page Zine" (Mini-Zine):
        //
        // Hoja desplegada (Lado impreso):
        // -----------------------------------------------------
        // |  Top-Left | Top-Mid-L | Top-Mid-R |  Top-Right  |  <- Fila 0 (Invertida 180°)
        // |   Pg 5    |   Pg 6    |   Pg 7    |    Pg 8     |     (Contraportada)
        // |     ↓     |     ↓     |     ↓     |      ↓      |
        // -----------------------------------------------------
        // | Bot-Left  | Bot-Mid-L | Bot-Mid-R |  Bot-Right  |  <- Fila 1 (Normal 0°)
        // |   Pg 4    |   Pg 3    |   Pg 2    |    Pg 1     |     (Portada)
        // |           |           |           |             |
        // -----------------------------------------------------
        //
        // Nota: Todas las páginas de la fila superior deben estar rotadas 180 grados
        // para que al doblar el fanzine queden orientadas correctamente.

        mapeo: [
            null,
            { fila: 1, columna: 1, rotacion: 0 },     // Pg 1 (Portada) - Pos: Abajo, 2da col
            { fila: 1, columna: 2, rotacion: 0 },     // Pg 2           - Pos: Abajo, 3ra col
            { fila: 1, columna: 3, rotacion: 0 },     // Pg 3           - Pos: Abajo, 4ta col
            { fila: 0, columna: 3, rotacion: 180 },   // Pg 4           - Pos: Arriba, 4ta col (Inv)
            { fila: 0, columna: 2, rotacion: 180 },   // Pg 5           - Pos: Arriba, 3ra col (Inv)
            { fila: 0, columna: 1, rotacion: 180 },   // Pg 6           - Pos: Arriba, 2da col (Inv)
            { fila: 0, columna: 0, rotacion: 180 },   // Pg 7           - Pos: Arriba, 1ra col (Inv)
            { fila: 1, columna: 0, rotacion: 0 }      // Pg 8 (Contra)  - Pos: Abajo, 1ra col
        ],

        instrucciones: [
            '1. Dobla la hoja por la mitad a lo largo (horizontalmente). Desdobla.',
            '2. Dobla por la mitad a lo ancho (verticalmente). Desdobla.',
            '3. Dobla los extremos (izquierdo y derecho) hacia el centro vertical. Desdobla.',
            '4. Ahora deberías tener 8 rectángulos marcados.',
            '5. Dobla la hoja por la mitad a lo ancho (como en el paso 2).',
            '6. CORTA por la línea central, pero SOLO a través de los dos paneles del medio (desde el doblez hasta el siguiente pliegue).',
            '7. Desdobla todo. Debería haber un corte en el centro de la hoja.',
            '8. Dobla la hoja a lo largo (paso 1). Sujeta los extremos y empújalos hacia el centro; el corte se abrirá formando un diamante.',
            '9. Sigue empujando hasta formar una cruz (X) con las páginas.',
            '10. Aplana las páginas para formar el librito. La portada es la página 1.'
        ]
    },

    '6-caras': {
        id: '6-caras',
        nombre: '6 Caras - Tríptico (con corte)',
        caras: 6,
        diseño: { filas: 2, columnas: 3 },
        requiereCorte: true,
        requiereDuplex: false,

        // Diseño One-Page para 6 caras (similar a 8-caras pero 2x3):
        // Se imprime, se corta horizontalmente entre las filas, 
        // se pliega cada tira y se encuadernan.
        //
        // Hoja desplegada (lado impreso):
        // ----------------------------------
        // | Pg 4↓ | Pg 5↓ | Pg 6↓ |  <- Fila 0 (Invertida 180°)
        // ----------------------------------
        // | Pg 3  | Pg 2  | Pg 1  |  <- Fila 1 (Normal) - Portada en esquina derecha
        // ----------------------------------
        //   col0    col1    col2
        //
        // Después de cortar y plegar: Portada(1) -> 2 -> 3 -> 4 -> 5 -> 6(Contra)

        mapeo: [
            null,
            { fila: 1, columna: 2, rotacion: 0 },     // Pg 1 (Portada)
            { fila: 1, columna: 1, rotacion: 0 },     // Pg 2
            { fila: 1, columna: 0, rotacion: 0 },     // Pg 3
            { fila: 0, columna: 0, rotacion: 180 },   // Pg 4
            { fila: 0, columna: 1, rotacion: 180 },   // Pg 5
            { fila: 0, columna: 2, rotacion: 180 }    // Pg 6 (Contraportada)
        ],

        instrucciones: [
            '1. Imprime la hoja.',
            '2. CORTA horizontalmente por la línea central (entre las dos filas).',
            '3. Dobla cada tira por la mitad.',
            '4. Inserta una tira dentro de la otra para formar el librito.',
            '5. La portada (Pg 1) quedará al frente.'
        ]
    },

    '16-caras': {
        id: '16-caras',
        nombre: '16 Caras - Fanzine Extendido (con corte)',
        caras: 16,
        diseño: { filas: 4, columnas: 4 },
        requiereCorte: true,
        requiereDuplex: false,

        // Diseño One-Page para 16 caras en papel Legal (o A4 extendido):
        // Basado en el patrón clásico de 16-page zine.
        //
        // La hoja se divide en 4x4 = 16 celdas.
        // La imposición sigue el patrón para que al cortar y plegar
        // quede un librito de 16 páginas.
        //
        // Hoja desplegada (lado impreso) - Papel en orientación VERTICAL:
        // ------------------------------------------------
        // | Pg 16↓| Pg 1↓ | Pg 2↓ | Pg 15↓|  <- Fila 0 (Invertida 180°)
        // ------------------------------------------------
        // | Pg 14↓| Pg 3↓ | Pg 4↓ | Pg 13↓|  <- Fila 1 (Invertida 180°)
        // ------------------------------------------------
        // | Pg 11 | Pg 6  | Pg 5  | Pg 12 |  <- Fila 2 (Normal)
        // ------------------------------------------------
        // | Pg 9  | Pg 8  | Pg 7  | Pg 10 |  <- Fila 3 (Normal)
        // ------------------------------------------------
        //   col0    col1    col2    col3
        //
        // Pasos: Cortar en 4 tiras horizontales, doblar cada una, anidar.

        mapeo: [
            null,
            { fila: 0, columna: 1, rotacion: 180 },   // Pg 1 (Portada)
            { fila: 0, columna: 2, rotacion: 180 },   // Pg 2
            { fila: 1, columna: 1, rotacion: 180 },   // Pg 3
            { fila: 1, columna: 2, rotacion: 180 },   // Pg 4
            { fila: 2, columna: 2, rotacion: 0 },     // Pg 5
            { fila: 2, columna: 1, rotacion: 0 },     // Pg 6
            { fila: 3, columna: 2, rotacion: 0 },     // Pg 7
            { fila: 3, columna: 1, rotacion: 0 },     // Pg 8
            { fila: 3, columna: 0, rotacion: 0 },     // Pg 9
            { fila: 3, columna: 3, rotacion: 0 },     // Pg 10
            { fila: 2, columna: 0, rotacion: 0 },     // Pg 11
            { fila: 2, columna: 3, rotacion: 0 },     // Pg 12
            { fila: 1, columna: 3, rotacion: 180 },   // Pg 13
            { fila: 1, columna: 0, rotacion: 180 },   // Pg 14
            { fila: 0, columna: 3, rotacion: 180 },   // Pg 15
            { fila: 0, columna: 0, rotacion: 180 }    // Pg 16 (Contraportada)
        ],

        instrucciones: [
            '1. Imprime en papel Legal (8.5" × 14") u Oficio.',
            '2. CORTA en 4 tiras horizontales iguales.',
            '3. Dobla cada tira por la mitad verticalmente.',
            '4. Anida las tiras en orden: tira superior afuera, luego las siguientes.',
            '5. La portada (Pg 1) quedará al frente del librito.'
        ]
    }
};

/**
 * Obtener un esquema de plegado por ID
 */
window.ZineR.obtenerEsquema = function (idEsquema) {
    return window.ZineR.ESQUEMAS_PLEGADO[idEsquema] || window.ZineR.ESQUEMAS_PLEGADO['4-caras'];
};

/**
 * Obtener la posición y rotación para un número de página lógico
 */
window.ZineR.obtenerPosicionPagina = function (esquema, numeroPagina) {
    if (numeroPagina < 1 || numeroPagina > esquema.caras) {
        return null;
    }
    return esquema.mapeo[numeroPagina];
};

/**
 * Obtener todas las páginas para un lado específico (frente/dorso) - para impresión duplex
 */
window.ZineR.obtenerPaginasPorLado = function (esquema, lado) {
    const paginas = [];
    for (let i = 1; i <= esquema.caras; i++) {
        const pos = esquema.mapeo[i];
        // Si el esquema no define lados (simplex), todas las páginas van en 'frente'
        if (!pos.lado || pos.lado === lado || (lado === 'frente' && !esquema.requiereDuplex)) {
            paginas.push({ numeroPagina: i, ...pos });
        }
    }
    return paginas;
};

/**
 * Calcular las dimensiones físicas de cada cara basado en tamaño de papel y diseño
 */
window.ZineR.calcularDimensionesCara = function (tamañoPapel, esquema) {
    const anchoCara = tamañoPapel.ancho / esquema.diseño.columnas;
    const altoCara = tamañoPapel.alto / esquema.diseño.filas;

    return {
        ancho: anchoCara,
        alto: altoCara,
        aspecto: anchoCara / altoCara
    };
};
