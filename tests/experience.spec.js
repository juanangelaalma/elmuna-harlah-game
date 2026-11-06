import { test, expect } from "@playwright/test";

test("mobile reveals cards individually and respects motion preference changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const cards = page.locator(".event-card");
  await expect(cards.nth(0)).toHaveCSS("opacity", "0");
  await cards.nth(0).scrollIntoViewIfNeeded();
  await expect(cards.nth(0)).toHaveCSS("opacity", "1");
  await expect(cards.nth(2)).toHaveCSS("opacity", "0");
  await cards.nth(0).click();
  await expect(page.locator("#event-dialog h2")).toHaveText("Dialog Interaktif");
  await page.keyboard.press("Escape");

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const card of await cards.all()) await expect(card).toHaveCSS("opacity", "1");
  const date = page.locator(".date-banner strong");
  await expect(date).toHaveCSS("opacity", "1");
  await expect(date).toHaveCSS("clip-path", "none");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await date.scrollIntoViewIfNeeded();
  await expect(date).toHaveCSS("opacity", "1");
  await expect(date).toHaveCSS("clip-path", "none");
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await date.scrollIntoViewIfNeeded();
  await expect(date).toHaveCSS("opacity", "1");
});

test("hero posters cycle through both upcoming events and honor reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#play #hero-canvas")).toBeVisible();
  await expect(page.locator(".hero canvas")).toHaveCount(0);
  const poster = page.getByRole("img", { name: "Poster unggulan Dialog Interaktif" });
  await expect.poll(() => poster.evaluate((image) => image.naturalWidth)).toBe(1200);
  const front = page.locator('.swap-card[data-position="0"]');
  await expect(front.getByRole("img")).toBeVisible();
  const next = page.getByRole("button", { name: "Poster berikutnya" });
  await next.click();
  await expect(front).toContainText("Turnamen");
  await expect(front).toContainText("POSTER SEGERA HADIR");
  await next.click();
  await expect(front).toContainText("Video Kreatif");
  await next.click();
  await expect(front.getByRole("img")).toBeVisible();
  await page.mouse.move(0, 0);
  await next.blur();
  await page.waitForTimeout(5000);
  await expect(front.getByRole("img")).toBeVisible();
});

test("posters follow a drag, snap back on short drags, and swap on swipe or tap", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jeda pergantian poster" }).click();
  const stack = page.locator(".poster-stack");
  const box = await stack.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const status = page.locator("#poster-status");
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 25, y, { steps: 5 });
  await page.mouse.up();
  await expect(status).toContainText("Dialog Interaktif");
  await page.waitForTimeout(300);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 110, y, { steps: 8 });
  const moved = await page.locator('.swap-card[data-position="0"]').boundingBox();
  expect(moved.x).toBeLessThan(box.x - 70);
  await page.mouse.up();
  await expect(status).toContainText("Turnamen Bulu Tangkis");
  await page.waitForTimeout(700);
  await page.mouse.click(x, y);
  await expect(status).toContainText("Lomba Video Kreatif");
  await page.waitForTimeout(700);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 110, y, { steps: 8 });
  await page.mouse.up();
  await expect(status).toContainText("Dialog Interaktif");
});

test("events are accessible without playing and the celebration can be saved", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ROAD TO 43 — Stronger Through Generations/);
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(page.locator(".hero .eyebrow")).toContainText(
    "STRONGER THROUGH GENERATIONS",
  );
  await expect(page.locator(".hero h1")).toHaveText(
    /Warisan\s+lintas\s+generasi\./,
  );
  await expect(page.locator(".hero-copy > p")).toContainText(
    "Merawat Warisan, Menguatkan Generasi.",
  );
  await expect(page.locator("#countdown")).toContainText("DETIK");
  const poster = page.getByRole("img", { name: /Poster Dialog Interaktif/ });
  await poster.scrollIntoViewIfNeeded();
  await expect(poster).toBeVisible();
  await expect
    .poll(() => poster.evaluate((image) => image.naturalWidth))
    .toBeGreaterThan(0);
  const names = [
    "Dialog Interaktif",
    "Turnamen Bulu Tangkis",
    "Lomba Video Kreatif",
  ];
  for (let i = 0; i < names.length; i++) {
    await page.locator(`[data-event="${i}"]`).click();
    await expect(page.locator("#event-dialog h2")).toHaveText(names[i]);
    await expect(page.locator("#event-content")).toContainText(
      "20 Desember 2026",
    );
    await page.keyboard.press("Escape");
  }
  await expect(page.locator("#game-dialog")).not.toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#calendar-button").click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("road-to-43.ics");
  const stream = await download.createReadStream();
  let calendar = "";
  for await (const chunk of stream) calendar += chunk;
  expect(calendar).toContain("DTSTART;VALUE=DATE:20261220");
  expect(calendar).toContain("DTEND;VALUE=DATE:20261221");
  expect(calendar).toContain(
    "SUMMARY:ROAD TO 43 — Stronger Through Generations",
  );
  expect(calendar).toContain(
    "DESCRIPTION:Merawat Warisan, Menguatkan Generasi.",
  );
  for (const width of [320, 390, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator(".card-bottom h3")
        .evaluateAll((headings) =>
          headings.every(
            (heading) => heading.scrollWidth <= heading.clientWidth,
          ),
        ),
    ).toBe(true);
  }
});

