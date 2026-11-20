# ROAD TO 43

A Three.js festival landing page and one-minute marble adventure for the 43rd anniversary of Remas Al Munawwar.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Vite listens on port 5173 and all network interfaces. `npm run build` creates a static production site in `dist/`; `npm run preview` serves that build.

## Festival island

The hero is a procedural Three.js festival diorama. Drag horizontally or use the
left, reset, and right buttons to change the view. Select the dialogue stage,
badminton court, or video studio (or their keyboard-accessible labels) to open
the existing event details. The gold 43 portal opens Marble Rush. Vertical touch
scrolling remains available; there is no automatic island motion. Without WebGL,
the same event and game buttons remain accessible with an explanatory message.
The poster carousel is now in the play section.

## Timeline

Open `/timeline.html` from the main navigation for the four-event schedule from
November 21 to December 20, 2026. The page uses the existing design tokens and a
procedural Three.js route. Four numbered buttons highlight the matching landmark;
the scene renders only on selection or resize, with no autoplay. All event dates
and descriptions remain available without JavaScript or WebGL. The production
build includes both the landing page and timeline.

## El Muna Fun Cup poster

Open `/fun-cup.html` for the “Blue Smash” one-page A4 portrait badminton
poster: a full-blue background, rising diagonal headline, layered court lines,
outline anniversary watermark, motion trails, and translucent shadows.
Two procedural Three.js rackets in sky/gold and a foreground shuttle provide
depth and contrast. The artwork is rendered once as a 2160 × 1080 transparent
image, then GPU resources are released. Gentle CSS motion can be paused and
respects reduced motion; printing always uses the static image. An inline
illustration remains available without WebGL or JavaScript. On narrow screens,
event details reflow while retaining the diagonal visual direction.

Enter an HTTP(S) registration URL and choose “Terapkan link” to update the
poster's clickable registration link and printable address. The URL is saved
only in this browser/origin; it does not update a shared registration service.
Apply an empty field to remove it. Without a URL, the poster says registration
will be announced rather than linking to a placeholder.

“Download PDF” waits for the artwork and fonts, then opens the browser print
dialog, like the proposal. Select Save as PDF, A4 portrait, 100% scale, no
margins, background graphics enabled, and browser headers/footers disabled.
The toolbar is omitted from the single-page output. Without JavaScript, use
the browser's Print command.

## MC cue cards

Open `/qcard.html` from the homepage navigation for a physical MC cue card design.
The blue anniversary front and ruled note back each measure 148 × 105 mm (A6
landscape). The front pairs editorial typography with an extruded gold “43”,
a sky orbit, and a white star built in Three.js. One temporary WebGL renderer
creates a 1600 × 1600 transparent PNG and releases GPU resources; there is no
animation loop. A CSS emblem stays visible without JavaScript or WebGL.
“Cetak kartu” waits for the emblem, image decode, and fonts before opening the
browser print dialog. Both faces fit on one A4 portrait sheet with cutting
outlines. Use 100% scale, enable background graphics, and disable browser
headers/footers. Cut the two faces and glue them back-to-back; this layout is not
automatic duplex printing. The back stays blank for handwritten rundown notes,
with six ruled lines. Browser printing also works without JavaScript.

## A4 heritage page

Open `/warisan.html` through the homepage footer or the timeline's “Makna Harlah
ke-43” link. It presents the anniversary message on a 210 × 297 mm portrait sheet.
“Cetak A4” opens the browser print dialog; print CSS removes the toolbar and page
shadow and requests A4 with zero page margins. On narrow screens the content
reflows for reading. The decorative Three.js sculpture renders only on resize
and before printing, with linked CSS rings when WebGL is unavailable. All text
and the fallback illustration are available without JavaScript.

## Sponsorship proposal

Open `/proposal.html` using “Proposal” on the heritage page. It now contains
**23 A4 portrait sheets**: 14 concise editorial chapters and nine appendices
preserving the full text, event facts, budget, sponsorship matrix, and conditions
from `Proposal_Sponsorship_Harlah_43 (1).md`. Links in the main chapters jump to
the corresponding full appendix.

Every sheet has a relevant Three.js illustration. Twelve procedural sculptures
are rendered once each using a single temporary WebGL context; appendix pages
reuse the high-resolution PNGs. GPU resources are released after rendering.
All images remain available in print, with local decorative fallback
illustrations when WebGL is unavailable. There is no animation loop.

Use the seven image upload areas to add photos or posters. Images are included
in printing and remembered in IndexedDB on the same browser/origin. “Hapus”
restores the original image or empty area. Images are not uploaded to a server.
If local storage is unavailable, images remain usable for the current visit and
the status message explains this. Existing saved images retain their upload keys.

“Cetak 23 halaman A4” waits for the illustrations, images, and fonts before opening
the print dialog. Choose A4, 100% scale, no margins, and disable browser
headers/footers. Print styles hide editing controls. Missing event, archive, and
contact information remains explicitly marked as in the source proposal.

### Editorial preview

`/proposal-preview.html` contains three A4 design samples: cover, Dialog
Interaktif, and a six-package sponsorship overview. It uses the same rendering,
image storage, and print implementation as the complete editorial proposal,
including the same saved dialogue poster. Its detail links point to the complete
proposal's appendices.

Each sample has a distinct Three.js sculpture. One temporary WebGL renderer
creates three high-resolution PNGs, then releases GPU resources; these images
remain visible in print without depending on live WebGL contexts. Local fallback
illustrations are shown when WebGL is unavailable. Use “Cetak 3 halaman A4” to
print the samples, not the complete proposal.

## Marble Rush

- Steer with **← / →** or **A / D**; jump with **Space / ↑ / W**.
- Mobile players use the on-screen arrow and jump buttons.
- Collect 48 possible sparks across the Dialog Interaktif, Badminton, and Creative Video worlds.
- Bumps slow the marble instead of ending the journey. An ordinary run takes about 50–60 seconds.
- Finish at the 43 portal to receive an achievement, save a PNG card, or share a friend challenge. The fastest time is stored only on the current device.
- Sound is opt-in. Switching tabs pauses the journey; closing the game starts a fresh run next time.

## Verify

```sh
npx playwright install --with-deps chromium
npm test
npm run build
```

Tests cover event discovery without gameplay, calendar dates, a complete three-world run, spark collection, achievement downloads, sharing, replay, and keyboard/pointer controls at mobile sizes. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation.

## Event information

The confirmed schedule is **November 21, 2026** (Dialog interaktif), **November 21–December 13, 2026** (Lomba Creative Video; concept and rules still being planned), **December 13, 2026** (Lomba Badminton at GOR Botoran, Tulungagung), and **December 20, 2026** (Puncak Harlah ke-43, with a public religious gathering at Masjid Agung Al Munawwar Tulungagung). The full schedule lives in `timeline.html`. No backend or registration service is connected.

The site is self-contained: fonts are bundled locally and all 3D objects are procedural. WebGL2 is required for the interactive scenes; event information remains accessible without it. Reduced-motion preferences disable ambient page animations.
