import "./style.css";
import "./proposal.css";

const printButton = document.querySelector("#print-proposal");
const status = document.querySelector("#proposal-status");
const localNotice = "Gambar hanya disimpan di peramban perangkat ini, tidak dikirim ke server.";
const events = new AbortController();
const pending = new Set();
const objectURLs = new Set();
const slots = [];
let preparingPrint = false;
let disposed = false;
let database;
let databasePromise;

function announce(message) {
  if (!disposed && status) status.textContent = `${message} ${localNotice}`;
}

function updateControls() {
  if (printButton) printButton.disabled = preparingPrint || pending.size > 0;
  for (const slot of slots) {
    slot.input.disabled = preparingPrint;
    if (slot.remove) slot.remove.disabled = preparingPrint;
  }
}

function track(task) {
  // All asynchronous entry points settle here, including storage and decode errors.
  const settled = Promise.resolve(task).catch(() => {
    announce("Gambar tidak dapat diproses. Silakan pilih kembali berkas gambar.");
  }).finally(() => {
    pending.delete(settled);
    updateControls();
  });
  pending.add(settled);
  updateControls();
  return settled;
}

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Penyimpanan lokal tidak tersedia."));
      return;
    }
    const request = indexedDB.open("elmuna-sponsorship-proposal", 1);
    let failed = false;
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("images")) {
        request.result.createObjectStore("images");
      }
    };
    request.onblocked = () => {
      failed = true;
      reject(new Error("Tutup tab proposal lain untuk membuka penyimpanan."));
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (failed || disposed) {
        request.result.close();
        reject(new Error("Penyimpanan lokal tidak tersedia."));
        return;
      }
      database = request.result;
      database.onversionchange = () => {
        database.close();
        database = undefined;
        databasePromise = undefined;
        announce("Penyimpanan berubah di tab lain. Muat ulang sebelum mengganti gambar.");
      };
      resolve(database);
    };
  });
  return databasePromise;
}

async function storedImage(key, action, file) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", action === "get" ? "readonly" : "readwrite");
    const store = transaction.objectStore("images");
    const request = action === "get" ? store.get(key)
      : action === "put" ? store.put(file, key) : store.delete(key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error || request.error || new Error("Penyimpanan dibatalkan."));
    transaction.onerror = () => reject(transaction.error || request.error);
  });
}

function releaseURL(url) {
  if (!url) return;
  URL.revokeObjectURL(url);
  objectURLs.delete(url);
}

async function readyImage(image) {
  if (typeof image.decode === "function") {
    await image.decode();
  } else if (!image.complete) {
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", () => reject(new Error("Gambar tidak terbaca.")), { once: true });
    });
  }
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("Gambar tidak terbaca.");
}

async function decodeFile(file) {
  if (!(file instanceof Blob) || !file.type.startsWith("image/")) {
    throw new Error("Pilih berkas gambar, misalnya PNG, JPEG, atau WebP.");
  }
  const url = URL.createObjectURL(file);
  objectURLs.add(url);
  try {
    const preview = new Image();
    preview.src = url;
    await readyImage(preview);
    return url;
  } catch {
    releaseURL(url);
    throw new Error("Gambar rusak atau formatnya tidak didukung peramban. Gambar sebelumnya tetap digunakan.");
  }
}

function showUpload(slot, url) {
  const oldURL = slot.url;
  slot.url = url;
  slot.image.removeAttribute("srcset");
  slot.image.src = url;
  slot.image.hidden = false;
  if (slot.empty) slot.empty.hidden = true;
  if (slot.remove) slot.remove.hidden = false;
  slot.element.classList.add("has-image");
  releaseURL(oldURL);
}

function restoreDefault(slot) {
  const oldURL = slot.url;
  slot.url = undefined;
  if (slot.originalSrc) slot.image.setAttribute("src", slot.originalSrc);
  else slot.image.removeAttribute("src");
  if (slot.originalSrcset) slot.image.setAttribute("srcset", slot.originalSrcset);
  else slot.image.removeAttribute("srcset");
  slot.image.hidden = !slot.hasOriginal;
  if (slot.empty) slot.empty.hidden = slot.hasOriginal;
  if (slot.remove) slot.remove.hidden = true;
  slot.element.classList.toggle("has-image", slot.hasOriginal);
  releaseURL(oldURL);
}

