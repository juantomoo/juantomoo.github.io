/**
 * En el NIDO — Aplicacion Principal
 * Logica interactiva para la experiencia inmersiva
 */

class EnElNido {
    constructor() {
        this.currentStoryIndex = 0;
        this.audioContext = null;
        this.noiseNode = null;
        this.gainNode = null;
        this.isAudioPlaying = false;
        this.theme = 'nido'; // nido, protocol, eink
        this.readStories = new Set();
        this.nodePositions = [];
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadProgress();
        this.checkFirstVisit();
    }

    cacheElements() {
        this.bootOverlay = document.getElementById('boot-sequence');
        this.mainInterface = document.getElementById('main-interface');
        this.enterBtn = document.getElementById('enter-btn');
        this.storyContent = document.getElementById('story-content');
        this.storyList = document.getElementById('story-list');
        this.storyMenu = document.getElementById('story-menu');
        this.noiseOverlay = document.getElementById('noise-overlay');
        this.canvas = document.getElementById('nav-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.modeToggle = document.getElementById('mode-toggle');
        this.audioToggle = document.getElementById('audio-toggle');
        this.einkModal = document.getElementById('eink-modal');
    }

    bindEvents() {
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => this.enterSite());
        }
        
        const closeMenuBtn = document.getElementById('close-menu');
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => this.closeMenu());
        }
        
        const menuToggleBtn = document.getElementById('menu-toggle');
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', () => this.openMenu());
        }
        
        const prevBtn = document.getElementById('prev-story');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStory());
        }
        
        const nextBtn = document.getElementById('next-story');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStory());
        }
        
        if (this.modeToggle) {
            this.modeToggle.addEventListener('click', () => this.cycleTheme());
        }
        
        if (this.audioToggle) {
            this.audioToggle.addEventListener('click', () => this.toggleAudio());
        }
        
        const einkConfirm = document.getElementById('eink-confirm');
        if (einkConfirm) {
            einkConfirm.addEventListener('click', () => this.closeEinkModal());
        }
        
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Canvas interactions
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Detect e-ink display
        this.detectEink();
    }

    checkFirstVisit() {
        const hasVisited = localStorage.getItem('enelnido_visited');
        if (!hasVisited) {
            // First visit - play boot sequence
            if (this.enterBtn) {
                this.enterBtn.style.display = 'none';
                setTimeout(() => {
                    if (this.enterBtn) {
                        this.enterBtn.style.display = 'block';
                        this.enterBtn.style.opacity = '1';
                    }
                }, 3000);
            }
        } else {
            // Skip boot sequence - show all lines immediately
            const bootLines = document.querySelectorAll('.boot-line');
            bootLines.forEach(line => {
                line.style.opacity = '1';
                line.style.transform = 'translateX(0)';
            });
            if (this.enterBtn) {
                this.enterBtn.style.opacity = '1';
            }
        }
    }

    enterSite() {
        localStorage.setItem('enelnido_visited', 'true');
        
        if (this.bootOverlay) {
            this.bootOverlay.style.opacity = '0';
            this.bootOverlay.style.pointerEvents = 'none';
        }
        
        setTimeout(() => {
            if (this.bootOverlay) {
                this.bootOverlay.classList.add('hidden');
            }
            if (this.mainInterface) {
                this.mainInterface.classList.remove('hidden');
            }
            this.loadStory(0);
            this.renderStoryList();
            this.initCanvas();
            this.startAnimation();
            this.applyTheme();
        }, 500);
    }

    loadStory(index) {
        if (typeof stories === 'undefined' || index < 0 || index >= stories.length) return;
        
        this.currentStoryIndex = index;
        const story = stories[index];
        
        // Mark as read
        this.readStories.add(story.id);
        this.saveProgress();
        
        // Render content with glitch effects
        let content = story.content;
        
        // Highlight keywords
        if (story.keywords) {
            story.keywords.forEach(keyword => {
                const regex = new RegExp('\\b(' + keyword + ')\\b', 'gi');
                content = content.replace(regex, '<span class="keyword">$1</span>');
            });
        }
        
        // Apply glitch effects based on story level
        if (story.glitchLevel > 2) {
            content = this.applyGlitchEffect(content, story.glitchLevel);
        }
        
        if (this.storyContent) {
            this.storyContent.innerHTML = `
                <div class="story-meta">NODO ${story.date}</div>
                <h1 class="story-title">${story.title}</h1>
                <p class="story-subtitle">${story.subtitle}</p>
                <div class="story-body">${content}</div>
            `;
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update navigation
        this.updateNavNodes();
    }

    applyGlitchEffect(content, level) {
        const glitchChars = ['@', '#', '$', '%', '&', '*', '?', '!', '~', '`'];
        const paragraphs = content.split('</p>');
        
        return paragraphs.map((p, i) => {
            if (Math.random() < level * 0.15) {
                const words = p.split(' ');
                const glitchWordIndex = Math.floor(Math.random() * words.length);
                const glitchWord = words[glitchWordIndex].replace(/<[^>]*>/g, '');
                const glitched = glitchWord.split('').map(c => 
                    Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
                ).join('');
                words[glitchWordIndex] = words[glitchWordIndex].replace(glitchWord, glitched);
                return words.join(' ');
            }
            return p;
        }).join('</p>');
    }

    renderStoryList() {
        if (!this.storyList || typeof stories === 'undefined') return;
        
        this.storyList.innerHTML = stories.map((story, index) => `
            <div class="story-item ${this.readStories.has(story.id) ? 'read' : ''}" data-index="${index}">
                <div class="story-item-title">${story.title}</div>
                <div class="story-item-meta">${story.date}</div>
            </div>
        `).join('');
        
        // Add click handlers
        const items = this.storyList.querySelectorAll('.story-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.loadStory(index);
                this.closeMenu();
            });
        });
    }

    // Canvas Navigation (Mycelium Network)
    initCanvas() {
        if (!this.canvas) return;
        
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = 200;
        };
        resize();
        window.addEventListener('resize', resize);
        
        // Initialize node positions
        this.updateNavNodes();
    }

    updateNavNodes() {
        if (!this.canvas || typeof stories === 'undefined') return;
        
        const padding = 80;
        const availableWidth = this.canvas.width - padding * 2;
        const step = stories.length > 1 ? availableWidth / (stories.length - 1) : 0;
        
        this.nodePositions = stories.map((story, index) => ({
            x: padding + index * step,
            y: 100 + (index % 2 === 0 ? -20 : 20) + (Math.random() - 0.5) * 30,
            radius: this.readStories.has(story.id) ? 6 : 4,
            color: this.readStories.has(story.id) ? '#00ff9d' : '#ff3e3e',
            pulse: this.currentStoryIndex === index,
            story: story
        }));
    }

    startAnimation() {
        if (!this.ctx) return;
        
        let time = 0;
        
        const animate = () => {
            time += 0.02;
            this.renderCanvas(time);
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    renderCanvas(time) {
        if (!this.ctx || !this.canvas) return;
        
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        if (this.nodePositions.length === 0) return;
        
        // Draw connections (mycelium filaments)
        this.ctx.strokeStyle = 'rgba(0, 255, 157, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.nodePositions.length - 1; i++) {
            const node1 = this.nodePositions[i];
            const node2 = this.nodePositions[i + 1];
            
            const offsetY = Math.sin(time + i * 0.5) * 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(node1.x, node1.y);
            this.ctx.quadraticCurveTo(
                (node1.x + node2.x) / 2,
                (node1.y + node2.y) / 2 + offsetY,
                node2.x,
                node2.y
            );
            this.ctx.stroke();
        }
        
        // Draw nodes
        this.nodePositions.forEach((node, i) => {
            const pulseScale = node.pulse ? 1 + Math.sin(time * 3) * 0.3 : 1;
            const radius = node.radius * pulseScale;
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, radius * 3
            );
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = node.color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Label for current story
            if (node.pulse && node.story) {
                this.ctx.fillStyle = '#e0e0e0';
                this.ctx.font = '10px Space Mono';
                this.ctx.textAlign = 'center';
                const title = node.story.title ? node.story.title.substring(0, 15) + '...' : '';
                this.ctx.fillText(title, node.x, node.y - 20);
            }
        });
    }

    handleCanvasHover(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let hovering = false;
        this.nodePositions.forEach(node => {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            if (dist < 30) {
                hovering = true;
            }
        });
        
        this.canvas.style.cursor = hovering ? 'pointer' : 'default';
    }

    handleCanvasClick(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.nodePositions.forEach((node, index) => {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            if (dist < 30) {
                this.loadStory(index);
            }
        });
    }

    // Theme Management
    cycleTheme() {
        const themes = ['nido', 'protocol', 'eink'];
        const currentIndex = themes.indexOf(this.theme);
        this.theme = themes[(currentIndex + 1) % themes.length];
        
        if (this.theme === 'eink' && this.einkModal) {
            this.einkModal.classList.remove('hidden');
        }
        
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Adjust noise based on theme
        const noiseOpacities = { nido: 0.03, protocol: 0.01, eink: 0 };
        if (this.noiseOverlay) {
            this.noiseOverlay.style.opacity = noiseOpacities[this.theme] || 0.03;
        }
        
        // Update status text
        const statusText = document.getElementById('status-text');
        const statusTexts = {
            nido: 'MiCeLiCon ACTIVO',
            protocol: 'Protocolo Normalizado',
            eink: 'MODO ARCHIVO'
        };
        if (statusText) {
            statusText.textContent = statusTexts[this.theme] || 'MiCeLiCon ACTIVO';
        }
    }

    closeEinkModal() {
        if (this.einkModal) {
            this.einkModal.classList.add('hidden');
        }
    }

    detectEink() {
        // Simple e-ink detection based on user agent patterns
        const isEink = /e-ink|kindle|reMarkable/i.test(navigator.userAgent);
        if (isEink) {
            this.theme = 'eink';
            this.applyTheme();
        }
    }

    // Audio System (White Noise)
    toggleAudio() {
        if (this.isAudioPlaying) {
            this.stopAudio();
        } else {
            this.startAudio();
        }
    }

    startAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            this.audioContext = new AudioContext();
            
            // Create white noise usingScriptProcessor (deprecated but more compatible) or AudioWorklet
            const bufferSize = 2 * this.audioContext.sampleRate;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
            
            this.noiseNode = this.audioContext.createBufferSource();
            this.noiseNode.buffer = noiseBuffer;
            this.noiseNode.loop = true;
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 0.015; // Very subtle
            
            // Add low-pass filter for softer sound
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            this.noiseNode.connect(filter);
            filter.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.noiseNode.start();
            this.isAudioPlaying = true;
            
            if (this.audioToggle) {
                this.audioToggle.classList.add('active');
                this.audioToggle.style.color = 'var(--bioluminescence-strong)';
            }
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }

    stopAudio() {
        if (this.noiseNode) {
            try {
                this.noiseNode.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            this.noiseNode = null;
        }
        this.isAudioPlaying = false;
        
        if (this.audioToggle) {
            this.audioToggle.classList.remove('active');
            this.audioToggle.style.color = '';
        }
    }

    // Navigation
    prevStory() {
        if (this.currentStoryIndex > 0) {
            this.loadStory(this.currentStoryIndex - 1);
        }
    }

    nextStory() {
        if (typeof stories !== 'undefined' && this.currentStoryIndex < stories.length - 1) {
            this.loadStory(this.currentStoryIndex + 1);
        }
    }

    openMenu() {
        if (this.storyMenu) {
            this.storyMenu.classList.add('open');
        }
    }

    closeMenu() {
        if (this.storyMenu) {
            this.storyMenu.classList.remove('open');
        }
    }

    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.prevStory();
                break;
            case 'ArrowRight':
                this.nextStory();
                break;
            case 'm':
            case 'M':
                this.openMenu();
                break;
            case 'Escape':
                this.closeMenu();
                break;
            case 't':
            case 'T':
                this.cycleTheme();
                break;
            case ' ':
                e.preventDefault();
                this.toggleAudio();
                break;
        }
    }

    handleResize() {
        this.updateNavNodes();
    }

    handleScroll() {
        // Parallax effect for noise
        const scrolled = window.pageYOffset;
        if (this.noiseOverlay) {
            this.noiseOverlay.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    }

    // Progress Persistence
    saveProgress() {
        localStorage.setItem('enelnido_progress', JSON.stringify({
            readStories: Array.from(this.readStories),
            lastRead: this.currentStoryIndex
        }));
    }

    loadProgress() {
        const saved = localStorage.getItem('enelnido_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.readStories = new Set(data.readStories || []);
                this.currentStoryIndex = data.lastRead || 0;
            } catch (e) {
                // Ignore parsing errors
            }
        }
    }
}

// Global variable for noise generation
let lastOut = 0;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnElNido();
});
