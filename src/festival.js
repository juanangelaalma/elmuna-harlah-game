import * as THREE from "three";
import { colors, createRenderer, eventProp, lighting, mesh, textMesh } from "./world.js";

export function initFestival() {
  const panel = document.querySelector(".festival");
  const canvas = panel.querySelector("canvas");
  const status = panel.querySelector("#festival-help");
  const buttons = [...panel.querySelectorAll(".festival-hotspot")];
  const controls = [...panel.querySelectorAll(".festival-controls button")];
  let renderer;
  function fallback() {
    panel.classList.add("festival-unavailable");
    status.textContent = "Tampilan 3D tidak tersedia. Pilih acara lewat tombol di atas.";
    controls.forEach((button) => { button.disabled = true; });
  }
  try {
    renderer = createRenderer(canvas);
  } catch {
    fallback();
    return;
  }
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    fallback();
  });
  canvas.addEventListener("webglcontextrestored", () => {
    panel.classList.remove("festival-unavailable");
    controls.forEach((button) => { button.disabled = false; });
    status.textContent = "Geser untuk memutar. Ketuk area untuk melihat acara.";
    draw();
  });
  const scene = new THREE.Scene();
  lighting(scene);
  const camera = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 80);
  camera.position.set(0, 10, 15);
  camera.lookAt(0, 0.5, 0);
  const island = new THREE.Group();
  scene.add(island);
  const box = (parent, color, size, position) =>
    mesh(new THREE.BoxGeometry(...size), color, parent, position);
  const disc = (parent, color, radius, height, position, bottom = radius) =>
    mesh(new THREE.CylinderGeometry(radius, bottom, height, 64), color, parent, position);

  // The blue shoreline and cream paths carry the site's existing festival palette.
  disc(island, colors.blue, 4.65, 0.65, [0, -0.65, 0], 4.15);
  disc(island, colors.sky, 4.64, 0.12, [0, -0.26, 0]);
  disc(island, colors.cream, 4.35, 0.12, [0, -0.14, 0]);
  disc(island, 0x81b7ae, 4.12, 0.12, [0, -0.04, 0]);
  const path = mesh(new THREE.TorusGeometry(2.7, 0.19, 8, 80), colors.cream, island, [0, 0.03, 0]);
  path.rotation.x = Math.PI / 2;
  box(island, colors.cream, [0.65, 0.06, 6.5], [0, 0.05, 0]);
  box(island, colors.cream, [6.5, 0.06, 0.55], [0, 0.06, -0.3]);

  const stations = [];
  function station(index, position) {
    const group = new THREE.Group();
    group.position.set(...position);
    group.userData.hotspot = index;
    island.add(group);
    stations.push(group);
    return group;
  }
  const talk = station(0, [-2.45, 0, -0.25]);
  disc(talk, colors.blue, 1.22, 0.25, [0, 0.16, 0]);
  disc(talk, colors.gold, 1.24, 0.09, [0, 0.33, 0]);
  for (const x of [-0.95, 0.95]) {
    box(talk, colors.blue, [0.09, 1.7, 0.09], [x, 1.1, -0.4]);
  }
  const roof = mesh(new THREE.ConeGeometry(1.55, 0.6, 4), colors.gold, talk, [0, 2.1, -0.35]);
  roof.rotation.y = Math.PI / 4;
  const mic = eventProp(0, talk, 0.58);
  mic.position.set(0, 0.95, 0.05);
  for (const x of [-0.65, 0.65]) {
    box(talk, colors.cream, [0.42, 0.45, 0.38], [x, 0.58, 0.22]);
  }
  const sport = station(1, [2.35, 0, -0.15]);
  box(sport, colors.blue, [2.15, 0.15, 2.65], [0, 0.13, 0]);
  for (const x of [-0.93, 0, 0.93]) {
    box(sport, colors.cream, [0.035, 0.02, 2.4], [x, 0.22, 0]);
  }
  for (const z of [-1.18, 0, 1.18]) {
    box(sport, colors.cream, [1.9, 0.02, 0.035], [0, 0.22, z]);
  }
  for (const x of [-1.1, 1.1]) {
    box(sport, colors.gold, [0.07, 0.95, 0.07], [x, 0.66, 0]);
  }
  for (let i = 0; i < 7; i++) {
    box(sport, colors.cream, [2.2, 0.015, 0.02], [0, 0.65 + i * 0.065, 0]);
  }
  for (let i = -5; i <= 5; i++) {
    box(sport, colors.cream, [0.015, 0.4, 0.02], [i * 0.2, 0.85, 0]);
  }
  const racket = eventProp(1, sport, 0.52);
  racket.position.set(0.5, 1.3, 0.75);
  const studio = station(2, [0, 0, 2.5]);
  box(studio, colors.gold, [2.2, 0.18, 1.55], [0, 0.15, 0]);
  box(studio, colors.blue, [1.9, 1.25, 0.16], [0, 0.87, -0.5]);
  const screen = eventProp(2, studio, 0.83);
  screen.position.set(0, 1, -0.35);
  for (const x of [-0.85, 0.85]) {
    box(studio, colors.blue, [0.08, 0.9, 0.08], [x, 0.7, 0.3]);
    mesh(new THREE.SphereGeometry(0.16, 12, 8), colors.cream, studio, [x, 1.2, 0.3]);
  }
  const portal = station(3, [0, 0, -2.5]);
  disc(portal, colors.blue, 1.25, 0.2, [0, 0.15, 0]);
  for (const x of [-0.95, 0.95]) {
    box(portal, colors.gold, [0.24, 2.35, 0.38], [x, 1.3, 0]);
  }
  box(portal, colors.gold, [2.15, 0.24, 0.38], [0, 2.45, 0]);
  const number = textMesh("43", 1.25, colors.gold, portal, 0.22);
  number.position.set(0, 1.45, 0.1);
  const marble = mesh(new THREE.SphereGeometry(0.3, 24, 16), colors.cream, island, [0, 0.4, -0.9]);
  const stripe = mesh(new THREE.TorusGeometry(0.3, 0.045, 8, 32), colors.blue, marble);
  stripe.rotation.x = Math.PI / 2;
  for (const [x, z] of [[-3.2, -2], [3.2, -2], [-3.55, 1.5], [3.5, 1.65], [-1.4, -3.5], [1.5, -3.5]]) {
    mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.65, 8), 0x957151, island, [x, 0.35, z]);
    mesh(new THREE.IcosahedronGeometry(0.48, 1), colors.gold, island, [x, 0.95, z]);
  }
  // Bunting joins the event areas rather than adding unrelated floating ornaments.
  for (const x of [-3.5, 3.5]) {
    box(island, colors.blue, [0.06, 2.25, 0.06], [x, 1.1, -2.7]);
  }
  for (let i = 0; i < 13; i++) {
    const flag = mesh(new THREE.ConeGeometry(0.18, 0.35, 3), i % 2 ? colors.gold : colors.blue, island,
      [-3.35 + i * 0.56, 2.2 - Math.sin(i / 12 * Math.PI) * 0.35, -2.7]);
    flag.rotation.z = Math.PI;
  }

  const anchors = [
    new THREE.Vector3(-2.45, 2.65, -0.25),
    new THREE.Vector3(2.35, 2.15, -0.15),
    new THREE.Vector3(0, 0.1, 3.7),
    new THREE.Vector3(0, 3.15, -2.5),
  ];
  const projected = new THREE.Vector3();
  let width = 1;
  let height = 1;
  let angle = -0.16;
  let dragging;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function draw() {
    if (panel.classList.contains("festival-unavailable")) return;
    island.rotation.y = angle;
    scene.updateMatrixWorld(true);
    renderer.render(scene, camera);
    anchors.forEach((anchor, i) => {
      projected.copy(anchor).applyMatrix4(island.matrixWorld).project(camera);
      buttons[i].style.left = `${(projected.x + 1) * width / 2}px`;
      buttons[i].style.top = `${(1 - projected.y) * height / 2}px`;
    });
  }
  function rotate(next) {
    angle = THREE.MathUtils.clamp(next, -0.7, 0.55);
    draw();
  }
  controls[0].addEventListener("click", () => rotate(angle - 0.2));
  controls[1].addEventListener("click", () => rotate(-0.16));
  controls[2].addEventListener("click", () => rotate(angle + 0.2));
  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(stations, true)[0];
    let object = hit?.object;
    while (object && object.userData.hotspot === undefined) object = object.parent;
    return object?.userData.hotspot;
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, angle, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) {
      canvas.style.cursor = pick(event) === undefined ? "grab" : "pointer";
      return;
    }
    if (event.pointerId !== dragging.id) return;
    const dx = event.clientX - dragging.x;
    dragging.moved ||= Math.hypot(dx, event.clientY - dragging.y) > 6;
    if (dragging.moved) {
      canvas.style.cursor = "grabbing";
      rotate(dragging.angle + dx / width * 2);
    }
  });
  function release(event) {
    if (event.pointerId !== dragging?.id) return;
    const tapped = !dragging.moved && event.type === "pointerup";
    dragging = undefined;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = "grab";
    if (tapped) {
      const index = pick(event);
      if (index !== undefined) buttons[index].click();
    }
  }
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(type, release);
  new ResizeObserver(() => {
    ({ width, height } = canvas.getBoundingClientRect());
    if (!width || !height) return;
    const halfWidth = Math.max(5.4, 4.4 * width / height);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth * height / width;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  }).observe(canvas);
  status.textContent = "Geser untuk memutar. Ketuk area untuk melihat acara.";
}
