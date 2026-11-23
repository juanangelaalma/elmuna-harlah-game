import "./style.css";
import {
  createIcons,
  ArrowUpRight,
  ArrowDown,
  MoveUpRight,
  Smile,
  Timer,
  Globe,
  Sparkles,
  CalendarPlus,
  VolumeX,
  Volume2,
} from "lucide";
import { initFestival } from "./festival.js";
import { initGame } from "./game.js";
import { initMotion } from "./motion.js";

export function refreshIcons() {
  createIcons({
    icons: {
      ArrowUpRight,
      ArrowDown,
      MoveUpRight,
      Smile,
      Timer,
      Globe,
      Sparkles,
      CalendarPlus,
      VolumeX,
      Volume2,
    },
  });
}
refreshIcons();
initFestival();

const dialogCard = document.querySelector(".event-card.talk");
const posterArt = dialogCard.querySelector(".talk-art");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function reflectPoster(event) {
  if (reducedMotion.matches) return;
  const rect = posterArt.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  posterArt.style.setProperty("--poster-x", `${x * 100}%`);
  posterArt.style.setProperty("--poster-y", `${y * 100}%`);
  posterArt.style.setProperty("--poster-rotate-x", `${(0.5 - y) * 12}deg`);
  posterArt.style.setProperty("--poster-rotate-y", `${(x - 0.5) * 12}deg`);
  posterArt.style.setProperty("--poster-shine", "1");
}
function resetPoster() {
  posterArt.removeAttribute("style");
}
dialogCard.addEventListener("pointermove", reflectPoster);
dialogCard.addEventListener("pointerdown", reflectPoster);
dialogCard.addEventListener("pointerleave", resetPoster);
dialogCard.addEventListener("pointercancel", resetPoster);
dialogCard.addEventListener("blur", resetPoster);
dialogCard.addEventListener("click", resetPoster);
dialogCard.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "mouse") resetPoster();
});
reducedMotion.addEventListener("change", resetPoster);

let toastTimer;
export function toast(message) {
  const el = document.querySelector("#toast");
  const parent = document.querySelector("dialog[open]") || document.body;
  if (el.parentElement !== parent) parent.append(el);
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}
export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const events = [
  {
    title: "Dialog Interaktif",
    eyebrow: "01 / MARI TERHUBUNG",
    poster: "/images/dialog-interaktif-poster.jpg",
    description:
      "“Ya Allah, ini arahnya ke mana, ya?” — Dialog Interaktif tentang quarter life crisis: mencari jati diri di tengah standar dunia, kembali pada petunjuk Al-Qur’an.",
    detail:
      "Narasumber Dr. M. Syarif Thoyib, M.Pd. dan Kak Juan, dipandu moderator Kak Rosa. Terbuka untuk umum, gratis snack & kopi untuk peserta.",
    note:
      "Sabtu, 21 November 2026 · 19.00 WIB · Area depan Masjid Agung Al Munawwar Tulungagung. Siaran langsung di YouTube El Muna TV.",
    world:
      "Di Marble Rush: jelajahi Taman Ide, kumpulkan percikan inspirasi, dan hindari balok percakapan.",
  },
  {
    title: "El Muna Fun Cup",
    poster: "/images/el-muna-fun-cup-poster.jpg",
    eyebrow: "02 / TUNJUKKAN SEMANGATMU",
    description:
      "Badminton ganda campuran untuk masyarakat umum usia 15–30 tahun. Setiap tim terdiri dari satu putra dan satu putri, dengan kuota 32 peserta atau 16 tim.",
    detail:
      "Biaya pendaftaran Rp30 ribu per tim. Hadiah uang pembinaan total jutaan rupiah, piala, dan sertifikat.",
    note:
      "Minggu, 13 Desember 2026 · 08.00 WIB. Informasi lokasi dan pendaftaran dapat dikonfirmasi melalui panitia.",
    world:
      "Di Marble Rush: masuki Lapangan Rali, lompati rintangan net, dan kumpulkan kok emas penuh semangat.",
  },
  {
    title: "Kompetisi Kreatif Video",
    poster: "/images/kompetisi-video-kreatif-poster.png",
    eyebrow: "03 / WUJUDKAN KREASIMU",
    description:
      "Nyala Generasi, Abadi Menginspirasi. Pendaftaran gratis pada 17–29 November 2026 dalam rangka Harlah ke-43 Remas El Muna.",
    detail:
      "Produksi video: 29 November–13 Desember 2026. Batas pengumpulan: 13 Desember 2026. Pengumuman pemenang: 17 Desember 2026.",
    note:
      "Awarding: 20 Desember 2026. Rangkaian kompetisi berlangsung 17 November–20 Desember 2026.",
    world:
      "Di Marble Rush: meluncur di Dunia Kreasi, lewati balok penyuntingan, dan kumpulkan percikan kreativitas.",
  },
  {
    title: "Puncak Harlah ke-43",
    eyebrow: "04 / PENGAJIAN UMUM",
    poster: "/images/puncak-harlah-poster.jpg",
    description:
      "Pengajian umum malam puncak Harlah ke-43 Remaja Masjid Agung Al Munawwar Tulungagung, gratis dan terbuka untuk umum.",
    detail:
      "Bersama Gus Salsaladin, Khodimul Majelis Ta’lim Futuhul Qolbi, Trenggalek, diiringi Hadrah El Muna Tulungagung.",
    note:
      "Ahad, 20 Desember 2026 · 19.00 WIB–selesai · Masjid Agung Al Munawwar Tulungagung. Siaran langsung di YouTube El Muna TV.",
  },
];
const posterCarousel = document.querySelector(".hero-posters");
const posterCards = [...posterCarousel.querySelectorAll(".swap-card")];
const posterPause = document.querySelector("#poster-pause");
let posterIndex = 0;
let posterBusy = false;
let posterPaused = false;
let posterVisible = false;
let posterTimer;
let posterDrag;

