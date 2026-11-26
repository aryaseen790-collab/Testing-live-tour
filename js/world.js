// The community: sky, desert, golf course, skyline, streets, villas, palms.
import * as THREE from 'three';
import * as T from './textures.js';
import { rand, rr } from './textures.js';

export const SUN_DIR = new THREE.Vector3(-0.82, 0.24, -0.4).normalize();
export const STREET_SPACING = 64;
export const STREET_COUNT = 8;
export const streetX = (i) => (i - (STREET_COUNT - 1) / 2) * STREET_SPACING;
export const HERO_Z = -20; // hero villa centre (world z)

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

export function tm(x, y, z, sx, sy, sz, ry = 0, rx = 0, rz = 0) {
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), _q, new THREE.Vector3(sx, sy, sz));
}

// Groups thousands of boxes into one InstancedMesh per material.
export class Batch {
  constructor(mats) { this.mats = mats; this.lists = {}; }
  add(key, m) { (this.lists[key] ||= []).push(m); }
  // axis-aligned box in a parent frame, given min/max corners
  box(key, P, x0, x1, y0, y1, z0, z1) {
    this.add(key, P.clone().multiply(tm((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0)));
  }
  build(opts = {}) {
    const g = new THREE.Group();
    for (const [key, list] of Object.entries(this.lists)) {
      const mat = this.mats[key];
      if (!mat) { console.warn('missing material', key); continue; }
      const mesh = new THREE.InstancedMesh(opts.geometry || unitBox, mat, list.length);
      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere?.();
      mesh.castShadow = opts.cast ?? !mat.transparent;
      mesh.receiveShadow = true;
      mesh.name = key;
      g.add(mesh);
    }
    return g;
  }
}

export function makeMaterials() {
  const S = (o) => new THREE.MeshStandardMaterial(o);
  const wood = T.woodTex();
  const walnut = T.woodTex([96, 52, 30]);
  const m = {
    white: S({ map: T.renderTex(), color: 0xffffff, roughness: 0.85 }),
    offwhite: S({ color: 0xe7dfd3, roughness: 0.9 }),
    stone: S({ map: T.stoneTex(), roughness: 0.9 }),
    wood: S({ map: wood, roughness: 0.55, color: 0xc89a78 }),
    walnut: S({ map: walnut, roughness: 0.45 }),
    darkGlass: S({ color: 0x23303d, metalness: 0.65, roughness: 0.06 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xcfe3ea, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.16, depthWrite: false, envMapIntensity: 1.6 }),
    frame: S({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.6 }),
    garage: S({ color: 0xd5d1ca, roughness: 0.55 }),
    lawn: S({ map: T.toTex(T.grassTex(false, '#6c9a36'), [4, 4]), roughness: 1 }),
    hedge: S({ color: 0x3f6b27, roughness: 1 }),
    paving: S({ color: 0xd9cdb8, roughness: 0.9 }),
    curb: S({ color: 0xd8d4cc, roughness: 0.8 }),
    pole: S({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.7 }),
    lampHead: S({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 0.6 }),
    roof: S({ color: 0xcfc8bd, roughness: 0.95 }),
    pool: S({ color: 0x4fc3d1, roughness: 0.1 }),
    city: S({ map: T.windowTex(), color: 0xc4ccd6, emissive: 0x9aa6b6, emissiveIntensity: 0.35, roughness: 0.6, fog: false, transparent: true, opacity: 0.8 }),
    tower: S({ color: 0xc9d1db, emissive: 0x9aa6b6, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.5, fog: false, transparent: true, opacity: 0.85 }),
    canopy: S({ color: 0x4d7a2c, roughness: 1, flatShading: true }),
    trunk: S({ map: T.barkTex(), roughness: 1 }),
  };
  m.frond = S({ map: T.frondTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.85, color: 0xd8e8b0 });
  m.frondDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: m.frond.map, alphaTest: 0.45, side: THREE.DoubleSide });
  return m;
}

// ---------- sky -------------------------------------------------------------
export function makeSky() {
  const geo = new THREE.SphereGeometry(9000, 48, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: SUN_DIR } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 sunDir; varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y, -0.2, 1.0);
        vec3 zen = vec3(0.24,0.45,0.78);
        vec3 hor = vec3(1.0,0.76,0.52);
        vec3 col = mix(hor, zen, pow(max(h,0.0), 0.45));
        float s = max(dot(normalize(vDir), sunDir), 0.0);
        col += vec3(1.0,0.72,0.42) * pow(s, 8.0) * 0.55;
        col += vec3(1.0,0.9,0.7) * pow(s, 400.0) * 3.0;
        if (h < 0.0) col = mix(hor, vec3(0.85,0.72,0.56), clamp(-h*6.0,0.,1.));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(geo, mat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  return sky;
}

