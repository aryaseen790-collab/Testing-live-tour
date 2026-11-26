// Google Photorealistic 3D Tiles aerial (loaded only when an API key is configured).
import * as THREE from 'three';
import { TilesRenderer } from '3d-tiles-renderer';
import { GoogleCloudAuthPlugin, GLTFExtensionsPlugin, ReorientationPlugin, TilesFadePlugin, TileCompressionPlugin } from '3d-tiles-renderer/plugins';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { makeSky } from './world.js';
import { AERIAL_CENTER, LANDMARK, STREET_PINS } from './config.js';

const D2R = Math.PI / 180;

export function createGoogleAerial(renderer, apiKey) {
  const scene = new THREE.Scene();
  scene.add(makeSky());
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 2, 80000);

  const tiles = new TilesRenderer();
  tiles.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: apiKey, autoRefreshToken: true, useRecommendedSettings: true }));
  const draco = new DRACOLoader().setDecoderPath(new URL('../vendor/addons/libs/draco/gltf/', import.meta.url).href);
  tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader: draco }));
  tiles.registerPlugin(new TileCompressionPlugin());
  tiles.registerPlugin(new TilesFadePlugin());
  tiles.registerPlugin(new ReorientationPlugin({ lat: AERIAL_CENTER.lat * D2R, lon: AERIAL_CENTER.lon * D2R, height: AERIAL_CENTER.groundHeight, recenter: true }));
  tiles.setCamera(camera);
  tiles.setResolutionFromRenderer(camera, renderer);
  scene.add(tiles.group);

  let loadedTiles = 0, failed = false;
  tiles.addEventListener('load-model', () => { loadedTiles++; });
  tiles.addEventListener('load-error', (e) => {
    console.warn('[google tiles] load error', e?.error || e);
    if (loadedTiles === 0) failed = true;
  });

  const _v = new THREE.Vector3();
  // geographic → scene position (after reorientation)
  const toLocal = (lat, lon, h = AERIAL_CENTER.groundHeight, out = new THREE.Vector3()) => {
    tiles.ellipsoid.getCartographicToPosition(lat * D2R, lon * D2R, h, out);
    return out.applyMatrix4(tiles.group.matrixWorld);
  };

  // Camera framing: from south of the community towards the landmark.
  const pose = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  function aerialPose(t = 0) {
    tiles.group.updateMatrixWorld(true);
    const c = toLocal(AERIAL_CENTER.lat, AERIAL_CENTER.lon);
    const l = toLocal(LANDMARK.lat, LANDMARK.lon);
    const dir = l.clone().sub(c); dir.y = 0; dir.normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    pose.pos.copy(c).addScaledVector(dir, -2300).addScaledVector(side, Math.sin(t * 0.05) * 160).add(_v.set(0, 560 + Math.sin(t * 0.035) * 25, 0));
    pose.look.copy(c).addScaledVector(dir, 1100);
    return pose;
  }
  // Pose hovering above a street pin, ready to hand off to the street-level tour.
  function divePose(i) {
    const p = STREET_PINS[i];
    const c = toLocal(p.lat, p.lon);
    const l = toLocal(LANDMARK.lat, LANDMARK.lon);
    const dir = l.clone().sub(c); dir.y = 0; dir.normalize();
    return { pos: c.clone().addScaledVector(dir, -140).add(_v.set(0, 95, 0)), look: c.clone().addScaledVector(dir, 60) };
  }
  const pinPositions = () => STREET_PINS.map((p) => toLocal(p.lat, p.lon, AERIAL_CENTER.groundHeight + 45));

  function attributions() {
    const list = tiles.getAttributions();
    return list.filter((a) => a.type === 'string').map((a) => a.value).join('; ');
  }

  return {
    scene, camera, tiles,
    get loadedTiles() { return loadedTiles; },
    get failed() { return failed; },
    aerialPose, divePose, pinPositions, attributions,
    resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.fov = camera.aspect < 0.8 ? 66 : 50;
      camera.updateProjectionMatrix();
      tiles.setResolutionFromRenderer(camera, renderer);
    },
    update() {
      camera.updateMatrixWorld();
      tiles.update();
    },
  };
}
