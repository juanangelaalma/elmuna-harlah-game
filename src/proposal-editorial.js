import "./style.css";
import "./proposal.css";
import "./proposal-preview.css";
import "./proposal-editorial.css";
import { renderEditorialArt } from "./proposal-scenes.js";

async function initEditorialProposal() {
  let rendered = false;
  try {
    rendered = await renderEditorialArt();
  } catch {
    // All pages retain their decorative illustrations if WebGL is unavailable.
  }
  await import("./proposal.js");
  if (!rendered) {
    document.querySelector("#proposal-status").textContent +=
      " WebGL tidak tersedia; ilustrasi pengganti tetap dapat dicetak.";
  }
}

initEditorialProposal().catch(() => {
  document.querySelector("#proposal-status").textContent =
    "Proposal belum selesai dimuat. Muat ulang untuk mengunggah gambar dan mencetak, atau gunakan menu cetak browser.";
});
