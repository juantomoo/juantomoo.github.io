# Una Red Segura - Lector local

Aplicación web local para leer **Una red segura** en una interfaz moderna, centrada en lectura continua, resaltados, notas, marcadores, búsqueda global, resúmenes por capítulo y lectura en voz alta.

## Qué incluye

- Lectura por páginas con progreso por capítulo y progreso total.
- Modo de resumen por capítulo, con 3 páginas de resumen por cada capítulo.
- Resaltados por color y notas asociadas.
- Marcadores persistentes en el navegador.
- Búsqueda global dentro del contenido del libro.
- Modo oscuro por defecto, tema sepia y alto contraste.
- Ajuste de contraste, tamaño de letra y voz/velocidad para TTS.
- Persistencia local de avances y preferencias usando `localStorage`.
- Diseño adaptable para escritorio y móvil.

## Archivos principales

- `una-red-segura-app.html`: aplicación completa de lectura.
- `book-data.json`: contenido estructurado del libro.
- `Una red segura (Jessica Fern).epub`: archivo fuente original del libro.
- `LICENSE`: licencia MIT del código de esta aplicación.

## Requisitos

La aplicación funciona en el navegador, pero como carga `book-data.json` con `fetch`, necesita ejecutarse desde un servidor local o cualquier servidor estático. No es recomendable abrir el HTML con doble clic sobre el archivo porque el navegador puede bloquear la carga del JSON.

## Cómo usarlo

1. Sitúate en la carpeta del proyecto.
2. Levanta un servidor estático local.
3. Abre la aplicación en el navegador.

### Ejemplo con Python

```bash
python3 -m http.server 8000
```

Después abre:

```text
http://localhost:8000/una-red-segura-app.html
```

## Controles principales

- `← Anterior` y `Siguiente →`: navegan entre páginas.
- Botones flotantes laterales: navegación rápida sin bajar al pie.
- `Capítulos`, `Marcadores`, `Notas`: cambian la vista lateral.
- Buscador: localiza coincidencias dentro de todo el libro.
- `Resumen: ON/OFF`: activa la lectura resumida por capítulo.
- `Resetear avance`: borra avances, marcadores, notas y resaltados con doble confirmación.
- `A-` / `A+`: cambia el tamaño del texto.
- Tema visual y contraste: ajustan la apariencia de lectura.
- TTS: lectura en voz alta con voz y velocidad configurables.

## Sobre la licencia

El código de esta aplicación se publica bajo licencia MIT. Eso permite usarlo, copiarlo, modificarlo y redistribuirlo con muy pocas restricciones, siempre que se conserve el aviso de copyright y la licencia.

Consulta el archivo [LICENSE](LICENSE) para el texto completo.

## Uso responsable y derechos de autor

Este proyecto se creó para uso interno del **Club de Lectura Poliamor**.

No pretende sustituir la compra o el acceso legítimo a la obra original, ni violar derechos de autor. El objetivo es ofrecer una herramienta privada de apoyo a la lectura para un grupo concreto.

Si quieres acceder a las versiones originales del libro, usa los enlaces oficiales de compra o información de la autora:

- Sitio oficial de Jessica Fern: [https://www.jessicafern.com/books](https://www.jessicafern.com/books)
- Ficha editorial de *Polysecure*: [https://thornapplepress.ca/books/polysecure/](https://thornapplepress.ca/books/polysecure/)
- Amazon: [https://a.co/d/06u4ffGw](https://a.co/d/06u4ffGw)
- Barnes & Noble: [https://www.barnesandnoble.com/s/polysecure%20jessica%20fern](https://www.barnesandnoble.com/s/polysecure%20jessica%20fern)
- Kobo: [https://www.kobo.com/us/en/search?query=Polysecure%20Jessica%20Fern](https://www.kobo.com/us/en/search?query=Polysecure%20Jessica%20Fern)

## Autoría

Desarrollado por **Juan Tomoo**.

Sitio web: [https://juantomoo.github.io](https://juantomoo.github.io)

## Nota técnica

La aplicación usa una arquitectura estática. Todo el estado de usuario se guarda en el navegador. Si limpias los datos del sitio o pulsas el botón de reseteo, se pierden avances, marcadores, notas y resaltados guardados localmente.
