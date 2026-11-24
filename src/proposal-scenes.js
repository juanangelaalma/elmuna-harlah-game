import * as THREE from "three";
import { mesh, textMesh, lighting } from "./world.js";

const blue = 0x3f6bf3;
const gold = 0xffbe35;
const sky = 0xa7def3;
const cream = 0xfff9e9;

function star(parent, position, size = 0.35) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const radius = i % 2 ? size * 0.45 : size;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const object = mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    }),
    gold,
    parent,
    position,
  );
  object.rotation.set(0.15, -0.25, 0.15);
}

// These three compositions retain the approved preview's geometry and lighting.
function heritage(group) {
  mesh(new THREE.CylinderGeometry(3, 3, 0.36, 80), sky, group, [0, -1.48, 0]);
  mesh(
    new THREE.CylinderGeometry(2.65, 2.65, 0.22, 80),
    cream,
    group,
    [0, -1.2, 0],
  );
  const ring = mesh(
    new THREE.TorusGeometry(2.88, 0.06, 10, 100),
    gold,
    group,
    [0, -1.23, 0],
  );
  ring.rotation.x = Math.PI / 2;
  const number = textMesh("43", 2.8, blue, group, 0.5);
  number.position.set(0, 0.26, 0.45);
  const arch = mesh(
    new THREE.TorusGeometry(2.35, 0.14, 16, 80, Math.PI),
    gold,
    group,
    [0, -0.7, -0.8],
  );
  arch.rotation.z = -0.17;
  star(group, [2.6, 1.75, 0], 0.38);
  const pearl = mesh(
    new THREE.SphereGeometry(0.23, 24, 16),
    sky,
    group,
    [-2.5, 0.75, 0.2],
  );
  pearl.material.roughness = 0.2;
  group.rotation.y = -0.17;
  group.rotation.z = -0.055;
}

function dialog(group) {
  const microphone = new THREE.Group();
  group.add(microphone);
  microphone.position.set(0.2, 0.35, 0.2);
  microphone.rotation.z = -0.38;
  microphone.rotation.x = 0.12;
  mesh(
    new THREE.CylinderGeometry(0.2, 0.18, 1.85, 32),
    blue,
    microphone,
    [0, 0, 0],
  );
  mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.2, 32),
    gold,
    microphone,
    [0, 0.86, 0],
  );
  const head = mesh(
    new THREE.SphereGeometry(0.54, 40, 32),
    cream,
    microphone,
    [0, 1.35, 0],
    { roughness: 0.5 },
  );
  head.scale.y = 1.2;
  for (let i = -3; i <= 3; i++) {
    const y = i * 0.13;
    const radius = Math.sqrt(0.54 ** 2 - (y / 1.2) ** 2);
    const grille = mesh(
      new THREE.TorusGeometry(radius, 0.018, 8, 48),
      0x8e9aa8,
      microphone,
      [0, 1.35 + y, 0],
    );
    grille.rotation.x = Math.PI / 2;
  }
  const base = new THREE.Vector3(-1.6, -1.35, 1.15);
  const junction = new THREE.Vector3(-0.55, -1.35, 0.1);
  const branches = [
    new THREE.Vector3(-1.2, -1.35, -1.7),
    new THREE.Vector3(1.7, -1.35, -0.4),
  ];
  for (const end of branches) {
    const path = new THREE.CatmullRomCurve3([base, junction, end]);
    mesh(new THREE.TubeGeometry(path, 40, 0.13, 12, false), gold, group);
    mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 32), blue, group, [
      end.x,
      end.y,
      end.z,
    ]);
  }
  star(group, [-1.25, 1.45, -0.3], 0.24);
  mesh(new THREE.SphereGeometry(0.18, 24, 16), sky, group, [1.6, 0.45, -0.7]);
  group.rotation.y = -0.08;
}

