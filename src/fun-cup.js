const status = document.querySelector("#cup-status");
const printButton = document.querySelector("#download-pdf");
const form = document.querySelector("#registration-form");
const input = document.querySelector("#registration-url");
const registration = document.querySelector("#registration-link");
const address = document.querySelector("#registration-address");
const motionButton = document.querySelector("#motion-toggle");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "elmuna-fun-cup-registration";
let artAvailable = false;
let printing = false;

function applyLink(value) {
  const url = value ? new URL(value) : null;
  if (url && !["https:", "http:"].includes(url.protocol)) throw new Error("unsupported protocol");
  registration.hidden = !url;
  document.querySelector("#registration-placeholder").hidden = Boolean(url);
  if (url) registration.href = url.href;
  else registration.removeAttribute("href");
  address.textContent = url ? url.href : "Link pendaftaran akan diumumkan.";
  input.value = url ? url.href : "";
}

try {
  applyLink(localStorage.getItem(storageKey) || "");
} catch {
  // Storage may be unavailable; the editor still works for this visit.
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  input.setCustomValidity("");
  try {
    applyLink(input.value.trim());
  } catch {
    input.setCustomValidity("Gunakan alamat lengkap dengan https:// atau http://.");
    input.reportValidity();
    return;
  }
  try {
    if (input.value) localStorage.setItem(storageKey, input.value);
    else localStorage.removeItem(storageKey);
    status.textContent = input.value ? "Link diterapkan dan disimpan di browser ini. Link akan ikut tercetak pada PDF." : "Link dihapus. Poster menampilkan pemberitahuan pendaftaran akan diumumkan.";
  } catch {
    status.textContent = "Link diterapkan untuk kunjungan ini. Penyimpanan browser tidak tersedia; link tetap ikut tercetak.";
  }
});
input.addEventListener("input", () => input.setCustomValidity(""));

function syncMotionControl() {
  motionButton.hidden = !artAvailable || reducedMotion.matches;
}
motionButton.addEventListener("click", () => {
  const paused = document.body.classList.toggle("motion-paused");
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.textContent = paused ? "Lanjutkan animasi" : "Jeda animasi";
});
reducedMotion.addEventListener("change", syncMotionControl);

