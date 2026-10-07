/**
 * colors.js — Sistema de Sinestesia Numérica y Código Cromático Universal
 * 
 * Cada dígito del 0 al 9 posee una identidad de color única y de alto contraste,
 * optimizada para reconocimiento visual subconsciente (reconocer el color antes de leer la cifra).
 * 
 * 0: Gris Titanio (#475569) — Ausencia / Neutro
 * 1: Azul Cielo Brillante (#0284c7) — Inicio / Unidad
 * 2: Verde Lima Neón (#22c55e) — Gemelos / Dobles
 * 3: Rojo Rubí Eléctrico (#ef4444) — Tríada / Acción
 * 4: Naranja Mandarina (#f97316) — Cuádruple / Fuego
 * 5: Morado Violeta (#a855f7) — Pentágono / Reloj solar
 * 6: Amarillo Ámbar (#eab308) — Hexágono / Resonancia
 * 7: Cian Esmeralda (#06b6d4) — Puente / Místico
 * 8: Rosa Fucsia Neón (#ec4899) — Octogonal / Fuerza
 * 9: Marrón Dorado / Bronce (#b45309) — Sabiduría / Nueve hojas
 */

const DIGIT_COLORS = {
  0: '#475569',
  1: '#0284c7',
  2: '#22c55e',
  3: '#ef4444',
  4: '#f97316',
  5: '#a855f7',
  6: '#eab308',
  7: '#06b6d4',
  8: '#ec4899',
  9: '#b45309'
};

const DIGIT_GLOWS = {
  0: 'rgba(71, 85, 105, 0.65)',
  1: 'rgba(2, 132, 199, 0.75)',
  2: 'rgba(34, 197, 94, 0.75)',
  3: 'rgba(239, 68, 68, 0.75)',
  4: 'rgba(249, 115, 22, 0.75)',
  5: 'rgba(168, 85, 247, 0.75)',
  6: 'rgba(234, 179, 8, 0.75)',
  7: 'rgba(6, 182, 212, 0.75)',
  8: 'rgba(236, 72, 153, 0.75)',
  9: 'rgba(180, 83, 9, 0.75)'
};

/**
 * Obtiene el color representativo de un número.
 * Si tiene 2 dígitos (ej. 36), se usa el color del dígito de mayor peso o el último dígito
 * según la familia. Por consistencia visual, usamos el último dígito (unidades) o primer dígito.
 * Para números de 1 dígito es exacto; para números >= 10, combina armónicamente ambos.
 */
function getNumberColor(num) {
  const s = Math.abs(num).toString();
  const lastDigit = parseInt(s[s.length - 1], 10);
  return DIGIT_COLORS[lastDigit] || '#06b6d4';
}

function getNumberGradient(num, ctx, x, y, r) {
  const s = Math.abs(num).toString();
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  
  if (s.length === 1) {
    const c = DIGIT_COLORS[parseInt(s, 10)];
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, c);
    grad.addColorStop(1, '#090d16');
  } else {
    // Número de 2 dígitos: fusiona el color de las decenas con el de las unidades
    const c1 = DIGIT_COLORS[parseInt(s[0], 10)];
    const c2 = DIGIT_COLORS[parseInt(s[1], 10)];
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, c1);
    grad.addColorStop(0.85, c2);
    grad.addColorStop(1, '#090d16');
  }
  return grad;
}

function getNumberGlow(num) {
  const s = Math.abs(num).toString();
  const lastDigit = parseInt(s[s.length - 1], 10);
  return DIGIT_GLOWS[lastDigit] || 'rgba(6, 182, 212, 0.75)';
}

window.PulseColors = {
  DIGIT_COLORS,
  DIGIT_GLOWS,
  getNumberColor,
  getNumberGradient,
  getNumberGlow
};
