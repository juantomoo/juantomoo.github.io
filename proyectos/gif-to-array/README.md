# GIFtoArray

GIFtoArray es una herramienta que convierte GIFs animados en archivos binarios optimizados, permitiendo su visualización en la web de manera ligera y eficiente. Además, incluye GIFSimply, un módulo que simplifica y reduce GIFs animados antes de la conversión.

## 📌 Características

### 🎨 GIFSimply.js (Simplificación de GIFs)
- Reduce la cantidad de colores a niveles predefinidos (2, 8, 16, 32, etc.).
- Reduce la resolución mediante escalado, desde "Original" hasta 1/128 del tamaño.
- Reduce la cantidad de frames sin afectar la duración de la animación.
- Muestra el progreso de conversión en la consola.
- Guarda el GIF optimizado como `result.gif`.

### 🔄 GIFtoArray.js (Conversión a BIN)
- Analiza el GIF y extrae resolución, frames y duración por frame.
- Permite seleccionar el porcentaje de frames a conservar.
- Convierte cada frame en un array de píxeles RGB y lo guarda en `result.bin`.
- Muestra el progreso de conversión en la consola.

### 🖥️ index.html (Visualización en la Web)
- Carga `result.bin` y extrae su información.
- Dibuja los frames en un `<canvas>` y los reproduce con el timing correcto.

## 🚀 Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/JuanTomoo/RetroGIFtoArray.git
   cd RetroGIFtoArray
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```

## 📌 Uso

### 1️⃣ Simplificar un GIF
   ```sh
   npm run simplify
   ```
   - Usa `original.gif` como entrada y guarda `result.gif` como salida.
   - Se puede elegir reducción de colores, resolución y cantidad de frames.

### 2️⃣ Convertir a BIN
   ```sh
   npm start
   ```
   - Usa `result.gif` como entrada y guarda `result.bin` como salida.
   - Se puede seleccionar qué porcentaje de frames conservar.

### 3️⃣ Visualizar en la Web
   - Abrir `index.html` en un navegador para ver la animación.

## 📝 Licencia
Este proyecto está licenciado bajo la licencia MIT.

## 👤 Autor
Desarrollado por **JuanTomoo**.