function persist(slot, action, file, revision) {
  // Serialize writes per slot so rapid replace/remove operations cannot revive an older image.
  slot.writes = slot.writes.then(async () => {
    try {
      await storedImage(slot.key, action, file);
      if (slot.revision === revision) {
        announce(action === "delete" ? "Gambar unggahan dihapus; tampilan awal dipulihkan." : "Gambar siap dicetak dan tersimpan secara lokal.");
      }
    } catch {
      if (slot.revision === revision) {
        announce(action === "delete"
          ? "Gambar dihapus dari halaman, tetapi penghapusan simpanan gagal. Gambar lama mungkin muncul setelah muat ulang; periksa izin penyimpanan peramban."
          : "Gambar tetap tampil dan dapat dicetak, tetapi belum tersimpan. Penyimpanan mungkin penuh atau diblokir; pilih kembali gambar setelah mengosongkan ruang atau mengizinkan penyimpanan.");
      }
    }
  });
  return slot.writes;
}

for (const element of document.querySelectorAll("[data-upload]")) {
  const image = element.querySelector("img");
  const input = element.querySelector('input[type="file"]');
  if (!image || !input) continue;
  const slot = {
    element, image, input,
    key: element.dataset.upload,
    empty: element.querySelector(".image-empty"),
    remove: element.querySelector("[data-remove]"),
    originalSrc: image.getAttribute("src"),
    originalSrcset: image.getAttribute("srcset"),
    hasOriginal: Boolean(image.getAttribute("src") || image.getAttribute("srcset")),
    revision: 0,
    writes: Promise.resolve(),
  };
  slots.push(slot);
  restoreDefault(slot);
  if (element.dataset.fit) image.style.objectFit = element.dataset.fit;
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const revision = ++slot.revision;
    announce("Menyiapkan gambar sebelum dicetak…");
    track((async () => {
      let url;
      try {
        url = await decodeFile(file);
      } catch (error) {
        if (slot.revision === revision) announce(error.message);
        return;
      }
      if (disposed || slot.revision !== revision) {
        releaseURL(url);
        return;
      }
      showUpload(slot, url);
      await persist(slot, "put", file, revision);
    })());
  }, { signal: events.signal });
  slot.remove?.addEventListener("click", () => {
    const revision = ++slot.revision;
    restoreDefault(slot);
    track(persist(slot, "delete", undefined, revision));
  }, { signal: events.signal });
  track((async () => {
    try {
      const file = await storedImage(slot.key, "get");
      if (!file || slot.revision !== 0 || disposed) return;
      const url = await decodeFile(file);
      if (slot.revision !== 0 || disposed) releaseURL(url);
      else showUpload(slot, url);
    } catch {
      if (slot.revision === 0) announce("Gambar tersimpan tidak dapat dipulihkan. Anda tetap dapat mengunggah gambar dan mencetak halaman ini.");
    }
  })());
}

announce("Unggah gambar pada tempat yang disediakan, lalu cetak atau simpan sebagai PDF.");

async function printProposal() {
  if (preparingPrint || disposed) return;
  preparingPrint = true;
  updateControls();
  announce("Menyiapkan font dan gambar untuk pencetakan…");
  try {
    while (pending.size) await Promise.all([...pending]);
    if (document.fonts) await document.fonts.ready;
    await Promise.all([...document.querySelectorAll(".proposal-sheet img")]
      .filter(image => !image.hidden && (image.currentSrc || image.getAttribute("src") || image.getAttribute("srcset")))
      .map(readyImage));
    if (disposed) return;
    window.print();
    announce("Siap dicetak. Pilih simpan sebagai PDF untuk menyertakan gambar Anda.");
  } catch {
    announce("Pencetakan belum dibuka karena ada gambar atau font yang gagal dimuat. Ganti atau hapus gambar bermasalah, lalu coba lagi.");
  } finally {
    preparingPrint = false;
    updateControls();
  }
}

printButton?.addEventListener("click", () => { void printProposal(); }, { signal: events.signal });
window.addEventListener("pagehide", (event) => {
  // A BFCache snapshot keeps its listeners and image URLs for pageshow.
  if (event.persisted) return;
  disposed = true;
  events.abort();
  database?.close();
  for (const url of objectURLs) URL.revokeObjectURL(url);
  objectURLs.clear();
}, { signal: events.signal });