function schedulePoster() {
  clearTimeout(posterTimer);
  if (
    posterPaused || posterDrag || posterBusy || reducedMotion.matches || !posterVisible || document.hidden ||
    posterCarousel.matches(":hover, :focus-within") ||
    document.querySelector("dialog[open]")
  ) return;
  posterTimer = setTimeout(() => swapPoster(), 4500);
}

async function swapPoster(direction = -1) {
  if (posterBusy || posterDrag) return;
  posterBusy = true;
  clearTimeout(posterTimer);
  const front = posterCards[posterIndex];
  const before = posterCards.map((card) => getComputedStyle(card).transform);
  front.style.removeProperty("transform");
  if (!reducedMotion.matches) {
    const exit = front.animate([
      { transform: before[posterIndex], opacity: 1 },
      { transform: `translate(${direction * 100}%, 30%) rotate(${direction * 16}deg)`, opacity: 0 },
    ], { duration: 380, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    await exit.finished;
    exit.cancel();
  }
  posterIndex = (posterIndex + 1) % posterCards.length;
  const animations = posterCards.map((card, index) => {
    card.dataset.position = (index - posterIndex + posterCards.length) % posterCards.length;
    if (reducedMotion.matches) return Promise.resolve();
    const animation = card.animate([
      { transform: card === front ? "translate(20px, 35%) rotate(8deg) scale(.92)" : before[index], opacity: card === front ? 0 : 1 },
      { transform: getComputedStyle(card).transform, opacity: 1 },
    ], { duration: 620, easing: "cubic-bezier(.22,1,.36,1)" });
    return animation.finished;
  });
  document.querySelector("#poster-status").textContent =
    `${String(posterIndex + 1).padStart(2, "0")} / ${events[posterIndex].title}`;
  await Promise.all(animations);
  posterBusy = false;
  schedulePoster();
}

const posterStack = document.querySelector(".poster-stack");
posterStack.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || !event.isPrimary || posterBusy || posterDrag) return;
  posterDrag = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: 0,
    card: posterCards[posterIndex],
  };
  posterStack.setPointerCapture(event.pointerId);
  posterStack.classList.add("is-dragging");
  schedulePoster();
});
posterStack.addEventListener("pointermove", (event) => {
  if (event.pointerId !== posterDrag?.id) return;
  posterDrag.x = event.clientX - posterDrag.startX;
  posterDrag.card.style.transform =
    `translateX(${posterDrag.x}px) rotate(${-4 + posterDrag.x * 0.04}deg)`;
});
async function releasePoster(event) {
  if (event.pointerId !== posterDrag?.id) return;
  const drag = posterDrag;
  posterDrag = null;
  posterStack.classList.remove("is-dragging");
  if (posterStack.hasPointerCapture(event.pointerId)) {
    posterStack.releasePointerCapture(event.pointerId);
  }
  const tapped = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6;
  if (event.type === "pointerup" && (tapped || Math.abs(drag.x) > posterStack.clientWidth * 0.18)) {
    swapPoster(drag.x > 0 ? 1 : -1);
  } else {
    const from = getComputedStyle(drag.card).transform;
    drag.card.style.removeProperty("transform");
    if (!reducedMotion.matches) {
      posterBusy = true;
      await drag.card.animate([
        { transform: from },
        { transform: getComputedStyle(drag.card).transform },
      ], { duration: 250, easing: "ease-out" }).finished;
      posterBusy = false;
    }
    schedulePoster();
  }
}
for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) {
  posterStack.addEventListener(event, releasePoster);
}
document.querySelector("#poster-next").addEventListener("click", () => swapPoster());
posterPause.addEventListener("click", () => {
  posterPaused = !posterPaused;
  posterPause.setAttribute("aria-pressed", String(posterPaused));
  posterPause.setAttribute("aria-label", posterPaused ? "Lanjutkan pergantian poster" : "Jeda pergantian poster");
  posterPause.textContent = posterPaused ? "▷" : "Ⅱ";
  schedulePoster();
});
for (const event of ["pointerenter", "pointerleave", "focusin"]) {
  posterCarousel.addEventListener(event, schedulePoster);
}
posterCarousel.addEventListener("focusout", () => setTimeout(schedulePoster, 0));
document.addEventListener("visibilitychange", schedulePoster);
document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("close", schedulePoster));
reducedMotion.addEventListener("change", schedulePoster);
new IntersectionObserver(([entry]) => {
  posterVisible = entry.isIntersecting;
  schedulePoster();
}).observe(posterCarousel);