function partnership(group) {
  const shape = new THREE.Shape();
  shape.moveTo(-1.5, 0);
  shape.lineTo(-1.5, 1);
  shape.bezierCurveTo(-1.5, 2.9, 1.5, 2.9, 1.5, 1);
  shape.lineTo(1.5, 0);
  shape.lineTo(0.91, 0);
  shape.lineTo(0.91, 1);
  shape.bezierCurveTo(0.91, 2.05, -0.91, 2.05, -0.91, 1);
  shape.lineTo(-0.91, 0);
  shape.closePath();
  const arch = mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.6,
      steps: 1,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 4,
    }),
    blue,
    group,
    [0, -1.1, 0],
  );
  arch.rotation.y = -0.15;
  const orbit = mesh(
    new THREE.TorusGeometry(1.05, 0.18, 16, 64),
    gold,
    group,
    [0.25, 0.2, 0.25],
  );
  orbit.rotation.set(0.15, 1.1, -0.35);
  const cube = new THREE.BoxGeometry(0.63, 0.63, 0.63);
  const positions = [
    [-2, -1.05, 0.7],
    [-1.5, -1.05, 1.3],
    [-0.65, -1.05, 1.6],
    [0.35, -1.05, 1.7],
    [1.3, -1.05, 1.25],
    [2, -1.05, 0.5],
  ];
  positions.forEach((position, index) => {
    const block = mesh(cube, [blue, sky, gold][index % 3], group, position);
    block.rotation.y = 0.2 + index * 0.08;
  });
  star(group, [1.9, 1.55, -0.3], 0.27);
}

function roundedBox(
  parent,
  width,
  height,
  depth,
  color,
  position,
  radius = 0.08,
) {
  const x = width / 2;
  const y = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 3,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  return mesh(geometry, color, parent, position);
}

function rod(parent, from, to, radius, color) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.sub(start);
  const object = mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 12),
    color,
    parent,
  );
  object.position.copy(start).addScaledVector(direction, 0.5);
  object.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return object;
}

function platform(group, radius = 2.6) {
  mesh(
    new THREE.CylinderGeometry(radius, radius, 0.18, 80),
    sky,
    group,
    [0, -1.3, 0],
  );
  mesh(
    new THREE.CylinderGeometry(radius - 0.13, radius - 0.13, 0.07, 80),
    cream,
    group,
    [0, -1.175, 0],
  );
}

function generations(group) {
  platform(group);
  const positions = [
    [-1.25, 0.12, 0.05],
    [0, 0.3, 0],
    [1.25, 0.12, 0.05],
  ];
  positions.forEach((position, index) => {
    const ring = mesh(
      new THREE.TorusGeometry(0.95, 0.19, 24, 96),
      [blue, gold, blue][index],
      group,
      position,
    );
    ring.rotation.set(0.1, index === 1 ? -0.65 : 0.5, index === 1 ? 0.1 : -0.1);
    const inner = mesh(
      new THREE.TorusGeometry(0.95, 0.025, 10, 96),
      cream,
      ring,
      [0, 0, 0.18],
    );
    inner.castShadow = false;
  });
  star(group, [0.1, 1.9, 0], 0.28);
  group.rotation.y = -0.15;
}

function journey(group) {
  platform(group, 2.85);
  const points = [
    [-2, -1.02, 0.6],
    [-0.7, -1.02, -0.6],
    [0.65, -1.02, 0.6],
    [2, -1.02, -0.6],
  ];
  const curve = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point)),
  );
  mesh(new THREE.TubeGeometry(curve, 96, 0.105, 12, false), gold, group);
  points.forEach(([x, y, z], index) => {
    mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.18, 40), blue, group, [
      x,
      y + 0.05,
      z,
    ]);
    rod(group, [x, y + 0.1, z], [x, 0.4, z], 0.045, gold);
    const marker = new THREE.Group();
    marker.position.set(x, 0.6, z);
    group.add(marker);
    const disc = mesh(
      new THREE.CylinderGeometry(0.37, 0.37, 0.12, 48),
      index === 3 ? gold : blue,
      marker,
    );
    disc.rotation.x = Math.PI / 2;
    const number = textMesh(String(index + 1), 0.34, cream, marker, 0.025);
    number.position.set(0, 0, 0.09);
  });
  group.rotation.y = -0.12;
}

