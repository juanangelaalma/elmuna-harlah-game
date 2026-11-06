# ROAD TO 43

A Three.js festival landing page and one-minute marble adventure for the 43rd anniversary of Remas Al Munawwar.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Vite listens on port 5173 and all network interfaces. `npm run build` creates a static production site in `dist/`; `npm run preview` serves that build.

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

The grand celebration is **December 20, 2026**. Other event dates, venue, speakers, tournament rules, submission requirements, and registration links are deliberately not fabricated. Add confirmed information to the event records in `src/main.js` before launch. No backend or registration service is connected.

The site is self-contained: fonts are bundled locally and all 3D objects are procedural. WebGL2 is required for the interactive scenes; event information remains accessible without it. Reduced-motion preferences disable ambient page animations.