const eventDialog = document.querySelector("#event-dialog");
document.querySelectorAll("[data-event]").forEach((button) =>
  button.addEventListener("click", () => {
    const event = events[Number(button.dataset.event)];
    eventDialog.classList.toggle("has-poster", Boolean(event.poster));
    document.querySelector("#event-content").innerHTML =
      `<div class="event-dialog-layout"><img class="event-dialog-poster" src="${event.poster}" alt="Poster ${event.title}" /><div><div class="eyebrow">${event.eyebrow}</div><h2 id="event-title">${event.title}</h2><p>${event.description}</p><p>${event.detail}</p><div class="event-detail-note">${event.note}</div>${event.world ? `<p>${event.world}</p><button class="button blue" id="event-play">Jelajahi dunianya ↗</button>` : `<a class="button blue" href="/proposal.html#finale">Baca detail di proposal ↗</a>`}</div></div>`;
    eventDialog.showModal();
    document.querySelector("#event-content").scrollTop = 0;
    document.querySelector("#event-play")?.addEventListener("click", () => {
      eventDialog.close();
      openGame();
    });
  }),
);
document
  .querySelectorAll("dialog .close-button")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
});

let game;
function openGame() {
  const dialog = document.querySelector("#game-dialog");
  dialog.showModal();
  if (!game) {
    try {
      game = initGame({ toast, download, refreshIcons });
    } catch (error) {
      console.error(error);
      dialog.close();
      toast(
        "Gunakan peramban yang mendukung WebGL untuk bermain. Kamu tetap bisa menjelajahi semua acara!",
      );
      return;
    }
  }
  game.open();
}
document
  .querySelectorAll("[data-start]")
  .forEach((button) => button.addEventListener("click", openGame));

document.querySelector("#calendar-button").addEventListener("click", () => {
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Remas Al Munawwar//ROAD TO 43//ID",
    "BEGIN:VEVENT",
    "UID:road-to-43-2026@remas-al-munawwar",
    "DTSTAMP:20261106T000000Z",
    "DTSTART;VALUE=DATE:20261220",
    "DTEND;VALUE=DATE:20261221",
    "SUMMARY:ROAD TO 43 — Stronger Through Generations",
    "DESCRIPTION:Merawat Warisan\\, Menguatkan Perjuangan. Pengajian umum bersama Gus Salsaladin dan Hadrah El Muna. Mulai 19.00 WIB.",
    "LOCATION:Masjid Agung Al Munawwar Tulungagung",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  download(new Blob([content], { type: "text/calendar" }), "road-to-43.ics");
  toast("Sampai jumpa di hari istimewa! Berkas kalender berhasil diunduh.");
});
function updateCountdown() {
  const difference = Math.max(
    0,
    new Date("2026-12-20T19:00:00+07:00").getTime() - Date.now(),
  );
  const values = [
    Math.floor(difference / 86400000),
    Math.floor(difference / 3600000) % 24,
    Math.floor(difference / 60000) % 60,
    Math.floor(difference / 1000) % 60,
  ];
  document.querySelector("#countdown").innerHTML =
    values
      .map(
        (value, i) =>
          `<span><strong>${String(value).padStart(2, "0")}</strong> ${["HARI", "JAM", "MENIT", "DETIK"][i]}</span>`,
      )
      .join("") +
    `<span>${difference ? "MENGHITUNG HARI MENUJU CERITA BARU ↗" : "BABAK BARU TELAH DIMULAI ✳"}</span>`;
}
updateCountdown();
setInterval(updateCountdown, 1000);
initMotion();