test("event modal shows its poster without carrying it over to other events", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('[data-event="0"]').click();
  const modal = page.locator("#event-dialog");
  const poster = modal.getByRole("img", { name: /Poster Dialog Interaktif/ });
  await expect(poster).toBeVisible();
  await expect
    .poll(() => poster.evaluate((image) => image.naturalWidth))
    .toBeGreaterThan(0);
  await page.locator("#event-play").scrollIntoViewIfNeeded();
  await expect(modal.getByRole("heading")).toHaveText("Dialog Interaktif");
  const close = modal.getByRole("button", { name: "Tutup detail acara" });
  await expect(close).toBeInViewport();
  await close.click();
  await expect(modal).not.toBeVisible();
  await page.locator('[data-event="1"]').click();
  await expect(modal.getByRole("heading")).toHaveText("Turnamen Bulu Tangkis");
  await expect(modal.getByRole("img")).toHaveCount(0);
});

test("Marble Rush visits all three events, rewards the player, and resets for replay", async ({
  page,
  context,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.locator("[data-start]").first().click();
  await expect(page.locator("#game-overlay")).toBeVisible();
  await page.locator("#sound-button").click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#sound-button").click();
  await page.locator("#begin-game").click();
  await expect(page.locator("#world-name")).toHaveText(
    "01 / DIALOG INTERAKTIF",
  );
  await expect
    .poll(async () =>
      parseFloat(
        (await page.locator("#game-time").innerText()).replace(",", "."),
      ),
    )
    .toBeGreaterThan(3);
  await page
    .locator("#game-dialog")
    .screenshot({ path: testInfo.outputPath("talkshow-world.png") });
  await expect(page.locator("#world-name")).toHaveText(
    "02 / TURNAMEN BULU TANGKIS",
    { timeout: 40_000 },
  );
  await page
    .locator("#game-dialog")
    .screenshot({ path: testInfo.outputPath("badminton-world.png") });
  await expect(page.locator("#world-name")).toHaveText(
    "03 / LOMBA VIDEO KREATIF",
    { timeout: 40_000 },
  );
  await page
    .locator("#game-dialog")
    .screenshot({ path: testInfo.outputPath("creative-world.png") });
  await expect(page.locator(".game-result")).toBeVisible({ timeout: 40_000 });
  await page
    .locator("#game-dialog")
    .screenshot({ path: testInfo.outputPath("results.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("mobile-results.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator("#result-time")).toHaveText(/^\d+,\d dtk$/);
  const time = parseFloat(
    (await page.locator("#result-time").innerText()).replace(",", "."),
  );
  expect(time).toBeGreaterThanOrEqual(45);
  expect(time).toBeLessThanOrEqual(65);
  await expect(page.locator("#result-sparks")).toHaveText("18 / 48");
  const personalBest = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("road43-best")),
  );
  expect(personalBest.time).toBeCloseTo(time, 0);
  expect(personalBest.score).toBe(18);
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#download-card").click();
  const cardDownload = await downloadEvent;
  expect(cardDownload.suggestedFilename()).toBe("my-road-to-43.png");
  await cardDownload.saveAs(testInfo.outputPath("achievement-card.png"));
  await page.locator("#share-game").click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("18 percikan semangat");
  await page.locator("#replay-game").click();
  await expect(page.locator(".game-result")).not.toBeVisible();
  await expect(page.locator("#world-name")).toHaveText(
    "01 / DIALOG INTERAKTIF",
  );
  await expect(page.locator("#game-score")).toHaveText("✦ 0");
  await page.keyboard.press("Escape");
  await page.locator("[data-start]").first().click();
  await expect(page.locator("#game-overlay")).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard and touch controls keep the marble journey playable at mobile sizes", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: testInfo.outputPath("mobile-landing.png"),
    fullPage: true,
  });
  await page.locator("[data-start]").first().click();
  await page.locator("#begin-game").click();
  await page.locator('[data-control="right"]').hover();
  await page.mouse.down();
  await expect
    .poll(
      async () =>
        parseFloat(
          (await page.locator("#game-time").innerText()).replace(",", "."),
        ),
      { timeout: 10_000 },
    )
    .toBeGreaterThan(4.1);
  await page.mouse.up();
  // An unsteered marble would have collected the two center-lane sparks by now.
  await expect(page.locator("#game-score")).toHaveText("✦ 0");
  await page.keyboard.down("Space");
  await page.waitForTimeout(200);
  await page.keyboard.up("Space");
  await page.locator('[data-control="jump"]').hover();
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.screenshot({ path: testInfo.outputPath("mobile-game.png") });
  await page.mouse.up();
  await expect(page.locator(".game-hud")).toBeVisible();
  await expect(page.locator("#game-dialog")).toBeInViewport();
  await page.locator("#game-dialog .close-button").click();
  await expect(page.locator("#game-dialog")).not.toBeVisible();
});
