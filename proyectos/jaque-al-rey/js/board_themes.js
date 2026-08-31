/**
 * board_themes.js - Gestor de Terrenos y Personalización de Casillas del Tablero
 * 
 * Permite seleccionar preajustes temáticos o personalizar de forma independiente
 * las casillas claras (luz) y oscuras (sombra) con texturas y colores andinos.
 */

const LIGHT_TILES = {
  'stone_light': {
    id: 'stone_light',
    nameEs: 'Piedra Clara',
    nameEn: 'Light Stone',
    descEs: 'Piedra tallada del valle.',
    img: 'assets/tiles/board_light_stone.png',
    color: '#B8A882'
  },
  'grass_light': {
    id: 'grass_light',
    nameEs: 'Césped Claro',
    nameEn: 'Light Grass',
    descEs: 'Musgo y pasto iluminado.',
    img: 'assets/tiles/board_light_grass.png',
    color: '#8BAA60'
  },
  'clay_light': {
    id: 'clay_light',
    nameEs: 'Arcilla Clara',
    nameEn: 'Light Clay',
    descEs: 'Terracota cálida andina.',
    img: 'assets/tiles/board_light_clay.png',
    color: '#C97B50'
  },
  'parchment_light': {
    id: 'parchment_light',
    nameEs: 'Pergamino Dorado',
    nameEn: 'Golden Parchment',
    descEs: 'Papel antiguo de códice.',
    img: 'assets/tiles/pattern_parchment.png',
    color: '#DDCFB4'
  },
  'wood_light': {
    id: 'wood_light',
    nameEs: 'Madera Sagrada',
    nameEn: 'Sacred Wood',
    descEs: 'Corteza de roble ancestral.',
    img: 'assets/tiles/pattern_wood_bark.png',
    color: '#7A4822'
  },
  'water_light': {
    id: 'water_light',
    nameEs: 'Agua Cristalina',
    nameEn: 'Crystal Water',
    descEs: 'Manantial de páramo.',
    img: 'assets/tiles/water_light.png',
    color: '#4EA3A1'
  }
};

const DARK_TILES = {
  'stone_dark': {
    id: 'stone_dark',
    nameEs: 'Piedra Oscura',
    nameEn: 'Dark Stone',
    descEs: 'Roca volcánica oscura.',
    img: 'assets/tiles/board_dark_stone.png',
    color: '#3A3A3A'
  },
  'grass_dark': {
    id: 'grass_dark',
    nameEs: 'Césped Oscuro',
    nameEn: 'Dark Grass',
    descEs: 'Páramo en sombra.',
    img: 'assets/tiles/board_dark_grass.png',
    color: '#2A3E20'
  },
  'clay_dark': {
    id: 'clay_dark',
    nameEs: 'Arcilla Oscura',
    nameEn: 'Dark Clay',
    descEs: 'Adobe oscuro cocido.',
    img: 'assets/tiles/board_dark_clay.png',
    color: '#5E2010'
  },
  'slate_dark': {
    id: 'slate_dark',
    nameEs: 'Pizarra & Obsidiana',
    nameEn: 'Obsidian Slate',
    descEs: 'Piedra negra pulida.',
    img: 'assets/tiles/pattern_slate.png',
    color: '#26292E'
  },
  'jungle_dark': {
    id: 'jungle_dark',
    nameEs: 'Selva Profunda',
    nameEn: 'Deep Jungle',
    descEs: 'Follaje sombrío esmeralda.',
    img: 'assets/tiles/pattern_jungle_dark.png',
    color: '#142820'
  },
  'water_dark': {
    id: 'water_dark',
    nameEs: 'Agua Profunda',
    nameEn: 'Deep Water',
    descEs: 'Laguna sagrada andina.',
    img: 'assets/tiles/water_dark.png',
    color: '#1F434E'
  }
};

