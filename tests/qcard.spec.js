import { test, expect } from "@playwright/test";

test("cue card PDF preserves a print-quality anniversary image", async ({ page }) => {
  await page.goto("/qcard.html");
  await expect(page.locator("#print-cards")).toBeEnabled();
  await expect(page.locator("#card-emblem")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });

  const printedWidth = await page.locator("#card-emblem").evaluate(
    (image) => image.getBoundingClientRect().width,
  );
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  const images = [...pdf.toString("latin1").matchAll(/\/Subtype\s*\/Image\b([\s\S]*?)stream/g)]
    .map(([, dictionary]) => ({
      width: Number(dictionary.match(/\/Width\s+(\d+)/)?.[1]),
      height: Number(dictionary.match(/\/Height\s+(\d+)/)?.[1]),
    }));

  // The square artwork must retain at least 450 ppi at its physical print size.
  // A CSS-filtered export reduces it to 300 ppi; the wide masthead must not
  // accidentally satisfy the artwork check.
  const minimumPixels = Math.ceil(printedWidth / 96 * 450);
  expect(images.some(({ width, height }) =>
    width >= minimumPixels && height >= minimumPixels &&
    Math.abs(width / height - 1) < 0.2,
  )).toBe(true);
});

test("cue cards keep their physical print layout on mobile and desktop", async ({ page }) => {
  await page.goto("/qcard.html");
  await expect(page.locator("#print-cards")).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });

  const layouts = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    layouts.push(await page.locator(".mc-print-sheet").evaluate(sheet => ({
      width: sheet.getBoundingClientRect().width,
      cards: [...sheet.querySelectorAll(".mc-card")].map(card => ({
        width: card.getBoundingClientRect().width,
        height: card.getBoundingClientRect().height,
        text: [...card.querySelectorAll("h2, p, span")].map(node => ({
          size: getComputedStyle(node).fontSize,
          spacing: getComputedStyle(node).letterSpacing,
        })),
      })),
    })));
  }
  expect(layouts[0]).toEqual(layouts[1]);
  expect(layouts[0].width).toBeCloseTo(210 / 25.4 * 96, 1);
  for (const card of layouts[0].cards) {
    expect(card.width).toBeCloseTo(148 / 25.4 * 96, 1);
    expect(card.height).toBeCloseTo(105 / 25.4 * 96, 1);
  }
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  expect([...pdf.toString("latin1").matchAll(/\/Type\s*\/Page\b/g)]).toHaveLength(1);
});
