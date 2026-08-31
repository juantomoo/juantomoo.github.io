# ♟️ Jaque al Rey — Aventura en los Andes / Checkmate to the King

Un videojuego interactivo de ajedrez diseñado con estética de **consola portátil (estilo Pokémon Sun & Moon / Nintendo 3DS)** y ambientado en el **bosque húmedo y selva tropical de los Andes**.

Inspirado en los principios de la **pedagogía de alto rendimiento, la neurocognición y la teoría de la carga cognitiva** (*Método de los Pasos holandés, Artur Yusupov y la Escuela Soviética*).

---

## 🌐 Internacionalización (Español & English)

* **Idioma por Defecto:** Español (`es`).
* **Soporte Completo en Inglés (`en`):** 
  - Todas las 10 lecciones de la Academia, diálogos del Maestro Búho y misiones.
  - Los 4 minijuegos cognitivos (Planificador de Rutas, Laberinto de la Llama, Space Invaders, Lucha de Reyes).
  - Los 8 puzzles tácticos con pistas y explicaciones.
  - Personalidades de los bots (*Curious Bird*, *Wise Llama*, *Guardian Bear*) y consejos del Coach.
  - Rangos de maestría (*Valley Apprentice* → *Immortal Inca*), medallas de logro y bitácora de batallas.
* **Selector Rápido:** Botón táctil **`🌐 ES / 🌐 EN`** en la barra superior con cambio reactivo en tiempo real y persistencia en `localStorage`.

---

## 🎮 Diseño e Interfaz Estilo Consola Portátil

* **El Tablero como Protagonista:**
  - El tablero de ajedrez ocupa el centro del escenario, tallado en madera amazónica con bisel dorado y coordenadas grabadas en latón (`a-h`, `1-8`).
  - Textura de casillas en **bambú dorado** (`#F7EAD0`) y **musgo de selva profunda** (`#334E3F`).
* **Caja de Diálogos Secuenciales (RPG Dialogue Box):**
  - Flotante, superpuesta y minimizable con el botón **`▼ MINIMIZAR / ▲ VER DIÁLOGO`**.
* **Menú Mochila Rotom (`🎒 MENÚ`):**
  - Un cajón deslizante (*slide-out bottom sheet*) que se abre y oculta a demanda para elegir entre los 5 modos del juego:
    1. 📜 **Academia de los Andes** (10 lecciones progresivas y selector de piezas).
    2. ⭐ **Minijuegos de Selva** (Come-Estrellas, Laberinto, Space Invaders y Lucha de Reyes).
    3. 🧩 **Gimnasio de Puzzles** (8 desafíos tácticos con andamiaje de pistas).
    4. ⚔️ **Duelo de Guardianes** (Partidas vs *Pajarito*, *Llama* y *Oso* con asistencia del Búho).
    5. 🏆 **Salón de Medallas & Rango** (7 rangos, vitrina de medallas y bitácora).

---

## 🎨 Fichas en Ultra Alta Definición (512×512 px)

Fichas pixel art transparentes de flora y fauna andina:
- 🐤 **Colibrí de los Valles** / **Valley Hummingbird** (`wp`) y **Cuervo de la Nieve** / **Snow Crow** (`bp`) (Peones)
- 🦙 **Llama Mágica** / **Magic Llama** (`wn`) y **Oso de Anteojos** / **Spectacled Bear** (`bn`) (Caballos)
- 🌸 **Orquídea Blanca** / **White Orchid** (`wb`) y **Orquídea Morada** / **Purple Orchid** (`bb`) (Alfiles)
- 🏰 **Torre de Cristal** / **Crystal Tower** (`wr`) y **Torre de Obsidiana** / **Obsidian Tower** (`br`) (Torres)
- 👑 **Reina de la Primavera** / **Spring Queen** (`wq`) y **Reina del Bosque** / **Forest Queen** (`bq`) (Damas)
- 🌿 **Rey de la Flora** / **King of Flora** (`wk`) y **Rey de la Noche** / **King of Night** (`bk`) (Reyes)

---

## 🚀 Cómo Jugar

Abre directamente [`index.html`](file:///home/juan/Datos/Datos Juan/ProyectosSoftware/JaqueAlRey/index.html) en tu navegador.
O ejecuta un servidor local:
```bash
cd "/home/juan/Datos/Datos Juan/ProyectosSoftware/JaqueAlRey"
python3 -m http.server 8080
```
Y visita `http://localhost:8080`.
