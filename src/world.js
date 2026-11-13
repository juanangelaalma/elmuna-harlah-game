import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import fontData from "three/examples/fonts/helvetiker_bold.typeface.json";

const font = new FontLoader().parse(fontData);
export const colors = {
  blue: 0x3f6bf3,
  gold: 0xffbe35,
  sky: 0xa7def3,
  cream: 0xfffde5,
};
export const material = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.34,
    metalness: 0.05,
    ...extra,
  });
export function mesh(
  geometry,
  color,
  parent,
  position = [0, 0, 0],
  extra = {},
) {
  const object = new THREE.Mesh(geometry, material(color, extra));
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
export function textMesh(text, size, color, parent, depth = 0.2) {
  const geometry = new TextGeometry(text, {
    font,
    size,
    depth,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: size * 0.045,
    bevelSize: size * 0.035,
    bevelSegments: 5,
  });
  geometry.center();
  return mesh(geometry, color, parent);
}
export function lighting(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb7cde8, 2.5));
  const sun = new THREE.DirectionalLight(0xfff4dd, 4.5);
  sun.position.set(-5, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.normalBias = 0.04;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc8d3ff, 2);
  fill.position.set(7, 2, -5);
  scene.add(fill);
}
export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  return renderer;
}
export function eventProp(type, parent, scale = 1) {
  const group = new THREE.Group();
  parent.add(group);
  group.scale.setScalar(scale);
  if (type === 0) {
    mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.25, 16), colors.blue, group);
    mesh(
      new THREE.SphereGeometry(0.33, 24, 16),
      colors.cream,
      group,
      [0, 0.7, 0],
      { roughness: 0.7 },
    );
    for (let i = 0; i < 4; i++) {
      const ring = mesh(
        new THREE.TorusGeometry(0.31 - i * 0.025, 0.018, 6, 24),
        0x979ba8,
        group,
        [0, 0.58 + i * 0.11, 0],
      );
      ring.rotation.x = Math.PI / 2;
    }
    group.rotation.z = -0.3;
  } else if (type === 1) {
    const head = mesh(
      new THREE.TorusGeometry(0.65, 0.075, 8, 40),
      colors.gold,
      group,
      [0, 0.55, 0],
    );
    head.scale.y = 1.25;
    mesh(
      new THREE.CylinderGeometry(0.075, 0.09, 1.15, 12),
      colors.blue,
      group,
      [0, -0.75, 0],
    );
    for (let i = -2; i <= 2; i++) {
      const offset = i * 0.19;
      const length = Math.sqrt(0.6 ** 2 - offset ** 2) * 2;
      mesh(
        new THREE.CylinderGeometry(0.008, 0.008, length * 1.25, 4),
        colors.cream,
        group,
        [offset, 0.55, 0],
      );
      const line = mesh(
        new THREE.CylinderGeometry(0.008, 0.008, length, 4),
        colors.cream,
        group,
        [0, 0.55 + offset * 1.25, 0],
      );
      line.rotation.z = Math.PI / 2;
    }
    group.rotation.z = -0.4;
  } else {
    mesh(new THREE.BoxGeometry(1.6, 1.12, 0.27), colors.blue, group);
    mesh(
      new THREE.BoxGeometry(1.34, 0.85, 0.04),
      colors.sky,
      group,
      [0, 0, 0.16],
    );
    const triangle = new THREE.Shape();
    triangle.moveTo(-0.14, -0.23);
    triangle.lineTo(0.23, 0);
    triangle.lineTo(-0.14, 0.23);
    triangle.closePath();
    mesh(new THREE.ShapeGeometry(triangle), colors.blue, group, [0, 0, 0.19]);
    mesh(
      new THREE.BoxGeometry(1.65, 0.26, 0.3),
      colors.gold,
      group,
      [0, 0.74, 0],
    );
    group.rotation.z = 0.15;
  }
  return group;
}

