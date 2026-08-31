/**
 * pieces.js - Catálogo Taxonómico y Visualmente Exacto de Piezas Andinas
 * 
 * Reglas de Taxonomía del Juego:
 * - Peones (p)  -> AVES (solas sin atuendo: Pajaritos, Colibríes, Búho, Guácharo, etc.)
 * - Caballos (n)-> MAMÍFEROS (Llama Sagrada, Osos de Anteojos, Danta/Tapir, Puma, Jaguar, Ocelote)
 * - Alfiles (b) -> PLANTAS Y HONGOS (Orquídeas, Frailejones, Helechos, Bromelias, Hongos, Mazorca)
 * - Torres (r)  -> TORRES Y FORTALEZAS (Piedra & Hiedra, Roble, Portal Musgoso, Obsidiana, Volcánica)
 * - Reinas (q)  -> SOBERANAS (Reinas humanas o antropomorfas con vestidos, tiaras y cetros)
 * - Reyes (k)   -> SOBERANOS (Reyes humanos o antropomorfos con coronas, mantos y báculos)
 */

const PIECE_CATALOG = {
  // ── 1. PEONES (AVES SOLAS) ────────────────────────────────────────────────
  // Blancas (Luz)
  'wp_bird_classic': {
    id: 'wp_bird_classic',
    color: 'w', role: 'p',
    nameEs: 'Pajarito del Valle',
    nameEn: 'Valley Bird',
    descEs: 'Pequeña ave andina cantora del valle.',
    descEn: 'Small singing Andean bird of the valley.',
    img: 'assets/pieces/catalog/wp_bird_classic.png'
  },
  'wp_bird_paramo': {
    id: 'wp_bird_paramo',
    color: 'w', role: 'p',
    nameEs: 'Pájaro del Páramo',
    nameEn: 'Páramo Bird',
    descEs: 'Ave resistente que anida en las alturas frías.',
    descEn: 'Hardy bird nesting in high mountain peaks.',
    img: 'assets/pieces/catalog/wp_bird_paramo.png'
  },
  'wp_hummingbird_fly': {
    id: 'wp_hummingbird_fly',
    color: 'w', role: 'p',
    nameEs: 'Colibrí en Vuelo',
    nameEn: 'Flying Hummingbird',
    descEs: 'Colibrí esmeralda con alas desplegadas.',
    descEn: 'Emerald hummingbird with wings spread in flight.',
    img: 'assets/pieces/catalog/wp_hummingbird_fly.png'
  },
  'wp_hummingbird_perch': {
    id: 'wp_hummingbird_perch',
    color: 'w', role: 'p',
    nameEs: 'Colibrí Guardián',
    nameEn: 'Perched Hummingbird',
    descEs: 'Colibrí posado vigilando los senderos.',
    descEn: 'Perched hummingbird guarding the trails.',
    img: 'assets/pieces/catalog/wp_hummingbird_perch.png'
  },
  'wp_hummingbird_blue': {
    id: 'wp_hummingbird_blue',
    color: 'w', role: 'p',
    nameEs: 'Colibrí Garganta Azul',
    nameEn: 'Blue-throated Hummingbird',
    descEs: 'Colibrí místico con reflejos violetas y azules.',
    descEn: 'Mystic hummingbird with violet and blue hues.',
    img: 'assets/pieces/catalog/wp_hummingbird_blue.png'
  },
  'wp_owl': {
    id: 'wp_owl',
    color: 'w', role: 'p',
    nameEs: 'Búho Sabio en Tronco',
    nameEn: 'Wise Mountain Owl',
    descEs: 'Búho vigilante posado en un tronco milenario.',
    descEn: 'Vigilant owl perched on an ancient trunk.',
    img: 'assets/pieces/catalog/wp_owl.png'
  },

  // Negras (Sombra)
  'bp_bird_classic': {
    id: 'bp_bird_classic',
    color: 'b', role: 'p',
    nameEs: 'Pájaro Sombrío',
    nameEn: 'Shadow Bird',
    descEs: 'Ave negra con garganta roja en pedestal oscuro.',
    descEn: 'Black bird with red throat on a dark pedestal.',
    img: 'assets/pieces/catalog/bp_bird_classic.png'
  },
  'bp_bird_paramo': {
    id: 'bp_bird_paramo',
    color: 'b', role: 'p',
    nameEs: 'Cuervo del Páramo',
    nameEn: 'Páramo Raven',
    descEs: 'Ave oscura centinela del viento andino.',
    descEn: 'Dark sentinel bird of the Andean winds.',
    img: 'assets/pieces/catalog/bp_bird_paramo.png'
  },
  'bp_rock_cock': {
    id: 'bp_rock_cock',
    color: 'b', role: 'p',
    nameEs: 'Guácharo de las Cavernas',
    nameEn: 'Cave Oilbird',
    descEs: 'Ave misteriosa con cresta roja de las rocas.',
    descEn: 'Mysterious red-crested rock bird of the caverns.',
    img: 'assets/pieces/catalog/bp_rock_cock.png'
  },
  'bp_frog_gold': {
    id: 'bp_frog_gold',
    color: 'b', role: 'p',
    nameEs: 'Rana Venenosa Dorada',
    nameEn: 'Golden Poison Frog',
    descEs: 'Pequeña rana de la selva con patrones amarillos.',
    descEn: 'Small jungle frog with vibrant yellow markings.',
    img: 'assets/pieces/catalog/bp_frog_gold.png'
  },
  'bp_frog_purple': {
    id: 'bp_frog_purple',
    color: 'b', role: 'p',
    nameEs: 'Rana Dardo Púrpura',
    nameEn: 'Purple Dart Frog',
    descEs: 'Rana nocturna con líneas moradas y doradas.',
    descEn: 'Nocturnal dart frog with purple and gold stripes.',
    img: 'assets/pieces/catalog/bp_frog_purple.png'
  },

  // ── 2. CABALLOS (MAMÍFEROS) ───────────────────────────────────────────────
  // Blancas (Luz)
  'wn_llama': {
    id: 'wn_llama',
    color: 'w', role: 'n',
    nameEs: 'Llama Sagrada',
    nameEn: 'Sacred Llama',
    descEs: 'Noble mamífero andino con gualdrapa ceremonial.',
    descEn: 'Noble Andean mammal with ceremonial saddle blanket.',
    img: 'assets/pieces/catalog/wn_llama.png'
  },
  'wn_bear_white': {
    id: 'wn_bear_white',
    color: 'w', role: 'n',
    nameEs: 'Oso del Páramo con Montura',
    nameEn: 'Saddled Páramo Bear',
    descEs: 'Oso de anteojos sobre pedestal verde con manta roja.',
    descEn: 'Spectacled bear on green pedestal with red blanket.',
    img: 'assets/pieces/catalog/wn_bear_white.png'
  },
  'wn_bear_green': {
    id: 'wn_bear_green',
    color: 'w', role: 'n',
    nameEs: 'Oso de la Selva',
    nameEn: 'Jungle Spectacled Bear',
    descEs: 'Oso de anteojos sentado en pedestal blanco ceremonial.',
    descEn: 'Spectacled bear sitting on ceremonial white pedestal.',
    img: 'assets/pieces/catalog/wn_bear_green.png'
  },
  'wn_tapir': {
    id: 'wn_tapir',
    color: 'w', role: 'n',
    nameEs: 'Danta Andina (Tapir)',
    nameEn: 'Andean Tapir',
    descEs: 'Coloso de los bosques de niebla con manto verde.',
    descEn: 'Colossus of the cloud forests with green blanket.',
    img: 'assets/pieces/catalog/wn_tapir.png'
  },

  // Negras (Sombra)
  'bn_bear_dark': {
    id: 'bn_bear_dark',
    color: 'b', role: 'n',
    nameEs: 'Oso de Anteojos Nocturno',
    nameEn: 'Night Spectacled Bear',
    descEs: 'Oso negro con gualdrapa andina geométrica.',
    descEn: 'Black bear with geometric Andean saddle blanket.',
    img: 'assets/pieces/catalog/bn_bear_dark.png'
  },
  'bn_panther': {
    id: 'bn_panther',
    color: 'b', role: 'n',
    nameEs: 'Jaguar Negro (Pantera)',
    nameEn: 'Black Jaguar',
    descEs: 'Felino sigiloso con manto de púrpura imperial.',
    descEn: 'Stealthy feline with imperial purple blanket.',
    img: 'assets/pieces/catalog/bn_panther.png'
  },
  'bn_puma': {
    id: 'bn_puma',
    color: 'b', role: 'n',
    nameEs: 'Puma Dorado',
    nameEn: 'Golden Puma',
    descEs: 'León de montaña andino ágil y veloz.',
    descEn: 'Agile and swift Andean mountain lion.',
    img: 'assets/pieces/catalog/bn_puma.png'
  },
  'bn_ocelot': {
    id: 'bn_ocelot',
    color: 'b', role: 'n',
    nameEs: 'Tigrillo Ocelote',
    nameEn: 'Spotted Ocelot',
    descEs: 'Felino manchado con cola anillada.',
    descEn: 'Spotted wildcat with ringed tail.',
    img: 'assets/pieces/catalog/bn_ocelot.png'
  },

  // ── 3. ALFILES (PLANTAS & HONGOS) ─────────────────────────────────────────
  // Blancas (Luz)
  'wb_white_orchid': {
    id: 'wb_white_orchid',
    color: 'w', role: 'b',
    nameEs: 'Orquídea Blanca',
    nameEn: 'White Orchid',
    descEs: 'Flor sagrada nacional en maceta de hojas verdes.',
    descEn: 'Sacred white orchid bloom in green leaf pot.',
    img: 'assets/pieces/catalog/wb_white_orchid.png'
  },
  'wb_gold_frailejon': {
    id: 'wb_gold_frailejon',
    color: 'w', role: 'b',
    nameEs: 'Frailejón Dorado',
    nameEn: 'Golden Frailejón',
    descEs: 'Planta sagrada del páramo andino de espiga dorada.',
    descEn: 'Sacred páramo plant with golden flowering spike.',
    img: 'assets/pieces/catalog/wb_gold_frailejon.png'
  },
  'wb_spiral_fern': {
    id: 'wb_spiral_fern',
    color: 'w', role: 'b',
    nameEs: 'Helecho Espiral',
    nameEn: 'Spiral Fern',
    descEs: 'Helecho arborescente con brote en espiral.',
    descEn: 'Tree fern with emerging spiral frond.',
    img: 'assets/pieces/catalog/wb_spiral_fern.png'
  },
  'wb_fire_bromeliad': {
    id: 'wb_fire_bromeliad',
    color: 'w', role: 'b',
    nameEs: 'Bromelia de Fuego',
    nameEn: 'Fire Bromeliad',
    descEs: 'Flor roja ardiente del dosel selvático.',
    descEn: 'Fiery red bloom of the jungle canopy.',
    img: 'assets/pieces/catalog/wb_fire_bromeliad.png'
  },
  'wb_sacred_corn': {
    id: 'wb_sacred_corn',
    color: 'w', role: 'b',
    nameEs: 'Mazorca Sagrada',
    nameEn: 'Sacred Maize',
    descEs: 'Planta de maíz dorado, símbolo de abundancia.',
    descEn: 'Golden maize plant, symbol of Andean abundance.',
    img: 'assets/pieces/catalog/wb_sacred_corn.png'
  },
  'wb_broad_leaf': {
    id: 'wb_broad_leaf',
    color: 'w', role: 'b',
    nameEs: 'Planta de Hojas Anchas',
    nameEn: 'Broadleaf Plant',
    descEs: 'Follaje verde tropical en maceta ornamental.',
    descEn: 'Tropical green foliage in an ornamental pot.',
    img: 'assets/pieces/catalog/wb_broad_leaf.png'
  },

  // Negras (Sombra)
  'bb_purple_orchid': {
    id: 'bb_purple_orchid',
    color: 'b', role: 'b',
    nameEs: 'Orquídea Morada',
    nameEn: 'Purple Orchid',
    descEs: 'Flor lunar violeta en maceta oscura.',
    descEn: 'Violet moon flower in a dark pot.',
    img: 'assets/pieces/catalog/bb_purple_orchid.png'
  },
  'bb_night_frailejon': {
    id: 'bb_night_frailejon',
    color: 'b', role: 'b',
    nameEs: 'Frailejón de la Noche',
    nameEn: 'Night Frailejón',
    descEs: 'Frailejón azul y violeta de energía mística.',
    descEn: 'Blue and violet frailejón of mystic energy.',
    img: 'assets/pieces/catalog/bb_night_frailejon.png'
  },
  'bb_purple_bromeliad': {
    id: 'bb_purple_bromeliad',
    color: 'b', role: 'b',
    nameEs: 'Bromelia Púrpura',
    nameEn: 'Purple Bromeliad',
    descEs: 'Bromelia de pétalos magenta y base verde.',
    descEn: 'Magenta bromeliad with emerald base.',
    img: 'assets/pieces/catalog/bb_purple_bromeliad.png'
  },
  'bb_magic_mushrooms': {
    id: 'bb_magic_mushrooms',
    color: 'b', role: 'b',
    nameEs: 'Hongos Mágicos',
    nameEn: 'Magic Mushrooms',
    descEs: 'Setas bioluminiscentes violetas de la selva.',
    descEn: 'Bioluminescent violet mushrooms of the forest.',
    img: 'assets/pieces/catalog/bb_magic_mushrooms.png'
  },
  'bb_purple_flowers': {
    id: 'bb_purple_flowers',
    color: 'b', role: 'b',
    nameEs: 'Flores de la Selva',
    nameEn: 'Jungle Flowers',
    descEs: 'Ramillete de campanillas violetas.',
    descEn: 'Bouquet of violet jungle blossoms.',
    img: 'assets/pieces/catalog/bb_purple_flowers.png'
  },

  // ── 4. TORRES (TORRES & FORTALEZAS) ───────────────────────────────────────
  // Blancas (Luz)
  'wr_stone_ivy': {
    id: 'wr_stone_ivy',
    color: 'w', role: 'r',
    nameEs: 'Torre de Piedra y Hiedra',
    nameEn: 'Ivy Stone Tower',
    descEs: 'Baluarte de piedra milenario con enredaderas.',
    descEn: 'Millenary stone bulwark with climbing vines.',
    img: 'assets/pieces/catalog/wr_stone_ivy.png'
  },
  'wr_tree_canopy': {
    id: 'wr_tree_canopy',
    color: 'w', role: 'r',
    nameEs: 'Fortaleza del Roble',
    nameEn: 'Oak Fortress',
    descEs: 'Torre tallada en la copa de un árbol ancestral.',
    descEn: 'Tower carved in the canopy of an ancient oak.',
    img: 'assets/pieces/catalog/wr_tree_canopy.png'
  },
  'wr_moss_gate': {
    id: 'wr_moss_gate',
    color: 'w', role: 'r',
    nameEs: 'Portal con Musgo',
    nameEn: 'Mossy Gateway',
    descEs: 'Torre de piedra con portal coronado de musgo.',
    descEn: 'Stone tower with moss-crowned arched gateway.',
    img: 'assets/pieces/catalog/wr_moss_gate.png'
  },

  // Negras (Sombra)
  'br_dark_stone': {
    id: 'br_dark_stone',
    color: 'b', role: 'r',
    nameEs: 'Torre de Obsidiana',
    nameEn: 'Obsidian Tower',
    descEs: 'Fortaleza inexpugnable de roca volcánica.',
    descEn: 'Impregnable fortress of dark volcanic rock.',
    img: 'assets/pieces/catalog/br_dark_stone.png'
  },
  'br_mushroom_tower': {
    id: 'br_mushroom_tower',
    color: 'b', role: 'r',
    nameEs: 'Torre Mística de Hongos',
    nameEn: 'Mystic Mushroom Tower',
    descEs: 'Bastión oscuro coronado por setas luminosas.',
    descEn: 'Dark bastion topped with glowing mushrooms.',
    img: 'assets/pieces/catalog/br_mushroom_tower.png'
  },
  'br_volcanic_rock': {
    id: 'br_volcanic_rock',
    color: 'b', role: 'r',
    nameEs: 'Torre de Rocas Volcánicas',
    nameEn: 'Volcanic Rock Tower',
    descEs: 'Baluarte de basalto y flores moradas.',
    descEn: 'Basalt bulwark with purple blossoms.',
    img: 'assets/pieces/catalog/br_volcanic_rock.png'
  },

  // ── 5. REINAS (SOBERANAS HUMANAS / ANTROPOMORFAS) ─────────────────────────
  // Blancas (Luz)
  'wq_white_queen': {
    id: 'wq_white_queen',
    color: 'w', role: 'q',
    nameEs: 'Reina de la Luz',
    nameEn: 'Queen of Light',
    descEs: 'Soberana con vestido verde, tiara dorada y flor blanca.',
    descEn: 'Sovereign with emerald dress, golden tiara, and white bloom.',
    img: 'assets/pieces/catalog/wq_white_queen.png'
  },
  'wq_floral_queen': {
    id: 'wq_floral_queen',
    color: 'w', role: 'q',
    nameEs: 'Reina Floral del Páramo',
    nameEn: 'Floral Queen of the Páramo',
    descEs: 'Soberana primaveral coronada de flores blancas.',
    descEn: 'Spring sovereign crowned with white blossoms.',
    img: 'assets/pieces/catalog/wq_floral_queen.png'
  },
  'wq_quetzal_queen': {
    id: 'wq_quetzal_queen',
    color: 'w', role: 'q',
    nameEs: 'Reina Tangara Real',
    nameEn: 'Royal Tanager Queen',
    descEs: 'Soberana antropomorfa alada con manto real y cetro.',
    descEn: 'Winged anthropomorphic sovereign with royal robe and scepter.',
    img: 'assets/pieces/catalog/wq_quetzal_queen.png'
  },

  // Negras (Sombra)
  'bq_night_queen': {
    id: 'bq_night_queen',
    color: 'b', role: 'q',
    nameEs: 'Reina de la Noche',
    nameEn: 'Queen of the Night',
    descEs: 'Soberana con vestido morado, corona y cetro floral.',
    descEn: 'Sovereign with purple gown, crown, and floral scepter.',
    img: 'assets/pieces/catalog/bq_night_queen.png'
  },
  'bq_shadow_queen': {
    id: 'bq_shadow_queen',
    color: 'b', role: 'q',
    nameEs: 'Reina de las Sombras',
    nameEn: 'Shadow Queen',
    descEs: 'Soberana con corona de pétalos violeta y manto oscuro.',
    descEn: 'Sovereign with violet petal crown and dark mantle.',
    img: 'assets/pieces/catalog/bq_shadow_queen.png'
  },
  'bq_raven_queen': {
    id: 'bq_raven_queen',
    color: 'b', role: 'q',
    nameEs: 'Reina Cuervo',
    nameEn: 'Raven Queen',
    descEs: 'Chamana antropomorfa con manto púrpura y báculo.',
    descEn: 'Anthropomorphic shaman with purple robe and staff.',
    img: 'assets/pieces/catalog/bq_raven_queen.png'
  },

  // ── 6. REYES (SOBERANOS HUMANOS / ANTROPOMORFOS) ──────────────────────────
  // Blancas (Luz)
  'wk_wise_king': {
    id: 'wk_wise_king',
    color: 'w', role: 'k',
    nameEs: 'Rey Sabio del Valle',
    nameEn: 'Wise King of the Valley',
    descEs: 'Monarca con corona de oro, barba y cetro de ramas.',
    descEn: 'Monarch with golden crown, beard, and branch scepter.',
    img: 'assets/pieces/catalog/wk_wise_king.png'
  },
  'wk_gold_king': {
    id: 'wk_gold_king',
    color: 'w', role: 'k',
    nameEs: 'Rey Dorado del Páramo',
    nameEn: 'Golden Páramo King',
    descEs: 'Monarca con corona de laurel, manto y cetro sagrado.',
    descEn: 'Monarch with laurel crown, mantle, and sacred scepter.',
    img: 'assets/pieces/catalog/wk_gold_king.png'
  },
  'wk_condor_king': {
    id: 'wk_condor_king',
    color: 'w', role: 'k',
    nameEs: 'Rey Cóndor Sagrado',
    nameEn: 'Sacred Condor King',
    descEs: 'Monarca antropomorfo supremo de las cumbres andinas.',
    descEn: 'Supreme anthropomorphic monarch of the Andean peaks.',
    img: 'assets/pieces/catalog/wk_condor_king.png'
  },

  // Negras (Sombra)
  'bk_night_king': {
    id: 'bk_night_king',
    color: 'b', role: 'k',
    nameEs: 'Rey de la Noche',
    nameEn: 'King of the Night',
    descEs: 'Monarca con manto púrpura, corona dorada y cetro.',
    descEn: 'Monarch with purple robe, golden crown, and scepter.',
    img: 'assets/pieces/catalog/bk_night_king.png'
  },
  'bk_purple_king': {
    id: 'bk_purple_king',
    color: 'b', role: 'k',
    nameEs: 'Rey Púrpura del Páramo',
    nameEn: 'Purple Páramo King',
    descEs: 'Soberano de las cumbres oscuras con cetro morado.',
    descEn: 'Sovereign of the dark peaks with purple scepter.',
    img: 'assets/pieces/catalog/bk_purple_king.png'
  },
  'bk_shaman_raven': {
    id: 'bk_shaman_raven',
    color: 'b', role: 'k',
    nameEs: 'Rey Chamán Cuervo',
    nameEn: 'Shaman Raven King',
    descEs: 'Gran sabio antropomorfo con corona y báculo místico.',
    descEn: 'Grand anthropomorphic sage with crown and mystic staff.',
    img: 'assets/pieces/catalog/bk_shaman_raven.png'
  }
};