function badminton(group) {
  platform(group, 2.5);
  const racket = new THREE.Group();
  group.add(racket);
  racket.position.set(-0.65, 0.2, 0.15);
  racket.rotation.set(0.12, -0.15, -0.37);
  const rim = mesh(
    new THREE.TorusGeometry(0.85, 0.075, 16, 96),
    blue,
    racket,
    [0, 0.75, 0],
  );
  rim.scale.y = 1.2;
  const trim = mesh(
    new THREE.TorusGeometry(0.85, 0.025, 10, 96),
    gold,
    racket,
    [0, 0.75, 0.065],
  );
  trim.scale.y = 1.2;
  for (let i = -5; i <= 5; i++) {
    const offset = i * 0.14;
    const half = Math.sqrt(0.81 ** 2 - offset ** 2);
    rod(
      racket,
      [offset, 0.75 - half * 1.2, 0],
      [offset, 0.75 + half * 1.2, 0],
      0.009,
      cream,
    );
    rod(
      racket,
      [-half, 0.75 + offset * 1.2, 0.012],
      [half, 0.75 + offset * 1.2, 0.012],
      0.009,
      cream,
    );
  }
  rod(racket, [-0.25, -0.2, 0], [0, -0.55, 0], 0.035, gold);
  rod(racket, [0.25, -0.2, 0], [0, -0.55, 0], 0.035, gold);
  rod(racket, [0, -0.5, 0], [0, -1.15, 0], 0.045, blue);
  rod(racket, [0, -1.1, 0], [0, -1.65, 0], 0.1, blue);
  for (let i = 0; i < 7; i++) {
    const wrap = mesh(
      new THREE.TorusGeometry(0.101, 0.013, 6, 24),
      gold,
      racket,
      [0, -1.12 - i * 0.08, 0],
    );
    wrap.rotation.x = Math.PI / 2;
  }
  const shuttle = new THREE.Group();
  group.add(shuttle);
  shuttle.position.set(1.15, -0.1, 0.55);
  shuttle.rotation.set(0.18, 0, -0.35);
  const cork = mesh(
    new THREE.SphereGeometry(0.24, 32, 24),
    cream,
    shuttle,
    [0, -0.5, 0],
  );
  cork.scale.y = 1.1;
  mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.13, 32),
    blue,
    shuttle,
    [0, -0.34, 0],
  );
  const feather = new THREE.Shape();
  feather.moveTo(-0.035, 0);
  feather.lineTo(-0.13, 0.78);
  feather.quadraticCurveTo(0, 1.03, 0.13, 0.78);
  feather.lineTo(0.035, 0);
  feather.closePath();
  const featherGeometry = new THREE.ExtrudeGeometry(feather, {
    depth: 0.018,
    bevelEnabled: false,
  });
  for (let i = 0; i < 14; i++) {
    const vane = new THREE.Group();
    const angle = (i * Math.PI * 2) / 14;
    vane.position.set(Math.sin(angle) * 0.18, -0.28, Math.cos(angle) * 0.18);
    vane.rotation.set(0, angle, 0);
    vane.rotateX(0.39);
    shuttle.add(vane);
    mesh(featherGeometry, cream, vane);
    rod(vane, [0, 0, 0.025], [0, 0.92, 0.025], 0.01, gold);
  }
  const binding = mesh(
    new THREE.TorusGeometry(0.34, 0.025, 8, 48),
    gold,
    shuttle,
    [0, 0.13, 0],
  );
  binding.rotation.x = Math.PI / 2;
}

