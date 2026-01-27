// modifyGIF.js
const fs = require("fs");
const gifFrames = require("gif-frames");
const { PNG } = require("pngjs");
const GIFEncoder = require("gifencoder");

// Función para forzar un valor a estar entre un mínimo y un máximo
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Aplica una transformación de "noche" a "mediodía" (aclara bastante la imagen)
function toMiddayPalette(r, g, b) {
  // Ajusta factores para un resultado más o menos brillante
  const factor = 1.4;   // multiplicador de brillo
  const offset = 30;    // suma adicional
  const newR = clamp(Math.floor(r * factor + offset), 0, 255);
  const newG = clamp(Math.floor(g * factor + offset), 0, 255);
  const newB = clamp(Math.floor(b * factor + offset), 0, 255);
  return [newR, newG, newB];
}

// Detección heurística de hojas:
// Se asume que las hojas tienen un componente verde notable,
// pero podrías ajustarlo si tu GIF usa otros tonos.
function isLeafPixel(r, g, b) {
  // Ajusta umbrales según tu paleta real
  return (g > r + 20 && g > b + 20 && g > 80);
}

// Parámetros de animación de las hojas
// SHIFT_SPEED: cuántos píxeles se desplazan por frame (diagonal)
const SHIFT_SPEED = 2;

// Nombre de archivos de entrada y salida
const INPUT_GIF = "result.gif";
const OUTPUT_GIF = "resultgpt.gif";

(async () => {
  // Obtener frames del GIF de entrada
  const frames = await gifFrames({
    url: INPUT_GIF,
    frames: "all",
    outputType: "png",
    cumulative: true // para que cada frame sea el "composite" de los anteriores
  });

  const totalFrames = frames.length;
  if (totalFrames === 0) {
    console.error("No se encontraron frames en el GIF.");
    return;
  }
  console.log(`Total de frames: ${totalFrames}`);

  // Obtener info del primer frame
  const firstFrameInfo = frames[0].frameInfo;
  const width = firstFrameInfo.width;
  const height = firstFrameInfo.height;
  let delay = firstFrameInfo.delay * 10; // en ms
  if (delay === 0) delay = 100;

  // Configurar el GIFEncoder
  const encoder = new GIFEncoder(width, height);
  const outStream = fs.createWriteStream(OUTPUT_GIF);
  encoder.createReadStream().pipe(outStream);

  encoder.start();
  encoder.setRepeat(0);     // 0 = bucle infinito
  encoder.setDelay(delay);  // Retardo entre frames
  encoder.setQuality(10);   // Calidad de compresión

  // Procesar cada frame
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    // Leer el frame como PNG
    const png = new PNG();
    await new Promise((resolve, reject) => {
      frames[frameIndex].getImage()
        .pipe(png)
        .on("parsed", resolve)
        .on("error", reject);
    });

    // Data original del frame
    const data = png.data;
    // Creamos un buffer donde iremos componiendo el nuevo frame
    // Partimos de un duplicado para no perder el fondo
    const newData = Buffer.from(data);

    // 1) Transformar toda la paleta de noche a mediodía
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const [nr, ng, nb] = toMiddayPalette(r, g, b);
      // Sobrescribir en ambos: data y newData
      data[i] = nr; data[i + 1] = ng; data[i + 2] = nb; data[i + 3] = a;
      newData[i] = nr; newData[i + 1] = ng; newData[i + 2] = nb; newData[i + 3] = a;
    }

    // 2) Mover las hojas en diagonal inferior-izquierda -> superior-derecha
    // Calculamos un desplazamiento basado en el frame actual
    const shiftX = SHIFT_SPEED * frameIndex; // hacia la derecha
    const shiftY = -SHIFT_SPEED * frameIndex; // hacia arriba

    // Para componer correctamente, eliminamos la hoja de su posición original
    // y la pegamos en la nueva posición (con wrap-around si sale de los límites)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (isLeafPixel(r, g, b)) {
          // Nueva posición
          let newX = x + shiftX;
          let newY = y + shiftY;
          // Wrap-around horizontal
          if (newX < 0) newX = (newX % width + width) % width;
          if (newX >= width) newX = newX % width;
          // Wrap-around vertical
          if (newY < 0) newY = (newY % height + height) % height;
          if (newY >= height) newY = newY % height;

          const newIdx = (newY * width + newX) * 4;

          // Pegar la hoja en la nueva posición
          newData[newIdx] = r;
          newData[newIdx + 1] = g;
          newData[newIdx + 2] = b;
          newData[newIdx + 3] = a;

          // Borrar la hoja de la posición original (píxel transparente)
          newData[idx] = 0;
          newData[idx + 1] = 0;
          newData[idx + 2] = 0;
          newData[idx + 3] = 0;
        }
      }
    }

    // Actualizamos la data del PNG con el frame modificado
    png.data = newData;
    // Agregamos el frame al encoder
    encoder.addFrame(png.data);
    console.log(`Frame ${frameIndex + 1}/${totalFrames} procesado (desplazamiento: ${shiftX}, ${shiftY}).`);
  }

  // Finalizar el GIF
  encoder.finish();
  console.log(`Nuevo GIF generado: ${OUTPUT_GIF}`);
})();