const BOARD_PRESETS = {
  'preset_stone': {
    id: 'preset_stone',
    nameEs: 'Piedra Ancestral',
    nameEn: 'Ancient Stone',
    descEs: 'Textura clásica de piedra andina en luz y sombra.',
    descEn: 'Classic Andean light & dark stone texture.',
    light: 'stone_light',
    dark: 'stone_dark'
  },
  'preset_grass': {
    id: 'preset_grass',
    nameEs: 'Páramo Andino',
    nameEn: 'Andean Páramo',
    descEs: 'Musgo y pastizales de alta montaña.',
    descEn: 'High altitude moss and mountain grasslands.',
    light: 'grass_light',
    dark: 'grass_dark'
  },
  'preset_clay': {
    id: 'preset_clay',
    nameEs: 'Arcilla Imperial',
    nameEn: 'Imperial Clay',
    descEs: 'Terracota incaica y adobe ceremonial.',
    descEn: 'Incan terracotta and ceremonial adobe.',
    light: 'clay_light',
    dark: 'clay_dark'
  },
  'preset_contrast': {
    id: 'preset_contrast',
    nameEs: 'Alto Contraste',
    nameEn: 'High Contrast',
    descEs: 'Pergamino dorado luminoso y pizarra de obsidiana.',
    descEn: 'Luminous gold parchment & dark obsidian slate.',
    light: 'parchment_light',
    dark: 'slate_dark'
  },
  'preset_wood': {
    id: 'preset_wood',
    nameEs: 'Madera & Selva',
    nameEn: 'Wood & Jungle',
    descEs: 'Corteza de roble ancestral y follaje sombrío.',
    descEn: 'Ancient oak bark and deep shadow jungle.',
    light: 'wood_light',
    dark: 'jungle_dark'
  },
  'preset_water': {
    id: 'preset_water',
    nameEs: 'Laguna Sagrada',
    nameEn: 'Sacred Lagoon',
    descEs: 'Aguas cristalinas y profundidades de páramo.',
    descEn: 'Crystal springs & deep Andean waters.',
    light: 'water_light',
    dark: 'water_dark'
  }
};

class BoardThemeManager {
  constructor() {
    this.storageKeyPreset = 'jaque_board_preset';
    this.storageKeyLight = 'jaque_board_light_tile';
    this.storageKeyDark = 'jaque_board_dark_tile';

    this.currentPresetId = 'preset_stone';
    this.currentLightTile = 'stone_light';
    this.currentDarkTile = 'stone_dark';
    this.listeners = [];

    this.load();
    this.applyToDOM();
  }

  load() {
    try {
      const savedPreset = localStorage.getItem(this.storageKeyPreset);
      if (savedPreset && (BOARD_PRESETS[savedPreset] || savedPreset === 'custom')) {
        this.currentPresetId = savedPreset;
      }
      const savedLight = localStorage.getItem(this.storageKeyLight);
      if (savedLight && LIGHT_TILES[savedLight]) {
        this.currentLightTile = savedLight;
      }
      const savedDark = localStorage.getItem(this.storageKeyDark);
      if (savedDark && DARK_TILES[savedDark]) {
        this.currentDarkTile = savedDark;
      }
    } catch (e) {
      console.warn('Error cargando tema de tablero:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKeyPreset, this.currentPresetId);
      localStorage.setItem(this.storageKeyLight, this.currentLightTile);
      localStorage.setItem(this.storageKeyDark, this.currentDarkTile);
    } catch (e) {
      console.warn('Error guardando tema de tablero:', e);
    }
  }

  setPreset(presetId) {
    const preset = BOARD_PRESETS[presetId];
    if (preset) {
      this.currentPresetId = presetId;
      this.currentLightTile = preset.light;
      this.currentDarkTile = preset.dark;
      this.save();
      this.applyToDOM();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  setLightTile(tileId) {
    if (LIGHT_TILES[tileId]) {
      this.currentLightTile = tileId;
      this.currentPresetId = this.findMatchingPreset() || 'custom';
      this.save();
      this.applyToDOM();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  setDarkTile(tileId) {
    if (DARK_TILES[tileId]) {
      this.currentDarkTile = tileId;
      this.currentPresetId = this.findMatchingPreset() || 'custom';
      this.save();
      this.applyToDOM();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  findMatchingPreset() {
    for (const [id, preset] of Object.entries(BOARD_PRESETS)) {
      if (preset.light === this.currentLightTile && preset.dark === this.currentDarkTile) {
        return id;
      }
    }
    return null;
  }

  cycleNextPreset() {
    const keys = Object.keys(BOARD_PRESETS);
    const currIdx = keys.indexOf(this.currentPresetId);
    const nextIdx = (currIdx + 1) % keys.length;
    this.setPreset(keys[nextIdx]);
    return BOARD_PRESETS[keys[nextIdx]];
  }

  applyToDOM() {
    const light = LIGHT_TILES[this.currentLightTile] || LIGHT_TILES['stone_light'];
    const dark = DARK_TILES[this.currentDarkTile] || DARK_TILES['stone_dark'];

    const root = document.documentElement;
    root.style.setProperty('--tile-light-bg', `url('../${light.img}')`);
    root.style.setProperty('--tile-light-color', light.color);
    root.style.setProperty('--tile-dark-bg', `url('../${dark.img}')`);
    root.style.setProperty('--tile-dark-color', dark.color);
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb({ light: this.currentLightTile, dark: this.currentDarkTile, preset: this.currentPresetId }); } catch(e) { console.error(e); }
    });
  }
}

// Exposición global
window.LIGHT_TILES = LIGHT_TILES;
window.DARK_TILES = DARK_TILES;
window.BOARD_PRESETS = BOARD_PRESETS;
window.boardThemeManager = new BoardThemeManager();