function video(group) {
  platform(group);
  const camera = new THREE.Group();
  group.add(camera);
  camera.position.set(-0.55, 0, 0);
  camera.rotation.y = -0.13;
  roundedBox(camera, 2.3, 1.45, 1.05, blue, [0, 0.15, 0]);
  roundedBox(camera, 0.8, 0.28, 0.4, gold, [0.1, 1.02, 0]);
  roundedBox(camera, 0.65, 0.23, 0.3, sky, [-0.6, 0.98, 0]);
  for (const [radius, depth, z, color] of [
    [0.62, 0.3, 0.65, gold],
    [0.51, 0.38, 0.91, blue],
    [0.43, 0.08, 1.13, sky],
    [0.24, 0.02, 1.18, 0x14213d],
  ]) {
    const lens = mesh(
      new THREE.CylinderGeometry(radius, radius, depth, 64),
      color,
      camera,
      [0.2, 0.18, z],
    );
    lens.rotation.x = Math.PI / 2;
  }
  mesh(
    new THREE.SphereGeometry(0.075, 20, 16),
    cream,
    camera,
    [0.34, 0.36, 1.2],
  );
  rod(camera, [0, -0.6, 0], [0, -1.05, 0], 0.1, gold);
  for (const foot of [
    [-0.8, -1.15, 0.5],
    [0.8, -1.15, 0.5],
    [0, -1.15, -0.7],
  ]) {
    rod(camera, [0, -0.75, 0], foot, 0.055, blue);
  }
  const clapper = new THREE.Group();
  group.add(clapper);
  clapper.position.set(1.5, -0.1, 0.1);
  clapper.rotation.set(0, -0.2, -0.12);
  roundedBox(clapper, 1.3, 1.05, 0.17, blue, [0, -0.15, 0]);
  roundedBox(clapper, 1.34, 0.22, 0.2, gold, [0, 0.5, 0]);
  const arm = new THREE.Group();
  arm.position.set(-0.64, 0.64, 0);
  arm.rotation.z = 0.3;
  clapper.add(arm);
  roundedBox(arm, 1.34, 0.22, 0.2, cream, [0.64, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const stripe = mesh(new THREE.BoxGeometry(0.14, 0.22, 0.012), blue, arm, [
      0.17 + i * 0.28,
      0,
      0.11,
    ]);
    stripe.rotation.z = -0.3;
  }
  for (let i = 0; i < 3; i++)
    roundedBox(
      clapper,
      0.87 - i * 0.12,
      0.035,
      0.01,
      cream,
      [0, 0.05 - i * 0.2, 0.105],
      0.01,
    );
}

function crescent(parent, position, scale = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(0.18, 0.42);
  shape.bezierCurveTo(-0.55, 0.48, -0.55, -0.45, 0.18, -0.42);
  shape.bezierCurveTo(-0.15, -0.22, -0.15, 0.22, 0.18, 0.42);
  const object = mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.065,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
      bevelSegments: 2,
    }),
    gold,
    parent,
    position,
  );
  object.scale.setScalar(scale);
}

