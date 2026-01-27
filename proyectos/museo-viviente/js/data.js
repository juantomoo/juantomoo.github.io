// data.js

/**
 * Carga las exposiciones desde el archivo JSON y devuelve una promesa
 * que resuelve con la lista de exposiciones.
 */
export async function fetchExpositionsData() {
  try {
    const response = await fetch('expositions.json');
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.expositions || [];
  } catch (err) {
    console.error("Error al cargar expositions.json:", err);
    return [];
  }
}
