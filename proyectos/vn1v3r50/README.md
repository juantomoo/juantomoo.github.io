# vn1v3r50: Rosetón Cósmico Fractal

*2010-2026 © Juan Tomoo 「 杜茂男」*

> "Navegación en la imagen que es una visión escatológica sobre el universo tomando los elementos que definen el saber físico, psíquico, místico, mítico y sensible." — Definición del Concepto Original (2010)

## Descripción General

**vn1v3r50** es una obra de arte web procedural que explora la intersección de la geometría sagrada, las matemáticas recursivas y la proyección 3D infinita. Conceptualizada originalmente en 2010 como una composición estática de gigapíxeles de alta resolución, esta iteración de 2026 evoluciona el concepto hacia un entorno 3D completamente interactivo generado en tiempo real utilizando tecnologías WebGL.

La obra visualiza un "Rosetón Esférico Cúbico", una paradoja matemática donde un tamiz fractal recursivo (que recuerda a los tamices de Apolonio o a los rosetones góticos) se genera en las caras de un cubo y se proyecta sobre una esfera. Esta proyección crea un entorno inmersivo de 360 grados sin costuras con ocho puntos de fuga distintos (las esquinas del cubo) y seis polos concéntricos (las caras), representando un caleidoscopio de profundidad infinita.

## Implementación Técnica

La pieza está construida utilizando **Three.js** y JavaScript puro, empleando algoritmos de geometría procedural personalizados en lugar de activos pre-renderizados.

### Algoritmos Clave:
1.  **Producción Geométrica Recursiva**: Una función recursiva personalizada genera estructuras de "Rosetón". Cada iteración engendra geometrías hijas en los vértices de la estructura madre, creando un patrón fractal autosimilar que teóricamente se extiende hasta el infinito. Parámetros como la profundidad de recursión, el factor de ramificación y la relación de escala están expuestos para su manipulación en tiempo real.
2.  **Mapeo de Proyección Esférica**: La geometría lineal se calcula en un plano 2D normalizado (espacio UV) para cada una de las seis caras de un cubo virtual. Estas coordenadas se mapean luego al espacio 3D utilizando una técnica de vector de normalización ($v_{esfera} = v_{cubo} / |v_{cubo}|$), transformando la rejilla fractal plana en una cáscara esférica perfecta.
3.  **Capas de Profundidad Logarítmica**: Para lograr la ilusión de un corredor infinito, el sistema renderiza múltiples "cáscaras" concéntricas de la geometría fractal. El espaciado y la opacidad de estas cáscaras siguen una escala logarítmica, permitiendo al espectador mirar profundamente en la estructura sin desorden visual ni artefactos de "z-fighting", apoyado por un búfer de profundidad logarítmico.

## Instrucciones

La aplicación es una página web estática independiente.

### Controles
*   **Navegación**: Clic y arrastrar (o tocar y mover) para rotar la cámara 360° alrededor de la singularidad.
*   **Zoom**: La rueda del ratón escala el Campo de Visión (FOV).
*   **Heads-Up Display (HUD)**:
    *   **Icono de Ojo**: Alterna la visibilidad de toda la interfaz para una visualización pura.
    *   **Panel de Control**: Permite la modificación en tiempo real de los parámetros fractales:
        *   *Estructura*: Conteo de capas y espaciado.
        *   *Geometría Fractal*: Profundidad de recursión, simetría de ramificación y escala.
        *   *Animación*: Velocidad de rotación e intensidad del pulso de "respiración".

---

## English Version

# vn1v3r50: Infinite Fractal Universe

*2010-2026 © Juan Tomoo 「 杜茂男」*

> "Navigation into the image that is a escatological vision about the universe taking the elements that defines the knowing physics, psychic, mistic, mythic and sensitive." — Original Concept Definition (2010)

## Overview

**vn1v3r50** is a procedural web artwork that explores the intersection of sacred geometry, recursive mathematics, and infinite 3D projection. Originally conceptualized in 2010 as a static high-resolution gigapixel composition, this 2026 iteration evolves the concept into a fully interactive, real-time generated 3D environment using WebGL technologies.