function mosque(group) {
  platform(group, 2.8);
  roundedBox(group, 2.8, 1.3, 1.8, cream, [0, -0.45, 0]);
  roundedBox(group, 3, 0.16, 2, blue, [0, 0.25, 0]);
  const dome = mesh(
    new THREE.SphereGeometry(0.95, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    blue,
    group,
    [0, 0.35, 0],
  );
  dome.scale.y = 0.95;
  mesh(
    new THREE.CylinderGeometry(0.99, 0.99, 0.1, 64),
    gold,
    group,
    [0, 0.37, 0],
  );
  rod(group, [0, 1.2, 0], [0, 1.6, 0], 0.025, gold);
  crescent(group, [0.06, 1.79, 0], 0.5);
  const doorShape = new THREE.Shape();
  doorShape.moveTo(-0.3, -0.6);
  doorShape.lineTo(-0.3, 0.05);
  doorShape.quadraticCurveTo(-0.3, 0.4, 0, 0.58);
  doorShape.quadraticCurveTo(0.3, 0.4, 0.3, 0.05);
  doorShape.lineTo(0.3, -0.6);
  doorShape.closePath();
  mesh(
    new THREE.ExtrudeGeometry(doorShape, { depth: 0.045, bevelEnabled: false }),
    blue,
    group,
    [0, -0.5, 0.93],
  );
  rod(group, [0, -1.08, 0.99], [0, -0.03, 0.99], 0.018, gold);
  for (const x of [-0.98, 0.98]) {
    roundedBox(group, 0.32, 0.55, 0.04, sky, [x, -0.38, 0.94]);
    rod(group, [x, -0.62, 0.98], [x, -0.13, 0.98], 0.015, gold);
  }
  for (const x of [-1.9, 1.9]) {
    mesh(new THREE.CylinderGeometry(0.19, 0.27, 2.3, 32), cream, group, [
      x,
      0,
      -0.35,
    ]);
    for (const y of [-0.95, 0.7, 1.05])
      mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32), gold, group, [
        x,
        y,
        -0.35,
      ]);
    mesh(new THREE.ConeGeometry(0.3, 0.55, 32), blue, group, [x, 1.37, -0.35]);
    rod(group, [x, 1.6, -0.35], [x, 1.85, -0.35], 0.02, gold);
  }
  roundedBox(group, 1.1, 0.12, 0.6, sky, [0, -1.08, 1.1]);
  group.rotation.y = -0.12;
}

function coin(parent, position, rotation = [0, 0, 0]) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.set(...rotation);
  parent.add(group);
  mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 48), gold, group);
  const border = mesh(
    new THREE.TorusGeometry(0.34, 0.018, 8, 48),
    cream,
    group,
    [0, 0.067, 0],
  );
  border.rotation.x = -Math.PI / 2;
  const mark = textMesh("+", 0.31, cream, group, 0.015);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.071;
}

function budget(group) {
  platform(group);
  // Equal-height modules are symbolic building blocks, not a quantitative chart.
  for (const [x, z, color] of [
    [-0.8, -0.55, blue],
    [0.45, -0.55, sky],
    [-0.8, 0.7, sky],
    [0.45, 0.7, blue],
  ]) {
    roundedBox(group, 1.05, 0.65, 1.05, color, [x, -0.75, z]);
    mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 32), gold, group, [
      x,
      -0.36,
      z,
    ]);
  }
  for (let i = 0; i < 5; i++) coin(group, [1.65, -1.06 + i * 0.14, 0.55]);
  coin(group, [-0.65, 0.45, -0.3], [Math.PI / 2, 0.12, -0.2]);
  coin(group, [0.55, 0.8, 0.05], [Math.PI / 2, -0.12, 0.18]);
  group.rotation.y = -0.2;
}

function picture(parent, position, rotation, accent) {
  const frame = new THREE.Group();
  frame.position.set(...position);
  frame.rotation.set(...rotation);
  parent.add(frame);
  roundedBox(frame, 2.2, 1.85, 0.14, accent, [0, 0, 0]);
  roundedBox(frame, 1.93, 1.58, 0.025, cream, [0, 0, 0.09], 0.03);
  roundedBox(frame, 1.73, 1.23, 0.02, sky, [0, 0.08, 0.115], 0.02);
  const mountains = new THREE.Shape();
  mountains.moveTo(-0.85, -0.51);
  mountains.lineTo(-0.28, 0.27);
  mountains.lineTo(0.15, -0.14);
  mountains.lineTo(0.46, 0.1);
  mountains.lineTo(0.85, -0.51);
  mountains.closePath();
  mesh(new THREE.ShapeGeometry(mountains), blue, frame, [0, 0.08, 0.133]);
  const sun = mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.02, 40),
    gold,
    frame,
    [0.45, 0.41, 0.14],
  );
  sun.rotation.x = Math.PI / 2;
  roundedBox(frame, 0.65, 0.035, 0.01, gold, [0, -0.73, 0.12], 0.01);
}

