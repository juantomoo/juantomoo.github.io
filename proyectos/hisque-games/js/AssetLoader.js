export function loadCommonAssets(scene) {
	// Cargar assets comunes en el juego
	scene.load.image('bg', 'assets/bg.png');
	scene.load.image('serpiente_npc', 'assets/serpiente_npc.png');
	scene.load.image('serpiente_cabeza', 'assets/serpiente_cabeza.png');
	scene.load.image('serpiente_cuerpo', 'assets/serpiente_cuerpo.png');
	scene.load.image('contenedor_papel', 'assets/contenedor_papel.png');
	scene.load.image('contenedor_plastico', 'assets/contenedor_plastico.png');
	scene.load.image('contenedor_vidrio', 'assets/contenedor_vidrio.png');
	scene.load.image('contenedor_organico', 'assets/contenedor_organico.png');
	scene.load.image('obstacle', 'assets/obstacle.png');
	scene.load.image('power_up', 'assets/power_up.png');
}

export function loadChapterAssets(scene, chapterNumber, introImage, outroImage, residueTypes) {
	// Cargar imagen de introducción
	if (introImage) {
		const introPath = introImage.endsWith('.png') ? introImage : `${introImage}.png`;
		if (!scene.textures.exists(introImage)) {
			scene.load.image(introImage, `assets/${introPath}`);
		}
	}
	// Cargar imagen de salida (outro)
	if (outroImage) {
		const outroPath = outroImage.endsWith('.png') ? outroImage : `${outroImage}.png`;
		if (!scene.textures.exists(outroImage)) {
			scene.load.image(outroImage, `assets/${outroPath}`);
		}
	}
	// Cargar cada tipo de residuo
	residueTypes.forEach(type => {
		if (!scene.textures.exists(type)) {
			scene.load.image(type, `assets/${type}.png`);
		}
	});
	// Cargar contenedores adicionales para el Capítulo 2
	if (chapterNumber === 2) {
		if (!scene.textures.exists('contenedor_bateria')) {
			scene.load.image('contenedor_bateria', 'assets/contenedor_bateria.png');
		}
		if (!scene.textures.exists('contenedor_metal')) {
			scene.load.image('contenedor_metal', 'assets/contenedor_metal.png');
		}
		if (!scene.textures.exists('contenedor_madera')) {
			scene.load.image('contenedor_madera', 'assets/contenedor_madera.png');
		}
	}
}