// ── MAZOS / SETS PREDEFINIDOS (COHERENTES Y EXACTOS) ───────────────────────
const PIECE_DECKS = {
  'classic': {
    id: 'classic',
    nameEs: 'El Reino del Valle (Clásico)',
    nameEn: 'Valley Kingdom (Classic)',
    descEs: 'Pajaritos (Peones), Llama y Oso (Caballos), Orquídeas (Alfiles), Torres de Piedra, Reyes del Valle.',
    descEn: 'Birds (Pawns), Llama & Bear (Knights), Orchids (Bishops), Stone Towers, Valley Kings.',
    bannerImg: 'assets/pieces/catalog/wn_llama.png',
    pieces: {
      'wp': 'wp_bird_classic',   // Pajarito blanco
      'wn': 'wn_llama',          // Llama
      'wb': 'wb_white_orchid',   // Orquídea blanca
      'wr': 'wr_stone_ivy',      // Torre piedra
      'wq': 'wq_white_queen',    // Reina verde
      'wk': 'wk_wise_king',      // Rey sabio
      'bp': 'bp_bird_classic',   // Pájaro negro
      'bn': 'bn_bear_dark',      // Oso negro
      'bb': 'bb_purple_orchid',  // Orquídea morada
      'br': 'br_dark_stone',     // Torre obsidiana
      'bq': 'bq_night_queen',    // Reina noche
      'bk': 'bk_night_king'      // Rey noche
    }
  },
  'paramo': {
    id: 'paramo',
    nameEs: 'Guardianes del Páramo',
    nameEn: 'Páramo Guardians',
    descEs: 'Pájaros de Niebla (Peones), Oso y Jaguar (Caballos), Frailejones (Alfiles), Fortaleza y Hongos (Torres), Reyes del Páramo.',
    descEn: 'Mist Birds (Pawns), Bear & Jaguar (Knights), Frailejones (Bishops), Fortress & Mushroom Towers, Páramo Kings.',
    bannerImg: 'assets/pieces/catalog/wn_bear_white.png',
    pieces: {
      'wp': 'wp_bird_paramo',    // Pájaro páramo
      'wn': 'wn_bear_white',     // Oso con montura
      'wb': 'wb_gold_frailejon', // Frailejón dorado
      'wr': 'wr_tree_canopy',    // Fortaleza roble
      'wq': 'wq_floral_queen',   // Reina floral
      'wk': 'wk_gold_king',      // Rey dorado
      'bp': 'bp_bird_paramo',    // Cuervo páramo
      'bn': 'bn_panther',        // Jaguar negro
      'bb': 'bb_night_frailejon',// Frailejón noche
      'br': 'br_mushroom_tower', // Torre setas
      'bq': 'bq_shadow_queen',   // Reina sombras
      'bk': 'bk_purple_king'     // Rey púrpura
    }
  },
  'selva': {
    id: 'selva',
    nameEs: 'Fauna & Selva Sagrada',
    nameEn: 'Fauna & Sacred Jungle',
    descEs: 'Colibríes (Peones), Oso Verde y Puma (Caballos), Helecho y Bromelia (Alfiles), Portal y Roca (Torres), Reina Floral y Rey Cóndor.',
    descEn: 'Hummingbirds (Pawns), Green Bear & Puma (Knights), Fern & Bromeliad (Bishops), Gateway & Rock Towers, Floral Queen & Condor King.',
    bannerImg: 'assets/pieces/catalog/wn_bear_green.png',
    pieces: {
      'wp': 'wp_hummingbird_fly',   // Colibrí vuelo
      'wn': 'wn_bear_green',        // Oso selva
      'wb': 'wb_spiral_fern',       // Helecho
      'wr': 'wr_moss_gate',         // Portal musgo
      'wq': 'wq_floral_queen',      // Reina floral
      'wk': 'wk_condor_king',       // Rey cóndor
      'bp': 'bp_bird_paramo',       // Cuervo páramo
      'bn': 'bn_puma',              // Puma dorado
      'bb': 'bb_purple_bromeliad',  // Bromelia púrpura
      'br': 'br_volcanic_rock',     // Torre volcánica
      'bq': 'bq_shadow_queen',      // Reina sombras
      'bk': 'bk_shaman_raven'       // Rey chamán
    }
  },
  'mistico': {
    id: 'mistico',
    nameEs: 'Aves, Dantas & Chamanes',
    nameEn: 'Birds, Tapirs & Shamans',
    descEs: 'Búho y Guácharo (Peones), Danta y Ocelote (Caballos), Bromelia y Setas (Alfiles), Roble y Roca (Torres), Reina Tangara y Rey Chamán.',
    descEn: 'Owl & Oilbird (Pawns), Tapir & Ocelot (Knights), Bromeliad & Mushrooms (Bishops), Oak & Rock Towers, Tanager Queen & Shaman King.',
    bannerImg: 'assets/pieces/catalog/wn_tapir.png',
    pieces: {
      'wp': 'wp_owl',               // Búho sabio
      'wn': 'wn_tapir',             // Danta tapir
      'wb': 'wb_fire_bromeliad',    // Bromelia fuego
      'wr': 'wr_tree_canopy',       // Fortaleza roble
      'wq': 'wq_quetzal_queen',     // Reina tangara
      'wk': 'wk_condor_king',       // Rey cóndor
      'bp': 'bp_rock_cock',         // Guácharo
      'bn': 'bn_ocelot',            // Tigrillo ocelote
      'bb': 'bb_magic_mushrooms',   // Hongos mágicos
      'br': 'br_volcanic_rock',     // Torre volcánica
      'bq': 'bq_raven_queen',       // Reina cuervo
      'bk': 'bk_shaman_raven'       // Rey chamán
    }
  }
};

