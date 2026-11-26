import * as THREE from 'three';
import { makeMaterials, makeSky, buildWorld, Palms, SUN_DIR, HERO_Z, streetX, STREET_COUNT } from './world.js';
import { buildHeroVilla } from './villa.js';
import { rr } from './textures.js';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const STREETS = [
  { name: 'Golf Place', full: 'Golf Place Vistas', left: 6, beds: 6, view: 'Golf', viewLong: 'Golf · Burj Khalifa', built: '8,531', dist: '7.95' },
  { name: 'Fairway Crescent', full: 'Fairway Crescent', left: 4, beds: 5, view: 'Golf', viewLong: 'Fairway · Skyline', built: '7,210', dist: '8.10' },
  { name: 'Palm Grove', full: 'Palm Grove Residences', left: 3, beds: 5, view: 'Park', viewLong: 'Park · Golf', built: '6,940', dist: '8.32' },
  { name: 'Parkside Lane', full: 'Parkside Lane', left: 5, beds: 6, view: 'Park', viewLong: 'Park · Skyline', built: '7,880', dist: '8.47' },
  { name: 'Sidra Row', full: 'Sidra Row', left: 2, beds: 4, view: 'Golf', viewLong: 'Golf course', built: '5,620', dist: '8.66' },
  { name: 'Emerald Walk', full: 'Emerald Walk', left: 7, beds: 5, view: 'Lake', viewLong: 'Lake · Golf', built: '6,410', dist: '8.90' },
  { name: 'Clubhouse Drive', full: 'Clubhouse Drive', left: 3, beds: 6, view: 'Golf', viewLong: 'Clubhouse · Golf', built: '9,105', dist: '9.12' },
  { name: 'Dune View', full: 'Dune View Estates', left: 4, beds: 7, view: 'Skyline', viewLong: 'Skyline · Golf', built: '10,240', dist: '9.40' },
];

// Camera keyframes in hero-villa local space [pos, look]
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const KEYS = [
  [V(1.6, 1.2, 228), V(0.4, 2.6, 120)],   // 0 street start
  [V(1.4, 1.2, 130), V(-0.8, 3.0, 40)],   // 1
  [V(0.6, 1.3, 54), V(0, 4.0, 0)],        // 2
  [V(0, 1.9, 33), V(0, 4.2, 0)],          // 3 villa front
  [V(0.1, 1.3, 19.5), V(0, 2.2, 5)],      // 4 gate
  [V(0.25, 1.6, 12.6), V(0, 2.4, 2)],     // 5 threshold
  [V(-2.4, 1.6, 7.4), V(3.2, 3.0, 3.6)],  // 6 entrance hall
  [V(-6.5, 1.6, 1.4), V(-6.5, 1.8, -10)], // 7 living room
  [V(-6.5, 1.45, -0.7), V(-6.9, 1.9, -10)], // 8
  [V(1.2, 1.6, 0.8), V(5.5, 1.2, -6)],    // 9 dining
  [V(4.6, 1.6, -1.6), V(12, 1.3, -2.6)],  // 10 kitchen
  [V(0.4, 1.6, -3.2), V(1.0, 1.4, -30)],  // 11
  [V(0.5, 1.6, -8.2), V(0.8, 1.5, -40)],  // 12 terrace door
  [V(1.2, 1.6, -11.4), V(0, 1.7, -60)],   // 13 terrace
  [V(0, 0.45, -16), V(0, 1.4, -90)],      // 14 low over pool, golf view
  [V(-11, 1.6, -23.4), V(1, 3.4, -6)],    // 15 look back at the house
];
const WEIGHTS = [3, 2.4, 1.3, 1.1, 0.9, 1.1, 1.3, 0.7, 1.2, 1, 0.9, 0.9, 0.9, 1.1, 1.5];
const CUM = [0]; WEIGHTS.forEach((w) => CUM.push(CUM[CUM.length - 1] + w));
const TOTAL = CUM[CUM.length - 1];
const kToS = (k) => { const i = Math.min(Math.floor(k), WEIGHTS.length - 1); return CUM[i] + (k - i) * WEIGHTS[i]; };
const sToK = (s) => { for (let i = 0; i < WEIGHTS.length; i++) if (s <= CUM[i + 1]) return i + (s - CUM[i]) / WEIGHTS[i]; return KEYS.length - 1; };

