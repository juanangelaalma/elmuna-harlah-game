import "./style.css";
import "./timeline.css";

const buttons = [...document.querySelectorAll("[data-stop]")];
const names = ["Dialog interaktif", "Lomba Creative Video", "Lomba Badminton", "Puncak Harlah ke-43"];
const status = document.querySelector("#journey-status");
const counter = document.querySelector(".journey-counter");
const canvas = document.querySelector("#timeline-canvas");
let selectStop;
let selected = 0;
let available = false;

for (const button of buttons) {
  button.addEventListener("click", () => {
    selected = Number(button.dataset.stop);
    for (const item of buttons) item.setAttribute("aria-pressed", String(item === button));
    counter.textContent = `0${selected + 1} / 04`;
    status.textContent = `${names[selected]}${available ? " — disorot pada peta." : " — lihat jadwal lengkap di bawah."}`;
    selectStop?.(selected);
  });
}

async function createJourney() {
  const [THREE, { createRenderer, lighting, mesh, eventProp, textMesh, colors }] = await Promise.all([
    import("three"),
    import("./world.js"),
  ]);
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(8, 10, 15);
  camera.lookAt(0, 0.5, 0);
  lighting(scene);

  const island = mesh(new THREE.CylinderGeometry(4.6, 4.25, 0.45, 64), 0xffffff, scene, [0, -0.65, 0]);
  island.scale.z = 0.78;
  const ground = mesh(new THREE.PlaneGeometry(200, 200), 0xedf5fc, scene, [0, -0.9, 0]);
  ground.rotation.x = -Math.PI / 2;
  const points = [
    new THREE.Vector3(-2.8, -0.32, 1.15),
    new THREE.Vector3(-1.4, -0.32, 1.9),
    new THREE.Vector3(0.15, -0.32, 1.1),
    new THREE.Vector3(1.55, -0.32, 0.5),
    new THREE.Vector3(2.05, -0.32, -1.1),
    new THREE.Vector3(0.7, -0.32, -2.1),
    new THREE.Vector3(-1.05, -0.32, -1.65),
  ];
  const route = new THREE.CatmullRomCurve3(points);
  mesh(new THREE.TubeGeometry(route, 90, 0.13, 10, false), colors.gold, scene);
  const positions = [points[0], points[2], points[4], points[6]];
  const props = [];
  const markers = [];
  const markerGeometry = new THREE.CylinderGeometry(0.51, 0.6, 0.22, 32);
  const haloGeometry = new THREE.TorusGeometry(0.7, 0.055, 8, 48);
  positions.forEach((position, index) => {
    const base = mesh(markerGeometry, colors.blue, scene, [position.x, -0.22, position.z]);
    markers.push(base);
    const prop = new THREE.Group();
    scene.add(prop);
    prop.position.set(position.x, 0.8, position.z);
    if (index < 3) eventProp([0, 2, 1][index], prop, 0.65);
    else {
      const number = textMesh("43", 1.35, colors.blue, prop, 0.22);
      number.position.y = 0.25;
      const arch = mesh(new THREE.TorusGeometry(1.05, 0.13, 10, 40, Math.PI), colors.gold, prop, [0, 0.25, -0.2]);
      arch.rotation.y = 0.12;
    }
    props.push(prop);
  });
  const halo = mesh(haloGeometry, colors.gold, scene);
  halo.rotation.x = Math.PI / 2;
  const star = textMesh("+", 0.7, colors.blue, scene, 0.1);
  star.position.set(2.9, 0.4, 1.8);
  star.rotation.z = 0.25;

  function render() { renderer.render(scene, camera); }
  selectStop = (index) => {
    props.forEach((prop, i) => prop.scale.setScalar(i === index ? 1.15 : 0.9));
    markers.forEach((marker, i) => marker.material.color.setHex(i === index ? colors.gold : colors.blue));
    const position = positions[index];
    halo.position.set(position.x, -0.08, position.z);
    render();
  };
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    available = false;
    status.textContent = "Visual 3D tidak tersedia. Semua jadwal tetap tersedia di halaman ini.";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    available = true;
    selectStop(selected);
    status.textContent = `${names[selected]} — disorot pada peta.`;
  });
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    observer.disconnect();
    const geometries = new Set();
    const materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) {
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
      if (object.shadow) object.shadow.dispose();
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
  }, { once: true });
  available = true;
  resize();
  selectStop(selected);
  status.textContent = `${names[selected]} — disorot pada peta.`;
}

createJourney().catch(() => {
  canvas.hidden = true;
  status.textContent = "Visual 3D tidak tersedia. Semua jadwal tetap dapat dibaca di halaman ini.";
});
