/**
 * Sons do jogo (Web Audio API, sem ficheiros externos) +
 * som contínuo do motor a partir do mp3 já existente no projecto.
 */

let ctx: AudioContext | null = null;
let motorEl: HTMLAudioElement | null = null;

function audio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  const c = ctx;
  if (c.state === 'suspended') void c.resume();
  return c;
}

function tom(freq: number, dur: number, tipo: OscillatorType = 'sine', gain = 0.14, alvo?: number) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  if (alvo) osc.frequency.exponentialRampToValueAtTime(alvo, a.currentTime + dur);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

function ruido(dur: number, gain = 0.18, corte = 1600) {
  const a = audio();
  if (!a) return;
  const frames = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, frames, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filtro = a.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.value = corte;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(filtro).connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  click: () => tom(760, 0.05, 'square', 0.06),
  select: () => tom(520, 0.09, 'sine', 0.1),
  snap: () => {
    tom(190, 0.13, 'triangle', 0.22, 95);
    ruido(0.07, 0.1, 3200);
  },
  parafuso: () => {
    tom(320, 0.16, 'sawtooth', 0.07, 150);
    tom(240, 0.12, 'sawtooth', 0.05, 120);
  },
  buzz: () => {
    tom(150, 0.28, 'square', 0.1, 105);
    tom(110, 0.28, 'sawtooth', 0.08);
  },
  ding: () => {
    tom(1320, 0.22, 'sine', 0.1);
    tom(1760, 0.18, 'sine', 0.06);
  },
  faisca: () => ruido(0.12, 0.22, 4200),
  crepitar: () => ruido(0.4, 0.1, 900),
  sucesso: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tom(f, 0.3, 'sine', 0.11), i * 140)),
};

export function motorLigar() {
  if (!motorEl) {
    motorEl = new Audio('/mp3/electric-motor-whir-77588.mp3');
    motorEl.loop = true;
    motorEl.volume = 0.4;
  }
  void motorEl.play().catch(() => undefined);
}

export function motorDesligar() {
  if (motorEl) {
    motorEl.pause();
    motorEl.currentTime = 0;
  }
}
