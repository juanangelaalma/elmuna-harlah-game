import { test, expect } from "@playwright/test";

// Exercise the built site too: Vite's production CSS order differs from dev.
test.use({ baseURL: process.env.PROPOSAL_PRINT_URL || "http://127.0.0.1:5173" });

for (const document of [
  { path: "/proposal.html", ready: "#print-proposal", pages: 23 },
  { path: "/proposal-preview.html", ready: "#print-proposal", pages: 3 },
  { path: "/perjanjian-sponsorship.html", ready: "#print-agreement", pages: 2 },
]) {
  test(`${document.path} prints one A4 page per sheet without blank pages`, async ({ page }) => {
    await page.goto(document.path);
    await expect(page.locator(document.ready)).toBeEnabled({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });

    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const clippedSheets = await page.locator(".proposal-sheet").evaluateAll(sheets => sheets
        .filter(sheet => {
          const body = sheet.querySelector(".editorial-body");
          const footer = sheet.querySelector(".editorial-footer");
          const bounds = sheet.getBoundingClientRect();
          const footerBounds = footer?.getBoundingClientRect();
          return footerBounds && (
            footerBounds.bottom > bounds.bottom ||
            (body?.lastElementChild &&
              body.lastElementChild.getBoundingClientRect().bottom > footerBounds.top)
          );
        })
        .map(sheet => sheet.dataset.page));
      expect(clippedSheets, `Content overlaps a footer at ${width}px`).toEqual([]);

      const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true, printBackground: true });
      const pageCount = [...pdf.toString("latin1").matchAll(/\/Type\s*\/Page\b/g)].length;
      // Extra blank sheets double this count even though the HTML sheet count is unchanged.
      expect(pageCount, `Unexpected blank or overflowing pages at ${width}px`).toBe(document.pages);
    }
  });
}
