import "./style.css";
import "./warisan.css";

const printButton = document.querySelector("#print-paper");
printButton.addEventListener("click", () => window.print());

async function createSculpture() {
  const THREE = await import("three");
  const canvas = document.querySelector("#heritage-canvas");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    // The CSS ring illustration remains visible when WebGL is unavailable.
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0.3, 9);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8eafdb, 3));
  const light = new THREE.DirectionalLight(0xfff4dd, 4);
  light.position.set(-3, 5, 6);
  scene.add(light);
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const geometry = new THREE.TorusGeometry(1.22, 0.19, 20, 80);
  const materials = [0x3f6bf3, 0xffbe35, 0xa7def3].map(color => new THREE.MeshStandardMaterial({ color, roughness: 0.27, metalness: 0.18 }));
  materials.forEach((material, index) => {
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.set(0.65 + index * 0.7, index * 0.55, -0.5 + index * 0.6);
    ring.position.x = (index - 1) * 0.17;
    sculpture.add(ring);
  });
  sculpture.rotation.z = -0.15;
  const sparkGeometry = new THREE.OctahedronGeometry(0.15);
  const sparkPositions = [[1.65, 1.2, 0], [-1.65, -0.8, 0], [1.3, -1.4, 0]];
  sparkPositions.forEach((position, index) => {
    const spark = new THREE.Mesh(sparkGeometry, materials[index]);
    spark.position.set(...position);
    scene.add(spark);
  });
  canvas.hidden = false;
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener("beforeprint", resize);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    canvas.hidden = true;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    canvas.hidden = false;
    resize();
  });
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    observer.disconnect();
    window.removeEventListener("beforeprint", resize);
    geometry.dispose();
    sparkGeometry.dispose();
    materials.forEach(material => material.dispose());
    renderer.dispose();
  }, { once: true });
  resize();
}

createSculpture().catch(() => {
  document.querySelector("#heritage-canvas").hidden = true;
});
