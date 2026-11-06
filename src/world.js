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

export function initHero() {
  const canvas = document.querySelector("#hero-canvas");
  let renderer;
  try {
    renderer = createRenderer(canvas);
  } catch {
    canvas.replaceWith(
      Object.assign(document.createElement("div"), {
        className: "hero-fallback",
        textContent: "43",
      }),
    );
    return;
  }
  const scene = new THREE.Scene();
  lighting(scene);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 5.4, 12.8);
  camera.lookAt(0, 0.65, 0);
  const world = new THREE.Group();
  scene.add(world);
  world.rotation.y = -0.22;
  const platform = mesh(
    new THREE.CylinderGeometry(3.35, 3.38, 0.28, 100),
    colors.blue,
    world,
    [0, -0.65, 0],
  );
  mesh(
    new THREE.CylinderGeometry(3.34, 3.34, 0.035, 100),
    colors.sky,
    world,
    [0, -0.493, 0],
  );
  for (const r of [2.5, 2.85, 3.13]) {
    const track = mesh(
      new THREE.TorusGeometry(r, 0.025, 6, 100),
      colors.cream,
      world,
      [0, -0.46, 0],
    );
    track.rotation.x = -Math.PI / 2;
  }
  const number = textMesh("43", 3.65, colors.gold, world, 0.75);
  number.position.set(-0.12, 1.35, 0);
  number.rotation.set(-0.09, -0.14, -0.1);
  const props = [
    eventProp(0, world, 0.65),
    eventProp(1, world, 0.69),
    eventProp(2, world, 0.7),
  ];
  props[0].position.set(-2.55, 0.2, 0.65);
  props[0].rotation.z = -0.55;
  props[1].position.set(2.62, 0.62, -0.05);
  props[1].rotation.z = -0.05;
  props[2].position.set(1.73, -0.05, 2.3);
  props[2].rotation.y = -0.3;
  const ball = mesh(
    new THREE.SphereGeometry(0.47, 40, 32),
    colors.cream,
    world,
    [-1.45, -0.01, 2.12],
    { metalness: 0.3, roughness: 0.18 },
  );
  const stripe = mesh(
    new THREE.TorusGeometry(0.465, 0.065, 12, 50),
    colors.blue,
    ball,
  );
  stripe.rotation.set(1.1, 0.3, 0.3);
  const ring = mesh(
    new THREE.TorusGeometry(0.57, 0.15, 16, 60),
    colors.blue,
    world,
    [-2.62, 2.55, -0.4],
  );
  ring.rotation.set(0.2, 0.5, -0.4);
  const pinkBall = mesh(
    new THREE.SphereGeometry(0.28, 24, 20),
    colors.sky,
    world,
    [2.5, 3.0, -0.5],
  );
  const spark = new THREE.Group();
  world.add(spark);
  spark.position.set(1.8, 3.6, -0.3);
  for (let i = 0; i < 4; i++) {
    const bar = mesh(
      new THREE.CapsuleGeometry(0.07, 0.65, 4, 8),
      colors.gold,
      spark,
    );
    bar.rotation.z = (i * Math.PI) / 4;
  }
  for (const [x, z, h] of [
    [-2, -1.6, 0.65],
    [2, -1.8, 0.8],
    [-2.8, -0.8, 0.4],
  ]) {
    mesh(new THREE.CylinderGeometry(0.045, 0.045, h, 8), colors.blue, world, [
      x,
      -0.4 + h / 2,
      z,
    ]);
    mesh(new THREE.SphereGeometry(h * 0.38, 16, 12), colors.gold, world, [
      x,
      -0.35 + h,
      z,
    ]);
  }
  const shadow = mesh(
    new THREE.PlaneGeometry(200, 200),
    colors.cream,
    scene,
    [0, -0.85, 0],
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.material = new THREE.ShadowMaterial({ opacity: 0.11 });
  const pointer = new THREE.Vector2();
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      (event.clientX - rect.left) / rect.width - 0.5,
      (event.clientY - rect.top) / rect.height - 0.5,
    );
  });
  canvas.addEventListener("pointerleave", () => pointer.set(0, 0));
  canvas.addEventListener("click", () => {
    bounce = 1;
  });
  new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }).observe(canvas);
  let visible = true;
  new IntersectionObserver(
    ([entry]) => (visible = entry.isIntersecting),
  ).observe(canvas);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let bounce = 0;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (
      !visible ||
      document.hidden ||
      document.querySelector("#game-dialog").open
    )
      return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    world.rotation.y += (-0.22 + pointer.x * 0.35 - world.rotation.y) * 0.04;
    world.rotation.x += (pointer.y * 0.08 - world.rotation.x) * 0.04;
    bounce *= 0.94;
    number.position.y =
      1.35 + Math.sin(t * 1.3) * 0.09 + Math.sin(bounce * Math.PI) * 0.4;
    ring.rotation.z = -0.4 + t * 0.2;
    pinkBall.position.y = 3 + Math.sin(t * 1.6) * 0.18;
    spark.rotation.z = t * 0.1;
    ball.rotation.z = t * 0.2;
    renderer.render(scene, camera);
  });
}
