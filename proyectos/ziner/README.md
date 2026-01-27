# ZineR 📖✂️

**Creador de Fanzines con Imposición Automática**

ZineR es una aplicación web progresiva (PWA) que permite crear fanzines imprimibles desde texto Markdown. Calcula automáticamente la imposición de páginas para diferentes esquemas de plegado, generando PDFs listos para imprimir, plegar y distribuir.

![ZineR Logo](assets/icons/icon-192.png)

## ✨ Características

- 🌐 **100% Client-Side**: Funciona completamente en el navegador, sin servidor
- 📱 **PWA**: Instalable como app en móvil y escritorio, funciona offline
- 📝 **Editor Markdown**: Con barra de herramientas para formateo rápido
- 📐 **Imposición Automática**: Calcula rotación y posición de páginas
- 🎨 **Personalización**: Tipografías, tamaños, imágenes de fondo
- 📥 **PDF de Alta Calidad**: Exportación a 300 DPI lista para imprenta
- 💾 **Guardado Automático**: Borradores en localStorage

## 🎯 Formatos de Plegado

| Formato | Descripción | Corte |
|---------|-------------|-------|
| **4 Caras** | Plegado simple en cruz | No |
| **6 Caras** | Tríptico plegable | Sí |
| **8 Caras** | Fanzine clásico de una hoja | Sí |
| **16 Caras** | Fanzine completo | Sí |

## 🚀 Uso

### Opción 1: Abrir directamente
Simplemente abre `index.html` en tu navegador moderno.

### Opción 2: Servidor local (recomendado para PWA)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```
Luego abre `http://localhost:8000` en tu navegador.

### Opción 3: Instalar como PWA
1. Abre la aplicación en Chrome, Edge o Safari
2. Haz clic en el icono de instalación en la barra de direcciones
3. ¡Listo! Úsala como una app nativa

## 📝 Sintaxis Markdown

```markdown
# Título de Portada

## Subtítulo

Texto normal del contenido.

**Negrita** y *cursiva*

----
(Cuatro guiones = salto de página/cara)

- Listas
- De items

_Firma del autor_
```

## 📁 Estructura del Proyecto

```
ZineR/
├── index.html           # Página principal
├── style.css            # Estilos
├── manifest.json        # Configuración PWA
├── service-worker.js    # Cache offline
├── favicon.ico          # Icono navegador
├── js/
│   ├── app.js           # Controlador principal
│   ├── config.js        # Configuración
│   ├── foldingSchemes.js    # Esquemas de plegado
│   ├── markdownParser.js    # Parser Markdown
│   ├── pagination.js        # Distribución de texto
│   ├── imageManager.js      # Gestión de imágenes
│   ├── layoutEngine.js      # Motor de maquetación
│   ├── pdfGenerator.js      # Generación PDF
│   └── storage.js           # Almacenamiento local
├── assets/
│   └── icons/           # Iconos PWA
└── examples/
    └── sample-zine.md   # Ejemplo de contenido
```

## 🛠️ Tecnologías

- **HTML5 / CSS3 / JavaScript** (ES6+)
- **[marked.js](https://marked.js.org/)** - Parser Markdown
- **[jsPDF](https://github.com/parallax/jsPDF)** - Generación de PDF
- **[html2canvas](https://html2canvas.hertzen.com/)** - Captura de canvas
- **Google Fonts** - Tipografías (Inter, Merriweather, Courier Prime, Caveat)

## 🖨️ Consejos de Impresión

1. **Papel**: Usa papel de 80-120g para mejor resultado
2. **Márgenes**: Configura márgenes mínimos (3-5mm)
3. **Calidad**: Selecciona "Alta calidad" en tu impresora
4. **Prueba**: Imprime primero en papel borrador

## 📜 Licencia

Este proyecto es software libre. Úsalo, modifícalo y distribúyelo libremente.

---

*Hecho con ❤️ para quienes creen en el poder del papel y la autoedición.*

> "Vivimos en el capitalismo. Su poder parece ineludible. También lo parecía el derecho divino de los reyes."  
> — Ursula K. Le Guin