async function createArtwork() {
  const THREE = await import("three");
  let renderer;
  const scene = new THREE.Scene();
  const geometries = new Set();
  const materials = new Set();
  function material(color, metalness = .1) {
    const value = new THREE.MeshStandardMaterial({ color, roughness: .32, metalness, side: THREE.DoubleSide });
    materials.add(value);
    return value;
  }
  const blue = material(0x3f6bf3, .25);
  const sky = material(0xa7def3, .2);
  const gold = material(0xffbe35, .35);
  const ink = material(0x14213d);
  const white = material(0xffffff);
  function mesh(geometry, mat, parent, position = [0, 0, 0]) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(...position);
    parent.add(object);
    return object;
  }
  const unitRod = new THREE.CylinderGeometry(1, 1, 1, 10);
  function rod(parent, a, b, radius, mat) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const direction = end.sub(start);
    const object = mesh(unitRod, mat, parent);
    object.position.copy(start).addScaledVector(direction, .5);
    object.scale.set(radius, direction.length(), radius);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return object;
  }
  const rimGeometry = new THREE.TorusGeometry(.86, .065, 18, 120);
  const trimGeometry = new THREE.TorusGeometry(.86, .017, 8, 100);
  const gripGeometry = new THREE.TorusGeometry(.092, .012, 6, 24);
  function racket(mat, position, rotation, scale) {
    const group = new THREE.Group();
    group.position.set(...position);
    group.rotation.set(...rotation);
    group.scale.setScalar(scale);
    scene.add(group);
    const rim = mesh(rimGeometry, mat, group, [0, .63, 0]);
    rim.scale.y = 1.26;
    const trim = mesh(trimGeometry, gold, group, [0, .63, .06]);
    trim.scale.y = 1.26;
    for (let i = -6; i <= 6; i++) {
      const offset = i * .12;
      const half = Math.sqrt(.8 ** 2 - offset ** 2);
      rod(group, [offset, .63 - half * 1.26, 0], [offset, .63 + half * 1.26, 0], .006, white);
      rod(group, [-half, .63 + offset * 1.26, .012], [half, .63 + offset * 1.26, .012], .006, white);
    }
    rod(group, [-.24, -.4, 0], [0, -.78, 0], .027, mat);
    rod(group, [.24, -.4, 0], [0, -.78, 0], .027, mat);
    rod(group, [0, -.76, 0], [0, -1.46, 0], .035, mat);
    rod(group, [0, -1.43, 0], [0, -2.02, 0], .09, ink);
    for (let i = 0; i < 9; i++) {
      const wrap = mesh(gripGeometry, mat, group, [0, -1.48 - i * .062, 0]);
      wrap.rotation.set(Math.PI / 2, .12, 0);
    }
    return group;
  }
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(2160, 1080, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xa7def3, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 5, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffbe35, 2);
    fill.position.set(4, -2, 3);
    scene.add(fill);
    racket(gold, [-.7, -.04, -.7], [.2, -.3, .35], .94);
    racket(sky, [-.18, .16, .6], [.3, -.25, -.77], 1.18);

    const shuttle = new THREE.Group();
    shuttle.position.set(2.35, .86, 1.4);
    shuttle.rotation.set(.3, .2, -.86);
    shuttle.scale.setScalar(1.16);
    scene.add(shuttle);
    const cork = mesh(new THREE.SphereGeometry(.22, 32, 24), white, shuttle, [0, -.45, 0]);
    cork.scale.y = 1.15;
    mesh(new THREE.CylinderGeometry(.21, .21, .12, 32), blue, shuttle, [0, -.29, 0]);
    const shape = new THREE.Shape();
    shape.moveTo(-.025, 0);
    shape.lineTo(-.12, .76);
    shape.quadraticCurveTo(0, 1, .12, .76);
    shape.lineTo(.025, 0);
    shape.closePath();
    const featherGeometry = new THREE.ExtrudeGeometry(shape, { depth: .012, bevelEnabled: false });
    for (let i = 0; i < 14; i++) {
      const angle = i * Math.PI * 2 / 14;
      const feather = new THREE.Group();
      feather.position.set(Math.sin(angle) * .17, -.22, Math.cos(angle) * .17);
      feather.rotation.set(0, angle, 0);
      feather.rotateX(.42);
      shuttle.add(feather);
      mesh(featherGeometry, white, feather);
      rod(feather, [0, 0, .02], [0, .89, .02], .008, gold);
    }
    const binding = mesh(new THREE.TorusGeometry(.34, .018, 8, 48), gold, shuttle, [0, .1, 0]);
    binding.rotation.x = Math.PI / 2;
    const camera = new THREE.OrthographicCamera(-4.5, 4.5, 2.25, -2.25, .1, 30);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, -.1, 0);
    renderer.render(scene, camera);
    const image = document.querySelector("#cup-sculpture");
    image.src = renderer.domElement.toDataURL("image/png");
    await image.decode();
    image.hidden = false;
    document.querySelector(".cup-fallback").setAttribute("hidden", "");
    artAvailable = true;
    syncMotionControl();
  } finally {
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((mat) => mat.dispose());
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.width = renderer.domElement.height = 1;
    }
  }
}

const artworkReady = createArtwork().catch(() => {
  status.textContent = "WebGL tidak tersedia. Ilustrasi pengganti tetap tampil dan dapat dicetak.";
}).then(() => {
  printButton.disabled = false;
  if (artAvailable) status.textContent = "Poster siap. Download PDF membuka dialog cetak: pilih Simpan sebagai PDF, A4, skala 100%, tanpa margin dan header/footer. Aktifkan grafis latar belakang.";
});

printButton.addEventListener("click", async () => {
  if (printing) return;
  printing = true;
  printButton.disabled = true;
  try {
    await artworkReady;
    await document.fonts.ready;
    if (artAvailable) await document.querySelector("#cup-sculpture").decode();
    window.print();
  } catch {
    status.textContent = "Dialog cetak belum dapat dibuka. Gunakan menu Cetak browser untuk menyimpan PDF.";
  } finally {
    printing = false;
    printButton.disabled = false;
  }
});