The artwork visualizes a "Cubic Sphere Rosette," a mathematical paradox where a recursive fractal gasket (reminiscent of Apollonian gaskets or gothic rose windows) is generated on the faces of a cube and projected onto a sphere. This projection creates an immersive, seamless 360-degree environment with eight distinct vanishing points (the corners of the cube) and six concentric poles (the faces), representing a kaleidoscope of infinite depth.

## Technical Implementation

The piece is built using **Three.js** and vanilla JavaScript, employing custom procedural geometry algorithms rather than pre-rendered assets.

### Key Algorithms:
1.  **Recursive Geometry Production**: A custom recursive function generates "Rosette" structures. Each iteration spawns child geometries at the vertices of the parent structure, creating a self-similar fractal pattern that theoretically extends to infinity. Parameters such as recursion depth, branching factor, and scaling ratio are exposed for real-time manipulation.
2.  **Spherical Projection Mapping**: The linear geometry is calculated on a normalized 2D plane (UV space) for each of the six faces of a virtual cube. These coordinates are then mapped to 3D space using a normalization vector technique ($v_{sphere} = v_{cube} / |v_{cube}|$), transforming the flat fractal grid into a perfect spherical shell.
3.  **Logarithmic Depth Layering**: To achieve the illusion of an infinite corridor, the system renders multiple concentric "shells" of the fractal geometry. The spacing and opacity of these shells follow a logarithmic scale, allowing the viewer to peer deep into the structure without visual clutter or z-fighting artifacts, supported by a logarithmic depth buffer.

---

## Versão em Português

# vn1v3r50: Universo Fractal Infinito

*2010-2026 © Juan Tomoo 「 杜茂男」*

> "Navegação na imagem que é uma visão escatológica sobre o universo tomando os elementos que definem o saber físico, psíquico, místico, mítico e sensível." — Definição do Conceito Original (2010)

## Visão Geral

**vn1v3r50** é uma obra de arte procedural web que explora a interseção da geometria sagrada, matemática recursiva e projeção 3D infinita. Originalmente conceituada em 2010 como uma composição estática gigapixel de alta resolução, esta iteração de 2026 evolui o conceito para um ambiente 3D totalmente interativo gerado em tempo real usando tecnologias WebGL.

A obra visualiza uma "Rosácea Esférica Cúbica", um paradoxo matemático onde uma junta fractal recursiva (reminiscente das juntas de Apolônio ou rosáceas góticas) é gerada nas faces de um cubo e projetada sobre uma esfera. Esta projeção cria um ambiente imersivo de 360 graus sem costuras com oito pontos de fuga distintos (os cantos do cubo) e seis polos concêntricos (as faces), representando um caleidoscópio de profundidade infinita.

## Implementação Técnica

A peça é construída usando **Three.js** e JavaScript puro, empregando algoritmos de geometria procedural personalizados em vez de ativos pré-renderizados.

### Algoritmos Chave:
1.  **Produção Geométrica Recursiva**: Uma função recursiva personalizada gera estruturas de "Rosácea". Cada iteração gera geometrias filhas nos vértices da estrutura pai, criando um padrão fractal auto-similar que teoricamente se estende ao infinito. Parâmetros como profundidade de recursão, fator de ramificação e razão de escala são expostos para manipulação em tempo real.
2.  **Mapeamento de Projeção Esférica**: A geometria linear é calculada em um plano 2D normalizado (espaço UV) para cada uma das seis faces de um cubo virtual. Essas coordenadas são então mapeadas para o espaço 3D usando uma técnica de vetor de normalização ($v_{esfera} = v_{cubo} / |v_{cubo}|$), transformando a grade fractal plana em uma casca esférica perfeita.
3.  **Camadas de Profundidade Logarítmica**: Para alcançar a ilusão de um corredor infinito, o sistema renderiza múltiplas "cascas" concêntricas da geometria fractal. O espaçamento e a opacidade dessas cascas seguem uma escala logarítmica, permitindo ao espectador olhar profundamente na estrutura sem desordem visual ou artefatos de "z-fighting", suportado por um buffer de profundidade logarítmico.

## Licença / License

© 2010-2026 Juan Tomoo. All rights reserved.
[https://juantomoo.github.io/](https://juantomoo.github.io/)
