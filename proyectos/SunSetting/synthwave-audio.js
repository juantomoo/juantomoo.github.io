/*
 * Motor de audio generativo Synthwave para SunSetting.
 *
 * Este archivo esta aislado de la logica visual para no interferir con draw()/canvas.
 * Toda la sincronizacion musical usa AudioContext.currentTime con patron Scheduler + Lookahead.
 */
(function () {
    'use strict';

    /**
     * Convierte un valor MIDI a frecuencia en Hz.
     * @param {number} midi Numero de nota MIDI.
     * @returns {number} Frecuencia en Hz.
     */
    function midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * Limita un valor al rango indicado.
     * @param {number} value Valor de entrada.
     * @param {number} min Minimo permitido.
     * @param {number} max Maximo permitido.
     * @returns {number} Valor acotado.
     */
    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    /**
     * Lee un numero desde un input range de forma segura.
     * @param {HTMLInputElement|null} input Input origen.
     * @param {number} fallback Valor por defecto si el input no existe.
     * @returns {number} Numero parseado.
     */
    function readRangeValue(input, fallback) {
        if (!input) {
            return fallback;
        }

        const parsed = parseFloat(input.value);
        if (Number.isNaN(parsed)) {
            return fallback;
        }

        return parsed;
    }

    /**
     * Lee un entero desde un select de forma segura.
     * @param {HTMLSelectElement|null} select Select origen.
     * @param {number} fallback Valor por defecto.
     * @returns {number} Entero parseado.
     */
    function readSelectInt(select, fallback) {
        if (!select) {
            return fallback;
        }

        const parsed = parseInt(select.value, 10);
        if (Number.isNaN(parsed)) {
            return fallback;
        }

        return parsed;
    }

    /**
     * Escribe texto en un label si existe.
     * @param {HTMLElement|null} label Elemento de texto.
     * @param {string} text Texto destino.
     */
    function setText(label, text) {
        if (label) {
            label.innerText = text;
        }
    }

    /**
     * Motor modular de audio generativo Synthwave.
     *
     * Responsabilidades:
     * - Scheduler de alta precision con lookahead.
     * - Secuenciador de 16 pasos editable.
     * - Instrumentos: Kick, Snare, Pulse Bass, Dream Pads, Arpegio.
     * - Motor de escalas: Menor Natural, Frigia y Dorica.
     * - Cadena FX: Reverb (Convolver), Master EQ y Limiter final.
     */
    class SynthwaveAudioEngine {
        /**
         * @param {{documentRef?: Document}} [config] Configuracion opcional.
         */
        constructor(config) {
            const safeConfig = config || {};

            /** @type {Document} */
            this.documentRef = safeConfig.documentRef || document;

            /** @type {AudioContext|null} */
            this.audioCtx = null;

            /** @type {boolean} */
            this.isRunning = false;

            /** @type {number|null} */
            this.schedulerTimerId = null;

            /** @type {number[]} */
            this.visualTimerIds = [];

            /** @type {AudioBuffer|null} */
            this.noiseBuffer = null;

            /**
             * Estado principal del secuenciador y mezcla.
             * Cada parametro puede ser alterado desde el HUD en tiempo real.
             */
            this.state = {
                bpm: 90,
                lookaheadMs: 25,
                scheduleAheadTime: 0.12,
                patternLength: 16,
                currentStep: 0,
                nextNoteTime: 0,
                rootMidi: 41,
                swing: 0.08,
                scale: 'minor',
                progressionDegrees: [0, 5, 3, 4],
                arpPattern: [0, 1, 2, 1, 3, 2, 1, 2],
                steps: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
                masterVolume: 0.8,
                reverbMix: 0.28,
                limiterThreshold: -1,
                channelVolume: {
                    kick: 0.85,
                    snare: 0.7,
                    bass: 0.78,
                    pad: 0.42,
                    melody: 0.5
                },
                channelEnabled: {
                    kick: true,
                    snare: true,
                    bass: true,
                    pad: true,
                    melody: true
                }
            };

            /**
             * Definicion de escalas para el motor armonico.
             * Los intervalos estan expresados en semitonos respecto a la tonica.
             */
            this.scales = {
                minor: [0, 2, 3, 5, 7, 8, 10],
                phrygian: [0, 1, 3, 5, 7, 8, 10],
                dorian: [0, 2, 3, 5, 7, 9, 10]
            };

            /**
             * Nombres de tonica para mostrar en HUD.
             */
            this.noteNames = {
                0: 'C',
                1: 'C#',
                2: 'D',
                3: 'D#',
                4: 'E',
                5: 'F',
                6: 'F#',
                7: 'G',
                8: 'G#',
                9: 'A',
                10: 'A#',
                11: 'B'
            };

            /** @type {Record<string, AudioNode>} */
            this.nodes = {};

            /** @type {Record<string, any>} */
            this.ui = {};

            // Se enlaza una sola vez para conservar el mismo contexto en setTimeout.
            this.boundScheduler = this.schedulerTick.bind(this);

            this.cacheUi();
            this.bootstrapStateFromUi();
            this.bindUiEvents();
            this.refreshAllUi();
        }

        /**
         * Guarda referencias a todos los controles del HUD.
         * Se usan IDs explicitos para desacoplar UI y motor.
         */
        cacheUi() {
            const byId = (id) => this.documentRef.getElementById(id);

            this.ui = {
                volume: byId('audio-vol'),
                volumeLabel: byId('vol-label'),
                bpm: byId('audio-bpm'),
                bpmLabel: byId('bpm-label'),
                root: byId('seq-root'),
                rootLabel: byId('root-label'),
                swing: byId('seq-swing'),
                swingLabel: byId('swing-label'),
                scale: byId('seq-scale'),
                scaleLabel: byId('scale-label'),
                reverb: byId('audio-reverb'),
                reverbLabel: byId('reverb-label'),
                limiterThreshold: byId('limiter-threshold'),
                limiterLabel: byId('limiter-label'),
                eqLow: byId('eq-low'),
                eqLowLabel: byId('eq-low-label'),
                eqMid: byId('eq-mid'),
                eqMidLabel: byId('eq-mid-label'),
                eqHigh: byId('eq-high'),
                eqHighLabel: byId('eq-high-label'),
                channelKick: byId('ch-kick'),
                channelKickLabel: byId('ch-kick-label'),
                channelSnare: byId('ch-snare'),
                channelSnareLabel: byId('ch-snare-label'),
                channelBass: byId('ch-bass'),
                channelBassLabel: byId('ch-bass-label'),
                channelPad: byId('ch-pad'),
                channelPadLabel: byId('ch-pad-label'),
                channelMelody: byId('ch-melody'),
                channelMelodyLabel: byId('ch-melody-label'),
                channelKickOn: byId('ch-kick-on'),
                channelSnareOn: byId('ch-snare-on'),
                channelBassOn: byId('ch-bass-on'),
                channelPadOn: byId('ch-pad-on'),
                channelMelodyOn: byId('ch-melody-on'),
                audioToggle: byId('audio-toggle'),
                seqRandomize: byId('seq-randomize'),
                seqFill: byId('seq-fill'),
                seqClear: byId('seq-clear'),
                stepButtons: []
            };

            for (let i = 0; i < this.state.patternLength; i += 1) {
                const button = byId(`step-${i}`);
                if (button) {
                    this.ui.stepButtons.push(button);
                }
            }
        }

        /**
         * Sincroniza el estado interno con los valores iniciales del HUD.
         */
        bootstrapStateFromUi() {
            this.state.masterVolume = readRangeValue(this.ui.volume, this.state.masterVolume);
            this.state.bpm = clamp(Math.round(readRangeValue(this.ui.bpm, this.state.bpm)), 40, 220);
            this.state.rootMidi = clamp(readSelectInt(this.ui.root, this.state.rootMidi), 24, 84);
            this.state.swing = clamp(readRangeValue(this.ui.swing, this.state.swing), 0, 0.49);
            this.state.reverbMix = clamp(readRangeValue(this.ui.reverb, this.state.reverbMix), 0, 1);
            this.state.limiterThreshold = clamp(readRangeValue(this.ui.limiterThreshold, this.state.limiterThreshold), -30, -1);

            if (this.ui.scale && this.scales[this.ui.scale.value]) {
                this.state.scale = this.ui.scale.value;
            }

            this.state.channelVolume.kick = clamp(readRangeValue(this.ui.channelKick, this.state.channelVolume.kick), 0, 1);
            this.state.channelVolume.snare = clamp(readRangeValue(this.ui.channelSnare, this.state.channelVolume.snare), 0, 1);
            this.state.channelVolume.bass = clamp(readRangeValue(this.ui.channelBass, this.state.channelVolume.bass), 0, 1);
            this.state.channelVolume.pad = clamp(readRangeValue(this.ui.channelPad, this.state.channelVolume.pad), 0, 1);
            this.state.channelVolume.melody = clamp(readRangeValue(this.ui.channelMelody, this.state.channelVolume.melody), 0, 1);

            this.state.channelEnabled.kick = this.ui.channelKickOn ? this.ui.channelKickOn.checked : true;
            this.state.channelEnabled.snare = this.ui.channelSnareOn ? this.ui.channelSnareOn.checked : true;
            this.state.channelEnabled.bass = this.ui.channelBassOn ? this.ui.channelBassOn.checked : true;
            this.state.channelEnabled.pad = this.ui.channelPadOn ? this.ui.channelPadOn.checked : true;
            this.state.channelEnabled.melody = this.ui.channelMelodyOn ? this.ui.channelMelodyOn.checked : true;

            if (this.ui.stepButtons.length === this.state.patternLength) {
                this.state.steps = this.ui.stepButtons.map((button) => (button.classList.contains('active') ? 1 : 0));
            }
        }

        /**
         * Enlaza eventos de la UI para reaccion inmediata en tiempo real.
         */
        bindUiEvents() {
            if (this.ui.volume) {
                this.ui.volume.addEventListener('input', () => {
                    this.state.masterVolume = clamp(readRangeValue(this.ui.volume, this.state.masterVolume), 0, 1);
                    this.applyMasterVolume();
                    this.refreshMasterVolumeLabel();
                });
            }

            if (this.ui.bpm) {
                this.ui.bpm.addEventListener('input', () => {
                    const nextBpm = clamp(Math.round(readRangeValue(this.ui.bpm, this.state.bpm)), 40, 220);
                    this.state.bpm = nextBpm;

                    // Si el reloj quedo atras por un cambio extremo de tempo, se recoloca solo el punto siguiente.
                    if (this.audioCtx && this.state.nextNoteTime < this.audioCtx.currentTime) {
                        this.state.nextNoteTime = this.audioCtx.currentTime + this.getSecondsPerStep();
                    }

                    this.refreshBpmLabel();
                });
            }

            if (this.ui.root) {
                this.ui.root.addEventListener('change', () => {
                    this.state.rootMidi = clamp(readSelectInt(this.ui.root, this.state.rootMidi), 24, 84);
                    this.refreshRootLabel();
                });
            }

            if (this.ui.swing) {
                this.ui.swing.addEventListener('input', () => {
                    this.state.swing = clamp(readRangeValue(this.ui.swing, this.state.swing), 0, 0.49);
                    this.refreshSwingLabel();
                });
            }

            if (this.ui.scale) {
                this.ui.scale.addEventListener('change', () => {
                    const nextScale = this.ui.scale.value;
                    if (this.scales[nextScale]) {
                        this.state.scale = nextScale;
                        this.refreshScaleLabel();
                    }
                });
            }

            if (this.ui.reverb) {
                this.ui.reverb.addEventListener('input', () => {
                    this.state.reverbMix = clamp(readRangeValue(this.ui.reverb, this.state.reverbMix), 0, 1);
                    this.applyReverbMix();
                    this.refreshReverbLabel();
                });
            }

            if (this.ui.limiterThreshold) {
                this.ui.limiterThreshold.addEventListener('input', () => {
                    this.state.limiterThreshold = clamp(readRangeValue(this.ui.limiterThreshold, this.state.limiterThreshold), -30, -1);
                    this.applyLimiterThreshold();
                    this.refreshLimiterLabel();
                });
            }

            if (this.ui.eqLow) {
                this.ui.eqLow.addEventListener('input', () => {
                    this.applyEq();
                    this.refreshEqLabels();
                });
            }

            if (this.ui.eqMid) {
                this.ui.eqMid.addEventListener('input', () => {
                    this.applyEq();
                    this.refreshEqLabels();
                });
            }

            if (this.ui.eqHigh) {
                this.ui.eqHigh.addEventListener('input', () => {
                    this.applyEq();
                    this.refreshEqLabels();
                });
            }

            if (this.ui.channelKick) {
                this.ui.channelKick.addEventListener('input', () => {
                    this.state.channelVolume.kick = clamp(readRangeValue(this.ui.channelKick, this.state.channelVolume.kick), 0, 1);
                    this.refreshChannelLabels();
                });
            }

            if (this.ui.channelSnare) {
                this.ui.channelSnare.addEventListener('input', () => {
                    this.state.channelVolume.snare = clamp(readRangeValue(this.ui.channelSnare, this.state.channelVolume.snare), 0, 1);
                    this.refreshChannelLabels();
                });
            }

            if (this.ui.channelBass) {
                this.ui.channelBass.addEventListener('input', () => {
                    this.state.channelVolume.bass = clamp(readRangeValue(this.ui.channelBass, this.state.channelVolume.bass), 0, 1);
                    this.refreshChannelLabels();
                });
            }

            if (this.ui.channelPad) {
                this.ui.channelPad.addEventListener('input', () => {
                    this.state.channelVolume.pad = clamp(readRangeValue(this.ui.channelPad, this.state.channelVolume.pad), 0, 1);
                    this.refreshChannelLabels();
                });
            }

            if (this.ui.channelMelody) {
                this.ui.channelMelody.addEventListener('input', () => {
                    this.state.channelVolume.melody = clamp(readRangeValue(this.ui.channelMelody, this.state.channelVolume.melody), 0, 1);
                    this.refreshChannelLabels();
                });
            }

            if (this.ui.channelKickOn) {
                this.ui.channelKickOn.addEventListener('change', () => {
                    this.state.channelEnabled.kick = this.ui.channelKickOn.checked;
                });
            }

            if (this.ui.channelSnareOn) {
                this.ui.channelSnareOn.addEventListener('change', () => {
                    this.state.channelEnabled.snare = this.ui.channelSnareOn.checked;
                });
            }

            if (this.ui.channelBassOn) {
                this.ui.channelBassOn.addEventListener('change', () => {
                    this.state.channelEnabled.bass = this.ui.channelBassOn.checked;
                });
            }

            if (this.ui.channelPadOn) {
                this.ui.channelPadOn.addEventListener('change', () => {
                    this.state.channelEnabled.pad = this.ui.channelPadOn.checked;
                });
            }

            if (this.ui.channelMelodyOn) {
                this.ui.channelMelodyOn.addEventListener('change', () => {
                    this.state.channelEnabled.melody = this.ui.channelMelodyOn.checked;
                });
            }

            if (this.ui.audioToggle) {
                this.ui.audioToggle.addEventListener('click', async () => {
                    if (this.isRunning) {
                        this.pause();
                        return;
                    }

                    await this.start(false);
                });
            }

            if (this.ui.seqRandomize) {
                this.ui.seqRandomize.addEventListener('click', () => {
                    this.randomizeSteps();
                });
            }

            if (this.ui.seqFill) {
                this.ui.seqFill.addEventListener('click', () => {
                    this.fillSteps();
                });
            }

            if (this.ui.seqClear) {
                this.ui.seqClear.addEventListener('click', () => {
                    this.clearSteps();
                });
            }

            this.ui.stepButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    this.state.steps[index] = this.state.steps[index] ? 0 : 1;
                    this.refreshStepButtons();
                });
            });
        }

        /**
         * Inicializa AudioContext y la cadena completa de nodos.
         * Se ejecuta una sola vez, solo tras gesto del usuario.
         */
        ensureAudioGraph() {
            if (this.audioCtx) {
                return;
            }

            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) {
                throw new Error('Web Audio API no disponible en este navegador.');
            }

            this.audioCtx = new AudioContextCtor();
            const ctx = this.audioCtx;

            // Bus principal donde desembocan todos los instrumentos.
            this.nodes.musicBus = ctx.createGain();

            // Mezcla dry/wet para reverb.
            this.nodes.dryGain = ctx.createGain();
            this.nodes.reverbSend = ctx.createGain();
            this.nodes.reverbConvolver = ctx.createConvolver();
            this.nodes.reverbReturn = ctx.createGain();

            // EQ maestro de tres bandas.
            this.nodes.eqLow = ctx.createBiquadFilter();
            this.nodes.eqMid = ctx.createBiquadFilter();
            this.nodes.eqHigh = ctx.createBiquadFilter();

            // Limiter final para prevenir clipping digital.
            this.nodes.limiter = ctx.createDynamicsCompressor();

            // Ganancia final de salida.
            this.nodes.masterGain = ctx.createGain();

            // Configuracion de filtros de ecualizacion.
            this.nodes.eqLow.type = 'lowshelf';
            this.nodes.eqLow.frequency.value = 320;
            this.nodes.eqMid.type = 'peaking';
            this.nodes.eqMid.frequency.value = 1000;
            this.nodes.eqMid.Q.value = 0.9;
            this.nodes.eqHigh.type = 'highshelf';
            this.nodes.eqHigh.frequency.value = 3200;

            // Configuracion de limiter en modo duro para picos transitorios.
            this.nodes.limiter.threshold.value = this.state.limiterThreshold;
            this.nodes.limiter.knee.value = 0;
            this.nodes.limiter.ratio.value = 20;
            this.nodes.limiter.attack.value = 0.003;
            this.nodes.limiter.release.value = 0.1;

            // Impulso de reverb generado de forma algoritmica.
            this.nodes.reverbConvolver.buffer = this.createImpulseResponse(2.8, 2.6);

            // Buffer de ruido blanco para la caja retro.
            this.noiseBuffer = this.createNoiseBuffer();

            // Enrutamiento de cadena FX.
            this.nodes.musicBus.connect(this.nodes.dryGain);
            this.nodes.musicBus.connect(this.nodes.reverbSend);
            this.nodes.reverbSend.connect(this.nodes.reverbConvolver);
            this.nodes.reverbConvolver.connect(this.nodes.reverbReturn);

            this.nodes.dryGain.connect(this.nodes.eqLow);
            this.nodes.reverbReturn.connect(this.nodes.eqLow);

            this.nodes.eqLow.connect(this.nodes.eqMid);
            this.nodes.eqMid.connect(this.nodes.eqHigh);
            this.nodes.eqHigh.connect(this.nodes.limiter);
            this.nodes.limiter.connect(this.nodes.masterGain);
            this.nodes.masterGain.connect(ctx.destination);

            this.applyMasterVolume();
            this.applyReverbMix();
            this.applyEq();
            this.applyLimiterThreshold();
        }

        /**
         * Crea un buffer de ruido blanco para la snare.
         * @returns {AudioBuffer} Buffer de ruido.
         */
        createNoiseBuffer() {
            const ctx = this.audioCtx;
            const length = ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
            const channel = noiseBuffer.getChannelData(0);

            for (let i = 0; i < length; i += 1) {
                channel[i] = Math.random() * 2 - 1;
            }

            return noiseBuffer;
        }

        /**
         * Crea un impulso de reverb para ConvolverNode.
         * @param {number} seconds Duracion del impulso.
         * @param {number} decay Curva de decaimiento.
         * @returns {AudioBuffer} Impulso estereo.
         */
        createImpulseResponse(seconds, decay) {
            const ctx = this.audioCtx;
            const length = Math.floor(ctx.sampleRate * seconds);
            const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

            for (let channelIndex = 0; channelIndex < 2; channelIndex += 1) {
                const channel = impulse.getChannelData(channelIndex);

                for (let i = 0; i < length; i += 1) {
                    const envelope = Math.pow(1 - i / length, decay);
                    channel[i] = (Math.random() * 2 - 1) * envelope;
                }
            }

            return impulse;
        }

        /**
         * Inicia reproduccion del scheduler con seguridad de gesto de usuario.
         *
         * @param {boolean} [resetTimeline=true] Cuando es true reinicia al step 0.
         * @returns {Promise<void>} Promesa de arranque.
         */
        async start(resetTimeline = true) {
            this.ensureAudioGraph();

            if (this.audioCtx.state === 'suspended') {
                await this.audioCtx.resume();
            }

            if (this.isRunning) {
                this.refreshTransportLabel();
                return;
            }

            this.isRunning = true;

            if (resetTimeline) {
                this.state.currentStep = 0;
            }

            this.state.nextNoteTime = this.audioCtx.currentTime + 0.08;
            this.schedulerTick();
            this.refreshTransportLabel();
        }

        /**
         * Pausa el scheduler sin destruir los nodos.
         */
        pause() {
            this.isRunning = false;

            if (this.schedulerTimerId !== null) {
                window.clearTimeout(this.schedulerTimerId);
                this.schedulerTimerId = null;
            }

            this.clearVisualTimers();
            this.clearPlayingStepUi();
            this.refreshTransportLabel();
        }

        /**
         * Limpia recursos de audio y timers.
         */
        destroy() {
            this.pause();

            if (this.audioCtx && this.audioCtx.state !== 'closed') {
                this.audioCtx.close();
            }

            this.audioCtx = null;
            this.noiseBuffer = null;
            this.refreshTransportLabel();
        }

        /**
         * Apaga todos los pasos del arpegio.
         */
        clearSteps() {
            this.state.steps = this.state.steps.map(() => 0);
            this.refreshStepButtons();
        }

        /**
         * Enciende todos los pasos del arpegio.
         */
        fillSteps() {
            this.state.steps = this.state.steps.map(() => 1);
            this.refreshStepButtons();
        }

        /**
         * Genera un patron aleatorio de pasos con densidad controlada.
         *
         * @param {number} [density=0.56] Probabilidad de activar cada step.
         */
        randomizeSteps(density = 0.56) {
            const safeDensity = clamp(density, 0.05, 0.95);
            let activeCount = 0;

            this.state.steps = this.state.steps.map(() => {
                const enabled = Math.random() < safeDensity ? 1 : 0;
                if (enabled) {
                    activeCount += 1;
                }
                return enabled;
            });

            // Garantiza al menos un step activo para evitar silencio total.
            if (activeCount === 0) {
                const randomIndex = Math.floor(Math.random() * this.state.patternLength);
                this.state.steps[randomIndex] = 1;
            }

            this.refreshStepButtons();
        }

        /**
         * Tick del Scheduler + Lookahead.
         * Este metodo nunca usa setInterval para evitar drift acumulado.
         */
        schedulerTick() {
            if (!this.isRunning || !this.audioCtx) {
                return;
            }

            while (this.state.nextNoteTime < this.audioCtx.currentTime + this.state.scheduleAheadTime) {
                this.scheduleStep(this.state.currentStep, this.state.nextNoteTime);
                this.advanceStep();
            }

            this.schedulerTimerId = window.setTimeout(this.boundScheduler, this.state.lookaheadMs);
        }

        /**
         * Avanza un paso respetando el BPM actual en tiempo real.
         */
        advanceStep() {
            const baseStepDuration = this.getSecondsPerStep();

            // Swing: acorta pasos pares y alarga impares manteniendo el promedio temporal.
            const swingAmount = clamp(this.state.swing, 0, 0.49);
            const isOddStep = this.state.currentStep % 2 === 1;
            const swingFactor = isOddStep ? (1 + swingAmount) : (1 - swingAmount);

            this.state.nextNoteTime += baseStepDuration * swingFactor;
            this.state.currentStep = (this.state.currentStep + 1) % this.state.patternLength;
        }

        /**
         * Duracion de un paso de dieciseisavo para el BPM actual.
         * @returns {number} Segundos por paso.
         */
        getSecondsPerStep() {
            return 60 / this.state.bpm / 4;
        }

        /**
         * Programa todos los eventos de un paso concreto.
         * @param {number} stepIndex Paso del secuenciador.
         * @param {number} when Tiempo absoluto de AudioContext para disparar.
         */
        scheduleStep(stepIndex, when) {
            const chord = this.getChordForStep(stepIndex);

            if (this.state.channelEnabled.kick && stepIndex % 4 === 0) {
                this.playKick(when);
            }

            if (this.state.channelEnabled.snare && stepIndex % 8 === 4) {
                this.playSnare(when);
            }

            if (this.state.channelEnabled.bass) {
                const bassMidi = this.getBassMidiForStep(stepIndex, chord);
                this.playPulseBass(when, bassMidi);
            }

            if (this.state.channelEnabled.pad && stepIndex % 8 === 0) {
                const padDuration = this.getSecondsPerStep() * 8;
                this.playDreamPads(when, chord, padDuration);
            }

            if (this.state.channelEnabled.melody && this.state.steps[stepIndex]) {
                const arpMidi = this.getArpMidiForStep(stepIndex, chord);
                this.playArpeggio(when, arpMidi);
            }

            this.scheduleStepUi(stepIndex, when);
        }

        /**
         * Mapea el paso actual a una progresion armonica de 16 steps.
         * @param {number} stepIndex Paso actual.
         * @returns {number[]} Acorde de 4 voces en MIDI.
         */
        getChordForStep(stepIndex) {
            const progressionSlot = Math.floor(stepIndex / 4) % this.state.progressionDegrees.length;
            const degree = this.state.progressionDegrees[progressionSlot];

            return [
                this.scaleDegreeToMidi(degree, 0),
                this.scaleDegreeToMidi(degree + 2, 0),
                this.scaleDegreeToMidi(degree + 4, 0),
                this.scaleDegreeToMidi(degree + 6, 0)
            ];
        }

        /**
         * Calcula nota de bajo para el paso y acorde actual.
         * @param {number} stepIndex Paso actual.
         * @param {number[]} chord Acorde actual en MIDI.
         * @returns {number} Nota MIDI para bass.
         */
        getBassMidiForStep(stepIndex, chord) {
            if (stepIndex % 4 === 2) {
                return chord[2] - 24;
            }
            if (stepIndex % 2 === 1) {
                return chord[1] - 24;
            }
            return chord[0] - 24;
        }

        /**
         * Selecciona la nota del arpegio automatico.
         * @param {number} stepIndex Paso actual.
         * @param {number[]} chord Acorde actual en MIDI.
         * @returns {number} Nota MIDI para arpegio.
         */
        getArpMidiForStep(stepIndex, chord) {
            const shape = this.state.arpPattern[stepIndex % this.state.arpPattern.length];
            const chordIndex = shape % chord.length;
            const octaveLift = shape >= 2 ? 24 : 12;
            return chord[chordIndex] + octaveLift;
        }

        /**
         * Convierte un grado de escala a MIDI respetando escala activa.
         * @param {number} degree Grado relativo.
         * @param {number} octaveOffset Desplazamiento extra en octavas.
         * @returns {number} Nota MIDI final.
         */
        scaleDegreeToMidi(degree, octaveOffset) {
            const scaleIntervals = this.scales[this.state.scale] || this.scales.minor;
            const scaleSize = scaleIntervals.length;
            const wrapped = ((degree % scaleSize) + scaleSize) % scaleSize;
            const octaveFromDegree = Math.floor(degree / scaleSize);
            const semitone = scaleIntervals[wrapped] + (octaveFromDegree + octaveOffset) * 12;

            return this.state.rootMidi + semitone;
        }

        /**
         * Kick con pitch sweep exponencial + envelope de amplitud rapida.
         * @param {number} when Tiempo de disparo.
         */
        playKick(when) {
            const ctx = this.audioCtx;
            const level = this.state.channelVolume.kick;
            if (!ctx || level <= 0) {
                return;
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, when);
            osc.frequency.exponentialRampToValueAtTime(52, when + 0.05);
            osc.frequency.exponentialRampToValueAtTime(32, when + 0.16);

            gain.gain.setValueAtTime(0.0001, when);
            gain.gain.exponentialRampToValueAtTime(1.05 * level, when + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);

            osc.connect(gain);
            gain.connect(this.nodes.musicBus);

            osc.start(when);
            osc.stop(when + 0.24);
        }

        /**
         * Snare retro basada en ruido blanco + cuerpo tonal corto.
         * @param {number} when Tiempo de disparo.
         */
        playSnare(when) {
            const ctx = this.audioCtx;
            const level = this.state.channelVolume.snare;
            if (!ctx || !this.noiseBuffer || level <= 0) {
                return;
            }

            const noise = ctx.createBufferSource();
            const noiseFilter = ctx.createBiquadFilter();
            const noiseGain = ctx.createGain();

            noise.buffer = this.noiseBuffer;
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(1900, when);
            noiseFilter.Q.value = 0.7;

            noiseGain.gain.setValueAtTime(0.0001, when);
            noiseGain.gain.exponentialRampToValueAtTime(0.8 * level, when + 0.001);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.nodes.musicBus);

            noise.start(when);
            noise.stop(when + 0.18);

            const body = ctx.createOscillator();
            const bodyGain = ctx.createGain();
            body.type = 'triangle';
            body.frequency.setValueAtTime(220, when);
            body.frequency.exponentialRampToValueAtTime(110, when + 0.08);

            bodyGain.gain.setValueAtTime(0.0001, when);
            bodyGain.gain.exponentialRampToValueAtTime(0.35 * level, when + 0.002);
            bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);

            body.connect(bodyGain);
            bodyGain.connect(this.nodes.musicBus);

            body.start(when);
            body.stop(when + 0.13);
        }

        /**
         * Bass pulse: osciladores + LPF con envolvente de filtro.
         * @param {number} when Tiempo de disparo.
         * @param {number} midi Nota MIDI objetivo.
         */
        playPulseBass(when, midi) {
            const ctx = this.audioCtx;
            const level = this.state.channelVolume.bass;
            if (!ctx || level <= 0) {
                return;
            }

            const primaryOsc = ctx.createOscillator();
            const subOsc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            const frequency = midiToFrequency(midi);

            primaryOsc.type = 'sawtooth';
            subOsc.type = 'square';
            primaryOsc.frequency.setValueAtTime(frequency, when);
            subOsc.frequency.setValueAtTime(frequency * 0.5, when);
            subOsc.detune.value = -4;

            filter.type = 'lowpass';
            filter.Q.value = 7;
            filter.frequency.setValueAtTime(90, when);
            filter.frequency.exponentialRampToValueAtTime(1200, when + 0.045);
            filter.frequency.exponentialRampToValueAtTime(130, when + 0.24);

            gain.gain.setValueAtTime(0.0001, when);
            gain.gain.exponentialRampToValueAtTime(0.52 * level, when + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.26);

            primaryOsc.connect(filter);
            subOsc.connect(filter);
            filter.connect(gain);
            gain.connect(this.nodes.musicBus);

            primaryOsc.start(when);
            subOsc.start(when);
            primaryOsc.stop(when + 0.28);
            subOsc.stop(when + 0.28);
        }

        /**
         * Pads polifonicos con ataque y release largos.
         * @param {number} when Tiempo de disparo.
         * @param {number[]} chord Notas del acorde.
         * @param {number} duration Duracion base del pad.
         */
        playDreamPads(when, chord, duration) {
            const ctx = this.audioCtx;
            const level = this.state.channelVolume.pad;
            if (!ctx || level <= 0) {
                return;
            }

            const padNotes = chord.slice(0, 3);
            const voices = Math.max(1, padNotes.length);
            const sustain = Math.max(duration, this.getSecondsPerStep() * 6);
            const attack = Math.min(0.8, sustain * 0.35);
            const release = Math.min(1.6, sustain * 0.45);
            const stopTime = when + sustain + release + 0.05;

            padNotes.forEach((midi, index) => {
                const oscA = ctx.createOscillator();
                const oscB = ctx.createOscillator();
                const filter = ctx.createBiquadFilter();
                const gain = ctx.createGain();

                const freq = midiToFrequency(midi + 12);
                const voiceLevel = (0.26 * level) / voices;

                oscA.type = 'triangle';
                oscB.type = 'sine';
                oscA.frequency.setValueAtTime(freq, when);
                oscB.frequency.setValueAtTime(freq, when);
                oscA.detune.value = -6 + index * 2;
                oscB.detune.value = 5 - index;

                filter.type = 'lowpass';
                filter.Q.value = 0.8;
                filter.frequency.setValueAtTime(850, when);
                filter.frequency.linearRampToValueAtTime(1700, when + sustain * 0.5);
                filter.frequency.linearRampToValueAtTime(820, when + sustain + release);

                gain.gain.setValueAtTime(0.0001, when);
                gain.gain.linearRampToValueAtTime(voiceLevel, when + attack);
                gain.gain.setValueAtTime(voiceLevel, when + sustain);
                gain.gain.linearRampToValueAtTime(0.0001, when + sustain + release);

                oscA.connect(filter);
                oscB.connect(filter);
                filter.connect(gain);
                gain.connect(this.nodes.musicBus);

                oscA.start(when);
                oscB.start(when);
                oscA.stop(stopTime);
                oscB.stop(stopTime);
            });
        }

        /**
         * Voz de arpegio corta y brillante.
         * @param {number} when Tiempo de disparo.
         * @param {number} midi Nota MIDI objetivo.
         */
        playArpeggio(when, midi) {
            const ctx = this.audioCtx;
            const level = this.state.channelVolume.melody;
            if (!ctx || level <= 0) {
                return;
            }

            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            const frequency = midiToFrequency(midi);

            osc.type = 'square';
            osc.frequency.setValueAtTime(frequency, when);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1300, when);
            filter.frequency.exponentialRampToValueAtTime(2500, when + 0.06);
            filter.frequency.exponentialRampToValueAtTime(1100, when + 0.22);
            filter.Q.value = 4;

            gain.gain.setValueAtTime(0.0001, when);
            gain.gain.exponentialRampToValueAtTime(0.34 * level, when + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.24);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.nodes.musicBus);

            osc.start(when);
            osc.stop(when + 0.26);
        }

        /**
         * Programa el resaltado visual del paso activo con el mismo reloj de audio.
         * @param {number} stepIndex Paso del secuenciador.
         * @param {number} when Tiempo absoluto del audio.
         */
        scheduleStepUi(stepIndex, when) {
            if (!this.audioCtx) {
                return;
            }

            const delayMs = Math.max(0, (when - this.audioCtx.currentTime) * 1000);
            const timer = window.setTimeout(() => {
                this.paintPlayingStep(stepIndex);
            }, delayMs);

            this.visualTimerIds.push(timer);

            if (this.visualTimerIds.length > 64) {
                const oldTimer = this.visualTimerIds.shift();
                if (oldTimer !== undefined) {
                    window.clearTimeout(oldTimer);
                }
            }
        }

        /**
         * Marca visualmente el step en reproduccion.
         * @param {number} stepIndex Paso actual.
         */
        paintPlayingStep(stepIndex) {
            this.ui.stepButtons.forEach((button, index) => {
                button.classList.toggle('playing', index === stepIndex);
            });
        }

        /**
         * Quita la marca de reproduccion de todos los botones.
         */
        clearPlayingStepUi() {
            this.ui.stepButtons.forEach((button) => {
                button.classList.remove('playing');
            });
        }

        /**
         * Limpia timers visuales pendientes.
         */
        clearVisualTimers() {
            this.visualTimerIds.forEach((timer) => window.clearTimeout(timer));
            this.visualTimerIds = [];
        }

        /**
         * Actualiza visualmente el estado de activacion de pasos.
         */
        refreshStepButtons() {
            this.ui.stepButtons.forEach((button, index) => {
                button.classList.toggle('active', Boolean(this.state.steps[index]));
            });
        }

        /**
         * Aplica volumen master al nodo final.
         */
        applyMasterVolume() {
            if (!this.nodes.masterGain) {
                return;
            }
            this.nodes.masterGain.gain.setValueAtTime(this.state.masterVolume, this.audioCtx.currentTime);
        }

        /**
         * Aplica mezcla dry/wet de reverb.
         */
        applyReverbMix() {
            if (!this.nodes.dryGain || !this.nodes.reverbSend || !this.nodes.reverbReturn || !this.audioCtx) {
                return;
            }

            const mix = this.state.reverbMix;
            const dryLevel = clamp(1 - mix * 0.7, 0, 1);
            const sendLevel = clamp(mix, 0, 1);
            const returnLevel = clamp(mix * 0.95, 0, 1);

            this.nodes.dryGain.gain.setValueAtTime(dryLevel, this.audioCtx.currentTime);
            this.nodes.reverbSend.gain.setValueAtTime(sendLevel, this.audioCtx.currentTime);
            this.nodes.reverbReturn.gain.setValueAtTime(returnLevel, this.audioCtx.currentTime);
        }

        /**
         * Aplica parametros de ecualizacion master desde UI.
         */
        applyEq() {
            if (!this.nodes.eqLow || !this.nodes.eqMid || !this.nodes.eqHigh || !this.audioCtx) {
                return;
            }

            const lowDb = readRangeValue(this.ui.eqLow, 0);
            const midDb = readRangeValue(this.ui.eqMid, 0);
            const highDb = readRangeValue(this.ui.eqHigh, 0);

            this.nodes.eqLow.gain.setValueAtTime(lowDb, this.audioCtx.currentTime);
            this.nodes.eqMid.gain.setValueAtTime(midDb, this.audioCtx.currentTime);
            this.nodes.eqHigh.gain.setValueAtTime(highDb, this.audioCtx.currentTime);
        }

        /**
         * Aplica umbral del limiter final.
         */
        applyLimiterThreshold() {
            if (!this.nodes.limiter || !this.audioCtx) {
                return;
            }

            this.nodes.limiter.threshold.setValueAtTime(this.state.limiterThreshold, this.audioCtx.currentTime);
        }

        /**
         * Refresca todas las etiquetas de estado del HUD.
         */
        refreshAllUi() {
            this.refreshMasterVolumeLabel();
            this.refreshBpmLabel();
            this.refreshRootLabel();
            this.refreshSwingLabel();
            this.refreshScaleLabel();
            this.refreshReverbLabel();
            this.refreshLimiterLabel();
            this.refreshEqLabels();
            this.refreshChannelLabels();
            this.refreshStepButtons();
            this.refreshTransportLabel();
        }

        /**
         * Refresca etiqueta de volumen master.
         */
        refreshMasterVolumeLabel() {
            setText(this.ui.volumeLabel, `${Math.round(this.state.masterVolume * 100)}%`);
        }

        /**
         * Refresca etiqueta de BPM.
         */
        refreshBpmLabel() {
            setText(this.ui.bpmLabel, String(this.state.bpm));
        }

        /**
         * Refresca etiqueta de tonica.
         */
        refreshRootLabel() {
            const normalized = ((this.state.rootMidi % 12) + 12) % 12;
            const name = this.noteNames[normalized] || 'F';
            setText(this.ui.rootLabel, name);
        }

        /**
         * Refresca etiqueta de swing.
         */
        refreshSwingLabel() {
            setText(this.ui.swingLabel, `${Math.round(this.state.swing * 100)}%`);
        }

        /**
         * Refresca etiqueta de escala activa.
         */
        refreshScaleLabel() {
            const names = {
                minor: 'Menor',
                phrygian: 'Frigia',
                dorian: 'Dorica'
            };

            const name = names[this.state.scale] || 'Menor';
            setText(this.ui.scaleLabel, name);
        }

        /**
         * Refresca etiqueta de reverb.
         */
        refreshReverbLabel() {
            setText(this.ui.reverbLabel, `${Math.round(this.state.reverbMix * 100)}%`);
        }

        /**
         * Refresca etiqueta de limiter.
         */
        refreshLimiterLabel() {
            setText(this.ui.limiterLabel, `${this.state.limiterThreshold.toFixed(1)} dB`);
        }

        /**
         * Refresca etiquetas del ecualizador.
         */
        refreshEqLabels() {
            const lowDb = readRangeValue(this.ui.eqLow, 0);
            const midDb = readRangeValue(this.ui.eqMid, 0);
            const highDb = readRangeValue(this.ui.eqHigh, 0);

            setText(this.ui.eqLowLabel, `${lowDb.toFixed(0)} dB`);
            setText(this.ui.eqMidLabel, `${midDb.toFixed(0)} dB`);
            setText(this.ui.eqHighLabel, `${highDb.toFixed(0)} dB`);
        }

        /**
         * Refresca etiquetas de volumen por canal.
         */
        refreshChannelLabels() {
            setText(this.ui.channelKickLabel, `${Math.round(this.state.channelVolume.kick * 100)}%`);
            setText(this.ui.channelSnareLabel, `${Math.round(this.state.channelVolume.snare * 100)}%`);
            setText(this.ui.channelBassLabel, `${Math.round(this.state.channelVolume.bass * 100)}%`);
            setText(this.ui.channelPadLabel, `${Math.round(this.state.channelVolume.pad * 100)}%`);
            setText(this.ui.channelMelodyLabel, `${Math.round(this.state.channelVolume.melody * 100)}%`);
        }

        /**
         * Refresca texto del boton de transporte principal.
         */
        refreshTransportLabel() {
            if (!this.ui.audioToggle) {
                return;
            }

            this.ui.audioToggle.innerText = this.isRunning ? 'PAUSAR' : 'REANUDAR';
        }
    }

    // Export global para uso desde index.html sin bundlers.
    window.SynthwaveAudioEngine = SynthwaveAudioEngine;
})();