const SECTIONS = [
  { id: 'street', at: 0, from: 0, to: 2.5 },
  { id: 'front', at: 3, from: 2.5, to: 4.5, eyebrow: (d) => `${d.name} · Villa ${d.hero}`, title: 'Arrive home', next: 'Step inside', go: 6 },
  { id: 'hall', at: 6, from: 4.5, to: 6.6, eyebrow: (d) => `Villa ${d.hero} · Ground floor`, title: 'Entrance hall', next: 'View the living room', go: 7 },
  { id: 'living', at: 7, from: 6.6, to: 8.5, eyebrow: (d) => `Villa ${d.hero} · Ground floor`, title: 'Living room', next: 'View the dining room', go: 9 },
  { id: 'dining', at: 9, from: 8.5, to: 9.5, eyebrow: (d) => `Villa ${d.hero} · Ground floor`, title: 'Dining room', next: 'View the kitchen', go: 10 },
  { id: 'kitchen', at: 10, from: 9.5, to: 11, eyebrow: (d) => `Villa ${d.hero} · Ground floor`, title: 'Kitchen', next: 'Step onto the terrace', go: 13 },
  { id: 'terrace', at: 13, from: 11, to: 13.5, eyebrow: (d) => `Villa ${d.hero} · Outdoors`, title: 'Pool terrace', next: 'Take in the view', go: 14 },
  { id: 'golf', at: 14, from: 13.5, to: 14.5, eyebrow: (d) => `Villa ${d.hero} · Outdoors`, title: 'Golf course view', next: 'Look back', go: 15 },
  { id: 'back', at: 15, from: 14.5, to: 99 },
];

const AERIAL = { pos: V(-30, 240, 470), look: V(20, 0, -180) };

// ---------------------------------------------------------------------------
// Renderer / scene
// ---------------------------------------------------------------------------
const $ = (s) => document.querySelector(s);
const canvas = $('#scene');
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 12000);
scene.fog = new THREE.FogExp2(0xeac39a, 0.00032);

let world, hero, heroPalms, streets, curvePos, curveLook;
const state = {
  stage: 'loading', // pick | fly | tour | prompt | card
  sel: 0, hover: -1,
  s: 0, sTarget: 0,
  fly: null,
  t: 0,
  snapshot: null,
};

function setupLights() {
  const hemi = new THREE.HemisphereLight(0xbcd4f5, 0xb08a5e, 0.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc98f, 3.6);
  sun.castShadow = true;
  const sm = isMobile ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 1500;
  scene.add(sun, sun.target);
  return sun;
}
let sun;

