import * as THREE from 'three';
import { JOURNEY_EVENTS } from './journey-state.js';
import { colors, createRenderer, eventProp, lighting, mesh, textMesh } from './world.js';

const INK = 0x14213d;
const ROUTE_SEGMENTS = 90;
const ROUTE_SIDES = 10;
const eventColors = { past: colors.blue, current: colors.gold, upcoming: colors.sky };

export async function createJourneyScene({ canvas, nodeButtons, onSelect, onAvailability }) {
  const map = canvas.parentElement;
  const pin = map.querySelector('[data-journey-pin]');
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(8, 10, 15);
  camera.lookAt(0, 0.5, 0);
  camera.updateMatrixWorld();
  lighting(scene);
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const island = mesh(new THREE.CylinderGeometry(4.6, 4.25, 0.45, 64), 0xffffff, scene, [0, -0.65, 0]);
  island.scale.z = 0.78;
  const route = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.8, -0.32, 1.15),
    new THREE.Vector3(-1.4, -0.32, 1.9),
    new THREE.Vector3(0.15, -0.32, 1.1),
    new THREE.Vector3(1.55, -0.32, 0.5),
    new THREE.Vector3(2.05, -0.32, -1.1),
    new THREE.Vector3(0.7, -0.32, -2.1),
    new THREE.Vector3(-1.05, -0.32, -1.65),
  ]);
  function addRoute(radius, color) {
    const geometry = new THREE.TubeGeometry(route, ROUTE_SEGMENTS, radius, ROUTE_SIDES, false);
    const material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    scene.add(new THREE.Mesh(geometry, material));
    return geometry;
  }
  addRoute(0.112, colors.sky);
  const elapsedRoute = addRoute(0.122, colors.blue);
  elapsedRoute.setDrawRange(0, 0);

  const markerGeometry = new THREE.CylinderGeometry(0.45, 0.52, 0.16, 32);
  const landmarks = JOURNEY_EVENTS.map(({ id }, index) => {
    const position = route.getPointAt(index / (JOURNEY_EVENTS.length - 1));
    const base = mesh(markerGeometry, colors.sky, scene, [position.x, -0.26, position.z]);
    base.material.toneMapped = false;
    const prop = new THREE.Group();
    scene.add(prop);
    prop.position.set(position.x, 0.42, position.z);
    if (index < 3) eventProp([2, 0, 1][index], prop, 0.69);
    else {
      const number = textMesh('43', 1.04, colors.blue, prop, 0.2);
      number.position.y = 0.42;
      mesh(new THREE.TorusGeometry(0.92, 0.1, 10, 40, Math.PI), colors.gold, prop, [0, 0.1, -0.18]);
    }
    // Stagger the two central screen-space buttons above their respective props.
    const anchor = new THREE.Vector3(position.x, [1.55, 1.43, 1.55, 2.4][index], position.z);
    return { id, position, base, anchor, button: nodeButtons[index] };
  });
  const halo = mesh(new THREE.TorusGeometry(0.57, 0.032, 8, 40), INK, scene);
  halo.rotation.x = Math.PI / 2;
  halo.castShadow = false;
  const ball = mesh(new THREE.SphereGeometry(0.19, 24, 16), colors.gold, scene, undefined, { roughness: 0.27 });
  ball.material.toneMapped = false;
  ball.castShadow = false;

  const listeners = new AbortController();
  const { signal } = listeners;
  const projected = new THREE.Vector3();
  let state;
  let selectedEventId;
  let width = 0;
  let height = 0;
  let visible = !('IntersectionObserver' in window);
  let lost = false;
  let painted = false;
  let frame = 0;

  function project(position, element, offsetY = 0) {
    projected.copy(position).project(camera);
    element.style.left = `${(projected.x + 1) * width * 0.5}px`;
    element.style.top = `${(1 - projected.y) * height * 0.5 + offsetY}px`;
  }

  function showArtwork(show) {
    canvas.hidden = pin.hidden = !show;
    for (const { button } of landmarks) button.hidden = !show;
    onAvailability(show);
  }

  function draw() {
    frame = 0;
    if (!state || !visible || lost || document.hidden) return;
    const nextWidth = map.clientWidth;
    const nextHeight = map.clientHeight;
    if (!nextWidth || !nextHeight) return;
    if (width !== nextWidth || height !== nextHeight) {
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.zoom = Math.min(1.46, camera.aspect * 1.24);
      camera.updateProjectionMatrix();
      for (const { anchor, button } of landmarks) project(anchor, button);
    }
    for (const { id, base, position } of landmarks) {
      base.material.color.setHex(eventColors[state.eventStates[id].kind]);
      if (id === selectedEventId) halo.position.set(position.x, -0.145, position.z);
    }
    elapsedRoute.setDrawRange(0, Math.floor(state.routeProgress * ROUTE_SEGMENTS) * ROUTE_SIDES * 6);
    route.getPointAt(state.routeProgress, ball.position);
    ball.position.y += 0.35;
    project(ball.position, pin, 10);
    renderer.render(scene, camera);
    if (!painted) {
      painted = true;
      showArtwork(true);
    }
  }

  function requestDraw() {
    if (!frame && state && visible && !lost && !document.hidden) frame = requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(requestDraw);
  resizeObserver.observe(map);
  const visibilityObserver = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    requestDraw();
  }) : null;
  visibilityObserver?.observe(map);
  map.dataset.scene = '';
  for (const { id, button } of landmarks) {
    button.addEventListener('click', () => onSelect(id), { signal });
  }
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
    painted = false;
    showArtwork(false);
  }, { signal });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    width = height = 0;
    renderer.shadowMap.needsUpdate = true;
    requestDraw();
  }, { signal });
  document.addEventListener('visibilitychange', requestDraw, { signal });
  window.addEventListener('pageshow', requestDraw, { signal });

  return {
    update(nextState, nextSelectedEventId) {
      state = nextState;
      selectedEventId = nextSelectedEventId;
      requestDraw();
    },
    dispose() {
      listeners.abort();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
        object.shadow?.dispose();
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
