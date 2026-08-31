# 🎨 Juan Tomoo - Portfolio Digital

Portfolio personal con estética vaporwave/retro-futurista. Basado en la plantilla Helios 99.

## 🚀 Estructura del Proyecto

```
juantomoo.github.io/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # JavaScript (Three.js, navegación, etc.)
├── media-config.json       # 📌 CONFIGURACIÓN DE TU CONTENIDO
├── README.md               # Este archivo
├── assets/
│   ├── gallery/            # 📌 TUS IMÁGENES DE ARTE
│   │   └── (pon tus imágenes aquí)
│   └── profile.jpg         # Tu foto de perfil (opcional)
└── proyectos/              # Landing pages de proyectos
    ├── ziner/
    ├── hisque-games/
    ├── museo-viviente/
    └── ...
```

## 📝 Cómo Agregar Tu Contenido

### 1. Imágenes de Galería

1. Coloca tus imágenes en `assets/gallery/`
2. Edita `media-config.json`, sección `"gallery"`
3. Por cada imagen, agrega un objeto:

```json
{
    "image": "assets/gallery/mi-obra.jpg",
    "title": "Nombre de la Obra",
    "year": "2024",
    "description": "Descripción de la técnica, concepto, etc.",
    "tags": ["digital", "vaporwave", "3D"]
}
```

#### Fuentes de imágenes:

| Plataforma | Cómo agregar |
|------------|--------------|
| **ArtStation** | Descarga tus obras y ponlas en `assets/gallery/`, o usa la URL directa de CDN |
| **Instagram** | Instagram no permite embeber. Descarga tus fotos y ponlas en `assets/gallery/` |
| **Behance** | Descarga las imágenes o usa URLs directas de CDN |
| **DeviantArt** | Descarga y sube a `assets/gallery/` |

### 2. Videos

Edita `media-config.json`, sección `"videos"`:

```json
{
    "embed": "URL_DEL_EMBED",
    "title": "Título del Video",
    "description": "Descripción opcional"
}
```

#### URLs de embed por plataforma:

| Plataforma | Formato de URL | Ejemplo |
|------------|----------------|---------|
| **YouTube** | `https://www.youtube.com/embed/VIDEO_ID` | `https://www.youtube.com/embed/dQw4w9WgXcQ` |
| **Vimeo** | `https://player.vimeo.com/video/VIDEO_ID` | `https://player.vimeo.com/video/123456789` |
| **Google Drive** | `https://drive.google.com/file/d/FILE_ID/preview` | `https://drive.google.com/file/d/1ABC.../preview` |

**Cómo obtener el embed:**
1. **YouTube**: Debajo del video → Compartir → Incorporar → copia el `src` del iframe
2. **Vimeo**: Botón Share → Embed → copia el `src`
3. **Drive**: Cambia `/view` por `/preview` en tu URL compartida (el archivo debe ser público)

### 3. Audio

Edita `media-config.json`, sección `"audio"`:

```json
{
    "embed": "URL_DEL_EMBED",
    "title": "Nombre del Track",
    "description": "Descripción opcional"
}
```

#### URLs de embed por plataforma:

| Plataforma | Cómo obtener |
|------------|--------------|
| **SoundCloud** | En el track → Share → Embed → copia el `src` del iframe |
| **Spotify** | Click derecho en track → Share → Embed track → copia el código |
| **Bandcamp** | En el track → Share/Embed → copia el código del iframe |

**Ejemplo SoundCloud:**
```
https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/juantomoo/a-travel&color=%23ff00ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true
```

### 4. Foto de Perfil

1. Coloca tu foto en `assets/profile.jpg`
2. Edita `index.html`, busca la sección "ABOUT" y reemplaza:
```html
<span class="portrait-icon">🎨</span>
```
por:
```html
<img src="assets/profile.jpg" alt="Juan Tomoo">
```

### 5. Información Personal

Edita directamente en `index.html`:

- **Bio**: Sección `section-about`, clase `bio-content`
- **Estadísticas**: Clase `artist-stats`
- **Herramientas**: Clase `tools-grid`
- **Redes sociales**: Sección `section-contacto`, clase `social-links`
- **Contacto**: Email, WhatsApp, ubicación

### 6. Formulario de Contacto

Para que el formulario funcione:

1. Crea una cuenta en [Formspree](https://formspree.io/) (gratis)
2. Crea un nuevo formulario
3. Copia tu Form ID
4. En `index.html`, reemplaza:
```html
action="https://formspree.io/f/YOUR_FORM_ID"
```
con tu ID real.

## 🎵 Audio de Fondo

El sitio incluye tu track "A Travel" de SoundCloud como música de fondo opcional.
El botón de audio (🔇/🔊) en la esquina inferior derecha controla la reproducción.

Para cambiar el track:
1. En `index.html`, busca `id="soundcloud-player"`
2. Cambia la URL en el `src` del iframe

## 🚀 Despliegue en GitHub Pages

### Opción A: Subir manualmente

```bash
cd /home/juan/Datos/Datos\ Juan/ProyectosSoftware/juantomoo/juantomoo.github.io

# Inicializar repo si es nuevo
git init
git remote add origin https://github.com/juantomoo/juantomoo.github.io.git

# Agregar y subir
git add .
git commit -m "Portfolio inicial"
git branch -M main
git push -u origin main
```

### Opción B: Crear repo desde GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `juantomoo.github.io`
3. Público
4. NO inicializar con README
5. Crear repositorio
6. Sigue las instrucciones de "push an existing repository"

### Activar GitHub Pages

1. Ve a tu repo → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, / (root)
4. Save

Tu sitio estará disponible en: `https://juantomoo.github.io`

## 📁 Proyectos con Demo

Los proyectos que tienen demo en vivo necesitan sus archivos copiados a `proyectos/`:

| Proyecto | Origen | Destino |
|----------|--------|---------|
| ZineR | `ZineR/` | `proyectos/ziner/` |
| HISQUE Games | `HISQUE Games/` | `proyectos/hisque-games/` |
| Jaque al Rey | `JaqueAlRey/` | `proyectos/jaque-al-rey/` |
| Museo Viviente | `Museo Viviente/` | `proyectos/museo-viviente/` |
| GIFtoArray | `GIFtoArray/` | `proyectos/giftoarray/` |

Para proyectos que requieren servidor (Node/Python), se crean landing pages informativas.

## 🔧 Personalización

### Colores

En `styles.css`, modifica las variables CSS:
```css
:root {
    --color-pink: #ff00ff;
    --color-cyan: #00ffff;
    --color-orange: #ff9e00;
}
```

### Fuentes

El sitio usa:
- **Press Start 2P**: Títulos pixel art
- **Space Mono**: Texto principal
- **VT323**: Números y datos

### Efecto CRT

Para desactivar el efecto de líneas de escaneo:
```css
.crt-overlay {
    display: none;
}
```

## 📱 Responsive

El sitio es completamente responsive con breakpoints en:
- 1200px
- 992px
- 768px (tablets)
- 480px (móviles)

## 🤝 Servicios - Machina Development

La sección de servicios enlaza a tu sitio de Machina Development.
Asegúrate de que esté desplegado en `https://juantomoo.github.io/MachinaDevelopment/`

---

**Hecho con 💜 y mucho código**

© 2015-2026 Juan Tomoo
