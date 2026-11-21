import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: new URL("./index.html", import.meta.url).pathname,
        timeline: new URL("./timeline.html", import.meta.url).pathname,
        warisan: new URL("./warisan.html", import.meta.url).pathname,
        proposal: new URL("./proposal.html", import.meta.url).pathname,
        sponsorshipAgreement: new URL("./perjanjian-sponsorship.html", import.meta.url).pathname,
        proposalPreview: new URL("./proposal-preview.html", import.meta.url).pathname,
        qcard: new URL("./qcard.html", import.meta.url).pathname,
        funCup: new URL("./fun-cup.html", import.meta.url).pathname,
      },
      output: {
        manualChunks(id) {
          if (id.endsWith("/three/build/three.core.js")) return "three-core";
        },
      },
    },
  },
});
