import { getTextStyle } from './StyleManager.js';

export function showMessage(scene, message) {
  if (!scene.dialogContainer) {
    const width = scene.cameras.main.width;
    const height = 30;
    const dialogBg = scene.add.rectangle(width/2, scene.cameras.main.height - height/2, width, height, 0x000000, 0.7);
    const npcSprite = scene.add.image(20, scene.cameras.main.height - height/2, 'serpiente_npc').setOrigin(0.5);
    let textStyle = getTextStyle('p');
    const dialogText = scene.add.text(40, scene.cameras.main.height - height/2, message, textStyle).setOrigin(0, 0.5);
    scene.dialogContainer = scene.add.container(0, 0, [dialogBg, npcSprite, dialogText]);
  } else {
    let dialogText = scene.dialogContainer.getAt(2);
    if (dialogText) {
      dialogText.setText(message);
    }
  }
  scene.time.delayedCall(2000, () => {
    const dt = scene.dialogContainer ? scene.dialogContainer.getAt(2) : null;
    if (dt && dt.active) {
      dt.setText('');  // Limpiar el texto en vez de destruirlo.
    }
  });
}

// Nueva función para mostrar el Área de Diálogos con el NPC
export function showDialog(scene, message) {
  if (!scene.dialogContainer) {
    const width = scene.cameras.main.width;
    const height = 30;
    // Fondo semitransparente para diálogo
    const dialogBg = scene.add.rectangle(width / 2, scene.cameras.main.height - height / 2, width, height, 0x000000, 0.7);
    // Sprite del NPC (se asume que 'serpiente_npc' ya fue cargado)
    const npcSprite = scene.add.image(20, scene.cameras.main.height - height / 2, 'serpiente_npc').setOrigin(0.5);
    // Texto del diálogo: obtener estilo de párrafo
    let textStyle = getTextStyle('p');
    const dialogText = scene.add.text(40, scene.cameras.main.height - height / 2, message, textStyle).setOrigin(0, 0.5);
    // Se crea el contenedor de diálogo de forma fija (sin destruirlo)
    scene.dialogContainer = scene.add.container(0, 0, [dialogBg, npcSprite, dialogText]);
  } else {
    const dialogText = scene.dialogContainer.getAt(2);
    if (dialogText) {
      dialogText.setText(message);
    }
  }
}
