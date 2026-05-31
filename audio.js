// Web Audio API Synthesizer for NEON STRIKE 1.5 - Story Mode
class SoundSystem {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterVolume = this.ctx.createGain();
            this.masterVolume.gain.setValueAtTime(0.4, this.ctx.currentTime); // Master volume at 40%
            this.masterVolume.connect(this.ctx.destination);
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Dynamic synth-wave sound effect for laser fire
    playShoot(isScoped = false) {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        if (isScoped) {
            osc.type = 'sine';
            osc2.type = 'triangle';
            osc.frequency.setValueAtTime(400, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.25);
            osc2.frequency.setValueAtTime(200, time);
            osc2.frequency.exponentialRampToValueAtTime(30, time + 0.25);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, time);

            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
            osc.start(time);
            osc2.start(time);
            osc.stop(time + 0.26);
            osc2.stop(time + 0.26);
        } else {
            osc.type = 'sawtooth';
            osc2.type = 'square';
            osc.frequency.setValueAtTime(900, time);
            osc.frequency.exponentialRampToValueAtTime(120, time + 0.15);
            osc2.frequency.setValueAtTime(450, time);
            osc2.frequency.exponentialRampToValueAtTime(60, time + 0.15);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1500, time);
            filter.frequency.exponentialRampToValueAtTime(200, time + 0.15);

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
            osc.start(time);
            osc2.start(time);
            osc.stop(time + 0.17);
            osc2.stop(time + 0.17);
        }
    }

    // CS-Style Reload Sounds: Mag out (click) & Mag in (clack)
    playReload() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        
        // Sound 1: Mag Out (t = 0)
        this.playReloadClick(time, 800, 400, 0.08);

        // Sound 2: Slide Back (t = 0.5s)
        setTimeout(() => {
            if (!this.ctx) return;
            this.playReloadClick(this.ctx.currentTime, 500, 200, 0.1);
        }, 500);

        // Sound 3: Mag In & Release (t = 1.2s)
        setTimeout(() => {
            if (!this.ctx) return;
            this.playReloadClick(this.ctx.currentTime, 1200, 600, 0.12);
        }, 1200);
    }

    playReloadClick(time, startFreq, endFreq, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time);
        osc.stop(time + duration + 0.01);
    }

    // Player jump sound
    playJump() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(350, time + 0.2);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.start(time);
        osc.stop(time + 0.21);
    }

    // Hit confirmation beep
    playHitmarker() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, time); // High pitched tink
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.06);
    }

    // Boss Shield deflected hit (electric zap)
    playShieldHit() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, time);
        osc.frequency.linearRampToValueAtTime(1800, time + 0.08);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.start(time);
        osc.stop(time + 0.09);
    }

    // Drone Explosion: Deep white noise crash
    playExplosion() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        
        // Create noise buffer
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, time);
        filter.frequency.exponentialRampToValueAtTime(10, time + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noiseNode.start(time);
        noiseNode.stop(time + 0.46);
    }

    // Huge Boss Explosion: Deeper, longer crash with structural pitch drops
    playBossExplosion() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        
        // Sound 1: Deep noise crash
        const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, time);
        filter.frequency.exponentialRampToValueAtTime(5, time + 1.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noiseNode.start(time);
        noiseNode.stop(time + 1.51);

        // Sound 2: Deep bass drop
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.connect(subGain);
        subGain.connect(this.masterVolume);
        
        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(110, time);
        subOsc.frequency.linearRampToValueAtTime(20, time + 1.2);
        
        subGain.gain.setValueAtTime(0.4, time);
        subGain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
        
        subOsc.start(time);
        subOsc.stop(time + 1.21);
    }

    // Player taking damage
    playPlayerHit() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.linearRampToValueAtTime(60, time + 0.25);

        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.start(time);
        osc.stop(time + 0.26);
    }

    // Next wave / Mission Success arpeggio
    playWaveStart() {
        if (!this.ctx) return;
        this.resume();

        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major chord
        const time = this.ctx.currentTime;

        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterVolume);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time + (index * 0.12));

            gain.gain.setValueAtTime(0, time + (index * 0.12));
            gain.gain.linearRampToValueAtTime(0.15, time + (index * 0.12) + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + (index * 0.12) + 0.25);

            osc.start(time + (index * 0.12));
            osc.stop(time + (index * 0.12) + 0.26);
        });
    }

    // Major mission completion fanfare arpeggio (C Major -> F Major -> G Major)
    playMissionSuccess() {
        if (!this.ctx) return;
        this.resume();
        
        const time = this.ctx.currentTime;
        const noteSequence = [
            { freq: 261.63, delay: 0.0 }, // C4
            { freq: 329.63, delay: 0.1 }, // E4
            { freq: 392.00, delay: 0.2 }, // G4
            { freq: 523.25, delay: 0.3 }, // C5 (held)
            { freq: 349.23, delay: 0.6 }, // F4
            { freq: 440.00, delay: 0.7 }, // A4
            { freq: 523.25, delay: 0.8 }, // C5
            { freq: 698.46, delay: 0.9 }, // F5 (held)
            { freq: 392.00, delay: 1.2 }, // G4
            { freq: 493.88, delay: 1.3 }, // B4
            { freq: 587.33, delay: 1.4 }, // D5
            { freq: 783.99, delay: 1.5 }, // G5 (held longer)
        ];
        
        noteSequence.forEach((note) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterVolume);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, time + note.delay);
            
            gain.gain.setValueAtTime(0, time + note.delay);
            gain.gain.linearRampToValueAtTime(0.2, time + note.delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + note.delay + 0.4);
            
            osc.start(time + note.delay);
            osc.stop(time + note.delay + 0.41);
        });
    }

    // Footsteps sound (low thud)
    playFootstep() {
        if (!this.ctx) return;
        this.resume();

        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.08);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        osc.start(time);
        osc.stop(time + 0.09);
    }
}

const sounds = new SoundSystem();
window.sounds = sounds;
