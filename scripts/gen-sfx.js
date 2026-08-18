// Génère les effets sonores du jeu par synthèse (WAV 44,1 kHz mono 16 bits).
// Pas de dépendance, pas de fichier à licencier : le son est calculé.
const fs = require('fs');
const path = require('path');

const SR = 44100;
const OUT = process.argv[2];

function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);   // PCM
  buf.writeUInt16LE(1, 22);   // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`${name.padEnd(16)} ${(buf.length / 1024).toFixed(0)} Ko`);
}

const env = (t, d, a = 0.005, r = 0.06) =>
  t < a ? t / a : t > d - r ? Math.max(0, (d - t) / r) : 1;
const sine = (t, f) => Math.sin(2 * Math.PI * f * t);
const noise = () => Math.random() * 2 - 1;

function build(dur, fn) {
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, dur) || 0;
  return out;
}

// ─── Interface ───────────────────────────────────────────────────────────
writeWav('tap.wav', build(0.07, (t, d) =>
  sine(t, 880 + 400 * t * 10) * env(t, d, 0.002, 0.04) * 0.22));

writeWav('confirm.wav', build(0.22, (t, d) => {
  const f = t < 0.09 ? 523 : t < 0.15 ? 659 : 784;
  return sine(t, f) * env(t, d, 0.004, 0.09) * 0.24;
}));

writeWav('deny.wav', build(0.18, (t, d) =>
  (sine(t, 220 - 90 * t) + 0.4 * sine(t, 110)) * env(t, d, 0.004, 0.07) * 0.2));

// ─── Combat ──────────────────────────────────────────────────────────────
writeWav('hit.wav', build(0.14, (t, d) => {
  const body = sine(t, 160 * Math.exp(-9 * t));
  const crack = noise() * Math.exp(-70 * t);
  return (body * 0.6 + crack * 0.5) * env(t, d, 0.001, 0.05) * 0.5;
}));

writeWav('crit.wav', build(0.36, (t, d) => {
  const body = sine(t, 220 * Math.exp(-6 * t)) * 0.7;
  const metal = (sine(t, 2100) + sine(t, 3170)) * Math.exp(-14 * t) * 0.28;
  const crack = noise() * Math.exp(-40 * t) * 0.5;
  return (body + metal + crack) * env(t, d, 0.001, 0.14) * 0.55;
}));

writeWav('dodge.wav', build(0.2, (t, d) => {
  const sweep = noise() * Math.exp(-11 * t);
  return sweep * Math.sin(2 * Math.PI * 3 * t) * env(t, d, 0.004, 0.08) * 0.32;
}));

writeWav('ko.wav', build(0.5, (t, d) => {
  const fall = sine(t, 300 * Math.exp(-2.4 * t));
  const thud = noise() * Math.exp(-26 * t) * 0.4;
  return (fall * 0.55 + thud) * env(t, d, 0.003, 0.2) * 0.5;
}));

// ─── Récompenses ─────────────────────────────────────────────────────────
writeWav('coin.wav', build(0.26, (t, d) => {
  const a = sine(t, 1050) * Math.exp(-11 * t);
  const b = sine(t, 1560) * Math.exp(-8 * t) * 0.8;
  return (a + b) * env(t, d, 0.002, 0.1) * 0.3;
}));

writeWav('victory.wav', build(1.0, (t, d) => {
  // arpège majeur montant, façon fanfare de kabar
  const notes = [523, 659, 784, 1047];
  const step = Math.min(notes.length - 1, Math.floor(t / 0.14));
  const f = notes[step];
  const held = t > 0.56 ? 1046 : f;
  const v = sine(t, held) * 0.6 + sine(t, held * 2) * 0.18 + sine(t, held * 1.5) * 0.12;
  return v * env(t, d, 0.006, 0.34) * 0.3;
}));

writeWav('defeat.wav', build(0.9, (t, d) => {
  const notes = [392, 349, 294, 233];
  const step = Math.min(notes.length - 1, Math.floor(t / 0.2));
  const f = notes[step];
  return (sine(t, f) * 0.6 + sine(t, f / 2) * 0.25) * env(t, d, 0.008, 0.3) * 0.26;
}));

writeWav('levelup.wav', build(1.1, (t, d) => {
  const notes = [523, 659, 784, 1047, 1319];
  const step = Math.min(notes.length - 1, Math.floor(t / 0.11));
  const f = notes[step];
  const shimmer = sine(t, f * 2.02) * 0.16 * Math.exp(-1.5 * t);
  return (sine(t, f) * 0.62 + shimmer) * env(t, d, 0.005, 0.42) * 0.3;
}));

writeWav('chest.wav', build(1.3, (t, d) => {
  // grincement puis éclat
  const creak = t < 0.45
    ? noise() * 0.16 * Math.sin(2 * Math.PI * 7 * t) * (1 - t / 0.45)
    : 0;
  const burst = t >= 0.42
    ? (sine(t - 0.42, 880) + sine(t - 0.42, 1320) * 0.7 + sine(t - 0.42, 1760) * 0.45)
      * Math.exp(-3.2 * (t - 0.42)) * 0.34
    : 0;
  const sparkle = t >= 0.5
    ? sine(t, 2600 + 500 * Math.sin(2 * Math.PI * 5 * t)) * Math.exp(-3 * (t - 0.5)) * 0.12
    : 0;
  return (creak + burst + sparkle) * env(t, d, 0.004, 0.3) * 0.62;
}));

// ─── Musique de fond : boucle séga, 8 mesures ────────────────────────────
{
  const bpm = 104;
  const beat = 60 / bpm;
  const bars = 8;
  const dur = beat * 4 * bars;
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);

  // Basse : i–VI–III–VII en la mineur, deux mesures par accord
  const roots = [110, 87.31, 130.81, 98];
  // Kayamb : bruit filtré sur les croches, accent sur le contretemps
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bar = Math.floor(t / (beat * 4));
    const inBeat = (t % beat) / beat;
    const eighth = Math.floor((t % (beat * 4)) / (beat / 2));
    const root = roots[Math.floor(bar / 2) % roots.length];

    // basse
    const bassEnv = Math.exp(-3.4 * (t % (beat / 2)));
    const bass = (Math.sin(2 * Math.PI * root * t) * 0.55
      + Math.sin(2 * Math.PI * root * 2 * t) * 0.12) * bassEnv * 0.34;

    // kayamb (secoué) : bruit court, plus fort sur les contretemps
    const accent = eighth % 2 === 1 ? 1 : 0.45;
    const shakeEnv = Math.exp(-42 * (t % (beat / 2)));
    const shake = noise() * shakeEnv * 0.1 * accent;

    // roulèr (tambour) : temps 1 et 3
    const beatIdx = Math.floor((t % (beat * 4)) / beat);
    const drumEnv = Math.exp(-16 * (t % beat));
    const drum = (beatIdx === 0 || beatIdx === 2)
      ? Math.sin(2 * Math.PI * 70 * Math.exp(-5 * (t % beat)) * t) * drumEnv * 0.26
      : 0;

    // nappe : quinte tenue, très en retrait
    const pad = (Math.sin(2 * Math.PI * root * 3 * t) * 0.05
      + Math.sin(2 * Math.PI * root * 4.5 * t) * 0.03)
      * (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.08 * t));

    let v = bass + shake + drum + pad;
    // fondu aux extrémités pour que la boucle ne claque pas
    const fade = Math.min(1, t / 0.6, (dur - t) / 0.6);
    out[i] = v * fade * 0.62;
  }
  writeWav('theme.wav', out);
}
