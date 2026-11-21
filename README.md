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
Like the proposal, printing uses a fixed physical A4 sheet with zero browser
page margins, explicit mm/px card measurements, and decoded images/fonts before
opening the print dialog. Responsive container-query sizing is screen-only;
both A6 faces retain their dimensions when printing from mobile or desktop.
The original 1600 × 1600 emblem PNG is embedded without a CSS-filter snapshot,
and text remains selectable. Choose **Save as PDF** in the browser print dialog.

## A4 heritage page

Open `/warisan.html` through the homepage footer or the timeline's “Makna Harlah
ke-43” link. It presents the anniversary message on a 210 × 297 mm portrait sheet.
“Cetak A4” opens the browser print dialog; print CSS removes the toolbar and page
shadow and requests A4 with zero page margins. On narrow screens the content
reflows for reading. The decorative Three.js sculpture renders only on resize
and before printing, with linked CSS rings when WebGL is unavailable. All text
and the fallback illustration are available without JavaScript.

## Sponsorship proposal

Open `/proposal.html` using “Proposal” on the heritage page. It contains
**23 A4 portrait sheets**: 14 editorial chapters, an approval sheet, and 8 appendices. Event details
and partnership terms reflect the latest supplied material; the original
`Proposal_Sponsorship_Harlah_43 (1).md` is historical source material, not the
current sponsorship contract. Chapter links jump to the remaining corresponding
appendices; event details are presented directly in chapters 5–8.
The cover uses the supplied transparent `/road-to-43-branding.png` directly on
the white sheet, without an added background.

Page 11 summarizes six support categories and distinguishes the Rp28,829,000 RAB,
Rp2,480,000 planned income from the mosque youth organization's cash fund,
and Rp26,349,000 funding gap. Pages 18–21 contain the
premium benefit matrix, Sahabat Harlah matrix and Donatur category, in-kind and
event-specific support, and partnership conditions. In-kind contributions use
the highest qualifying package threshold; equipment loans use rental/service
value, not purchase price. Sponsor Tunggal requires a separate exclusivity
agreement. The two benefit matrices remain separate and horizontally scrollable
on narrow screens, with all columns visible in A4 print.

Content follow-up:
- [x] Updated the Instagram handle embedded in the dialog and El Muna Fun Cup
  posters (pages 5–6) to `remas_elmuna.ta` using the supplied replacement posters.

Pages 12–13 present Harlah 41 (2024) and Harlah 42 (2025), with event summaries,
dates, venues, and themes transcribed from the supplied reference posters.
The posters themselves are not embedded. Locally generated QR PNGs and clickable
links point to the supplied Instagram reel/post without tracking parameters;
QRs include four-module quiet zones for print scanning.
The Harlah 42 archive covers both the 27 December 2025 Festival Banjari and
the 28 December 2025, 19:00 WIB closing pengajian with Ust. Dr. H. Soim Alkassi,
M.Pd.I., accompanied by Hadroh El Muna Tulungagung.

Page 15 is the approval sheet dated 13 November 2026, placed after contact details
and before the appendices. It has two signature rows: the event chair and secretary,
then the mosque board chair and youth organization chair under “Mengetahui”.
The signature areas are intentionally blank for handwritten signatures.

Editorial chapters use relevant Three.js illustrations. Twelve procedural
sculptures are rendered once each using a single temporary WebGL context; related
appendices reuse their high-resolution PNGs. Dense partnership pages prioritize
readable tables and copy. GPU resources are released after rendering. Images
remain available in print, with local fallback illustrations when WebGL is
unavailable. There is no animation loop.

Use the five image upload areas to add photos or posters. Images are included
in printing and remembered in IndexedDB on the same browser/origin. “Hapus”
restores the original image or empty area. Images are not uploaded to a server.
If local storage is unavailable, images remain usable for the current visit and
the status message explains this. Existing saved images retain their upload keys.

“Cetak 23 halaman A4” waits for the illustrations, images, and fonts before opening
the print dialog. Choose A4, 100% scale, no margins, and disable browser
headers/footers. Print styles hide editing controls. The optional group photo
on page 2 remains available for upload.

“Unduh Word (.docx)” creates a local download named
`Proposal-Sahabat-Harlah-43.docx`. The Word generator is loaded only when requested;
opening the proposal or printing does not load the DOCX library. Export waits for
saved-image restoration, pending uploads, image decoding, and fonts, then captures
the current proposal including uploaded images. Print and image-editing controls
are temporarily disabled during export and restored afterward, including on failure.
No proposal content or images are sent to a server.

The Word file preserves editable paragraphs and native tables rather than
screenshots of pages, with embedded artwork and images. It uses Arial and Georgia
italic for stable, widely available typography, fixed A4 sections, and bounded
images/table widths. The downloaded document was rendered in LibreOffice 25.2:
23 A4 pages, all benefit-table rows preserved, and both archive QR codes readable.
Line wrapping and spacing can still vary between Word applications or after edits;
use print/PDF when exact browser appearance is required.

### Sponsorship agreement

Open `/perjanjian-sponsorship.html` through “Surat perjanjian” in the proposal
toolbar. It is a separate two-page A4 agreement without an agreement-number field,
leaving the proposal at 23 pages. Page 1 covers identity and support category;
page 2 covers contributions, concise terms, validity, and signatures. Print it and fill it in by hand; fields and printed
checkboxes are intentionally not interactive browser controls.

The agreement uses the six current categories, cash/in-kind valuation rules,
official event names, and the supplied BRI account. Record the exact contribution,
handover deadline, selected proposal version/pages, any benefit adjustments, and
exclusive rights before signing. Attach the agreed benefit details, give each
party an identical copy, and initial the first sheet.

“Cetak 2 halaman A4” waits for local fonts before opening the browser print dialog.
Use the same A4, no-margin, 100%-scale settings as the proposal.

### Editorial preview

`/proposal-preview.html` contains three A4 design samples: cover, Dialog
Interaktif, and the current six-category sponsorship overview. It uses the same
rendering, image storage, and print implementation as the complete editorial
proposal, including the same saved dialogue poster. Its detail links point to
the complete proposal's premium, regular, in-kind, and terms appendices.

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
