/**
 * Motupia Web Standalone Runtime — Oblivion / Star Trek Sci-Fi Minimalist HUD
 * Funciona completamente en el navegador (GitHub Pages) con soporte de creación de plugins en vivo vía Modal.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BUILTIN_PLUGINS } from './standalone-plugins.js';

const JS_DEFAULT_TEMPLATE = `// Motupia Plugin Standard MDP Spec
function createPlugin() {
  let t = 0;
  return {
    setup(ctx, params) {},
    update(ctx, dt, params) {
      t += dt * (params.speed || 1.5);
    },
    draw(ctx, scene3d, canvas2d, params) {
      const col = params.color || "#00f0ff";
      scene3d.clear("#040608");
      scene3d.setCamera({ x: 0, y: 0, z: 6, targetX: 0, targetY: 0, targetZ: 0, fov: 60 });

      // Generación procedural de filamentos 3D
      const lines = [];
      const count = 48;
      for (let i = 0; i < count; i++) {
        const u = (i / count) * Math.PI * 2;
        const rad = 2.2 + 0.5 * Math.sin(u * 5 + t);
        const x1 = rad * Math.cos(u + t * 0.2);
        const y1 = rad * Math.sin(u + t * 0.2);
        const z1 = Math.sin(u * 3 + t) * 0.8;
        lines.push(0, 0, 0, x1, y1, z1);
      }
      scene3d.lines("custom_stream", lines, { color: col, lineWidth: 1.8 });

      // Capa 2D
      canvas2d.clear();
      canvas2d.text("LIVE USER PLUGIN // MDP ACTIVE", 45, 50, {
        font: "bold 13px monospace",
        fill: col
      });
      canvas2d.text(\`TEMPORALIDAD: t=\${t.toFixed(2)}s\`, 45, 70, {
        font: "11px monospace",
        fill: "#c9bea7"
      });
    }
  };
}
return createPlugin();
`;

class BridgeCanvas2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  text(str, x, y, options = {}) {
    this.ctx.save();
    this.ctx.font = options.font || '13px monospace';
    this.ctx.fillStyle = options.fill || '#faf7ee';
    this.ctx.textAlign = options.align || 'left';
    this.ctx.fillText(str, x, y);
    this.ctx.restore();
  }

  rect(x, y, w, h, options = {}) {
    this.ctx.save();
    this.ctx.lineWidth = options.lineWidth || 1.0;
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fillRect(x, y, w, h);
    }
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.strokeRect(x, y, w, h);
    }
    this.ctx.restore();
  }

  circle(cx, cy, r, options = {}) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 1.0;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  line(x1, y1, x2, y2, options = {}) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = options.stroke || '#faf7ee';
    this.ctx.lineWidth = options.lineWidth || 1.0;
    this.ctx.stroke();
    this.ctx.restore();
  }

  path(points, options = {}) {
    if (!points || points.length < 2) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i][0], points[i][1]);
    }
    if (options.closed) this.ctx.closePath();
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.lineWidth || 1.0;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
}

class BridgeScene3D {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.objects = new Map();
  }

  clear(bgColor = null) {}

  setCamera({ x = 0, y = 0, z = 6, targetX = 0, targetY = 0, targetZ = 0, fov = 60 } = {}) {}

  points(nodeId, positions, options = {}) {
    let obj = this.objects.get(nodeId);
    const count = positions.length / 3;
    const flatArray = positions instanceof Float32Array ? positions : new Float32Array(positions);

    if (!obj || !(obj instanceof THREE.Points)) {
      if (obj) {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(flatArray, 3));
      const material = new THREE.PointsMaterial({
        color: new THREE.Color(options.color || '#00f0ff'),
        size: (options.size || 2.5) * 0.05,
        transparent: true,
        opacity: 0.9
      });
      obj = new THREE.Points(geometry, material);
      this.scene.add(obj);
      this.objects.set(nodeId, obj);
    } else {
      const posAttr = obj.geometry.getAttribute('position');
      if (posAttr && posAttr.count === count) {
        posAttr.array.set(flatArray);
        posAttr.needsUpdate = true;
      } else {
        obj.geometry.dispose();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(flatArray, 3));
        obj.geometry = geometry;
      }
      obj.material.color.set(options.color || '#00f0ff');
      obj.material.size = (options.size || 2.5) * 0.05;
    }
  }

  lines(nodeId, positions, options = {}) {
    let obj = this.objects.get(nodeId);
    const count = positions.length / 3;
    const flatArray = positions instanceof Float32Array ? positions : new Float32Array(positions);

    if (!obj || !(obj instanceof THREE.LineSegments)) {
      if (obj) {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(flatArray, 3));
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(options.color || '#ffaa00'),
        transparent: true,
        opacity: 0.9,
        linewidth: options.lineWidth || 1.0
      });
      obj = new THREE.LineSegments(geometry, material);
      this.scene.add(obj);
      this.objects.set(nodeId, obj);
    } else {
      const posAttr = obj.geometry.getAttribute('position');
      if (posAttr && posAttr.count === count) {
        posAttr.array.set(flatArray);
        posAttr.needsUpdate = true;
      } else {
        obj.geometry.dispose();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(flatArray, 3));
        obj.geometry = geometry;
      }
      obj.material.color.set(options.color || '#ffaa00');
    }
  }

  cleanup() {
    for (const [id, obj] of this.objects.entries()) {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    this.objects.clear();
  }
}

class MotupiaStandaloneApp {
  constructor() {
    this.plugins = [...BUILTIN_PLUGINS];
    this.currentPlugin = null;
    this.pluginInstance = null;
    this.currentParams = {};
    this.isPlaying = true;
    this.frameCount = 0;
    this.elapsedTime = 0;
    this.lastTime = performance.now();

    this.initDOM();
    this.initThree();
    this.initHUD();
    this.initModal();
    this.switchPlugin(this.plugins[0].id);
    this.startLoop();
  }

  initDOM() {
    this.canvas3D = document.getElementById('canvas-3d');
    this.canvas2D = document.getElementById('canvas-2d');
    this.fpsMeter = document.getElementById('fps-meter');
    this.frameCounter = document.getElementById('frame-counter');
    this.currentTitleEl = document.getElementById('current-plugin-title');
    this.pluginCountEl = document.getElementById('plugin-count');
    this.pluginsDrawer = document.getElementById('hud-plugins-drawer');
    this.pluginsListEl = document.getElementById('plugins-list');
    this.inspector = document.getElementById('hud-inspector');
    this.paramsContainer = document.getElementById('params-container');
    this.pluginDescEl = document.getElementById('current-plugin-desc');
    this.langTagEl = document.getElementById('current-lang-tag');
    this.toastEl = document.getElementById('hud-toast');
    this.btnPlay = document.getElementById('btn-play');

    // Modal DOM
    this.pluginModal = document.getElementById('plugin-modal');
    this.modalPluginName = document.getElementById('modal-plugin-name');
    this.modalCodeEditor = document.getElementById('modal-code-editor');
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030406');

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas3D,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.canvas3D);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambient);

    this.bridge3D = new BridgeScene3D(this.scene, this.camera);
    this.bridge2D = new BridgeCanvas2D(this.canvas2D);

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas2D.width = width;
    this.canvas2D.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastEl.classList.add('hidden'), 3500);
  }

  initHUD() {
    this.renderPluginsList();

    // Toggle Drawer
    document.getElementById('btn-toggle-plugins').onclick = () => {
      this.pluginsDrawer.classList.toggle('hidden');
    };
    document.getElementById('btn-close-plugins').onclick = () => {
      this.pluginsDrawer.classList.add('hidden');
    };

    // Toggle Inspector
    document.getElementById('btn-toggle-inspector').onclick = () => {
      this.inspector.classList.toggle('collapsed');
    };

    // Clean Art Mode Toggle
    const toggleHud = () => document.body.classList.toggle('hud-hidden');
    document.getElementById('btn-toggle-hud').onclick = toggleHud;
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'h' || e.key === 'H') toggleHud();
    });

    // Transport Controls
    this.btnPlay.onclick = () => {
      this.isPlaying = !this.isPlaying;
      this.btnPlay.textContent = this.isPlaying ? '❚❚ PAUSA' : '▶ PLAY';
      this.btnPlay.classList.toggle('active', this.isPlaying);
    };

    document.getElementById('btn-reset').onclick = () => {
      this.elapsedTime = 0;
      this.frameCount = 0;
      this.showToast('◈ TEMPORALIDAD RESETEADA A T=0');
    };

    document.getElementById('btn-reload-plugin').onclick = () => {
      this.switchPlugin(this.currentPlugin.id);
      this.showToast('↻ MÓDULO REINICIALIZADO');
    };

    document.getElementById('btn-export-frame').onclick = () => {
      this.exportCanvasImage();
    };
  }

  initModal() {
    const openModal = () => {
      this.modalPluginName.value = `Sector-${Math.floor(Math.random() * 900 + 100)}`;
      this.modalCodeEditor.value = JS_DEFAULT_TEMPLATE;
      this.pluginModal.classList.remove('hidden');
      this.pluginsDrawer.classList.add('hidden');
    };

    const btnOpenCreator = document.getElementById('btn-open-creator');
    if (btnOpenCreator) btnOpenCreator.onclick = openModal;

    const btnFlyoutNew = document.getElementById('btn-flyout-new');
    if (btnFlyoutNew) btnFlyoutNew.onclick = openModal;

    const btnClose = document.getElementById('btn-modal-close');
    if (btnClose) btnClose.onclick = () => this.pluginModal.classList.add('hidden');

    const btnCancel = document.getElementById('btn-modal-cancel');
    if (btnCancel) btnCancel.onclick = () => this.pluginModal.classList.add('hidden');

    const btnSave = document.getElementById('btn-modal-save');
    if (btnSave) {
      btnSave.onclick = () => {
        const name = this.modalPluginName.value.trim() || 'Nuevo Arte';
        const code = this.modalCodeEditor.value;

        try {
          // Evaluar y compilar la función generativa de forma segura
          const pluginFactory = new Function(code);
          const instance = pluginFactory();
          if (!instance || typeof instance.draw !== 'function') {
            throw new Error('El script debe retornar un objeto con el método draw(ctx, scene3d, canvas2d, params)');
          }

          const id = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') + '-' + Date.now();
          const newPlugin = {
            id,
            name,
            version: '1.0.0',
            author: 'Live User Creator',
            description: `Módulo interactivo creado en vivo: ${name}`,
            runtime: 'js',
            parameters: {
              speed: { type: 'float', label: 'Velocidad', default: 1.5, min: 0.1, max: 5.0, step: 0.1 },
              color: { type: 'color', label: 'Color Principal', default: '#00f0ff' }
            },
            create: () => pluginFactory()
          };

          this.plugins.unshift(newPlugin);
          this.pluginModal.classList.add('hidden');
          this.switchPlugin(id);
          this.showToast(`◈ PLUGIN COMPILADO Y REGISTRADO: ${name}`);
        } catch (err) {
          alert(`Error de compilación en el plugin:\n${err.message}`);
        }
      };
    }
  }

  renderPluginsList() {
    this.pluginsListEl.innerHTML = '';
    this.pluginCountEl.textContent = this.plugins.length;

    for (const p of this.plugins) {
      const card = document.createElement('div');
      const isActive = this.currentPlugin && this.currentPlugin.id === p.id;
      card.className = `hud-plugin-card ${isActive ? 'active' : ''}`;
      card.innerHTML = `
        <div class="card-info">
          <span class="card-name">${p.name}</span>
          <span class="card-type">${p.author} // v${p.version}</span>
        </div>
        <span class="card-pill js">ESM</span>
      `;
      card.onclick = () => {
        this.switchPlugin(p.id);
        this.pluginsDrawer.classList.add('hidden');
      };
      this.pluginsListEl.appendChild(card);
    }
  }

  switchPlugin(pluginId) {
    const plugin = this.plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    this.bridge3D.cleanup();
    this.bridge2D.clear();

    this.currentPlugin = plugin;
    this.currentTitleEl.textContent = plugin.name;
    this.pluginDescEl.textContent = plugin.description;
    this.langTagEl.textContent = 'ESM / CLIENT';
    this.langTagEl.className = 'inspector-tag js';

    this.currentParams = {};
    for (const [key, conf] of Object.entries(plugin.parameters || {})) {
      this.currentParams[key] = conf.default;
    }

    this.pluginInstance = plugin.create();
    if (typeof this.pluginInstance.setup === 'function') {
      this.pluginInstance.setup({ width: window.innerWidth, height: window.innerHeight, time: 0 }, this.currentParams);
    }

    this.renderParametersForm();
    this.renderPluginsList();
    this.showToast(`◈ MÓDULO CARGADO: ${plugin.name}`);
  }

  renderParametersForm() {
    this.paramsContainer.innerHTML = '';
    const params = this.currentPlugin.parameters || {};

    for (const [key, conf] of Object.entries(params)) {
      const row = document.createElement('div');
      row.className = 'hud-param-row';

      const label = document.createElement('label');
      label.className = 'hud-param-label';
      label.innerHTML = `<span>${conf.label || key}</span>`;

      if (conf.type === 'float' || conf.type === 'int') {
        const valSpan = document.createElement('span');
        valSpan.className = 'param-val-readout';
        valSpan.textContent = this.currentParams[key];
        label.appendChild(valSpan);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = conf.min !== undefined ? conf.min : 0;
        slider.max = conf.max !== undefined ? conf.max : 100;
        slider.step = conf.step || (conf.type === 'int' ? 1 : 0.05);
        slider.value = this.currentParams[key];
        slider.className = 'hud-slider';

        slider.oninput = (e) => {
          const val = conf.type === 'int' ? parseInt(e.target.value) : parseFloat(e.target.value);
          this.currentParams[key] = val;
          valSpan.textContent = val;
        };

        row.appendChild(label);
        row.appendChild(slider);
      } else if (conf.type === 'color') {
        const picker = document.createElement('input');
        picker.type = 'color';
        picker.value = this.currentParams[key] || '#00f0ff';
        picker.className = 'hud-color-picker';

        picker.oninput = (e) => {
          this.currentParams[key] = e.target.value;
        };

        row.appendChild(label);
        row.appendChild(picker);
      } else if (conf.type === 'bool') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(this.currentParams[key]);
        checkbox.className = 'hud-checkbox';

        checkbox.onchange = (e) => {
          this.currentParams[key] = e.target.checked;
        };

        row.appendChild(label);
        row.appendChild(checkbox);
      }

      this.paramsContainer.appendChild(row);
    }
  }

  exportCanvasImage() {
    const combined = document.createElement('canvas');
    combined.width = this.canvas3D.width;
    combined.height = this.canvas3D.height;
    const ctx = combined.getContext('2d');
    ctx.drawImage(this.canvas3D, 0, 0);
    ctx.drawImage(this.canvas2D, 0, 0);

    const a = document.createElement('a');
    a.download = `motupia_${this.currentPlugin.id}_${Date.now()}.png`;
    a.href = combined.toDataURL('image/png');
    a.click();
    this.showToast('◈ ARTE CAPTURADO EN ALTA DEFINICIÓN (PNG)');
  }

  startLoop() {
    let frameTimes = [];

    const animate = (now) => {
      requestAnimationFrame(animate);

      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      frameTimes.push(now);
      while (frameTimes.length > 0 && frameTimes[0] <= now - 1000) {
        frameTimes.shift();
      }
      this.fpsMeter.textContent = frameTimes.length.toFixed(1);

      this.controls.update();

      if (this.isPlaying && this.pluginInstance) {
        this.elapsedTime += dt;
        this.frameCount++;
        this.frameCounter.textContent = this.frameCount;

        const ctx = {
          width: this.canvas2D.width,
          height: this.canvas2D.height,
          time: this.elapsedTime,
          frame: this.frameCount,
          dt
        };

        if (typeof this.pluginInstance.update === 'function') {
          this.pluginInstance.update(ctx, dt, this.currentParams);
        }
        if (typeof this.pluginInstance.draw === 'function') {
          this.pluginInstance.draw(ctx, this.bridge3D, this.bridge2D, this.currentParams);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    requestAnimationFrame(animate);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MotupiaStandaloneApp();
});