// ── ADMINISTRADOR CENTRAL DE MAZOS ─────────────────────────────────────────
class PieceDeckManager {
  constructor() {
    this.storageKeyDeck = 'jaque_active_deck_id';
    this.storageKeyCustom = 'jaque_custom_deck_pieces';
    this.currentDeckId = 'classic';
    this.customDeck = Object.assign({}, PIECE_DECKS['classic'].pieces);
    this.listeners = [];

    this.load();
    this.applyToGlobal();
  }

  load() {
    try {
      const savedDeck = localStorage.getItem(this.storageKeyDeck);
      if (savedDeck && (PIECE_DECKS[savedDeck] || savedDeck === 'custom')) {
        this.currentDeckId = savedDeck;
      }
      const savedCustom = localStorage.getItem(this.storageKeyCustom);
      if (savedCustom) {
        this.customDeck = Object.assign({}, this.customDeck, JSON.parse(savedCustom));
      }
    } catch (e) {
      console.warn('Error cargando mazo de piezas:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKeyDeck, this.currentDeckId);
      localStorage.setItem(this.storageKeyCustom, JSON.stringify(this.customDeck));
    } catch (e) {
      console.warn('Error guardando mazo de piezas:', e);
    }
  }

  getActivePieces() {
    if (this.currentDeckId === 'custom') {
      return this.customDeck;
    }
    const deck = PIECE_DECKS[this.currentDeckId];
    return deck ? deck.pieces : PIECE_DECKS['classic'].pieces;
  }

  applyToGlobal() {
    const active = this.getActivePieces();
    window.PIECE_IMAGES = {};
    for (const [slot, catalogId] of Object.entries(active)) {
      const item = PIECE_CATALOG[catalogId];
      window.PIECE_IMAGES[slot] = item ? item.img : `assets/pieces/${slot}.png`;
    }
    this.notifyListeners();
  }

  setDeck(deckId) {
    if (PIECE_DECKS[deckId] || deckId === 'custom') {
      this.currentDeckId = deckId;
      this.save();
      this.applyToGlobal();
      return true;
    }
    return false;
  }

  setCustomPiece(slot, catalogId) {
    if (PIECE_CATALOG[catalogId]) {
      this.customDeck[slot] = catalogId;
      this.currentDeckId = 'custom';
      this.save();
      this.applyToGlobal();
      return true;
    }
    return false;
  }

  getPieceMeta(catalogId) {
    return PIECE_CATALOG[catalogId] || null;
  }

  getAvailablePiecesForSlot(slot) {
    const color = slot[0]; // 'w' or 'b'
    const role  = slot[1]; // 'p', 'n', 'b', 'r', 'q', 'k'
    return Object.values(PIECE_CATALOG).filter(p => p.color === color && p.role === role);
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.getActivePieces(), this.currentDeckId); } catch(e) { console.error(e); }
    });
  }
}

// Inicialización global
window.PIECE_CATALOG = PIECE_CATALOG;
window.PIECE_DECKS = PIECE_DECKS;
window.pieceDeckManager = new PieceDeckManager();
