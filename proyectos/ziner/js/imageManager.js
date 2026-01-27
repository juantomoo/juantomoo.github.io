// imageManager.js - Gestión de carga y manejo de imágenes

window.ZineR = window.ZineR || {};

/**
 * Gestor de Imágenes
 * Maneja la carga, almacenamiento y gestión de imágenes de fondo
 */
window.ZineR.GestorImagenes = function () {
    this.imagenes = new Map(); // número de cara -> datos de imagen
};

/**
 * Manejar carga de imagen para una cara específica
 */
window.ZineR.GestorImagenes.prototype.subirImagen = async function (archivo, numeroCara) {
    return new Promise((resolver, rechazar) => {
        if (!archivo || !archivo.type.startsWith('image/')) {
            rechazar(new Error('Tipo de archivo inválido'));
            return;
        }

        const lector = new FileReader();

        lector.onload = (e) => {
            const datosImagen = {
                dataUrl: e.target.result,
                nombreArchivo: archivo.name,
                numeroCara: numeroCara,
                opacidad: 1.0,
                ajuste: 'cover', // 'cover' o 'contain'
                filtro: 'none' // Filtro CSS
            };

            this.imagenes.set(numeroCara, datosImagen);
            resolver(datosImagen);
        };

        lector.onerror = (e) => {
            rechazar(new Error('Error al leer archivo'));
        };

        lector.readAsDataURL(archivo);
    });
};

/**
 * Obtener imagen para una cara específica
 */
window.ZineR.GestorImagenes.prototype.obtenerImagen = function (numeroCara) {
    return this.imagenes.get(numeroCara);
};

/**
 * Eliminar imagen de una cara
 */
window.ZineR.GestorImagenes.prototype.eliminarImagen = function (numeroCara) {
    this.imagenes.delete(numeroCara);
};

/**
 * Actualizar propiedades de imagen
 */
window.ZineR.GestorImagenes.prototype.actualizarPropiedadesImagen = function (numeroCara, propiedades) {
    const imagen = this.imagenes.get(numeroCara);
    if (imagen) {
        Object.assign(imagen, propiedades);
        this.imagenes.set(numeroCara, imagen);
    }
};

/**
 * Obtener todas las imágenes
 */
window.ZineR.GestorImagenes.prototype.obtenerTodasImagenes = function () {
    return Array.from(this.imagenes.values());
};

/**
 * Limpiar todas las imágenes
 */
window.ZineR.GestorImagenes.prototype.limpiarTodo = function () {
    this.imagenes.clear();
};

/**
 * Exportar datos de imágenes (para guardar/cargar proyectos)
 */
window.ZineR.GestorImagenes.prototype.exportarDatos = function () {
    return Array.from(this.imagenes.entries());
};

/**
 * Importar datos de imágenes
 */
window.ZineR.GestorImagenes.prototype.importarDatos = function (datos) {
    this.imagenes = new Map(datos);
};
