export function getCSSVariable(variable) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

export function getTextStyle(type) {
  const defaults = {
    h1: { fontSize: '13px', fill: '#FFFFFF' },
    h2: { fontSize: '11px', fill: '#FFFFFF' },
    h3: { fontSize: '10px', fill: '#FFFFFF' },
    h4: { fontSize: '9px', fill: '#FFFFFF' },
    p:  { fontSize: '9px', fill: '#FFFFFF' },
    p1:  { fontSize: '9px', fill: '#000000' },
  };

  let style;
  switch(type) {
    case 'h1': 
      style = { 
        fontSize: getCSSVariable('--h1-font-size') || defaults.h1.fontSize, 
        fill: getCSSVariable('--h1-color') || defaults.h1.fill 
      };
      break;
    case 'h2': 
      style = { 
        fontSize: getCSSVariable('--h2-font-size') || defaults.h2.fontSize, 
        fill: getCSSVariable('--h2-color') || defaults.h2.fill 
      };
      break;
    case 'h3': 
      style = { 
        fontSize: getCSSVariable('--h3-font-size') || defaults.h3.fontSize, 
        fill: getCSSVariable('--h3-color') || defaults.h3.fill 
      };
      break;
    case 'h4': 
      style = { 
        fontSize: getCSSVariable('--h4-font-size') || defaults.h4.fontSize, 
        fill: getCSSVariable('--h4-color') || defaults.h4.fill 
      };
      break;
    case 'p': 
      style = { 
        fontSize: getCSSVariable('--p-font-size') || defaults.p.fontSize, 
        fill: getCSSVariable('--p-color') || defaults.p.fill 
      };
      break;
    default: 
      style = { fontSize: '10px', fill: '#FFFFFF' };
  }
  // Se añade la propiedad para que textos largos continúen en la siguiente línea
  style.whiteSpace = getCSSVariable(`--${type}-white-space`) || 'normal';
  return style;
}
