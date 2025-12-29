# Machina Development

Sitio web corporativo para Machina Development, una agencia de desarrollo de software de alto nivel.

## Estructura del Proyecto

```
MachinaDevelopment/
├── index.html              # Página de inicio
├── about.html              # Sobre Nosotros
├── creditos.html           # Créditos y Atribuciones
├── privacidad.html         # Política de Privacidad
├── terminos.html           # Términos y Condiciones
├── test-visual.html        # Página de prueba de componentes
├── assets/                 # Imágenes y recursos estáticos
├── css/
│   └── main.css            # Estilos principales (Variables, Reset, Componentes)
├── js/
│   └── main.js             # Lógica principal (Animaciones, Tema, Navegación)
└── servicios/              # Páginas de servicios individuales
    ├── landing-pages.html
    ├── e-cards.html
    ├── wordpress.html
    ├── web-apps.html
    ├── chatbots.html
    └── plugins.html
```

## Tecnologías

- **HTML5 Semántico**: Estructura limpia y accesible.
- **CSS3 Moderno**: Variables CSS (Custom Properties), Flexbox, Grid, Glassmorphism.
- **Vanilla JavaScript**: Sin dependencias externas, alto rendimiento.
- **Diseño Responsive**: Mobile-first.

## Características Clave

- **Tema Claro/Oscuro**: Persistencia de preferencia de usuario.
- **Animaciones al Scroll**: Intersection Observer API.
- **Componentes Reutilizables**: Tarjetas, Botones, Ventanas de Código.
- **Estética Cyber Gold**: Gradientes metálicos y efectos de vidrio.

## Mantenimiento

### Actualización de Precios
Los precios de los servicios están definidos estáticamente en el HTML. Para actualizarlos, se deben modificar los siguientes archivos:
- `index.html`: Sección de precios y tarjetas de servicios.
- `servicios/*.html`: Precios detallados en cada página de servicio.

### Secciones Principales
- **Por qué elegirnos**: Sección de valores corporativos en `index.html` (clase `.why-us`).
- **Servicios**: Lista de servicios principales en `index.html` y detalles en `servicios/`.

## Despliegue

El sitio es completamente estático y puede ser desplegado en cualquier servidor web (Apache, Nginx, Vercel, Netlify, GitHub Pages).

Para desarrollo local, se puede utilizar cualquier servidor estático, por ejemplo:

```bash
npx serve .
# o
python3 -m http.server 8080
```