// ---------- palms ----------------------------------------------------------
function frondGeometry() {
  const seg = 7; const pos = []; const uv = []; const idx = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const y = 0.28 * t - 0.62 * t * t;
    const hw = 0.17 * Math.sin(Math.PI * Math.min(1, t * 1.12 + 0.05)) + 0.015;
    pos.push(-hw, y - 0.03, t, 0, y + 0.03, t, hw, y - 0.03, t);
    uv.push(0, 1 - t, 0.5, 1 - t, 1, 1 - t);
    if (i < seg) {
      const a = i * 3;
      idx.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export class Palms {
  constructor() { this.trunks = []; this.fronds = []; }
  add(x, y, z, h = rr(6, 10), fronds = 14) {
    const lean = rr(-0.08, 0.08), leanDir = rand() * Math.PI * 2;
    const tx = x + Math.cos(leanDir) * lean * h, tz = z + Math.sin(leanDir) * lean * h;
    // trunk: from base towards leaned top
    const dir = new THREE.Vector3(tx - x, h, tz - z);
    const len = dir.length(); dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.trunks.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, len, 1).multiplyScalar(1).setX(h / 8).setZ(h / 8)));
    const top = new THREE.Vector3(tx, y + h, tz);
    for (let k = 0; k < fronds; k++) {
      const yaw = (k / fronds) * Math.PI * 2 + rr(-0.2, 0.2);
      const tilt = k % 3 === 0 ? rr(-0.7, -0.2) : rr(-0.1, 0.45);
      const L = rr(2.8, 4.0) * (h / 8 + 0.4);
      _e.set(tilt, yaw, rr(-0.2, 0.2), 'YXZ'); _q.setFromEuler(_e);
      this.fronds.push(new THREE.Matrix4().compose(top, _q.clone(), new THREE.Vector3(L * 1.1, L, L)));
    }
  }
  build(m) {
    const g = new THREE.Group();
    const tg = new THREE.CylinderGeometry(0.14, 0.26, 1, 7, 1); tg.translate(0, 0.5, 0);
    const tr = new THREE.InstancedMesh(tg, m.trunk, this.trunks.length);
    this.trunks.forEach((mm, i) => tr.setMatrixAt(i, mm));
    tr.castShadow = true; tr.receiveShadow = true;
    const fr = new THREE.InstancedMesh(frondGeometry(), m.frond, this.fronds.length);
    this.fronds.forEach((mm, i) => fr.setMatrixAt(i, mm));
    fr.castShadow = true; fr.customDepthMaterial = m.frondDepth;
    tr.computeBoundingSphere?.(); fr.computeBoundingSphere?.();
    g.add(tr, fr);
    return g;
  }
}

class Trees {
  constructor() { this.list = []; }
  add(x, z, s) { this.list.push([x, z, s]); }
  build(m) {
    const g = new THREE.Group();
    const cg = new THREE.IcosahedronGeometry(1, 1);
    const can = new THREE.InstancedMesh(cg, m.canopy, this.list.length);
    const col = new THREE.Color();
    this.list.forEach(([x, z, s], i) => {
      can.setMatrixAt(i, tm(x, s * 1.6, z, s * 1.2, s, s * 1.2, rand() * 6));
      col.setHSL(0.24 + rr(-0.03, 0.03), 0.45, 0.28 + rr(-0.05, 0.06));
      can.setColorAt(i, col);
    });
    can.castShadow = true; can.receiveShadow = true;
    can.computeBoundingSphere?.();
    g.add(can);
    return g;
  }
}

