// Procedural canvas textures — no image assets needed.
import * as THREE from 'three';

let seed = 1337;
export function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
export const rr = (a, b) => a + (b - a) * rand();

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function toTex(c, repeat = [1, 1], srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function speckle(ctx, w, h, n, alpha, light = true, size = 2) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${rand() * alpha})`;
    ctx.fillRect(rand() * w, rand() * h, rr(0.5, size), rr(0.5, size));
  }
}

export function grassTex(stripes = true, base = '#5f8f2f') {
  const [c, x] = canvas(512);
  x.fillStyle = base; x.fillRect(0, 0, 512, 512);
  if (stripes) {
    for (let i = 0; i < 8; i++) {
      x.fillStyle = i % 2 ? 'rgba(255,255,200,0.07)' : 'rgba(0,30,0,0.06)';
      x.fillRect(0, i * 64, 512, 64);
    }
  }
  speckle(x, 512, 512, 9000, 0.12, true, 2);
  speckle(x, 512, 512, 9000, 0.12, false, 2);
  return c;
}

export function sandTex() {
  const [c, x] = canvas(512);
  x.fillStyle = '#d9b98b'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {
    const g = x.createRadialGradient(rand() * 512, rand() * 512, 0, rand() * 512, rand() * 512, rr(40, 140));
    g.addColorStop(0, rand() > 0.5 ? 'rgba(170,130,80,0.15)' : 'rgba(255,240,210,0.15)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  }
  speckle(x, 512, 512, 12000, 0.1, false, 1.5);
  return toTex(c, [1, 1]);
}

export function asphaltTex() {
  const [c, x] = canvas(512);
  x.fillStyle = '#8d8b88'; x.fillRect(0, 0, 512, 512);
  speckle(x, 512, 512, 30000, 0.18, false, 2);
  speckle(x, 512, 512, 12000, 0.15, true, 1.5);
  return toTex(c);
}

export function travertineTex(tile = 4) {
  const S = 1024; const [c, x] = canvas(S);
  const n = tile; const s = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const l = rr(-10, 10);
    x.fillStyle = `rgb(${226 + l},${214 + l},${196 + l})`;
    x.fillRect(i * s, j * s, s, s);
    // veins (horizontal travertine bands)
    for (let k = 0; k < 14; k++) {
      x.strokeStyle = `rgba(${150 + rr(-20, 20)},${130},${100},${rr(0.04, 0.14)})`;
      x.lineWidth = rr(1, 5);
      const y0 = j * s + rand() * s;
      x.beginPath(); x.moveTo(i * s, y0);
      for (let t = 0; t <= 6; t++) x.lineTo(i * s + (t / 6) * s, y0 + rr(-4, 4));
      x.stroke();
    }
    speckle(x, S, S, 400, 0.05, false, 3);
  }
  x.strokeStyle = 'rgba(120,105,85,0.35)'; x.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, S); x.stroke();
    x.beginPath(); x.moveTo(0, i * s); x.lineTo(S, i * s); x.stroke();
  }
  return toTex(c);
}

export function marbleTex() {
  const S = 1024; const [c, x] = canvas(S);
  x.fillStyle = '#f2efea'; x.fillRect(0, 0, S, S);
  for (let k = 0; k < 26; k++) {
    let px = rand() * S, py = rand() * S;
    const ang = rr(-0.6, 0.6) + Math.PI / 4;
    x.strokeStyle = k % 3 === 0 ? 'rgba(110,70,90,0.55)' : 'rgba(120,110,120,0.35)';
    x.lineWidth = k % 3 === 0 ? rr(2, 5) : rr(0.6, 2);
    x.beginPath(); x.moveTo(px, py);
    for (let t = 0; t < 40; t++) {
      px += Math.cos(ang + rr(-0.9, 0.9)) * 30; py += Math.sin(ang + rr(-0.9, 0.9)) * 30;
      x.lineTo(px, py);
    }
    x.stroke();
  }
  return toTex(c);
}

export function woodTex(base = [92, 48, 26]) {
  const W = 512, H = 1024; const [c, x] = canvas(W, H);
  x.fillStyle = `rgb(${base})`; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const xx = rand() * W; const l = rr(-30, 25);
    x.strokeStyle = `rgba(${base[0] + l},${base[1] + l * 0.6},${base[2] + l * 0.4},${rr(0.2, 0.6)})`;
    x.lineWidth = rr(1, 4);
    x.beginPath(); x.moveTo(xx, 0);
    for (let t = 0; t <= 20; t++) x.lineTo(xx + Math.sin(t * 0.7 + i) * rr(1, 5), (t / 20) * H);
    x.stroke();
  }
  return toTex(c);
}

export function slatTex() {
  // wood slat ceiling (warm)
  const [c, x] = canvas(512);
  const w = woodTex([150, 82, 42]).image;
  x.drawImage(w, 0, 0, 512, 512);
  for (let i = 0; i < 512; i += 32) {
    x.fillStyle = 'rgba(30,12,4,0.55)'; x.fillRect(i, 0, 5, 512);
  }
  return toTex(c);
}

export function zebraTex() {
  const S = 1024; const [c, x] = canvas(S);
  x.fillStyle = '#ece8e0'; x.fillRect(0, 0, S, S);
  x.fillStyle = '#1b2a5c';
  for (let k = -2; k < 22; k++) {
    const y0 = k * 52;
    const ph = rand() * 6, amp = rr(14, 30), th = rr(14, 26);
    x.beginPath();
    for (let t = 0; t <= 64; t++) { const xx = (t / 64) * S; x.lineTo(xx, y0 + Math.sin(xx * 0.012 + ph) * amp); }
    for (let t = 64; t >= 0; t--) { const xx = (t / 64) * S; x.lineTo(xx, y0 + th + Math.sin(xx * 0.012 + ph + 0.4) * amp * 0.8); }
    x.closePath(); x.fill();
  }
  // border
  x.strokeStyle = '#1b2a5c'; x.lineWidth = 26; x.strokeRect(13, 13, S - 26, S - 26);
  speckle(x, S, S, 20000, 0.06, false, 2);
  return toTex(c);
}

export function renderTex() {
  // off-white render for facades
  const [c, x] = canvas(256);
  x.fillStyle = '#f1ece4'; x.fillRect(0, 0, 256, 256);
  speckle(x, 256, 256, 4000, 0.05, false, 2);
  return toTex(c);
}

export function stoneTex() {
  const S = 512; const [c, x] = canvas(S);
  x.fillStyle = '#c9b49a'; x.fillRect(0, 0, S, S);
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    let xx = -rand() * 120;
    while (xx < S) {
      const w = rr(70, 160), l = rr(-18, 18);
      x.fillStyle = `rgb(${200 + l},${180 + l},${154 + l})`;
      x.fillRect(xx + 2, r * (S / rows) + 2, w - 4, S / rows - 4);
      xx += w;
    }
  }
  speckle(x, S, S, 5000, 0.08, false, 2);
  return toTex(c);
}

export function frondTex() {
  // feather-like palm frond with alpha
  const W = 128, H = 512; const [c, x] = canvas(W, H);
  x.clearRect(0, 0, W, H);
  x.strokeStyle = '#6d6a2a'; x.lineWidth = 4;
  x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke();
  for (let i = 8; i < H; i += 7) {
    const t = i / H; const len = (W / 2) * Math.sin(Math.PI * Math.min(1, t * 1.15)) * 0.98;
    const g = 70 + rr(-15, 25);
    x.strokeStyle = `rgb(${g - 20},${g + 45},${30})`;
    x.lineWidth = rr(2.5, 4);
    x.beginPath(); x.moveTo(W / 2, i); x.lineTo(W / 2 - len, i + 22); x.stroke();
    x.beginPath(); x.moveTo(W / 2, i); x.lineTo(W / 2 + len, i + 22); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function barkTex() {
  const [c, x] = canvas(128, 512);
  x.fillStyle = '#8a7356'; x.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 512; i += 10) {
    x.fillStyle = `rgba(60,45,30,${rr(0.3, 0.6)})`;
    x.fillRect(0, i, 128, rr(2, 4));
  }
  speckle(x, 128, 512, 1500, 0.15, false, 2);
  return toTex(c);
}

export function waterNormal() {
  const S = 256; const [c, x] = canvas(S);
  const img = x.createImageData(S, S);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const a = Math.sin(i * 0.11 + Math.sin(j * 0.07) * 2) + Math.sin(j * 0.13 + Math.cos(i * 0.05) * 2);
    const b = Math.cos(i * 0.09 - j * 0.05) + Math.sin((i + j) * 0.08);
    const k = (j * S + i) * 4;
    img.data[k] = 128 + a * 22; img.data[k + 1] = 128 + b * 22; img.data[k + 2] = 255; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return toTex(c, [3, 3], false);
}

export function windowTex() {
  // distant tower facades
  const [c, x] = canvas(128, 256);
  x.fillStyle = '#aeb8c4'; x.fillRect(0, 0, 128, 256);
  for (let j = 0; j < 256; j += 8) for (let i = 0; i < 128; i += 8) {
    x.fillStyle = `rgba(60,75,95,${rr(0.2, 0.55)})`; x.fillRect(i + 1, j + 2, 6, 5);
  }
  return toTex(c);
}

export { canvas, toTex };
