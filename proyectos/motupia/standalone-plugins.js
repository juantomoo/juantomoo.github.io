/**
 * Motupia Standalone Client Plugins Matrix
 * Includes all 11 procedural, generative, and artistic plugins created in Motupia
 */

export const BUILTIN_PLUGINS = [
  {
    id: "polillas-arlequin-malla",
    name: "Polillas Arlequín · La Malla del Universo",
    version: "1.0.0",
    author: "Claude / Motupia",
    description: "Malla de rombos de arlequín del siglo XIX flotando en gravedad cero, tejida por polillas con probóscide espiral, alas de diamante, naves-octaedro y engranajes mecánicos en 3D.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad de Simulación", default: 1.0, min: 0.1, max: 4.0, step: 0.05 },
      moths: { type: "int", label: "Polillas Tejedoras", default: 8, min: 2, max: 16, step: 1 },
      wingBeat: { type: "float", label: "Aleteo (rad/s)", default: 6.0, min: 1.0, max: 14.0, step: 0.25 },
      colorA: { type: "color", label: "Arlequín Carmín", default: "#d4274a" },
      colorB: { type: "color", label: "Arlequín Verdemar", default: "#1d8a78" },
      accentColor: { type: "color", label: "Oro de Acento", default: "#f2c14e" }
    },
    create() {
      let tTotal = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          tTotal += dt * (params.speed || 1.0);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const moths = params.moths || 8;
          const beat = params.wingBeat || 6.0;
          const colA = params.colorA || "#d4274a";
          const colB = params.colorB || "#1d8a78";
          const colGold = params.accentColor || "#f2c14e";

          scene3d.clear("#180d26");
          scene3d.setCamera({ x: 0, y: 1.5, z: 7, targetX: 0, targetY: 0, targetZ: 0, fov: 65 });

          // 1. Malla de rombos arlequín ondeante
          const cols = 14;
          const rows = 10;
          const meshLines = [];
          const W = 8;
          const H = 5;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const u = (c / (cols - 1) - 0.5) * W;
              const v = (r / (rows - 1) - 0.5) * H;
              const z = Math.sin(u * 1.2 + tTotal * 1.5) * Math.cos(v * 1.2 + tTotal) * 0.45;

              if (c < cols - 1) {
                const uNext = ((c + 1) / (cols - 1) - 0.5) * W;
                const zNext = Math.sin(uNext * 1.2 + tTotal * 1.5) * Math.cos(v * 1.2 + tTotal) * 0.45;
                meshLines.push(u, v, z, uNext, v, zNext);
              }
              if (r < rows - 1) {
                const vNext = ((r + 1) / (rows - 1) - 0.5) * H;
                const zNext = Math.sin(u * 1.2 + tTotal * 1.5) * Math.cos(vNext * 1.2 + tTotal) * 0.45;
                meshLines.push(u, v, z, u, vNext, zNext);
              }
            }
          }
          scene3d.lines("harlequin_mesh", meshLines, { color: colB, lineWidth: 1.2 });

          // 2. Polillas con probóscide y alas de diamante
          for (let i = 0; i < moths; i++) {
            const angle = (i / moths) * Math.PI * 2 + tTotal * 0.35;
            const radX = 2.8 + 0.6 * Math.sin(tTotal * 0.8 + i);
            const radY = 1.4 + 0.4 * Math.cos(tTotal * 0.6 + i);
            const px = Math.cos(angle) * radX;
            const py = Math.sin(angle * 1.5) * radY;
            const pz = Math.sin(angle) * 1.2;

            const wing = Math.sin(tTotal * beat + i * 1.3) * 0.6;
            const wingLines = [
              px, py, pz, px - 0.7, py + 0.4 + wing, pz - 0.2,
              px - 0.7, py + 0.4 + wing, pz - 0.2, px - 0.9, py - 0.1 + wing, pz,
              px - 0.9, py - 0.1 + wing, pz, px, py, pz,
              px, py, pz, px + 0.7, py + 0.4 + wing, pz - 0.2,
              px + 0.7, py + 0.4 + wing, pz - 0.2, px + 0.9, py - 0.1 + wing, pz,
              px + 0.9, py - 0.1 + wing, pz, px, py, pz,
              px, py, pz, px + Math.sin(tTotal * 3 + i) * 0.2, py - 0.4, pz + 0.15
            ];
            scene3d.lines(`moth_${i}`, wingLines, { color: i % 2 === 0 ? colA : colGold, lineWidth: 1.8 });

            const thread = [px, py, pz, px * 0.3, py * 0.3 - 0.5, pz * 0.3 - 0.8];
            scene3d.lines(`thread_${i}`, thread, { color: "#faf7ee", lineWidth: 0.8 });
          }

          // 3. Naves octaédricas mecánicas
          const shipAngle = -tTotal * 0.4;
          const sx = Math.sin(shipAngle) * 3.5;
          const sz = Math.cos(shipAngle) * 3.5;
          const sy = Math.cos(tTotal * 0.8) * 0.8;
          const shipEdges = [
            sx, sy + 0.6, sz, sx + 0.4, sy, sz,
            sx, sy + 0.6, sz, sx - 0.4, sy, sz,
            sx, sy + 0.6, sz, sx, sy, sz + 0.4,
            sx, sy + 0.6, sz, sx, sy, sz - 0.4,
            sx, sy - 0.6, sz, sx + 0.4, sy, sz,
            sx, sy - 0.6, sz, sx - 0.4, sy, sz,
            sx, sy - 0.6, sz, sx, sy, sz + 0.4,
            sx, sy - 0.6, sz, sx, sy, sz - 0.4,
            sx + 0.4, sy, sz, sx, sy, sz + 0.4,
            sx, sy, sz + 0.4, sx - 0.4, sy, sz,
            sx - 0.4, sy, sz, sx, sy, sz - 0.4,
            sx, sy, sz - 0.4, sx + 0.4, sy, sz
          ];
          scene3d.lines("clockwork_ship", shipEdges, { color: colGold, lineWidth: 2.0 });

          // 4. Capa 2D: Viñeta y Glifos de Teatro
          canvas2d.clear();
          const W2d = ctx.width || 1280;
          const H2d = ctx.height || 720;
          canvas2d.rect(20, 20, W2d - 40, H2d - 40, { stroke: "rgba(242, 193, 78, 0.4)", lineWidth: 1.5 });
          canvas2d.rect(26, 26, W2d - 52, H2d - 52, { stroke: "rgba(212, 39, 74, 0.3)", lineWidth: 0.8 });
          canvas2d.text("LE THÉÂTRE DES PAPILLONS NOCTURNES // HARLEQUIN LOOM", 45, 55, {
            font: "bold 13px 'Courier New', monospace",
            fill: colGold
          });
          canvas2d.text(`POLILLAS ACTIVAS: ${moths} · ENGRANAJES EN FASE · t=${tTotal.toFixed(2)}s`, 45, 75, {
            font: "11px monospace",
            fill: "#c9bea7"
          });
          canvas2d.text("ゴ ゴ ゴ ゴ", W2d - 140, H2d - 45, {
            font: "bold 26px sans-serif",
            fill: colA
          });
        }
      };
    }
  },
  {
    id: "tornasol-manga-70s",
    name: "Viaje Tornasol Manga 70s",
    version: "1.0.0",
    author: "Claude / Motupia",
    description: "Túnel multidimensional de anillos poligonales con colores planos tornasolados, contorno de tinta, líneas de velocidad cónicas y tramas de puntos (screentone) estilo Leiji Matsumoto.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad de Vuelo", default: 1.2, min: 0.2, max: 4.0, step: 0.05 },
      rings: { type: "int", label: "Anillos del Túnel", default: 22, min: 8, max: 40, step: 1 },
      sides: { type: "int", label: "Lados Polígono", default: 6, min: 3, max: 12, step: 1 },
      twist: { type: "float", label: "Torsión Dimensional", default: 1.0, min: 0.0, max: 3.0, step: 0.1 },
      accentColor: { type: "color", label: "Color Destellos", default: "#fff36b" }
    },
    create() {
      let travel = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          travel += dt * (params.speed || 1.2) * 2.2;
        },
        draw(ctx, scene3d, canvas2d, params) {
          const R = params.rings || 22;
          const S = params.sides || 6;
          const twist = params.twist || 1.0;
          const colAccent = params.accentColor || "#fff36b";

          scene3d.clear("#130924");
          scene3d.setCamera({ x: 0, y: 0, z: 5, targetX: 0, targetY: 0, targetZ: -14, fov: 72 });

          const palette = ["#ff2a6d", "#05d9e8", "#ffd23f", "#a78bfa", "#ff8a3d", "#f9f3df"];
          const spacing = 0.9;
          const baseK = Math.floor(travel / spacing);
          const frac = (travel / spacing) - baseK;

          for (let i = 0; i < R; i++) {
            const k = baseK + i;
            const z = 3.5 - (i - frac) * spacing;
            const radius = 2.1 + 0.45 * Math.sin(k * 0.85);
            const rot = k * 0.16 * twist + travel * 0.1;
            const cx = 0.6 * Math.sin(0.25 * z + travel * 0.4);
            const cy = 0.4 * Math.cos(0.2 * z + travel * 0.35);

            const ringPts = [];
            for (let s = 0; s < S; s++) {
              const a1 = rot + (s / S) * Math.PI * 2;
              const a2 = rot + ((s + 1) / S) * Math.PI * 2;
              ringPts.push(
                cx + radius * Math.cos(a1), cy + radius * Math.sin(a1), z,
                cx + radius * Math.cos(a2), cy + radius * Math.sin(a2), z
              );
            }
            const color = palette[k % palette.length];
            scene3d.lines(`ring_${i}`, ringPts, { color, lineWidth: 2.2 });
          }

          canvas2d.clear();
          const W2d = ctx.width || 1280;
          const H2d = ctx.height || 720;
          const c2x = W2d / 2;
          const c2y = H2d / 2;

          for (let l = 0; l < 42; l++) {
            const angle = (l / 42) * Math.PI * 2 + Math.sin(travel * 0.5 + l) * 0.05;
            const r0 = 120 + (l % 4) * 25;
            const r1 = Math.max(W2d, H2d) * 0.75;
            const x1 = c2x + Math.cos(angle) * r0;
            const y1 = c2y + Math.sin(angle) * r0;
            const x2 = c2x + Math.cos(angle) * r1;
            const y2 = c2y + Math.sin(angle) * r1;
            canvas2d.line(x1, y1, x2, y2, {
              stroke: l % 3 === 0 ? colAccent : "rgba(244, 239, 228, 0.4)",
              lineWidth: l % 5 === 0 ? 2.5 : 1.0
            });
          }

          canvas2d.rect(16, 16, W2d - 32, H2d - 32, { stroke: "#05030a", lineWidth: 7.0 });
          canvas2d.rect(22, 22, W2d - 44, H2d - 44, { stroke: "#faf3df", lineWidth: 1.8 });

          canvas2d.text("ゴ ゴ ゴ ゴ", 50, H2d - 50, {
            font: "bold 48px sans-serif",
            fill: colAccent
          });
          canvas2d.text(`DIM WARP // Z ${travel.toFixed(1)}`, W2d - 220, 60, {
            font: "bold 14px monospace",
            fill: "#faf3df"
          });
        }
      };
    }
  },
  {
    id: "telar-de-polillas-onirico",
    name: "Le Théâtre des Papillons Nocturnes (OpenAI)",
    version: "1.0.0",
    author: "Motupia Agent",
    description: "Un circo victoriano suspendido en gravedad cero: naves de relojería, arlequines celestes y polillas con antenas y probóscides que tejen una malla cósmica toroidal.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad del Sueño", default: 1.0, min: 0.1, max: 4.0, step: 0.05 },
      density: { type: "int", label: "Densidad del Telar", default: 1200, min: 200, max: 3000, step: 100 },
      primaryColor: { type: "color", label: "Hilo Primario", default: "#e7b85c" },
      palette: { type: "select", label: "Paleta", default: "oxblood-ivory", options: ["oxblood-ivory", "moonlit-opal", "velvet-carnival"] }
    },
    create() {
      let t = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          t += dt * (params.speed || 1.0);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const colGold = params.primaryColor || "#e7b85c";
          scene3d.clear("#17121f");
          scene3d.setCamera({ x: 0, y: 0, z: 6.5, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });

          // Telar toroidal
          const lines = [];
          const rings = 16;
          const segments = 32;
          for (let i = 0; i < rings; i++) {
            const u = (i / rings) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
              const v = (j / segments) * Math.PI * 2;
              const R = 2.2 + 0.3 * Math.sin(u * 3 + t);
              const r = 0.7;
              const x1 = (R + r * Math.cos(v)) * Math.cos(u);
              const y1 = (R + r * Math.cos(v)) * Math.sin(u);
              const z1 = r * Math.sin(v) + Math.cos(t * 1.5 + u) * 0.3;

              const v2 = ((j + 1) / segments) * Math.PI * 2;
              const x2 = (R + r * Math.cos(v2)) * Math.cos(u);
              const y2 = (R + r * Math.cos(v2)) * Math.sin(u);
              const z2 = r * Math.sin(v2) + Math.cos(t * 1.5 + u) * 0.3;

              lines.push(x1, y1, z1, x2, y2, z2);
            }
          }
          scene3d.lines("toroidal_loom", lines, { color: colGold, lineWidth: 1.2 });

          canvas2d.clear();
          const W = ctx.width || 1280;
          canvas2d.text("LE THÉÂTRE DES PAPILLONS // VICTORIAN CIRCUS", 45, 50, {
            font: "bold 13px 'Courier New', monospace",
            fill: colGold
          });
          canvas2d.text(`HILOS DE LUZ // RESONANCIA t=${t.toFixed(2)}`, 45, 70, {
            font: "11px monospace",
            fill: "#c9bea7"
          });
        }
      };
    }
  },
  {
    id: "viaje-dimensional-tornasolado",
    name: "Viaje Dimensional Tornasolado (Teseracto 4D)",
    version: "1.0.0",
    author: "Motupia Agent",
    description: "Portal multidimensional con proyección 4D de teseracto rotatorio y cintas de partículas cromáticas.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad de Simulación", default: 1.0, min: 0.1, max: 4.0, step: 0.05 },
      density: { type: "int", label: "Densidad de Elementos", default: 1200, min: 200, max: 3000, step: 50 },
      primaryColor: { type: "color", label: "Tono Primario", default: "#FF4D8D" }
    },
    create() {
      let t = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          t += dt * (params.speed || 1.0);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const colPrimary = params.primaryColor || "#FF4D8D";
          scene3d.clear("#110C24");
          scene3d.setCamera({ x: 0, y: 0, z: 6, targetX: 0, targetY: 0, targetZ: 0, fov: 65 });

          // Cintas cromáticas
          const points = [];
          const N = Math.min(params.density || 1200, 1500);
          for (let i = 0; i < N; i++) {
            const q = i / N;
            const theta = q * 18 * Math.PI + t * 0.4;
            const rad = 0.5 + q * 2.4 + 0.15 * Math.sin(theta * 2 + t);
            points.push(rad * Math.cos(theta), rad * Math.sin(theta), (q - 0.5) * 6);
          }
          scene3d.points("chromatic_ribbon", points, { color: colPrimary, size: 2.8 });

          // Teseracto 4D rotatorio
          const tesseractLines = [];
          const rotW = t * 0.8;
          const baseCube = [];
          for (let v = 0; v < 16; v++) {
            const x = (v & 1) ? 1 : -1;
            const y = (v & 2) ? 1 : -1;
            const z = (v & 4) ? 1 : -1;
            const w = (v & 8) ? 1 : -1;
            // Rotación xw
            const xRot = x * Math.cos(rotW) - w * Math.sin(rotW);
            const wRot = x * Math.sin(rotW) + w * Math.cos(rotW);
            const factor = 1.0 / (2.5 - wRot * 0.5);
            baseCube.push([xRot * factor, y * factor, z * factor]);
          }
          for (let i = 0; i < 16; i++) {
            for (let axis = 0; axis < 4; axis++) {
              if ((i & (1 << axis)) === 0) {
                const j = i | (1 << axis);
                tesseractLines.push(
                  baseCube[i][0] * 1.5, baseCube[i][1] * 1.5, baseCube[i][2] * 1.5,
                  baseCube[j][0] * 1.5, baseCube[j][1] * 1.5, baseCube[j][2] * 1.5
                );
              }
            }
          }
          scene3d.lines("tesseract_4d", tesseractLines, { color: "#4DEEEA", lineWidth: 1.8 });

          canvas2d.clear();
          const W = ctx.width || 1280;
          canvas2d.text("MOTUPIA // 4D HYPERCUBE PROJECTION", 45, 50, {
            font: "bold 13px monospace",
            fill: "#4DEEEA"
          });
          canvas2d.text(`ROTACIÓN 4D // t=${t.toFixed(2)}s`, 45, 70, {
            font: "11px monospace",
            fill: "#c9bea7"
          });
        }
      };
    }
  },
  {
    id: "minimax-manga-70s",
    name: "Tornasol Manga 70s (Minimax Gekiga)",
    version: "1.0.0",
    author: "Minimax Agent",
    description: "Túnel de anillos segmentados en rotación con estética gekiga de los 70 y líneas de velocidad continua.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad del Viaje", default: 1.0, min: 0.1, max: 4.0, step: 0.05 },
      density: { type: "int", label: "Densidad de Anillos", default: 50, min: 20, max: 100, step: 5 },
      inkWidth: { type: "float", label: "Grosor de Tinta", default: 1.6, min: 0.5, max: 3.5, step: 0.1 }
    },
    create() {
      let t = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          t += dt * (params.speed || 1.0);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const count = params.density || 50;
          const ink = params.inkWidth || 1.6;

          scene3d.clear("#0a0a0a");
          scene3d.setCamera({ x: 0, y: 0, z: 6, targetX: 0, targetY: 0, targetZ: 0, fov: 65 });

          const lines = [];
          for (let r = 0; r < count; r++) {
            const z = (r / count) * -15 + (t * 2 % 15);
            const radius = 1.8 + Math.sin(r * 0.4 + t) * 0.4;
            const segments = 24;
            for (let s = 0; s < segments; s++) {
              if (s % 3 === 0) continue; // Arcos con gaps
              const a1 = (s / segments) * Math.PI * 2 + (r % 2 ? t : -t) * 0.2;
              const a2 = ((s + 1) / segments) * Math.PI * 2 + (r % 2 ? t : -t) * 0.2;
              lines.push(
                radius * Math.cos(a1), radius * Math.sin(a1), z,
                radius * Math.cos(a2), radius * Math.sin(a2), z
              );
            }
          }
          scene3d.lines("gekiga_rings", lines, { color: "#ff2a6d", lineWidth: ink });

          canvas2d.clear();
          const W = ctx.width || 1280;
          const H = ctx.height || 720;
          canvas2d.rect(14, 14, W - 28, H - 28, { stroke: "#f4ecd6", lineWidth: 2.0 });
          canvas2d.text("GEKIGA // TÚNEL RETRO 1970", 40, 50, {
            font: "bold 14px monospace",
            fill: "#ff2a6d"
          });
        }
      };
    }
  },
  {
    id: "voxel-sculptor",
    name: "Procedural Harmonic Sculptor 3D",
    version: "1.0.0",
    author: "Motupia Core",
    description: "Generador de esculturas matemáticas 3D basadas en armónicos esféricos y deformación volumétrica toroidal.",
    runtime: "js",
    parameters: {
      radial_resolution: { type: "int", label: "Resolución Radial", default: 28, min: 12, max: 60, step: 2 },
      tubular_resolution: { type: "int", label: "Resolución Tubular", default: 48, min: 20, max: 90, step: 2 },
      harmonics: { type: "float", label: "Orden Armónico (m)", default: 5.0, min: 1.0, max: 10.0, step: 1.0 },
      pinch: { type: "float", label: "Modulación de Torsión", default: 0.45, min: 0.0, max: 1.0, step: 0.05 },
      mesh_color: { type: "color", label: "Color de la Escultura", default: "#818cf8" }
    },
    create() {
      let angle = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          angle += dt * 0.6;
        },
        draw(ctx, scene3d, canvas2d, params) {
          const radRes = params.radial_resolution || 28;
          const tubRes = params.tubular_resolution || 48;
          const m = params.harmonics || 5.0;
          const pinch = params.pinch || 0.45;
          const col = params.mesh_color || "#818cf8";

          scene3d.clear("#050608");
          scene3d.setCamera({ x: 0, y: 0, z: 6, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });

          const lines = [];
          for (let i = 0; i < radRes; i++) {
            const v1 = (i / radRes) * Math.PI * 2;
            const v2 = ((i + 1) / radRes) * Math.PI * 2;
            for (let j = 0; j < tubRes; j++) {
              const u1 = (j / tubRes) * Math.PI * 2;
              const u2 = ((j + 1) / tubRes) * Math.PI * 2;

              const R1 = 2.0 + pinch * Math.sin(m * u1 + angle);
              const r1 = 0.8 + 0.3 * Math.cos(3 * v1 + angle * 0.7);
              const x1 = (R1 + r1 * Math.cos(v1)) * Math.cos(u1);
              const y1 = (R1 + r1 * Math.cos(v1)) * Math.sin(u1);
              const z1 = r1 * Math.sin(v1) + 0.5 * Math.sin(2 * u1 + angle);

              const R2 = 2.0 + pinch * Math.sin(m * u2 + angle);
              const r2 = 0.8 + 0.3 * Math.cos(3 * v1 + angle * 0.7);
              const x2 = (R2 + r2 * Math.cos(v1)) * Math.cos(u2);
              const y2 = (R2 + r2 * Math.cos(v1)) * Math.sin(u2);
              const z2 = r2 * Math.sin(v1) + 0.5 * Math.sin(2 * u2 + angle);

              lines.push(x1, y1, z1, x2, y2, z2);
            }
          }
          scene3d.lines("harmonic_sculpture", lines, { color: col, lineWidth: 1.4 });

          canvas2d.clear();
          const W = ctx.width || 1280;
          canvas2d.text("MOTUPIA // HARMONIC TOROIDAL SCULPTOR", 45, 50, {
            font: "bold 13px monospace",
            fill: col
          });
          canvas2d.text(`ORDEN ARMÓNICO: ${m} · TORSIÓN: ${pinch.toFixed(2)}`, 45, 70, {
            font: "11px monospace",
            fill: "#c9bea7"
          });
        }
      };
    }
  },
  {
    id: "quantum-loom",
    name: "Quantum Loom · Hebras Cuánticas",
    version: "1.0.0",
    author: "Motupia Core",
    description: "Oscilador armónico multidimensional que teje haces de filamentos cuánticos resonantes con telemetría de fase y osciloscopio polar.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Frecuencia Temporal", default: 1.2, min: 0.2, max: 4.0, step: 0.05 },
      num_strands: { type: "int", label: "Hebras Cuánticas", default: 18, min: 4, max: 36, step: 1 },
      harmonics: { type: "float", label: "Resonancia Armónica", default: 3.0, min: 1.0, max: 8.0, step: 0.2 },
      loom_color: { type: "color", label: "Hebra Primaria", default: "#f43f5e" },
      accent_color: { type: "color", label: "Acento Cuántico", default: "#38bdf8" }
    },
    create() {
      let t = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          t += dt * (params.speed || 1.2);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const strands = params.num_strands || 18;
          const freq = params.harmonics || 3.0;
          const colMain = params.loom_color || "#f43f5e";
          const colAcc = params.accent_color || "#38bdf8";

          scene3d.clear("#050608");
          scene3d.setCamera({ x: 0, y: 0, z: 6, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });

          const pointsPerStrand = 90;
          const allLines = [];
          for (let s = 0; s < strands; s++) {
            const strandAngle = (s / strands) * Math.PI * 2;
            for (let p = 0; p < pointsPerStrand - 1; p++) {
              const u1 = (p / pointsPerStrand) * Math.PI * 4;
              const u2 = ((p + 1) / pointsPerStrand) * Math.PI * 4;

              const r1 = 1.8 + 0.6 * Math.sin(u1 * freq + t + strandAngle);
              const x1 = r1 * Math.cos(u1 + strandAngle);
              const y1 = (u1 - Math.PI * 2) * 0.4 + 0.3 * Math.cos(u1 * 2 + t);
              const z1 = r1 * Math.sin(u1 + strandAngle);

              const r2 = 1.8 + 0.6 * Math.sin(u2 * freq + t + strandAngle);
              const x2 = r2 * Math.cos(u2 + strandAngle);
              const y2 = (u2 - Math.PI * 2) * 0.4 + 0.3 * Math.cos(u2 * 2 + t);
              const z2 = r2 * Math.sin(u2 + strandAngle);

              allLines.push(x1, y1, z1, x2, y2, z2);
            }
          }
          scene3d.lines("quantum_strands", allLines, { color: colMain, lineWidth: 1.5 });

          canvas2d.clear();
          const W = ctx.width || 1280;
          const ox = W - 100;
          const oy = 100;
          const oscPts = [];
          for (let a = 0; a <= 36; a++) {
            const ang = (a / 36) * Math.PI * 2;
            const rad = 32 + 12 * Math.sin(ang * freq + t * 2.5);
            oscPts.push([ox + rad * Math.cos(ang), oy + rad * Math.sin(ang)]);
          }
          canvas2d.path(oscPts, { stroke: colAcc, lineWidth: 1.6, closed: true });
          canvas2d.circle(ox, oy, 3, { fill: "#ffffff" });

          canvas2d.text("MOTUPIA // QUANTUM HARMONIC RESONANCE", 45, 50, {
            font: "bold 13px monospace",
            fill: colAcc
          });
          canvas2d.text(`HEBRAS: ${strands} · FRECUENCIA: ${freq.toFixed(1)} Hz`, 45, 72, {
            font: "11px monospace",
            fill: "#c9bea7"
          });
        }
      };
    }
  },
  {
    id: "chaotic-flow",
    name: "Chaotic Flow Field 2D/3D",
    version: "1.0.0",
    author: "Motupia Core",
    description: "Simulador de atractor no lineal lorentziano con partículas proyectadas sobre el espacio de fase.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad de Flujo", default: 1.4, min: 0.2, max: 4.0, step: 0.05 },
      num_particles: { type: "int", label: "Densidad de Partículas", default: 1600, min: 200, max: 3500, step: 100 },
      color: { type: "color", label: "Color del Plasma", default: "#00f0ff" }
    },
    create() {
      let particles = null;
      let t = 0;
      return {
        setup(ctx, params) {
          const N = params.num_particles || 1600;
          particles = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            particles[i * 3] = (Math.random() - 0.5) * 6;
            particles[i * 3 + 1] = (Math.random() - 0.5) * 6;
            particles[i * 3 + 2] = (Math.random() - 0.5) * 6;
          }
        },
        update(ctx, dt, params) {
          const N = params.num_particles || 1600;
          if (!particles || particles.length !== N * 3) this.setup(ctx, params);
          const speed = params.speed || 1.4;
          t += dt * speed;

          for (let i = 0; i < N; i++) {
            const x = particles[i * 3];
            const y = particles[i * 3 + 1];
            const z = particles[i * 3 + 2];

            particles[i * 3] += Math.sin(y * 1.5 + t) * 0.025;
            particles[i * 3 + 1] += Math.cos(z * 1.5 + t) * 0.025;
            particles[i * 3 + 2] += Math.sin(x * 1.5 + t) * 0.025;

            if (Math.abs(particles[i * 3]) > 3.5) particles[i * 3] *= -0.9;
            if (Math.abs(particles[i * 3 + 1]) > 3.5) particles[i * 3 + 1] *= -0.9;
            if (Math.abs(particles[i * 3 + 2]) > 3.5) particles[i * 3 + 2] *= -0.9;
          }
        },
        draw(ctx, scene3d, canvas2d, params) {
          const col = params.color || "#00f0ff";
          scene3d.clear("#040608");
          scene3d.setCamera({ x: 0, y: 0, z: 5.5, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });
          if (particles) {
            scene3d.points("flow_nodes", particles, { color: col, size: 2.8 });
          }

          canvas2d.clear();
          canvas2d.text("MOTUPIA // LORENTZ CHAOS ATTRACTOR", 45, 50, {
            font: "bold 13px monospace",
            fill: col
          });
          canvas2d.text(`NODOS DE FASE: ${params.num_particles || 1600} · t=${t.toFixed(2)}s`, 45, 72, {
            font: "11px monospace",
            fill: "#c9bea7"
          });
        }
      };
    }
  },
  {
    id: "fractal-nebula",
    name: "Fractal Nebula 3D",
    version: "1.0.0",
    author: "Motupia Creator",
    description: "Enjambre de gas ionizado con dispersión browniana y fluctuación sinusoidal ondulatoria.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad Nebular", default: 1.2, min: 0.1, max: 4.0, step: 0.1 },
      color: { type: "color", label: "Tono Nebular", default: "#38bdf8" }
    },
    create() {
      let pts = null;
      let t = 0;
      return {
        setup(ctx, params) {
          pts = new Float32Array(1400 * 3);
          for (let i = 0; i < 1400; i++) {
            pts[i * 3] = (Math.random() - 0.5) * 5;
            pts[i * 3 + 1] = (Math.random() - 0.5) * 5;
            pts[i * 3 + 2] = (Math.random() - 0.5) * 5;
          }
        },
        update(ctx, dt, params) {
          if (!pts) this.setup(ctx, params);
          t += dt * (params.speed || 1.2);
          for (let i = 0; i < 1400; i++) {
            pts[i * 3 + 1] += Math.sin(pts[i * 3] * 2.0 + t) * 0.012;
            pts[i * 3] += Math.cos(pts[i * 3 + 2] * 2.0 + t) * 0.008;
          }
        },
        draw(ctx, scene3d, canvas2d, params) {
          const col = params.color || "#38bdf8";
          scene3d.clear("#030508");
          scene3d.setCamera({ x: 0, y: 0, z: 5.5, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });
          if (pts) scene3d.points("nebula_dust", pts, { color: col, size: 2.6 });
          canvas2d.clear();
          canvas2d.text("MOTUPIA // FRACTAL NEBULA CLOUD", 45, 50, { font: "bold 13px monospace", fill: col });
        }
      };
    }
  },
  {
    id: "hud-test-orb",
    name: "HUD Test Orb",
    version: "1.0.0",
    author: "Motupia Test",
    description: "Esfera de pulsos lumínicos con telemetría orbital y emisión de señal continua.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Velocidad Orbital", default: 1.5, min: 0.2, max: 4.0, step: 0.1 },
      orb_color: { type: "color", label: "Color del Orbe", default: "#39ff14" }
    },
    create() {
      let t = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          t += dt * (params.speed || 1.5);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const col = params.orb_color || "#39ff14";
          scene3d.clear("#040804");
          scene3d.setCamera({ x: 0, y: 0, z: 5, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });

          const lines = [];
          for (let a = 0; a < 36; a++) {
            const ang1 = (a / 36) * Math.PI * 2;
            const ang2 = ((a + 1) / 36) * Math.PI * 2;
            lines.push(
              1.8 * Math.cos(ang1), 1.8 * Math.sin(ang1), 0,
              1.8 * Math.cos(ang2), 1.8 * Math.sin(ang2), 0,
              0, 1.8 * Math.cos(ang1), 1.8 * Math.sin(ang1),
              0, 1.8 * Math.cos(ang2), 1.8 * Math.sin(ang2),
              1.8 * Math.cos(ang1), 0, 1.8 * Math.sin(ang1),
              1.8 * Math.cos(ang2), 0, 1.8 * Math.sin(ang2)
            );
          }
          scene3d.lines("orb_rings", lines, { color: col, lineWidth: 1.8 });

          canvas2d.clear();
          const W = ctx.width || 1280;
          canvas2d.text("MOTUPIA // HUD TACTICAL ORB [TEST HARNESS]", 45, 50, {
            font: "bold 13px monospace",
            fill: col
          });
        }
      };
    }
  },
  {
    id: "mi-arte-generativo",
    name: "Constelación Sonora (Mi Arte)",
    version: "1.0.0",
    author: "Juan Tomoo",
    description: "Retícula armónica de puntos estelares interconectados por vectores de proximidad.",
    runtime: "js",
    parameters: {
      speed: { type: "float", label: "Pulso", default: 1.0, min: 0.1, max: 3.0, step: 0.05 },
      color: { type: "color", label: "Tono Constelación", default: "#ffaa00" }
    },
    create() {
      let t = 0;
      return {
        setup(ctx, params) {},
        update(ctx, dt, params) {
          t += dt * (params.speed || 1.0);
        },
        draw(ctx, scene3d, canvas2d, params) {
          const col = params.color || "#ffaa00";
          scene3d.clear("#080604");
          scene3d.setCamera({ x: 0, y: 0, z: 5.5, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });

          const pts = [];
          for (let i = 0; i < 400; i++) {
            const u = (i / 400) * Math.PI * 4;
            const r = 2.0 + Math.sin(u * 3 + t) * 0.5;
            pts.push(r * Math.cos(u), r * Math.sin(u), Math.sin(u * 2 + t) * 0.8);
          }
          scene3d.points("constellation_pts", pts, { color: col, size: 3.0 });

          canvas2d.clear();
          canvas2d.text("MOTUPIA // CONSTELACIÓN ARMONIZADA", 45, 50, {
            font: "bold 13px monospace",
            fill: col
          });
        }
      };
    }
  }
];
