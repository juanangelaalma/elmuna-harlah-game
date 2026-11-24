const printButton = document.querySelector("#print-cards");
const status = document.querySelector("#card-status");
const image = document.querySelector("#card-emblem");
printButton.hidden = false;
printButton.disabled = true;
status.textContent = "Menyiapkan emblem Three.js untuk layar dan cetak…";

async function createEmblem() {
  const [THREE, { textMesh }] = await Promise.all([
    import("three"),
    import("./world.js"),
  ]);
  const scene = new THREE.Scene();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(1600, 1600, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xa7def3, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 4.5);
    key.position.set(-3, 5, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa7def3, 3);
    rim.position.set(4, 1, -2);
    scene.add(rim);
    const emblem = new THREE.Group();
    emblem.rotation.set(-.12, -.32, .1);
    scene.add(emblem);
    const number = textMesh("43", 1.65, 0xffbe35, emblem, .38);
    number.material.metalness = .35;
    number.material.roughness = .3;
    const orbitMaterial = new THREE.MeshStandardMaterial({
      color: 0xa7def3, roughness: .25, metalness: .15,
    });
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.82, .075, 20, 160), orbitMaterial);
    orbit.rotation.set(1.1, .15, -.42);
    orbit.position.y = -.13;
    emblem.add(orbit);
    const shape = new THREE.Shape();
    for (let i = 0; i < 32; i++) {
      const angle = i * Math.PI / 16;
      const radius = i % 4 === 0 || i % 4 === 3 ? .44 : .19;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const spark = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
      depth: .12, bevelEnabled: true, bevelThickness: .025,
      bevelSize: .025, bevelSegments: 3,
    }), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3, metalness: .12 }));
    spark.position.set(1.25, 1.3, .1);
    spark.rotation.set(.2, -.2, -.18);
    emblem.add(spark);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 16), number.material);
    bead.position.set(-1.4, -.85, .7);
    emblem.add(bead);
    const camera = new THREE.OrthographicCamera(-2.45, 2.45, 2.45, -2.45, .1, 20);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, .1, 0);
    renderer.render(scene, camera);
    image.src = renderer.domElement.toDataURL("image/png");
    await image.decode();
    image.hidden = false;
    document.querySelector(".emblem-fallback").hidden = true;
  } finally {
    const geometries = new Set();
    const materials = new Set();
    scene.traverse((object) => {
      if (!object.isMesh) return;
      geometries.add(object.geometry);
      materials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.width = renderer.domElement.height = 1;
    }
  }
}

const artworkReady = createEmblem().then(() => {
  status.textContent = "Emblem 3D siap dan ikut tercetak. Dua sisi A6 dalam satu lembar A4.";
}).catch(() => {
  status.textContent = "WebGL tidak tersedia. Emblem alternatif tetap dapat dicetak; ukuran kartu tidak berubah.";
}).finally(() => {
  printButton.disabled = false;
});

printButton.addEventListener("click", async () => {
  printButton.disabled = true;
  try {
    await artworkReady;
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll(".mc-card img")]
      .filter(image => !image.hidden && (image.currentSrc || image.getAttribute("src")))
      .map(image => image.decode()));
    window.print();
  } catch {
    status.textContent = "Pencetakan belum dibuka karena ada gambar atau font yang gagal dimuat. Muat ulang halaman, lalu coba lagi.";
  } finally {
    printButton.disabled = false;
  }
});