// ---------- villas ---------------------------------------------------------
// Detailed villa on a 22 x 26 plot. Local frame: front faces +z, origin plot centre.
export function sideVilla(B, P, palms, opt = {}) {
  const v = rand();
  const box = (k, ...a) => B.box(k, P, ...a);
  // plot
  box('lawn', -11, 11, 0, 0.12, -13, 13);
  box('paving', -3, 3.5, 0, 0.16, 3, 13); // driveway
  // boundary walls + gate
  box('white', -11, -4, 0, 1.6, 12.4, 12.8);
  box('white', 4.5, 11, 0, 1.6, 12.4, 12.8);
  box('wood', -4, 4.5, 0.1, 1.5, 12.5, 12.7);
  box('white', -11.2, -10.8, 0, 1.8, -13, 13);
  box('white', 10.8, 11.2, 0, 1.8, -13, 13);
  box('hedge', -10.6, -5, 0, 1.1, 11.2, 12.2);
  // ground volume
  const w0 = 7.5 + v * 1.2;
  box('white', -w0, w0, 0, 4.0, -9, 3);
  box('roof', -w0 - 0.3, w0 + 0.3, 4.0, 4.3, -9.3, 3.4);
  // ground glazing + garage
  box('darkGlass', -w0 + 0.6, -0.8, 0.3, 3.5, 3, 3.08);
  box('frame', -w0 + 0.5, -0.7, 3.5, 3.7, 3, 3.1);
  box('garage', 1, 6.4, 0, 2.7, 3, 3.1);
  // upper volume (cantilevered)
  const off = v > 0.5 ? -1.6 : 1.6;
  box('white', -5.6 + off, 5.6 + off, 4.3, 7.9, -8, 4.4);
  box('roof', -5.9 + off, 5.9 + off, 7.9, 8.2, -8.3, 4.7);
  box('darkGlass', -4.6 + off, 2.4 + off, 4.9, 7.4, 4.4, 4.48);
  box('glass', -4.6 + off, 2.4 + off, 4.3, 5.4, 4.5, 4.56);
  // feature stone fin / wood slats
  if (v > 0.35) box('stone', 3.0 + off, 5.2 + off, 0, 7.9, 3.2, 4.7);
  else box('wood', 2.6 + off, 5.4 + off, 4.6, 7.6, 4.45, 4.6);
  // side windows
  box('darkGlass', w0, w0 + 0.06, 1, 3.2, -6, -1);
  box('darkGlass', -w0 - 0.06, -w0, 1, 3.2, -6, -1);
  // back pool
  box('pool', -6, 6, 0.1, 0.18, -12.5, -10);
  if (palms) {
    const p = new THREE.Vector3(-7.5, 0, 8).applyMatrix4(P);
    palms.add(p.x, 0, p.z, rr(6, 9));
    if (v > 0.6) { const p2 = new THREE.Vector3(8.5, 0, -11).applyMatrix4(P); palms.add(p2.x, 0, p2.z, rr(7, 10)); }
  }
}

function lowVilla(B, P) {
  const box = (k, ...a) => B.box(k, P, ...a);
  const v = rand();
  box('lawn', -12, 12, 0, 0.1, -12, 12);
  box('white', -7, 7, 0, 4, -6, 5);
  box('white', -5 + v * 3, 4 + v * 3, 4, 7.6, -5, 3 + v * 2);
  box('darkGlass', -5, 2, 0.4, 3.4, 5, 5.1);
  box('roof', -7.2, 7.2, 3.95, 4.15, -6.2, 5.2);
  if (v > 0.5) box('pool', -5, 5, 0.1, 0.16, -11, -8);
}