function buildEnv(sky) {
  const envScene = new THREE.Scene();
  envScene.add(sky.clone());
  const ground = new THREE.Mesh(new THREE.CircleGeometry(5000, 32), new THREE.MeshBasicMaterial({ color: 0xa88f6c }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -10; envScene.add(ground);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(envScene, 0.02, 1, 20000).texture;
  scene.environment = env;
  pmrem.dispose();
}

function init() {
  const sky = makeSky();
  scene.add(sky);
  sun = setupLights();
  buildEnv(sky);
  const m = makeMaterials();
  world = buildWorld(scene, m);
  streets = world.streets;
  hero = buildHeroVilla(m);
  heroPalms = new Palms();
  for (const [x, y, z, h] of hero.palmSpots) heroPalms.add(x, y, z, h || rr(7.5, 9), h ? 9 : 14);
  hero.group.add(heroPalms.build(m));
  hero.group.traverse((o) => { if (o.isMesh && !o.material.transparent) { if (!o.isInstancedMesh) o.castShadow = true; o.receiveShadow = true; } });
  scene.add(hero.group);
  curvePos = new THREE.CatmullRomCurve3(KEYS.map((k) => k[0]), false, 'centripetal');
  curveLook = new THREE.CatmullRomCurve3(KEYS.map((k) => k[1]), false, 'centripetal');
  selectStreet(0, true);
  camera.position.copy(AERIAL.pos); camera.lookAt(AERIAL.look);
  camLook.copy(AERIAL.look);
  buildPins();
  renderer.compile(scene, camera);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const heroOrigin = () => hero.group.position;
const toWorld = (v, out = new THREE.Vector3()) => out.copy(v).add(heroOrigin());
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const camLook = new THREE.Vector3();
const data = () => ({ ...STREETS[state.sel], hero: streets[state.sel].hero });

function tourPose(k, outPos, outLook) {
  const t = k / (KEYS.length - 1);
  toWorld(curvePos.getPoint(t), outPos);
  toWorld(curveLook.getPoint(t), outLook);
}

function selectStreet(i, silent) {
  state.sel = (i + STREET_COUNT) % STREET_COUNT;
  const st = streets[state.sel];
  hero.group.position.set(st.x, 0.5, HERO_Z);
  streets.forEach((s, j) => (s.endVilla.visible = j !== state.sel));
  updateCard(silent);
  updateVillaLabels();
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
const ui = {
  pick: $('#pick'), card: $('#street-card'), num: $('#street-num'), name: $('#street-name'), left: $('#street-left'),
  beds: $('#stat-beds'), view: $('#stat-view'), dots: $('#street-dots'), drop: $('#drop-btn'),
  streetPin: $('#street-pin'), streetPill: $('#street-pill'), streetProg: $('#street-progress'),
  pins: $('#pins'), chip: $('#villa-chip'), room: $('#room'), roomEyebrow: $('#room-eyebrow'), roomTitle: $('#room-title'),
  next: $('#next-btn'), nextLabel: $('#next-label'), back: $('#back-btn'), rail: $('#rail'),
  prompt: $('#prompt'), final: $('#final'), loader: $('#loader'), loaderBar: $('#loader-bar'), hint: $('#scroll-hint'),
};

for (let i = 0; i < STREET_COUNT; i++) {
  const b = document.createElement('button');
  b.className = 'dot'; b.setAttribute('aria-label', `Street ${i + 1}: ${STREETS[i].name}`);
  b.onclick = () => selectStreet(i);
  ui.dots.appendChild(b);
}
// progress rail
SECTIONS.filter((s) => s.title || s.id === 'street').forEach((s) => {
  const b = document.createElement('button');
  b.className = 'rail-tick'; b.dataset.id = s.id;
  b.innerHTML = `<span>${s.title || 'The street'}</span>`;
  b.onclick = () => { if (state.stage === 'tour') state.sTarget = kToS(s.at); };
  ui.rail.appendChild(b);
});

function updateCard(silent) {
  const d = STREETS[state.sel];
  ui.num.textContent = String(state.sel + 1).padStart(2, '0');
  ui.name.textContent = d.name;
  ui.left.textContent = `${d.left} villas left on this street`;
  ui.beds.textContent = d.beds;
  ui.view.textContent = d.view;
  ui.drop.querySelector('span').textContent = `Drop your pin on ${d.name}`;
  [...ui.dots.children].forEach((c, j) => c.classList.toggle('on', j === state.sel));
  if (!silent) { ui.num.classList.remove('flip'); void ui.num.offsetWidth; ui.num.classList.add('flip'); }
}

function updateVillaLabels() {
  const d = data();
  $('#chip-title').textContent = `Villa ${d.hero} · ${d.name}`;
  $('#chip-sub').textContent = `${d.beds} bed · ${d.built} ft² · On request`;
}

function showStage(stage) {
  state.stage = stage;
  document.body.dataset.stage = stage;
}

// pins (villa numbers along the chosen street)
let pinEls = [];
function buildPins() {
  ui.pins.innerHTML = '';
  pinEls = [];
  for (let k = 0; k < 20; k++) {
    const el = document.createElement('div'); el.className = 'pin';
    el.innerHTML = '<b></b><span class="tag"></span>';
    ui.pins.appendChild(el); pinEls.push(el);
  }
  const h = document.createElement('button'); h.className = 'pin hero';
  h.innerHTML = '<b></b><span class="tag"></span>';
  h.onclick = () => (state.sTarget = kToS(3));
  ui.pins.appendChild(h); pinEls.push(h);
}
const STATUS = ['Sold', 'Reserved', 'Sold', 'Available', 'Sold'];
const _v = new THREE.Vector3();
function updatePins() {
  if (state.stage !== 'tour' || state.s > kToS(3.6)) { ui.pins.classList.add('hidden'); return; }
  ui.pins.classList.remove('hidden');
  const st = streets[state.sel];
  const items = st.villas.map((v) => ({ pos: v.pos, n: v.number, hero: false }));
  items.push({ pos: toWorld(V(0, 12.5, 6)), n: st.hero, hero: true });
  items.forEach((it, i) => {
    const el = i === items.length - 1 ? pinEls[pinEls.length - 1] : pinEls[i];
    if (!el) return;
    const d = camera.position.distanceTo(it.pos);
    _v.copy(it.pos).project(camera);
    const vis = _v.z < 1 && Math.abs(_v.x) < 1.1 && Math.abs(_v.y) < 1.1 && (it.hero ? d < 260 : d < 150 && d > 8);
    el.style.opacity = vis ? (it.hero ? 1 : Math.min(1, (150 - d) / 40)) : 0;
    el.style.pointerEvents = vis ? 'auto' : 'none';
    if (!vis) return;
    const x = (_v.x * 0.5 + 0.5) * innerWidth, y = (-_v.y * 0.5 + 0.5) * innerHeight;
    const sc = THREE.MathUtils.clamp(26 / d, 0.55, 1.15);
    el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${it.hero ? Math.max(sc, 0.9) : sc})`;
    el.querySelector('b').textContent = it.n;
    el.querySelector('.tag').textContent = it.hero ? `Villa ${it.n} · Available` : `Villa ${it.n} · ${STATUS[(it.n * 7) % 5]}`;
  });
}

function updateTourUI(k) {
  const sec = SECTIONS.find((s) => k >= s.from && k < s.to) || SECTIONS[SECTIONS.length - 1];
  document.body.dataset.section = sec.id;
  const d = data();
  // street progress
  ui.streetProg.style.transform = `scaleX(${THREE.MathUtils.clamp(k / 3, 0, 1)})`;
  if (sec.title) {
    ui.roomEyebrow.textContent = sec.eyebrow(d);
    if (ui.roomTitle.textContent !== sec.title) {
      ui.roomTitle.textContent = sec.title;
      ui.room.classList.remove('in'); void ui.room.offsetWidth; ui.room.classList.add('in');
    }
    ui.nextLabel.textContent = sec.next;
    ui.next.onclick = () => (state.sTarget = kToS(sec.go));
  }
  [...ui.rail.children].forEach((c) => c.classList.toggle('on', c.dataset.id === sec.id));
  ui.rail.style.setProperty('--p', (state.s / TOTAL).toFixed(4));
  // end of tour → prompt
  if (state.stage === 'tour' && state.sTarget >= TOTAL - 0.001 && state.s > TOTAL - 0.04) openPrompt();
}

function openPrompt() {
  showStage('prompt');
  $('#prompt-title').textContent = 'Is this your home?';
}

function openFinal() {
  const d = data();
  $('#final-img').src = state.snapshot || '';
  $('#final-title').textContent = `Villa ${d.hero}`;
  $('#final-sub').textContent = `${d.full} · Dubai Hills`;
  $('#f-beds').textContent = d.beds;
  $('#f-built').innerHTML = `${d.built} ft²`;
  $('#f-view').textContent = d.viewLong;
  $('#f-dist').textContent = `${d.dist} km`;
  ui.final.classList.remove('booking', 'booked');
  showStage('card');
}

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------
function flyTo(points, looks, duration, onDone) {
  state.fly = {
    pos: new THREE.CatmullRomCurve3(points, false, 'centripetal'),
    look: new THREE.CatmullRomCurve3(looks, false, 'centripetal'),
    t: 0, duration, onDone,
  };
}

function dropPin() {
  if (state.stage !== 'pick') return;
  const st = streets[state.sel];
  const p0 = new THREE.Vector3(), l0 = new THREE.Vector3();
  tourPose(0, p0, l0);
  showStage('fly');
  ui.hint.classList.remove('show');
  flyTo(
    [camera.position.clone(), V(st.x + 40, 90, 360), V(st.x + 8, 14, 262), p0],
    [camLook.clone(), V(st.x, 0, 120), V(st.x, 4, 160), l0],
    4.2,
    () => { state.s = state.sTarget = 0; showStage('tour'); ui.hint.classList.add('show'); },
  );
}

function backToStreets() {
  const from = camera.position.clone();
  showStage('fly');
  flyTo(
    [from, V(from.x, from.y + 30, from.z + 30), V(AERIAL.pos.x * 0.5 + from.x * 0.5, 150, from.z + 200), AERIAL.pos.clone()],
    [camLook.clone(), V(camLook.x, camLook.y + 10, camLook.z), V(0, 0, 0), AERIAL.look.clone()],
    3.4,
    () => showStage('pick'),
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
let wheelLock = 0;
function onScrollDelta(dy, fromWheel = true) {
  if (state.stage === 'pick') {
    const now = performance.now();
    if (Math.abs(dy) < 4 || now < wheelLock) return;
    wheelLock = now + 420;
    selectStreet(state.sel + (dy > 0 ? 1 : -1));
  } else if (state.stage === 'tour') {
    state.sTarget = THREE.MathUtils.clamp(state.sTarget + dy * (fromWheel ? 0.0022 : 0.006), 0, TOTAL);
    ui.hint.classList.remove('show');
  } else if (state.stage === 'prompt' && dy < -10) {
    showStage('tour'); state.sTarget = TOTAL - 0.6;
  }
}
addEventListener('wheel', (e) => {
  if (e.target.closest('.scrollable')) return;
  e.preventDefault();
  const dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
  onScrollDelta(dy);
}, { passive: false });
let touchY = null;
addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => {
  if (touchY == null) return;
  const y = e.touches[0].clientY; const dy = touchY - y; touchY = y;
  if (state.stage === 'pick') { if (Math.abs(dy) > 2) { tAccum += dy; if (Math.abs(tAccum) > 60) { onScrollDelta(tAccum); tAccum = 0; } } } else onScrollDelta(dy, false);
}, { passive: true });
let tAccum = 0;
addEventListener('touchend', () => { touchY = null; tAccum = 0; });
addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea')) return;
  const map = { ArrowDown: 120, PageDown: 400, ' ': 300, ArrowUp: -120, PageUp: -400, ArrowRight: 120, ArrowLeft: -120 };
  if (state.stage === 'pick') {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { selectStreet(state.sel + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { selectStreet(state.sel - 1); e.preventDefault(); }
    if (e.key === 'Enter') dropPin();
    return;
  }
  if (map[e.key] != null) { e.preventDefault(); onScrollDelta(map[e.key]); }
  if (e.key === 'Escape' && (state.stage === 'tour' || state.stage === 'card')) backToStreets();
});

// raycast streets in pick stage
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pickStreet(cx, cy) {
  ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(streets.map((s) => s.hit), false);
  return hits.length ? hits[0].object.userData.street : -1;
}
canvas.addEventListener('pointermove', (e) => {
  if (state.stage !== 'pick' || e.pointerType === 'touch') return;
  state.hover = pickStreet(e.clientX, e.clientY);
  canvas.style.cursor = state.hover >= 0 ? 'pointer' : '';
});
canvas.addEventListener('click', (e) => {
  if (state.stage !== 'pick') return;
  const i = pickStreet(e.clientX, e.clientY);
  if (i < 0) return;
  if (i !== state.sel) selectStreet(i);
  dropPin();
});
ui.drop.onclick = dropPin;
ui.streetPin.onclick = dropPin;
$('#card-prev').onclick = () => selectStreet(state.sel - 1);
$('#card-next').onclick = () => selectStreet(state.sel + 1);
ui.back.onclick = backToStreets;
$('#yes-btn').onclick = () => { state.snapReq = true; };
$('#no-btn').onclick = backToStreets;
$('#again-btn').onclick = backToStreets;
$('#book-btn').onclick = () => ui.final.classList.add('booking');
$('#book-cancel').onclick = () => ui.final.classList.remove('booking');
$('#book-form').onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $('#booked-name').textContent = (f.get('name') || '').toString().split(' ')[0] || 'there';
  $('#booked-date').textContent = f.get('date') ? new Date(f.get('date')).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : 'soon';
  ui.final.classList.add('booked');
};
// default viewing date: a week from today
{ const d = new Date(Date.now() + 7 * 864e5); $('#book-date').value = d.toISOString().slice(0, 10); }

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 0.8 ? 72 : 55;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------------------
// Frame loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
const tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
const focus = new THREE.Vector3();
let lastShadowSize = 0;

function updateSun() {
  const high = camera.position.y > 45;
  const size = high ? 520 : 80;
  // focus a little ahead of the camera
  focus.copy(camLook).sub(camera.position).normalize().multiplyScalar(high ? 260 : 22).add(camera.position);
  focus.y = 0;
  sun.target.position.copy(focus);
  sun.position.copy(focus).addScaledVector(SUN_DIR, 700);
  if (size !== lastShadowSize) {
    const c = sun.shadow.camera;
    c.left = -size; c.right = size; c.top = size; c.bottom = -size;
    c.updateProjectionMatrix(); lastShadowSize = size;
  }
}

const labelV = new THREE.Vector3();
function updatePickUI() {
  streets.forEach((s, i) => {
    const target = state.stage !== 'pick' ? 0 : i === state.sel ? 0.55 + Math.sin(state.t * 3) * 0.12 : i === state.hover ? 0.32 : 0;
    s.ribbon.material.opacity += (target - s.ribbon.material.opacity) * 0.15;
  });
  if (state.stage === 'pick') {
    labelV.copy(streets[state.sel].labelPos).project(camera);
    const x = (labelV.x * 0.5 + 0.5) * innerWidth, y = (-labelV.y * 0.5 + 0.5) * innerHeight;
    ui.streetPin.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
    ui.streetPin.querySelector('b').textContent = String(state.sel + 1).padStart(2, '0');
  }
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  state.t += dt;

  if (state.stage === 'pick') {
    const a = state.t * 0.07;
    tmpP.copy(AERIAL.pos).add(V(Math.sin(a) * 30, Math.sin(a * 0.7) * 6, Math.cos(a) * 12));
    camera.position.lerp(tmpP, 0.03);
    camLook.lerp(AERIAL.look, 0.05);
  } else if (state.fly) {
    const f = state.fly;
    f.t = Math.min(1, f.t + dt / f.duration);
    const e = ease(f.t);
    camera.position.copy(f.pos.getPoint(e));
    camLook.copy(f.look.getPoint(e));
    if (f.t >= 1) { state.fly = null; f.onDone?.(); }
  } else if (state.stage === 'tour' || state.stage === 'prompt' || state.stage === 'card') {
    state.s += (state.sTarget - state.s) * (1 - Math.exp(-dt * 3.2));
    const k = sToK(state.s);
    tourPose(k, tmpP, tmpL);
    // gentle handheld sway
    tmpP.y += Math.sin(state.t * 1.3) * 0.015;
    camera.position.copy(tmpP);
    camLook.copy(tmpL);
    if (state.stage === 'tour') updateTourUI(k);
  }
  camera.lookAt(camLook);
  const near = camera.position.y > 30 ? 3 : 0.1;
  if (near !== camera.near) { camera.near = near; camera.updateProjectionMatrix(); }
  updateSun();
  updatePickUI();
  updatePins();
  if (hero) hero.water.material.normalMap.offset.set(state.t * 0.02, state.t * 0.013);

  if (state.snapReq) {
    // render a hero shot of the villa front for the final card
    state.snapReq = false;
    const saved = [camera.position.clone(), camLook.clone(), camera.aspect];
    camera.position.copy(toWorld(V(-6, 1.7, 30))); camera.lookAt(toWorld(V(1, 4.2, 4)));
    camera.aspect = 1; camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    renderer.setSize(900, 900, false); renderer.setPixelRatio(1);
    updateSunFor(camera.position);
    renderer.render(scene, camera);
    state.snapshot = canvas.toDataURL('image/jpeg', 0.86);
    renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight);
    camera.position.copy(saved[0]); camera.aspect = saved[2]; camera.updateProjectionMatrix();
    camLook.copy(saved[1]); camera.lookAt(camLook);
    updateSun();
    openFinal();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
function updateSunFor(p) {
  focus.copy(p); focus.y = 0; focus.z -= 20;
  sun.target.position.copy(focus);
  sun.position.copy(focus).addScaledVector(SUN_DIR, 700);
  sun.target.updateMatrixWorld();
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
ui.loaderBar.style.transform = 'scaleX(0.3)';
requestAnimationFrame(() => setTimeout(() => {
  init();
  window.dispatchEvent(new Event('resize'));
  ui.loaderBar.style.transform = 'scaleX(1)';
  showStage('pick');
  setTimeout(() => ui.loader.classList.add('done'), 350);
  clock.getDelta();
  frame();
}, 30));

// debug hook for automated checks
window.__tour = { scene, camera, renderer, state, jump: (k) => { state.s = state.sTarget = kToS(k); }, dropPin, TOTAL, kToS };
