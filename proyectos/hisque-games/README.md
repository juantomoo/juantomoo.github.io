# HISQUE Games

Este es un proyecto de juego desarrollado con Phaser.

## Descripción del Juego

"ECO Serpiente" es un juego educativo donde el jugador controla una serpiente que debe recoger y reciclar residuos en diferentes escenarios. El objetivo es enseñar la importancia del reciclaje y la correcta disposición de los residuos.

## Estructura del proyecto

- **index.html**: Archivo principal HTML.
- **css/styles.css**: Archivo de estilos CSS.
- **assets/**: Carpeta para imágenes y audio.
- **js/main.js**: Archivo de configuración general de Phaser.
- **js/StyleManager.js**: Archivo para gestionar estilos de texto dinámicos.
- **js/GameUI.js**: Archivo para gestionar la interfaz de usuario del juego.
- **js/GameInit.js**: Archivo para inicializar variables y configuraciones del juego.
- **js/GameCollisions.js**: Archivo para gestionar las colisiones en el juego.
- **js/AssetLoader.js**: Archivo para cargar los recursos del juego.
- **js/scenes/**: Carpeta para las escenas del juego.
  - **BootScene.js**: Escena de arranque.
  - **PreloadScene.js**: Escena de precarga.
  - **MenuScene.js**: Escena del menú.
  - **PlayScene.js**: Escena de juego.
  - **GameOverScene.js**: Escena de fin del juego.
  - **ChapterScene.js**: Escena de selección de capítulo.

## Cómo Jugar

1. **Iniciar el Juego**: Al cargar el juego, se mostrará el menú principal.
2. **Seleccionar Capítulo**: Usa las teclas de flecha para seleccionar un capítulo y presiona [ESPACIO] para comenzar.
3. **Controlar la Serpiente**: Usa las teclas de flecha para mover la serpiente.
4. **Recoger Residuos**: Recoge los residuos y llévalos al contenedor correcto.
5. **Puntaje y Niveles**: Gana puntos por reciclar correctamente y avanza de nivel.
6. **Game Over**: Si chocas con un obstáculo o con el borde del área de juego, el juego termina.

## Controles

- **Flechas de Dirección**: Mover la serpiente.
- **ESPACIO**: Iniciar juego, avanzar en pantallas de introducción y finalización, pausar/continuar el juego.

## Requisitos

- **Phaser 3**: Motor de juego utilizado.
- **Navegador Web**: Para ejecutar el juego.

## Instalación

1. Clona el repositorio.
2. Abre `index.html` en un navegador web.

```sh
git clone <URL del repositorio>
cd HISQUE Games
open index.html
```

## Documentación de Archivos

### index.html
Archivo principal HTML que carga los estilos y scripts necesarios para el juego.

### css/styles.css
Archivo de estilos CSS que define la apariencia de la interfaz de usuario.

### js/main.js
Archivo de configuración principal de Phaser que inicializa el juego y carga las escenas.

### js/StyleManager.js
Archivo que gestiona los estilos de texto dinámicos basados en variables CSS.

### js/GameUI.js
Archivo que gestiona la interfaz de usuario del juego, incluyendo mensajes y diálogos.

### js/GameInit.js
Archivo que inicializa las variables y configuraciones del juego.

### js/GameCollisions.js
Archivo que gestiona las colisiones en el juego, incluyendo colisiones con bordes, obstáculos y residuos.

### js/AssetLoader.js
Archivo que carga los recursos del juego, incluyendo imágenes y sonidos.

### js/scenes/BootScene.js
Escena de arranque que inicia la escena de precarga.

### js/scenes/PreloadScene.js
Escena de precarga que carga los recursos necesarios para el juego.

### js/scenes/MenuScene.js
Escena del menú principal donde el jugador puede seleccionar el capítulo a jugar.

### js/scenes/PlayScene.js
Escena principal del juego donde el jugador controla la serpiente y recicla residuos.

### js/scenes/GameOverScene.js
Escena que se muestra al finalizar el juego, mostrando la puntuación final.

### js/scenes/ChapterScene.js
Escena de selección de capítulo donde el jugador puede elegir el capítulo a jugar.

## Glosario

### Funciones Clave

- **getCSSVariable(variable)**: Obtiene el valor de una variable CSS.
- **getTextStyle(type)**: Obtiene el estilo de texto basado en el tipo especificado.
- **showMessage(scene, message)**: Muestra un mensaje en la interfaz de usuario.
- **showDialog(scene, message)**: Muestra un diálogo con el NPC en la interfaz de usuario.
- **initializeGame(scene)**: Inicializa las variables y configuraciones del juego.
- **isOutOfBounds(head, tileSize, gameWidth, gameHeight)**: Verifica si la cabeza de la serpiente está fuera de los límites del área de juego.
- **checkSelfCollision(head, snake)**: Verifica si la cabeza de la serpiente colisiona con su propio cuerpo.
- **checkCollisionWithArray(head, arr, tileSize)**: Verifica si la cabeza de la serpiente colisiona con algún elemento de un array.
- **isOccupied(x, y, snake, residues, contenedors, tileSize)**: Verifica si una posición está ocupada por la serpiente, residuos o contenedores.
- **loadCommonAssets(scene)**: Carga los recursos comunes del juego.
- **loadChapterAssets(scene, chapterNumber, introImage, outroImage, residueTypes)**: Carga los recursos específicos de un capítulo.
- **moveSerpiente()**: Mueve la serpiente en la dirección actual.
- **handleCollisions()**: Maneja las colisiones de la serpiente con bordes, residuos, contenedores y obstáculos.
- **updateLevel()**: Actualiza el nivel del juego basado en la puntuación.
- **spawnResidue()**: Genera un nuevo residuo en una posición aleatoria.
- **spawnTutorialResidue()**: Genera un nuevo residuo en una posición fija para el tutorial.
- **spawnPowerUp()**: Genera un nuevo power-up en una posición aleatoria.
- **spawnObstacle()**: Genera un nuevo obstáculo en una posición aleatoria.
- **activateSlowPowerUp()**: Activa el power-up de ralentización.
- **drawGame()**: Dibuja los elementos del juego en la pantalla.
- **finishChapter()**: Finaliza el capítulo actual.
- **gameOver()**: Maneja el fin del juego y reinicia el capítulo actual.
- **togglePause()**: Alterna el estado de pausa del juego.

### Elementos del Juego

- **serpiente**: La serpiente controlada por el jugador.
- **residues**: Array de residuos que deben ser recogidos por la serpiente.
- **contenedors**: Array de contenedores donde deben ser depositados los residuos.
- **obstacles**: Array de obstáculos que dificultan el movimiento de la serpiente.
- **powerUps**: Array de power-ups que otorgan beneficios temporales a la serpiente.
- **npcMessages**: Array de mensajes que el NPC puede mostrar al jugador.
- **dialogContainer**: Contenedor para los diálogos del NPC.
- **gameObjectsContainer**: Contenedor para los objetos del juego.
- **uiContainer**: Contenedor para los elementos de la interfaz de usuario.
- **scoreText**: Texto que muestra la puntuación actual del jugador.
- **levelText**: Texto que muestra el nivel actual del juego.

## Créditos

Desarrollado por HISQUE Estudio.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Para más detalles, consulta el archivo LICENSE.
