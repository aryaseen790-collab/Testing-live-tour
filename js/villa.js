// The hero villa — full exterior + furnished ground floor + pool terrace.
// Local frame: origin = centre of footprint at finished floor level, front faces +z,
// golf course is behind (-z). House footprint x[-13,13] z[-10,10].
import * as THREE from 'three';
import * as T from './textures.js';
import { Batch, tm } from './world.js';
import { rand, rr } from './textures.js';

export function buildHeroVilla(m) {
  const g = new THREE.Group();
  const S = (o) => new THREE.MeshStandardMaterial(o);
  const trav = T.travertineTex(4);
  const mats = {
    ...m,
    trav: S({ map: trav, roughness: 0.35 }),
    travOut: S({ map: T.travertineTex(3), roughness: 0.6 }),
    marble: S({ map: T.marbleTex(), roughness: 0.15 }),
    slats: S({ map: T.slatTex(), roughness: 0.6 }),
    velvet: S({ color: 0x1f3378, roughness: 0.9 }),
    cushion: S({ color: 0xe8dcc6, roughness: 0.95 }),
    fabric: S({ color: 0xebe4d8, roughness: 0.95 }),
    gold: S({ color: 0xc9a25a, metalness: 1, roughness: 0.25 }),
    black: S({ color: 0x151515, roughness: 0.35, metalness: 0.4 }),
    oven: S({ color: 0x0d0d0d, roughness: 0.15, metalness: 0.5 }),
    cove: S({ color: 0xffe0b0, emissive: 0xffc27a, emissiveIntensity: 2.2 }),
    poolTile: S({ color: 0x7fd6e0, roughness: 0.3 }),
    ivory: S({ color: 0xf3ede4, roughness: 0.8 }),
    planter: S({ color: 0xe8e0d2, roughness: 0.8 }),
    vase: S({ color: 0x1b1b1b, roughness: 0.25 }),
  };
  const B = new Batch(mats);
  const I = new THREE.Matrix4();
  const box = (k, x0, x1, y0, y1, z0, z1) => B.box(k, I, x0, x1, y0, y1, z0, z1);
  const H1 = 4.4, SL = 0.5, H2 = 3.8; // ground height, slab, upper height
  const Y2 = H1 + SL, Y3 = Y2 + H2;

  // ---- plinth / terrace (local y 0 = floor level; world ground is at -0.5)
  const PX = 15.5;
  box('travOut', -PX, PX, -0.5, 0, -10, 12.2);          // under house + front step
  box('travOut', -PX, PX, -0.5, 0, -12.5, -10);          // terrace strip
  box('travOut', -PX, -8, -0.5, 0, -20.5, -12.5);        // left of pool
  box('travOut', 8, PX, -0.5, 0, -20.5, -12.5);          // right of pool
  box('travOut', -PX, PX, -0.5, 0, -26, -20.5);          // beyond pool
  // pool basin tiles + water (water is a separate mesh)
  box('poolTile', -8, 8, -0.5, -0.44, -20.5, -12.5);
  box('poolTile', -8, -7.95, -0.5, 0, -20.5, -12.5);
  box('poolTile', 7.95, 8, -0.5, 0, -20.5, -12.5);
  box('poolTile', -8, 8, -0.5, 0, -12.55, -12.5);
  box('poolTile', -8, 8, -0.5, 0, -20.5, -20.45);
  // glass fence to golf course + low side walls
  box('glass', -PX, PX, 0, 1.1, -26, -25.92);
  box('white', -PX - 0.3, -PX, -0.5, 2.0, -26, 12.2);
  box('white', PX, PX + 0.3, -0.5, 2.0, -26, 12.2);
  box('hedge', -PX + 0.2, -PX + 1.4, 0, 1.2, -25, -10.5);
  box('hedge', PX - 1.4, PX - 0.2, 0, 1.2, -25, -10.5);
  // loungers
  for (const x of [-12.5, -10.5]) {
    box('ivory', x - 0.4, x + 0.4, 0, 0.35, -18.5, -16.4);
    box('ivory', x - 0.4, x + 0.4, 0.35, 0.8, -16.6, -16.2);
  }
  // front yard (world ground level, i.e. local -0.5)
  box('paving', -PX, PX, -0.5, -0.42, 12.2, 17);
  box('lawn', -PX, -3, -0.5, -0.38, 12.6, 16.6);
  box('lawn', 3, PX, -0.5, -0.38, 12.6, 16.6);
  box('white', -PX - 0.3, -2.4, -0.5, 1.3, 16.8, 17.1);
  box('white', 2.4, PX + 0.3, -0.5, 1.3, 16.8, 17.1);
  for (let x = -PX + 0.3; x < -2.6; x += 0.45) box('wood', x, x + 0.22, 1.3, 1.9, 16.85, 17.05);
  for (let x = 2.6; x < PX; x += 0.45) box('wood', x, x + 0.22, 1.3, 1.9, 16.85, 17.05);
  box('white', -2.4, -2.0, -0.5, 2.2, 16.7, 17.2);
  box('white', 2.0, 2.4, -0.5, 2.2, 16.7, 17.2);

  // ---- ground floor
  box('trav', -13, 13, 0, 0.02, -10, 10);
  // front facade z = 10
  const FZ0 = 9.7, FZ1 = 10;
  box('stone', -13, -6, 0, H1, FZ0, FZ1);
  box('glass', -6, -1.5, 0, H1, 9.8, 9.86);
  box('frame', -6, -5.9, 0, H1, 9.75, 9.9);
  box('stone', -1.5, -1.3, 0, H1, FZ0, FZ1);
  box('stone', 1.3, 1.5, 0, H1, FZ0, FZ1);
  box('stone', -1.3, 1.3, 3.6, H1, FZ0, FZ1);
  box('glass', 1.5, 6, 0, H1, 9.8, 9.86);
  box('white', 6, 13, 0, H1, FZ0, FZ1);
  box('darkGlass', 7.5, 11.5, 2.4, 3.2, 10, 10.05);
  // pivot door (open)
  B.add('walnut', tm(-1.3 + 1.25 * Math.cos(1.3), 1.8, 9.85 - 1.25 * Math.sin(1.3), 2.5, 3.6, 0.12, 1.3));
  // canopy over entrance
  box('white', -4, 4, H1 - 0.05, H1 + 0.3, 10, 12.4);
  // west wall: glass along living room, stone further front
  box('glass', -13, -12.94, 0, H1, -10, 2);
  for (let z = -10; z <= 2; z += 3) box('frame', -13.05, -12.9, 0, H1, z - 0.04, z + 0.04);
  box('stone', -13.3, -13, 0, H1, 2, 10);
  // east wall
  box('white', 13, 13.3, 0, H1, -6, 10);
  box('glass', 12.94, 13, 0, H1, -10, -6);
  // back glazing z = -10 (open between x -0.5 .. 3.5)
  box('glass', -13, -0.5, 0, H1, -10.06, -10);
  box('glass', 3.5, 13, 0, H1, -10.06, -10);
  box('glass', 3.5, 7.6, 0, H1, -10.18, -10.12); // slid-open panel stacked behind
  for (let x = -13; x <= 13; x += 3.25) if (x < -0.6 || x > 3.4) box('frame', x - 0.04, x + 0.04, 0, H1, -10.1, -9.96);
  box('frame', -13, 13, H1 - 0.12, H1, -10.1, -9.96);
  // columns
  box('white', -0.6, -0.2, 0, H1, -10, -9.6);

  // ---- slab between floors (void over entrance hall x[-4,4] z[2,10])
  box('white', -13.3, 13.3, H1, Y2, -10.6, 2);
  box('white', -13.3, -4, H1, Y2, 2, 10);
  box('white', 4, 13.3, H1, Y2, 2, 10);
  box('white', -13.3, 13.3, H1, Y2, -10.6, -10.3);
  // wood slat ceiling + cove in living room
  box('slats', -12.6, -0.4, H1 - 0.35, H1, -9.6, 1.6);
  box('cove', -12.7, -0.3, H1 - 0.38, H1 - 0.34, -9.7, -9.6);
  box('cove', -12.7, -0.3, H1 - 0.38, H1 - 0.34, 1.6, 1.7);
  // dining / kitchen ceiling
  box('ivory', 0, 12.9, H1 - 0.12, H1, -9.8, 2);

  // ---- upper floor (thin walls so it reads from inside the void)
  const UZ0 = -9, UZ1 = 11.5, UX0 = -12, UX1 = 10;
  box('white', UX0, UX1, Y2, Y2 + 0.05, UZ0, UZ1); // floor finish
  box('white', UX0, UX0 + 0.3, Y2, Y3, UZ0, UZ1);
  box('white', UX1 - 0.3, UX1, Y2, Y3, UZ0, UZ1);
  box('white', UX0, -4, Y2, Y3, UZ1 - 0.3, UZ1);
  box('white', 4, UX1, Y2, Y3, UZ1 - 0.3, UZ1);
  box('white', -4, 4, Y3 - 0.6, Y3, UZ1 - 0.3, UZ1);
  box('glass', -4, 4, Y2, Y3 - 0.6, UZ1 - 0.2, UZ1 - 0.14);
  box('darkGlass', -10.5, -5, Y2 + 0.6, Y3 - 0.6, UZ1, UZ1 + 0.04);
  box('darkGlass', 5, 9, Y2 + 0.8, Y3 - 0.8, UZ1, UZ1 + 0.04);
  box('white', UX0, UX1, Y2, Y3, UZ0, UZ0 + 0.3);
  box('darkGlass', -10, 8, Y2 + 0.3, Y3 - 0.4, UZ0 - 0.05, UZ0);
  box('white', UX0 - 0.4, UX1 + 0.4, Y3, Y3 + 0.45, UZ0 - 0.4, UZ1 + 0.4); // roof
  // back balcony w/ glass balustrade
  box('white', UX0, 13, Y2 - 0.1, Y2 + 0.1, -10.6, UZ0);
  box('glass', UX0, 13, Y2 + 0.1, Y2 + 1.15, -10.6, -10.52);
  // stone fin on front
  box('stone', 6.2, 8.4, 0, Y3 + 0.45, UZ1 - 0.1, UZ1 + 0.5);
  // wood screen on upper front left
  for (let x = -11.8; x < -5.4; x += 0.35) box('wood', x, x + 0.16, Y2 + 0.2, Y3 - 0.1, UZ1 + 0.05, UZ1 + 0.25);
  // upper landing balustrade around void
  box('glass', -4, 4, Y2, Y2 + 1.1, 1.98, 2.04);
  box('glass', -4.04, -3.98, Y2, Y2 + 1.1, 2, 10);

  // ---- entrance hall: floating stair + stone wall
  box('stone', 4, 4.3, 0, Y2, 2, 9.7);
  for (let k = 0; k < 16; k++) {
    const z1 = 9.4 - k * 0.42;
    box('walnut', 2.3, 4, 0.28 + k * 0.3, 0.36 + k * 0.3, z1 - 0.4, z1);
  }
  B.add('glass', tm(2.25, 2.95, 6.0, 0.05, 1.1, 7.6, 0, Math.atan2(0.3, 0.42)));
  // console + art in hall
  box('walnut', -3.9, -3.5, 0.6, 0.7, 5.2, 8.6);
  box('gold', -3.85, -3.6, 0, 0.6, 5.4, 5.5);
  box('gold', -3.85, -3.6, 0, 0.6, 8.3, 8.4);
  box('stone', -4.15, -4, 0, H1, 4.6, 9.7);

  // ---- living room furniture (x[-13,0] z[-10,2])
  box('cushion', -11, -2, 0.02, 0.035, -8, -1); // rug underlay edge (rug mesh on top)
  const sofa = (x, dir) => {
    const z0 = -6.4, z1 = -2.3;
    const back = dir > 0 ? [x - 0.5, x - 0.2] : [x + 0.2, x + 0.5];
    box('velvet', x - 0.5, x + 0.5, 0.05, 0.45, z0, z1);
    box('velvet', back[0], back[1], 0.45, 1.05, z0, z1);
    box('velvet', x - 0.5, x + 0.5, 0.45, 0.75, z0 - 0.25, z0);
    box('velvet', x - 0.5, x + 0.5, 0.45, 0.75, z1, z1 + 0.25);
    for (const zz of [-5.3, -3.4]) B.add('velvet', tm(x + dir * 0.08, 0.55, zz, 0.8, 0.2, 1.85));
    for (const zz of [-5.8, -2.9]) B.add('cushion', tm(x - dir * 0.18, 0.78, zz, 0.18, 0.5, 0.55, 0, 0, dir * 0.25));
  };
  sofa(-10.3, 1);
  sofa(-2.7, -1);
  // coffee table
  box('marble', -7.7, -5.3, 0.3, 0.42, -5.2, -3.6);
  box('travOut', -7.2, -5.8, 0.02, 0.3, -4.9, -3.9);
  // side tables
  for (const [x, z] of [[-10.3, -1.5], [-2.7, -7.2]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 24), mats.gold);
    c.position.set(x, 0.6, z); g.add(c);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), mats.gold);
    s.position.set(x, 0.3, z); g.add(s);
  }
  const vase = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), mats.vase);
  vase.scale.set(1, 0.85, 1); vase.position.set(-6.5, 0.6, -4.4); vase.castShadow = true; g.add(vase);
  // zebra rug
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 6.4), S({ map: T.zebraTex(), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(-6.5, 0.04, -4.4); rug.receiveShadow = true; g.add(rug);

  // chandeliers (glass/chrome bubbles)
  const bubble = new THREE.SphereGeometry(1, 16, 12);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04, envMapIntensity: 2 });
  const bulb = S({ color: 0xffefd6, emissive: 0xffd49a, emissiveIntensity: 3 });
  const cluster = (cx, cy, cz, rad, n, hang) => {
    const cm = new THREE.InstancedMesh(bubble, chrome, n);
    const bm = new THREE.InstancedMesh(bubble, bulb, Math.floor(n / 3));
    const rods = [];
    let bi = 0;
    for (let i = 0; i < n; i++) {
      const u = rand() * Math.PI * 2, v = Math.acos(rr(-1, 1)), r = rad * Math.cbrt(rand());
      const p = new THREE.Vector3(Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r * (hang ? 2.2 : 0.8), Math.sin(v) * Math.sin(u) * r).add(new THREE.Vector3(cx, cy, cz));
      const s = rr(0.05, 0.13);
      cm.setMatrixAt(i, tm(p.x, p.y, p.z, s, s, s));
      if (i % 3 === 0 && bi < bm.count) { bm.setMatrixAt(bi++, tm(p.x, p.y - 0.02, p.z, s * 0.45, s * 0.45, s * 0.45)); }
      rods.push(p);
    }
    g.add(cm, bm);
    const rg = []; for (const p of rods) rg.push(p.x, p.y, p.z, p.x, H1 - 0.35 + (hang ? Y3 - H1 : 0), p.z);
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(rg, 3));
    g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.5 })));
    const pl = new THREE.PointLight(0xffc98a, 8, 14, 1.6); pl.position.set(cx, cy, cz); g.add(pl);
  };
  cluster(-6.5, 3.1, -4.2, 0.9, 70, false);
  cluster(0, 6.2, 6, 0.8, 90, true);

  // ---- dining (x[0,13])
  box('marble', 1.6, 6.8, 0.72, 0.8, -6.6, -5.0);
  box('black', 2.4, 2.6, 0, 0.72, -6.2, -5.4);
  box('black', 5.8, 6.0, 0, 0.72, -6.2, -5.4);
  for (let k = 0; k < 4; k++) {
    const x = 2.3 + k * 1.25;
    for (const s of [-1, 1]) {
      const zc = -5.8 + s * 1.15;
      box('fabric', x - 0.27, x + 0.27, 0, 0.5, zc - 0.27, zc + 0.27);
      const bz = zc + s * 0.24;
      box('fabric', x - 0.27, x + 0.27, 0.5, 1.25, bz - 0.06, bz + 0.06);
    }
  }
  for (const zc of [-5.8]) for (const s of [1]) {
    const x = s < 0 ? 1.0 : 7.4;
    box('fabric', x - 0.27, x + 0.27, 0, 0.5, zc - 0.27, zc + 0.27);
    box('fabric', x + s * 0.24 - 0.06, x + s * 0.24 + 0.06, 0.5, 1.25, zc - 0.27, zc + 0.27);
  }
  // pendants
  const shade = new THREE.ConeGeometry(0.22, 0.3, 20, 1, true);
  const pend = (x, z, len) => {
    const c = new THREE.Mesh(shade, mats.black); c.position.set(x, H1 - len, z); c.material.side = THREE.DoubleSide; g.add(c);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bulb); b.position.set(x, H1 - len - 0.12, z); g.add(b);
    box('black', x - 0.008, x + 0.008, H1 - len + 0.15, H1, z - 0.008, z + 0.008);
  };
  for (let k = 0; k < 3; k++) pend(2.8 + k * 1.6, -5.8, 1.9);
  for (let k = 0; k < 3; k++) pend(9, -4 + k * 1.6, 1.7);
  const dl = new THREE.PointLight(0xffd29a, 5, 10, 1.6); dl.position.set(4.2, 2.6, -5.8); g.add(dl);

  // ---- kitchen (east wall x=13)
  box('walnut', 12.3, 13, 0, 0.9, -5, 2);
  box('marble', 12.2, 13, 0.9, 0.96, -5, 2);
  box('marble', 12.95, 13, 0.96, 2.4, -5, 2);
  box('walnut', 12.55, 13, 2.4, 3.5, -5, 2);
  box('walnut', 12.3, 13, 0, H1 - 0.12, -6.4, -5);    // tall column
  box('oven', 12.28, 12.3, 1.0, 1.65, -6.2, -5.2);
  box('oven', 12.28, 12.3, 1.75, 2.4, -6.2, -5.2);
  box('walnut', 12.3, 13, 0, H1 - 0.12, 2, 2.6);
  box('walnut', 12.5, 12.95, 1.6, 1.66, -4.5, -1.5); // floating shelf
  // island (marble waterfall)
  box('marble', 8.4, 9.6, 0, 0.98, -5.2, -0.6);
  box('walnut', 8.3, 8.4, 0.05, 0.9, -5.0, -0.8);
  for (let k = 0; k < 3; k++) {
    const z = -4.4 + k * 1.5;
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.12, 20), mats.fabric);
    seat.position.set(7.75, 0.72, z); seat.castShadow = true; g.add(seat);
    for (const [dx, dz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) box('gold', 7.75 + dx - 0.015, 7.75 + dx + 0.015, 0, 0.66, z + dz - 0.015, z + dz + 0.015);
  }
  // indoor palm in planter
  box('planter', 10.6, 11.8, 0, 0.6, -8.8, -7.6);

  // ---- built
  const built = B.build();
  built.traverse((o) => { if (o.isInstancedMesh) { o.castShadow = !o.material.transparent && o.name !== 'cove'; o.receiveShadow = true; } });
  g.add(built);

  // pool water
  const wn = T.waterNormal();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(16, 8),
    new THREE.MeshPhysicalMaterial({ color: 0x46c4d4, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.82, normalMap: wn, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.4 }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.1, -16.5);
  g.add(water);

  // interior fill lights
  const fill1 = new THREE.PointLight(0xfff0dc, 6, 18, 1.4); fill1.position.set(-6, 3.6, -1); g.add(fill1);
  const fill2 = new THREE.PointLight(0xfff0dc, 6, 18, 1.4); fill2.position.set(8, 3.6, -2); g.add(fill2);
  const fill3 = new THREE.PointLight(0xffe2bc, 5, 14, 1.4); fill3.position.set(0, 3.2, 7); g.add(fill3);

  return { group: g, water, palmSpots: [[-11.5, -0.5, 14.5], [11.5, -0.5, 14.5], [11.2, 0.6, -8.2, 3.2], [14, 0, -22]] };
}