// ---------- main builder ----------------------------------------------------
export function buildWorld(scene, m) {
  const root = new THREE.Group(); scene.add(root);

  // desert base
  const sand = new THREE.MeshStandardMaterial({ map: T.sandTex(), roughness: 1 });
  sand.map.repeat.set(140, 140);
  const desert = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), sand);
  desert.rotation.x = -Math.PI / 2; desert.position.y = -1.2; desert.receiveShadow = true;
  root.add(desert);

  // community + fill ground
  const commMat = new THREE.MeshStandardMaterial({ map: T.toTex(T.grassTex(false, '#9aa776'), [120, 80]), roughness: 1 });
  const comm = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), commMat);
  comm.rotation.x = -Math.PI / 2; comm.position.set(0, -0.4, -200); comm.receiveShadow = true;
  root.add(comm);

  // golf course
  const golfMat = new THREE.MeshStandardMaterial({ map: T.toTex(T.grassTex(true, '#5f9a2c'), [70, 30]), roughness: 0.95 });
  const golf = new THREE.Mesh(new THREE.PlaneGeometry(1800, 720), golfMat);
  golf.rotation.x = -Math.PI / 2; golf.position.set(0, -0.15, -46 - 360); golf.receiveShadow = true;
  root.add(golf);
  const fairMat = new THREE.MeshStandardMaterial({ map: T.toTex(T.grassTex(true, '#79b23a'), [20, 8]), roughness: 0.9 });
  const lakeMat = new THREE.MeshStandardMaterial({ color: 0x3c8fb0, roughness: 0.05, metalness: 0.1 });
  const bunkerMat = new THREE.MeshStandardMaterial({ color: 0xead6ae, roughness: 1 });
  const disc = new THREE.CircleGeometry(1, 40);
  const blob = (mat, x, z, sx, sz, y, r = 0) => {
    const d = new THREE.Mesh(disc, mat); d.rotation.set(-Math.PI / 2, 0, r);
    d.scale.set(sx, sz, 1); d.position.set(x, y, z); d.receiveShadow = true; root.add(d);
  };
  for (let i = 0; i < 9; i++) blob(fairMat, -760 + i * 190 + rr(-30, 30), rr(-200, -560), rr(50, 90), rr(120, 220), -0.08, rr(-0.5, 0.5));
  blob(lakeMat, 120, -330, 70, 38, -0.02, 0.3);
  blob(lakeMat, -420, -520, 55, 30, -0.02, -0.4);
  for (let i = 0; i < 26; i++) blob(bunkerMat, rr(-850, 850), rr(-120, -680), rr(6, 16), rr(4, 9), -0.04, rand() * 3);

  const B = new THREE.Group(); root.add(B);
  const batch = new Batch(m);
  const palms = new Palms();
  const trees = new Trees();
  const lamps = [];

  // golf course trees & palms
  for (let i = 0; i < 200; i++) {
    const x = rr(-880, 880), z = rr(-90, -740);
    if (rand() > 0.45) palms.add(x, 0, z, rr(7, 12), 10); else trees.add(x, z, rr(3, 6));
  }
  // palm rows along fairways (seen from terrace)
  for (let row = 0; row < 3; row++) {
    const z0 = [-140, -300, -470][row];
    for (let x = -880; x < 880; x += rr(20, 40)) palms.add(x, 0, z0 + rr(-15, 15), rr(8, 13), 11);
  }

  // ---------- detailed streets ----------
  const streets = [];
  const asphalt = new THREE.MeshStandardMaterial({ map: T.asphaltTex(), roughness: 0.92 });
  asphalt.map.repeat.set(2, 60);
  for (let i = 0; i < STREET_COUNT; i++) {
    const sx = streetX(i);
    const zA = 262, zB = -1;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(8, zA - zB), asphalt);
    road.rotation.x = -Math.PI / 2; road.position.set(sx, 0.04, (zA + zB) / 2); road.receiveShadow = true;
    root.add(road);
    const cul = new THREE.Mesh(new THREE.CircleGeometry(9.5, 40), asphalt);
    cul.rotation.x = -Math.PI / 2; cul.position.set(sx, 0.045, 4); cul.receiveShadow = true; root.add(cul);
    const I = new THREE.Matrix4();
    // curbs & verges
    for (const s of [-1, 1]) {
      batch.box('curb', I, sx + s * 4 - 0.15, sx + s * 4 + 0.15, 0, 0.22, 14, zA);
      batch.box('lawn', I, Math.min(sx + s * 4.15, sx + s * 6), Math.max(sx + s * 4.15, sx + s * 6), 0, 0.14, 14, zA);
      for (let z = 20; z < zA; z += 12) palms.add(sx + s * 5.1, 0.1, z + (s > 0 ? 6 : 0), rr(7, 9.5), 13);
      for (let z = 30; z < zA; z += 36) lamps.push([sx + s * 4.6, z + (s > 0 ? 18 : 0), s]);
    }
    const villas = [];
    // side villas
    const hero = 27 + i * 2 - (i % 3) * 6;
    for (let j = 0; j < 10; j++) {
      const z = 26 + j * 24;
      // west side faces +x
      sideVilla(batch, tm(sx - 19, 0, z, 1, 1, 1, Math.PI / 2), palms);
      sideVilla(batch, tm(sx + 19, 0, z, 1, 1, 1, -Math.PI / 2), palms);
      villas.push({ number: hero - 2 * (j + 1), pos: new THREE.Vector3(sx - 17, 9.6, z), side: -1 });
      villas.push({ number: hero - 2 * (j + 1) + 1, pos: new THREE.Vector3(sx + 17, 9.6, z), side: 1 });
    }
    // golf-facing filler villa between hero plots
    sideVilla(batch, tm(sx + 32, 0, -24, 1, 1, 1, Math.PI), palms);
    if (i === 0) sideVilla(batch, tm(sx - 32, 0, -24, 1, 1, 1, Math.PI), palms);
    // placeholder end villa (hidden when the hero villa occupies this street)
    const eb = new Batch(m);
    sideVilla(eb, tm(sx, 0, -24, 1.15, 1.05, 1.3), null);
    const endVilla = eb.build(); root.add(endVilla);

    // highlight ribbon + hit area
    const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(9, zA - zB + 20),
      new THREE.MeshBasicMaterial({ color: 0xff6a1f, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    ribbon.rotation.x = -Math.PI / 2; ribbon.position.set(sx, 0.35, (zA + zB) / 2 - 10);
    root.add(ribbon);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(44, 4, zA - zB + 50), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(sx, 2, (zA + zB) / 2 - 20); hit.userData.street = i;
    root.add(hit);

    streets.push({ index: i, x: sx, villas, hero, endVilla, ribbon, hit, labelPos: new THREE.Vector3(sx, 22, 140) });
  }
  // outer golf-facing villas east end
  sideVilla(batch, tm(streetX(STREET_COUNT - 1) + 64, 0, -24, 1, 1, 1, Math.PI), palms);

  // ---------- low-detail fill ----------
  const lb = batch;
  const fillZone = (x0, x1, z0, z1, treeChance = 0.35) => {
    for (let x = x0; x < x1; x += 30) for (let z = z0; z < z1; z += 28) {
      if (rand() < 0.07) continue;
      const rot = rand() > 0.5 ? 0 : Math.PI;
      lowVilla(lb, tm(x + rr(-1, 1), 0, z, 1, 1, 1, rot));
      if (rand() < treeChance) trees.add(x + 13, z + 12, rr(1.5, 2.6));
    }
  };
  fillZone(-1150, 1150, 300, 950);
  fillZone(-1150, -290, -40, 300);
  fillZone(290, 1150, -40, 300);
  fillZone(-1150, 1150, -1350, -790, 0.25);
  fillZone(-1300, -910, -790, -40, 0.25);
  fillZone(910, 1300, -790, -40, 0.25);
  // fill roads (grid lines, cheap)
  for (let x = -1150; x <= 1150; x += 150) {
    batch.box('curb', new THREE.Matrix4(), x - 4, x + 4, 0, 0.06, 300, 950);
    batch.box('curb', new THREE.Matrix4(), x - 4, x + 4, 0, 0.06, -1350, -790);
  }
  // community palms in the southern fill (sparse, near view only)

  // lamps
  const I = new THREE.Matrix4();
  for (const [x, z, s] of lamps) {
    batch.add('pole', tm(x, 3.2, z, 0.14, 6.4, 0.14));
    batch.add('pole', tm(x - s * 0.6, 6.35, z, 1.3, 0.1, 0.12));
    batch.add('lampHead', tm(x - s * 1.2, 6.25, z, 0.6, 0.12, 0.28));
  }

  // ---------- skyline ----------
  const cityB = new Batch(m);
  for (let k = 0; k < 170; k++) {
    const cx = rr(-1, 1) ** 3 * 3600 + 500;
    const cz = rr(-6200, -7200);
    const h = rr(50, 150) + (Math.abs(cx - 500) < 1100 ? rr(0, 230) : 0);
    const w = rr(40, 80);
    cityB.add('city', tm(cx, h / 2, cz, w, h, w * rr(0.7, 1.3), rand()));
  }
  // twin & signature towers to the left
  cityB.add('city', tm(-900, 170, -6300, 50, 340, 50));
  cityB.add('city', tm(-830, 160, -6320, 50, 320, 50));
  const city = cityB.build({ cast: false });
  city.children.forEach((c) => (c.receiveShadow = false));
  root.add(city);

  // the supertall
  const tower = new THREE.Group();
  const stages = [[0, 150, 34], [150, 300, 27], [300, 430, 21], [430, 540, 15], [540, 630, 10], [630, 700, 6], [700, 760, 3.5]];
  for (const [y0, y1, r] of stages) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, y1 - y0, 12), m.tower);
    c.position.y = (y0 + y1) / 2; tower.add(c);
    for (let a = 0; a < 3; a++) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(r * 1.6, y1 - y0 - 10, r * 0.9), m.tower);
      wing.position.set(Math.cos((a * Math.PI * 2) / 3) * r * 0.9, wing.position.y = (y0 + y1) / 2 - 5, Math.sin((a * Math.PI * 2) / 3) * r * 0.9);
      wing.rotation.y = -(a * Math.PI * 2) / 3; tower.add(wing);
    }
  }
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 3.5, 110, 8), m.tower);
  spire.position.y = 815; tower.add(spire);
  tower.position.set(420, 0, -6700);
  root.add(tower);

  root.add(batch.build());
  root.add(palms.build(m));
  root.add(trees.build(m));

  return { root, streets };
}
