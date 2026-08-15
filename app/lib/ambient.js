// Procedural Web Audio API sound generator for background ambiance.
// Works completely client-side without downloading external MP3 files.

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.nodes = {};
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Rain Sound Generator (Filtered Pink Noise with modulation)
  createRainNode() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    return gain;
  }

  // Vinyl Crackle Generator
  createCrackleNode() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.001) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      } else if (Math.random() < 0.005) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.005;
      }
    }

    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = buffer;
    crackleSource.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    crackleSource.connect(gain);
    gain.connect(this.masterGain);

    crackleSource.start();
    return gain;
  }

  // Wind Generator (Low Pass Filtered Noise with LFO)
  createWindNode() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO to modulate filter frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    windSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    windSource.start();
    return gain;
  }

  // Cafe Ambience Generator
  createCafeNode() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const cafeSource = this.ctx.createBufferSource();
    cafeSource.buffer = buffer;
    cafeSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    cafeSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    cafeSource.start();
    return gain;
  }

  setVolume(soundType, val) {
    this.init();
    this.resume();

    if (!this.nodes[soundType]) {
      if (soundType === "rain") this.nodes.rain = this.createRainNode();
      if (soundType === "crackle") this.nodes.crackle = this.createCrackleNode();
      if (soundType === "wind") this.nodes.wind = this.createWindNode();
      if (soundType === "cafe") this.nodes.cafe = this.createCafeNode();
    }

    const nodeGain = this.nodes[soundType];
    if (nodeGain && this.ctx) {
      nodeGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  stopAll() {
    Object.keys(this.nodes).forEach((key) => {
      if (this.nodes[key] && this.ctx) {
        this.nodes[key].gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
    });
  }
}

export const ambientEngine = new AmbientSoundEngine();