function archive(group) {
  platform(group);
  // Picture icons denote an archive, never fabricated documentary photographs.
  picture(group, [-0.95, -0.05, -0.25], [0.04, 0.12, -0.12], gold);
  picture(group, [0.8, -0.12, 0.55], [0, -0.16, 0.12], blue);
  star(group, [1.65, 1.5, -0.15], 0.25);
}

function polygon(parent, points, color, position) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) =>
    index ? shape.lineTo(x, y) : shape.moveTo(x, y),
  );
  shape.closePath();
  return mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
      bevelSegments: 2,
    }),
    color,
    parent,
    position,
  );
}

function contact(group) {
  platform(group);
  const envelope = new THREE.Group();
  envelope.position.set(0, 0, 0.3);
  envelope.rotation.set(-0.08, -0.18, -0.07);
  group.add(envelope);
  roundedBox(envelope, 3.45, 2.05, 0.22, blue, [0, 0, 0]);
  roundedBox(envelope, 2.75, 2.05, 0.065, cream, [0, 0.57, -0.04]);
  for (let i = 0; i < 3; i++)
    roundedBox(
      envelope,
      1.6 - i * 0.25,
      0.05,
      0.015,
      sky,
      [-0.25, 1.12 - i * 0.22, 0.015],
      0.015,
    );
  polygon(
    envelope,
    [
      [-1.68, 0.94],
      [0, -0.25],
      [-1.68, -0.94],
    ],
    sky,
    [0, 0, 0.14],
  );
  polygon(
    envelope,
    [
      [1.68, 0.94],
      [1.68, -0.94],
      [0, -0.25],
    ],
    sky,
    [0, 0, 0.14],
  );
  polygon(
    envelope,
    [
      [-1.68, -0.94],
      [0, 0.1],
      [1.68, -0.94],
    ],
    blue,
    [0, 0, 0.19],
  );
  const seal = mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.08, 48),
    gold,
    envelope,
    [0, -0.18, 0.25],
  );
  seal.rotation.x = Math.PI / 2;
  star(group, [1.9, 1.65, 0], 0.24);
}

function documentScene(group) {
  platform(group, 2.45);
  for (let i = 0; i < 4; i++) {
    const sheet = roundedBox(group, 2.45, 3.05, 0.07, i === 0 ? blue : cream, [
      0,
      -0.95 + i * 0.11,
      0,
    ]);
    sheet.rotation.set(-Math.PI / 2, 0, (i - 1.5) * 0.075);
  }
  const page = new THREE.Group();
  group.add(page);
  page.position.set(0, -0.49, 0);
  page.rotation.set(-Math.PI / 2, 0, 0.1125);
  roundedBox(page, 1.35, 0.22, 0.025, blue, [-0.2, 0.93, 0]);
  for (let i = 0; i < 6; i++)
    roundedBox(
      page,
      i === 5 ? 1.05 : 1.85,
      0.045,
      0.02,
      i === 2 ? gold : sky,
      [i === 5 ? -0.4 : 0, 0.43 - i * 0.25, 0],
      0.015,
    );
  const clip = mesh(
    new THREE.TorusGeometry(0.18, 0.035, 10, 48, Math.PI * 1.8),
    gold,
    page,
    [0.75, 1.23, 0.08],
  );
  clip.scale.y = 1.7;
  const pencil = new THREE.Group();
  group.add(pencil);
  pencil.position.set(1.7, -0.72, 0.1);
  pencil.rotation.set(0.5, 0, -0.22);
  mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 1.7, 6),
    gold,
    pencil,
    [0, 0.5, 0],
  );
  mesh(new THREE.ConeGeometry(0.085, 0.25, 6), cream, pencil, [0, 1.475, 0]);
  mesh(new THREE.ConeGeometry(0.025, 0.08, 6), blue, pencil, [0, 1.63, 0]);
}

