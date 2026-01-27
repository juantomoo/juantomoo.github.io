# Museo Viviente

**Museo Viviente** es una aplicación web interactiva que permite a los usuarios explorar exposiciones virtuales sobre diversos temas históricos y científicos. Está diseñada para ser atractiva, educativa y accesible, utilizando imágenes, videos y texto para ofrecer una experiencia inmersiva.

---

## Estructura del Proyecto

```
museo-viviente/
├── index.html
├── styles.css
├── expositions.json
├── js/
│   ├── data.js
│   ├── lightbox.js
│   ├── slider.js
│   └── main.js
└── (carpetas con imágenes, música, etc.)
```

- **`index.html`**: Página principal. Define la estructura semántica, las pantallas (inicio, exposiciones, detalle, carrusel) y popups (glosario, referencias, créditos, apoyar).
- **`styles.css`**: Hoja de estilos principal, con variables CSS, organización en secciones, media queries y scrollbars personalizados.
- **`expositions.json`**: Archivo JSON con la información de cada exposición (id, título, carpeta, música, referencias, glosario, media).
- **`js/`**: Carpeta con los scripts:
  - **`data.js`**: Carga de datos de `expositions.json` usando `async/await`.
  - **`lightbox.js`**: Maneja la lógica de zoom/pan e interacciones del lightbox.
  - **`slider.js`**: Controla el carrusel (slides), auto-scroll del texto, TTS, y audio de la exposición.
  - **`main.js`**: Inicializa la aplicación, maneja la navegación de pantallas y eventos globales.

---

## Funcionalidades Principales

1. **Exploración de Exposiciones**  
   - Muestra una lista de exposiciones disponibles y permite seleccionar una para ver más detalles.

2. **Detalle de Exposición**  
   - Incluye información adicional y un botón para iniciar un carrusel interactivo.

3. **Carrusel Interactivo**  
   - Muestra imágenes y videos de la exposición, con texto explicativo y la opción de:
     - Ajustar la velocidad de auto-scroll (texto) en píxeles por segundo.
     - Ajustar la velocidad de lectura en voz alta (TTS).
     - Ajustar el volumen de la música de fondo.
     - Hacer zoom/pan en la imagen (lightbox).
     - Encender/apagar la voz (TTS).
     - Ocultar/mostrar el texto.

4. **Modo Claro/Oscuro**  
   - Botón fijo en la esquina superior derecha para alternar entre temas.

5. **Popups**  
   - **Referencias** y **Glosario** (contenido adicional de cada exposición).
   - **Créditos** y **Apoyar** (para donaciones).

---

## Uso e Instrucciones

1. **Clonar o descargar** este repositorio en tu máquina local.
2. **Abrir `index.html`** en tu navegador favorito.  
   - Se recomienda usar un servidor local (por ejemplo, `http-server`) para evitar problemas de CORS al cargar `expositions.json`.
3. **Pantalla de Inicio**  
   - Verás un botón para “Ingresa al museo”. Al hacer clic, se muestra la lista de exposiciones.
4. **Lista de Exposiciones**  
   - Cada exposición tiene una tarjeta con imagen o ícono de video. Al hacer clic, se muestra el detalle.
5. **Detalle de Exposición**  
   - Contiene una breve descripción y un botón “Iniciar” para abrir el carrusel interactivo.
6. **Carrusel Interactivo**  
   - Flechas izquierda/derecha para cambiar de diapositiva.  
   - Iconos inferiores para:  
     - Lightbox (ampliar imagen)  
     - Mostrar/ocultar texto  
     - Activar/desactivar voz  
     - Activar/desactivar música (si la exposición tiene archivo de audio)  
     - Referencias y Glosario (popups con más información)
7. **Controles de Velocidad**  
   - Haz clic en el ícono de configuración (engranaje) para mostrar/ocultar el panel.  
   - Ajusta la velocidad de la voz (TTS) y la velocidad de auto-scroll (texto).  
   - Ajusta el volumen de la música de fondo.
8. **Modo Claro/Oscuro**  
   - Botón fijo arriba a la derecha.  
   - Alterna las clases `dark-mode` y `light-mode` en el `body`.

---

## Requisitos y Tecnologías

- **HTML, CSS y JavaScript puros** (sin frameworks).  
- **JSON** para los datos de las exposiciones.  
- **Navegadores modernos** que soporten ES Modules y `pointerevents`.

---

## Sugerencias para Futuras Mejoras

- **Implementar alt en imágenes** para accesibilidad y SEO (ahora omitido a solicitud).  
- **Optimizar imágenes** con formatos modernos (WebP) o compresión selectiva.  
- **Agregar un backend** con APIs si se requiere escalabilidad o actualizaciones dinámicas.  
- **Minificar** y/o usar bundlers (Webpack, Vite) para producción.  
- **Implementar un Service Worker** para experiencia offline y mayor rendimiento.

---

## Créditos

- **Desarrollador Principal**: Juan Tomoo  
- **Estudio**: [HISQUE Estudio](https://hisque.com.co)  
- **Herramientas Utilizadas**: Google Labs, GPT-4, Copilot  
- **Licencia**: [MIT](LICENSE)

Si tienes dudas o deseas colaborar, ¡contáctanos o abre un Issue!  

¡Gracias por probar **Museo Viviente**! Disfruta explorando sus exposiciones virtuales y aprendiendo más sobre el fascinante mundo que nos rodea.