// storage.js - Gestión de localStorage para borradores y proyectos

window.ZineR = window.ZineR || {};

/**
 * Gestor de Almacenamiento
 * Maneja guardar/cargar borradores y proyectos en localStorage
 */
window.ZineR.Almacenamiento = function () {
    this.claveBorrador = window.ZineR.CONFIG.CLAVES_ALMACENAMIENTO.borrador;
    this.claveProyectos = window.ZineR.CONFIG.CLAVES_ALMACENAMIENTO.proyectos;
    this.claveConfiguracion = window.ZineR.CONFIG.CLAVES_ALMACENAMIENTO.configuracion;
};

/**
 * Guardar borrador actual
 */
window.ZineR.Almacenamiento.prototype.guardarBorrador = function (datos) {
    try {
        const datosBorrador = {
            marcaTiempo: new Date().toISOString(),
            ...datos
        };
        localStorage.setItem(this.claveBorrador, JSON.stringify(datosBorrador));
        return true;
    } catch (error) {
        console.error('Error al guardar borrador:', error);
        return false;
    }
};

/**
 * Cargar borrador actual
 */
window.ZineR.Almacenamiento.prototype.cargarBorrador = function () {
    try {
        const datos = localStorage.getItem(this.claveBorrador);
        if (datos) {
            return JSON.parse(datos);
        }
    } catch (error) {
        console.error('Error al cargar borrador:', error);
    }
    return null;
};

/**
 * Limpiar borrador actual
 */
window.ZineR.Almacenamiento.prototype.limpiarBorrador = function () {
    localStorage.removeItem(this.claveBorrador);
};

/**
 * Guardar un proyecto con nombre
 */
window.ZineR.Almacenamiento.prototype.guardarProyecto = function (nombre, datos) {
    try {
        const proyectos = this.listarProyectos();
        const datosProyecto = {
            nombre,
            marcaTiempo: new Date().toISOString(),
            ...datos
        };

        proyectos[nombre] = datosProyecto;
        localStorage.setItem(this.claveProyectos, JSON.stringify(proyectos));
        return true;
    } catch (error) {
        console.error('Error al guardar proyecto:', error);
        return false;
    }
};

/**
 * Cargar un proyecto con nombre
 */
window.ZineR.Almacenamiento.prototype.cargarProyecto = function (nombre) {
    try {
        const proyectos = this.listarProyectos();
        return proyectos[nombre] || null;
    } catch (error) {
        console.error('Error al cargar proyecto:', error);
        return null;
    }
};

/**
 * Listar todos los proyectos guardados
 */
window.ZineR.Almacenamiento.prototype.listarProyectos = function () {
    try {
        const datos = localStorage.getItem(this.claveProyectos);
        if (datos) {
            return JSON.parse(datos);
        }
    } catch (error) {
        console.error('Error al listar proyectos:', error);
    }
    return {};
};

/**
 * Eliminar un proyecto
 */
window.ZineR.Almacenamiento.prototype.eliminarProyecto = function (nombre) {
    try {
        const proyectos = this.listarProyectos();
        delete proyectos[nombre];
        localStorage.setItem(this.claveProyectos, JSON.stringify(proyectos));
        return true;
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        return false;
    }
};

/**
 * Guardar configuración de usuario
 */
window.ZineR.Almacenamiento.prototype.guardarConfiguracion = function (configuracion) {
    try {
        localStorage.setItem(this.claveConfiguracion, JSON.stringify(configuracion));
        return true;
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        return false;
    }
};

/**
 * Cargar configuración de usuario
 */
window.ZineR.Almacenamiento.prototype.cargarConfiguracion = function () {
    try {
        const datos = localStorage.getItem(this.claveConfiguracion);
        if (datos) {
            return JSON.parse(datos);
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
    return null;
};

/**
 * Exportar todos los datos (para respaldo)
 */
window.ZineR.Almacenamiento.prototype.exportarTodo = function () {
    return {
        borrador: this.cargarBorrador(),
        proyectos: this.listarProyectos(),
        configuracion: this.cargarConfiguracion()
    };
};

/**
 * Importar datos (para restaurar)
 */
window.ZineR.Almacenamiento.prototype.importarTodo = function (datos) {
    try {
        if (datos.borrador) {
            localStorage.setItem(this.claveBorrador, JSON.stringify(datos.borrador));
        }
        if (datos.proyectos) {
            localStorage.setItem(this.claveProyectos, JSON.stringify(datos.proyectos));
        }
        if (datos.configuracion) {
            localStorage.setItem(this.claveConfiguracion, JSON.stringify(datos.configuracion));
        }
        return true;
    } catch (error) {
        console.error('Error al importar datos:', error);
        return false;
    }
};