const definitions = new Map([
  [
    "heritage",
    {
      build: heritage,
      width: 1500,
      height: 900,
      view: 5.8,
      camera: [5, 4.5, 11],
      target: [0, 0.2, 0],
      floor: -1.75,
    },
  ],
  // Same approved portrait aspect and camera, with increased print resolution.
  [
    "dialog",
    {
      build: dialog,
      width: 1170,
      height: 1300,
      view: 5.8,
      camera: [4, 4.2, 9],
      target: [0, 0.3, 0],
    },
  ],
  [
    "partnership",
    {
      build: partnership,
      width: 1100,
      height: 800,
      view: 4.7,
      camera: [5, 4, 9],
      target: [0, 0.2, 0],
    },
  ],
  ...Object.entries({
    generations,
    journey,
    badminton,
    video,
    mosque,
    budget,
    archive,
    contact,
    document: documentScene,
  }).map(([name, build]) => [
    name,
    {
      build,
      width: 1500,
      height: 1100,
      view: 5.8,
      camera: [4, 3.5, 10],
      target: [0, 0.2, 0],
    },
  ]),
]);

function disposeScene(scene) {
  const geometries = new Set();
  const materials = new Set();
  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      const entries = Array.isArray(object.material)
        ? object.material
        : [object.material];
      entries.forEach((material) => materials.add(material));
    }
    object.shadow?.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  scene.clear();
}

/**
 * Render static, reusable PNGs for all editorial frames. Initialization errors
 * propagate to the caller's WebGL fallback handler; frame failures return false.
 * No page initialization, status updates, or animation are performed here.
 */
export async function renderEditorialArt() {
  const frames = document.querySelectorAll(
    ".editorial-scene[data-editorial-scene]",
  );
  if (!frames.length) return true;
  const byType = new Map();
  for (const frame of frames) {
    const name = frame.dataset.editorialScene;
    if (!byType.has(name)) byType.set(name, []);
    byType.get(name).push(frame);
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  let success = true;
  try {
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    for (const [name, instances] of byType) {
      const definition = definitions.get(name);
      if (!definition) {
        success = false;
        continue;
      }
      const scene = new THREE.Scene();
      let snapshot;
      try {
        lighting(scene);
        const group = new THREE.Group();
        scene.add(group);
        definition.build(group);
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(100, 100),
          new THREE.ShadowMaterial({ opacity: 0.13 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = definition.floor ?? -1.42;
        floor.receiveShadow = true;
        scene.add(floor);
        const aspect = definition.width / definition.height;
        const half = definition.view / 2;
        const camera = new THREE.OrthographicCamera(
          -half * aspect,
          half * aspect,
          half,
          -half,
          0.1,
          100,
        );
        camera.position.set(...definition.camera);
        camera.lookAt(...definition.target);
        renderer.setSize(definition.width, definition.height);
        renderer.render(scene, camera);
        if (renderer.getContext().isContextLost())
          throw new Error("WebGL context lost");
        snapshot = renderer.domElement.toDataURL("image/png");
      } catch {
        success = false;
      } finally {
        disposeScene(scene);
        renderer.renderLists.dispose();
      }
      if (!snapshot) continue;

      // One PNG per type; appendix frames share it without another render.
      const results = await Promise.all(
        instances.map(async (frame) => {
          const image = frame.querySelector("img.scene-image");
          if (!image) return false;
          try {
            image.src = snapshot;
            await image.decode();
            image.hidden = false;
            frame.dataset.rendered = "three";
            return true;
          } catch {
            image.hidden = true;
            delete frame.dataset.rendered;
            return false;
          }
        }),
      );
      if (results.some((result) => !result)) success = false;
    }
    return success;
  } finally {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.width = 1;
    renderer.domElement.height = 1;
  }
}
