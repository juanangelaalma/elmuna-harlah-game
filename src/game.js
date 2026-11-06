import * as THREE from "three";
import {
  colors,
  material,
  mesh,
  textMesh,
  lighting,
  createRenderer,
  eventProp,
} from "./world.js";

const WORLDS = [
  {
    name: "01 / DIALOG INTERAKTIF",
    title: "Taman Ide — terus penasaran.",
    color: 0xe3f3fb,
    road: 0x9dcfe8,
    accent: colors.blue,
    collectible: "Inspirasi baru untukmu ✦",
  },
  {
    name: "02 / TURNAMEN BULU TANGKIS",
    title: "Lapangan Rali — ayo bertanding.",
    color: 0xfff3cf,
    road: 0xe9bd64,
    accent: colors.blue,
    collectible: "Semangat bertanding bertambah ✦",
  },
  {
    name: "03 / LOMBA VIDEO KREATIF",
    title: "Dunia Kreasi — wujudkan idemu.",
    color: 0xe8efff,
    road: 0x8daee7,
    accent: colors.blue,
    collectible: "Percikan kreativitas terkumpul ✦",
  },
];
const LENGTH = 360;
const SPEED = 7.15;
const timeFormat = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function initGame({ toast, download, refreshIcons }) {
  const dialog = document.querySelector("#game-dialog");
  const canvas = document.querySelector("#game-canvas");
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WORLDS[0].color);
  scene.fog = new THREE.Fog(WORLDS[0].color, 20, 64);
  lighting(scene);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  const player = new THREE.Group();
  scene.add(player);
  const marble = mesh(
    new THREE.SphereGeometry(0.43, 32, 24),
    colors.cream,
    player,
    [0, 0, 0],
    { metalness: 0.32, roughness: 0.16 },
  );
  const stripe = mesh(
    new THREE.TorusGeometry(0.424, 0.075, 10, 40),
    colors.blue,
    marble,
  );
  stripe.rotation.x = 0.9;
  const stripe2 = mesh(
    new THREE.TorusGeometry(0.428, 0.035, 8, 40),
    colors.gold,
    marble,
  );
  stripe2.rotation.y = 0.8;
  const shadow = mesh(
    new THREE.CircleGeometry(0.5, 24),
    0x242647,
    scene,
    [0, 0.02, 0],
    { transparent: true, opacity: 0.18 },
  );
  shadow.rotation.x = -Math.PI / 2;
  const course = new THREE.Group();
  scene.add(course);
  const obstacles = [],
    tokens = [],
    decorations = [],
    gates = [],
    confetti = [];
  const boxGeometry = new THREE.BoxGeometry(1.45, 0.95, 1.05);
  const tokenGeometry = [
    new THREE.IcosahedronGeometry(0.26, 1),
    new THREE.ConeGeometry(0.25, 0.55, 8),
    new THREE.OctahedronGeometry(0.32),
  ];
  let state = "ready",
    progress = 0,
    elapsed = 0,
    score = 0,
    x = 0,
    velocity = 0,
    jumpY = 0,
    jumpVelocity = 0,
    slowdown = 0,
    worldIndex = -1,
    hitCount = 0,
    best = null;
  let audio,
    sound = false,
    lastTime = 0,
    toastTimeout;
  const input = { left: false, right: false, jump: false };
  try {
    best = JSON.parse(localStorage.getItem("road43-best"));
  } catch {
    /* Storage may be disabled. */
  }
  function beep(frequency, duration = 0.1) {
    if (!sound || !audio) return;
    const osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      frequency * 1.4,
      audio.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.07, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    osc.start();
    osc.stop(audio.currentTime + duration);
  }
  function worldToast(message) {
    const el = document.querySelector("#world-toast");
    el.textContent = message;
    el.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove("visible"), 2500);
  }

  for (let stage = 0; stage < 3; stage++) {
    const world = WORLDS[stage],
      start = stage * 120;
    mesh(new THREE.BoxGeometry(7.5, 0.35, 120), world.road, course, [
      0,
      -0.2,
      -start - 60,
    ]);
    for (const side of [-1, 1]) {
      mesh(new THREE.BoxGeometry(0.16, 0.26, 120), colors.cream, course, [
        side * 3.64,
        0.05,
        -start - 60,
      ]);
      mesh(new THREE.BoxGeometry(0.035, 0.015, 120), colors.cream, course, [
        side * 1.15,
        0.005,
        -start - 60,
      ]);
    }
    // Repeating side scenery makes each event a distinct miniature world.
    for (let d = 10; d < 120; d += 18) {
      for (const side of [-1, 1]) {
        const group = new THREE.Group();
        course.add(group);
        group.position.set(side * (5 + Math.random() * 1.6), 0, -start - d);
        mesh(
          new THREE.CylinderGeometry(1.2, 1.4, 0.7, 24),
          world.road,
          group,
          [0, -0.3, 0],
        );
        const prop = eventProp(stage, group, 1.1);
        prop.position.y = 1.5;
        prop.rotation.y = side * 0.3;
        const tree = mesh(
          new THREE.SphereGeometry(0.65, 16, 12),
          stage === 1 ? colors.sky : colors.gold,
          group,
          [side * 1.6, 0.8, -1],
        );
        tree.scale.y = 1.4;
        mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), colors.blue, group, [
          side * 1.6,
          0.2,
          -1,
        ]);
        decorations.push(group);
      }
    }
    for (let row = 0; row < 8; row++) {
      const distance = start + 18 + row * 12;
      const lane = Math.floor(Math.random() * 3) - 1;
      const block = mesh(boxGeometry, world.accent, course, [
        lane * 2.25,
        0.475,
        -distance,
      ]);
      if (stage === 1) {
        block.material = material(colors.blue, { wireframe: true });
        mesh(
          new THREE.BoxGeometry(1.55, 0.09, 0.1),
          colors.cream,
          block,
          [0, 0.46, 0],
        );
        for (const side of [-1, 1])
          mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 1.05, 8),
            colors.blue,
            block,
            [side * 0.75, 0, 0],
          );
      } else {
        const mark = textMesh(
          stage === 0 ? "?" : "+",
          0.5,
          colors.cream,
          block,
          0.02,
        );
        mark.position.set(0, 0, 0.55);
      }
      obstacles.push({ object: block, distance, lane, hit: false });
      const tokenLane = (row % 3) - 1;
      for (const offset of [4, 8]) {
        const token = mesh(
          tokenGeometry[stage],
          stage === 1 ? 0xffe494 : colors.blue,
          course,
          [tokenLane * 2.25, 0.7, -(distance - offset)],
          {
            metalness: 0.35,
            roughness: 0.2,
            emissive: stage === 1 ? 0x5b3a00 : 0x070b44,
            emissiveIntensity: 0.2,
          },
        );
        const ring = mesh(
          new THREE.TorusGeometry(0.38, 0.025, 6, 20),
          colors.gold,
          token,
        );
        tokens.push({
          object: token,
          distance: distance - offset,
          taken: false,
          baseY: 0.7,
          stage,
        });
      }
    }
    const gate = new THREE.Group();
    course.add(gate);
    gate.position.z = -start - 2;
    for (const side of [-1, 1])
      mesh(new THREE.CylinderGeometry(0.075, 0.075, 4, 8), world.accent, gate, [
        side * 3.65,
        2,
        0,
      ]);
    mesh(new THREE.BoxGeometry(7.5, 0.8, 0.15), world.accent, gate, [0, 4, 0]);
    const label = textMesh(
      ["TERUS PENASARAN", "AYO BERTANDING", "BEBASKAN KREASI"][stage],
      0.33,
      colors.cream,
      gate,
      0.02,
    );
    label.position.set(0, 4.02, 0.1);
    gates.push(gate);
  }
  mesh(new THREE.BoxGeometry(7.5, 0.35, 12), colors.sky, course, [
    0,
    -0.2,
    -LENGTH - 6,
  ]);
  const portal = textMesh("43", 3.4, colors.gold, course, 0.4);
  portal.position.set(0, 2.1, -LENGTH - 3);
  const portalRing = mesh(
    new THREE.TorusGeometry(3.3, 0.085, 10, 70),
    colors.blue,
    course,
    [0, 2, -LENGTH - 3.5],
  );
  for (let i = 0; i < 45; i++) {
    const piece = mesh(
      new THREE.BoxGeometry(0.12, 0.23, 0.025),
      [colors.blue, colors.gold, colors.sky, colors.cream][i % 4],
      scene,
      [
        (Math.random() - 0.5) * 11,
        Math.random() * 8 + 2,
        -LENGTH + (Math.random() - 0.5) * 8,
      ],
    );
    piece.visible = false;
    confetti.push(piece);
  }

  function resize() {
    const width = dialog.clientWidth,
      height = dialog.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 600 ? 63 : 52;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(dialog);
  function reset() {
    progress =
      elapsed =
      score =
      x =
      velocity =
      jumpY =
      jumpVelocity =
      slowdown =
      hitCount =
        0;
    worldIndex = -1;
    input.left = input.right = input.jump = false;
    tokens.forEach((token) => {
      token.taken = false;
      token.object.visible = true;
    });
    obstacles.forEach((obstacle) => {
      obstacle.hit = false;
      obstacle.object.scale.setScalar(1);
    });
    confetti.forEach((piece) => (piece.visible = false));
    document.querySelector(".game-result").hidden = true;
    document.querySelector("#game-overlay").hidden = false;
    document.querySelector(".game-hud").hidden = true;
    document.querySelector(".touch-controls").hidden = true;
    document.querySelector("#world-toast").classList.remove("visible");
    state = "ready";
    player.position.set(0, 0.45, 0);
    updateCamera();
    scene.background.set(WORLDS[0].color);
    scene.fog.color.set(WORLDS[0].color);
  }
  function begin() {
    reset();
    state = "playing";
    document.querySelector("#game-overlay").hidden = true;
    document.querySelector(".game-hud").hidden = false;
    document.querySelector(".touch-controls").hidden = false;
    document.querySelector("#begin-game").blur();
    if (audio?.state === "suspended") audio.resume();
    beep(400, 0.2);
    lastTime = performance.now();
  }
  function finish() {
    state = "finished";
    beep(700, 0.4);
    document.querySelector(".game-hud").hidden = true;
    document.querySelector(".touch-controls").hidden = true;
    document.querySelector("#world-toast").classList.remove("visible");
    document.querySelector("#result-time").textContent =
      `${timeFormat.format(elapsed)} dtk`;
    document.querySelector("#result-sparks").textContent =
      `${score} / ${tokens.length}`;
    const title =
      score >= 32
        ? "Sang Pengumpul Semangat"
        : hitCount <= 2
          ? "Si Jago Meluncur"
          : "Penjelajah Penuh Semangat";
    const newBest = !best || elapsed < best.time;
    if (newBest) {
      best = { time: elapsed, score };
      try {
        localStorage.setItem("road43-best", JSON.stringify(best));
      } catch {
        /* Playing never requires storage. */
      }
    }
    document.querySelector("#result-title").textContent =
      `${title} ✳ ${newBest ? "Rekor pribadimu yang baru!" : `Rekor pribadi: ${timeFormat.format(best.time)} dtk.`} Sampai jumpa 20 Desember!`;
    document.querySelector(".game-result").hidden = false;
    confetti.forEach((piece) => (piece.visible = true));
  }
  function updateCamera() {
    const narrow = camera.aspect < 0.8;
    camera.position.set(
      x * 0.3,
      narrow ? 6.5 : 5.8,
      -progress + (narrow ? 10.5 : 9),
    );
    camera.lookAt(x * 0.15, 0, -progress - (narrow ? 10 : 9));
  }
  function step(dt) {
    elapsed += dt;
    slowdown = Math.max(0, slowdown - dt);
    progress = Math.min(
      LENGTH,
      progress + SPEED * dt * (slowdown > 0 ? 0.35 : 1),
    );
    const direction = Number(input.right) - Number(input.left);
    velocity += (direction * 7.5 - velocity) * Math.min(1, dt * 11);
    x = THREE.MathUtils.clamp(x + velocity * dt, -3.02, 3.02);
    if (input.jump && jumpY <= 0) {
      jumpVelocity = 6.4;
      beep(250, 0.08);
    }
    jumpVelocity -= 17 * dt;
    jumpY = Math.max(0, jumpY + jumpVelocity * dt);
    if (jumpY === 0) jumpVelocity = 0;
    player.position.set(x, 0.44 + jumpY, -progress);
    marble.rotation.x -= SPEED * dt * 2;
    marble.rotation.z -= velocity * dt * 2;
    shadow.position.set(x, 0.02, -progress);
    shadow.scale.setScalar(1 - jumpY * 0.16);
    marble.material.emissive.set(
      slowdown > 0 && Math.floor(elapsed * 15) % 2 ? 0xc44221 : 0x000000,
    );
    const nextWorld = Math.min(2, Math.floor(progress / 120));
    if (nextWorld !== worldIndex) {
      worldIndex = nextWorld;
      document.querySelector("#world-name").textContent =
        WORLDS[worldIndex].name;
      worldToast(WORLDS[worldIndex].title);
    }
    scene.background.lerp(
      new THREE.Color(WORLDS[worldIndex].color),
      Math.min(1, dt * 3),
    );
    scene.fog.color.copy(scene.background);
    for (const obstacle of obstacles) {
      const diff = obstacle.distance - progress;
      obstacle.object.visible = diff > -8 && diff < 65;
      if (
        !obstacle.hit &&
        Math.abs(diff) < 0.8 &&
        Math.abs(x - obstacle.lane * 2.25) < 1.03 &&
        jumpY < 0.83
      ) {
        obstacle.hit = true;
        hitCount++;
        slowdown = 0.8;
        obstacle.object.scale.y = 0.2;
        beep(100, 0.12);
        worldToast("Sedikit tersandung. Tetap melaju!");
      }
    }
    for (const token of tokens) {
      const diff = token.distance - progress;
      token.object.visible = !token.taken && diff > -5 && diff < 60;
      if (!token.object.visible) continue;
      token.object.rotation.y += dt * 2.5;
      token.object.position.y =
        token.baseY + Math.sin(elapsed * 3 + token.distance) * 0.1;
      if (
        Math.abs(diff) < 0.72 &&
        Math.abs(x - token.object.position.x) < 0.73 &&
        Math.abs(jumpY + 0.44 - token.object.position.y) < 0.8
      ) {
        token.taken = true;
        token.object.visible = false;
        score++;
        beep(600 + (score % 5) * 100);
      }
    }
    for (const group of decorations)
      group.visible =
        -group.position.z - progress > -10 && -group.position.z - progress < 65;
    for (const gate of gates)
      gate.visible =
        -gate.position.z - progress > 5 && -gate.position.z - progress < 65;
    document.querySelector("#game-time").textContent =
      `${timeFormat.format(elapsed)} dtk`;
    document.querySelector("#game-score").textContent = `✦ ${score}`;
    document.querySelector("#game-progress").style.width =
      `${(progress / LENGTH) * 100}%`;
    updateCamera();
    if (progress >= LENGTH) finish();
  }
  const keyMap = {
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
    " ": "jump",
    ArrowUp: "jump",
    w: "jump",
    W: "jump",
  };
  window.addEventListener("keydown", (event) => {
    if (dialog.open && state === "playing" && keyMap[event.key]) {
      event.preventDefault();
      input[keyMap[event.key]] = true;
    }
  });
  window.addEventListener("keyup", (event) => {
    if (keyMap[event.key]) input[keyMap[event.key]] = false;
  });
  window.addEventListener("blur", () => {
    input.left = input.right = input.jump = false;
  });
  document.querySelectorAll("[data-control]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      input[button.dataset.control] = true;
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
      button.addEventListener(
        name,
        () => (input[button.dataset.control] = false),
      );
  });
  document.querySelector("#begin-game").addEventListener("click", begin);
  document.querySelector("#replay-game").addEventListener("click", begin);
  document.querySelector("#sound-button").addEventListener("click", () => {
    sound = !sound;
    if (sound && !audio)
      audio = new (window.AudioContext || window.webkitAudioContext)();
    if (sound) {
      audio.resume();
      beep(500);
    }
    const button = document.querySelector("#sound-button");
    button.innerHTML = `<i data-lucide="${sound ? "volume-2" : "volume-x"}"></i>`;
    button.setAttribute(
      "aria-label",
      `${sound ? "Matikan" : "Aktifkan"} suara permainan`,
    );
    button.setAttribute("aria-pressed", String(sound));
    refreshIcons();
  });
  document.querySelector("#share-game").addEventListener("click", async () => {
    const text = `Aku sampai di 43 dalam ${timeFormat.format(elapsed)} detik dengan ${score} percikan semangat! Bisa kalahkan waktuku di Marble Rush? ✳ ROAD TO 43 — Remas Al Munawwar.`;
    const url = location.href.split("#")[0] + "#play";
    try {
      if (navigator.share)
        await navigator.share({ title: "Perjalananku menuju 43", text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast("Tantangan disalin. Ajak temanmu ikut meluncur!");
      }
    } catch (error) {
      if (error.name !== "AbortError")
        toast(
          "Fitur berbagi belum tersedia di sini. Unduh kartu pencapaianmu sebagai gantinya.",
        );
    }
  });
  document.querySelector("#download-card").addEventListener("click", () => {
    const card = document.createElement("canvas");
    card.width = 1080;
    card.height = 1350;
    const ctx = card.getContext("2d");
    ctx.fillStyle = "#3f6bf3";
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.strokeStyle = "#ffffff14";
    ctx.lineWidth = 1;
    for (let offset = 0; offset < 1350; offset += 60) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset, 1350);
      ctx.moveTo(0, offset);
      ctx.lineTo(1080, offset);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffbe35";
    ctx.font = '600 36px "Space Grotesk", sans-serif';
    ctx.fillText("✳ ROAD TO 43", 80, 115);
    ctx.fillStyle = "#fffde5";
    ctx.font = '850 100px "DM Sans", sans-serif';
    ctx.fillText("CERITA BAIK.", 80, 285);
    ctx.fillText("LANGKAH", 80, 400);
    ctx.fillText("HEBAT.", 80, 515);
    ctx.fillStyle = "#ffbe35";
    ctx.font = '700 310px "Space Grotesk", sans-serif';
    ctx.fillText("43", 70, 850);
    ctx.fillStyle = "#a7def3";
    ctx.fillRect(80, 915, 920, 215);
    ctx.fillStyle = "#14213d";
    ctx.font = '500 25px "Space Grotesk", sans-serif';
    ctx.fillText("HASIL MARBLE RUSH", 115, 970);
    ctx.font = '800 56px "DM Sans", sans-serif';
    ctx.fillText(
      `${timeFormat.format(elapsed)} dtk  /  ${score} PERCIKAN`,
      115,
      1060,
    );
    ctx.fillStyle = "#fffde5";
    ctx.font = '600 26px "DM Sans", sans-serif';
    ctx.fillText("BISA KALAHKAN WAKTUKU?", 80, 1210);
    ctx.font = '500 21px "Space Grotesk", sans-serif';
    ctx.fillText("REMAS AL MUNAWWAR · 20 DESEMBER 2026", 80, 1265);
    card.toBlob((blob) => {
      if (blob) download(blob, "my-road-to-43.png");
    }, "image/png");
  });
  dialog.addEventListener("close", () => {
    state = "closed";
    input.left = input.right = input.jump = false;
  });
  document.addEventListener("visibilitychange", () => {
    lastTime = performance.now();
    input.left = input.right = input.jump = false;
  });
  reset();
  resize();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - lastTime) / 1000, 0.5);
    lastTime = now;
    if (!dialog.open || document.hidden) return;
    // Small physics steps preserve collisions without slowing the run at lower frame rates.
    for (let remaining = dt; state === "playing" && remaining > 0;) {
      const stepTime = Math.min(remaining, 1 / 60);
      step(stepTime);
      remaining -= stepTime;
    }
    if (state === "finished")
      for (const piece of confetti) {
        piece.position.y -= dt * 1.5;
        if (piece.position.y < 0) piece.position.y = 8;
        piece.rotation.x += dt;
        piece.rotation.z += dt * 1.4;
      }
    portalRing.rotation.z += dt * 0.15;
    renderer.render(scene, camera);
  });
  return {
    open() {
      reset();
      resize();
      lastTime = performance.now();
    },
  };
}
