import { expect, test } from '@playwright/test';
import { getJourneyState } from '../src/journey-state.js';

test.use({ timezoneId: 'America/Los_Angeles', reducedMotion: 'reduce' });

const ui = (page) => {
  const section = page.locator('#timeline');
  const find = (name) => section.locator(`[data-journey-${name}]`);
  return {
    section, find, slider: section.getByRole('slider', { name: 'Jelajahi tanggal' }),
    reset: section.getByRole('button', { name: 'Kembali ke hari ini' }),
    badge: (id) => section.locator(`[data-journey-select="${id}"] .journey-badge`),
    detail: () => section.locator('.journey-details article:visible').getByRole('heading'),
  };
};

const cases = [
  ['2026-11-16', 'Rangkaian belum dimulai', 0, ['Belum dibuka', 'Mendatang', 'Mendatang', 'Mendatang'], '', '17 November 2026: Pendaftaran video dibuka'],
  ['2026-11-21', 'Pendaftaran video dibuka', 4, ['Pendaftaran video dibuka', 'Hari acara', 'Mendatang', 'Mendatang'], 'Dialog Interaktif', '29 November 2026: Produksi video dimulai'],
  ['2026-11-23', 'Pendaftaran video dibuka', 6, ['Pendaftaran video dibuka', 'Jadwal telah lewat', 'Mendatang', 'Mendatang'], '', '29 November 2026: Produksi video dimulai'],
  ['2026-11-29', 'Hari terakhir pendaftaran · produksi video dimulai', 12, ['Hari terakhir pendaftaran · produksi video dimulai', 'Jadwal telah lewat', 'Mendatang', 'Mendatang'], 'Produksi video dimulai', '13 Desember 2026: Batas pengumpulan video · El Muna Fun Cup'],
  ['2026-12-13', 'Batas pengumpulan video', 26, ['Batas pengumpulan video', 'Jadwal telah lewat', 'Hari acara', 'Mendatang'], 'Batas pengumpulan video · El Muna Fun Cup', '17 Desember 2026: Pengumuman pemenang video'],
  ['2026-12-17', 'Pengumuman pemenang video', 30, ['Pengumuman pemenang video', 'Jadwal telah lewat', 'Jadwal telah lewat', 'Mendatang'], 'Pengumuman pemenang video', '20 Desember 2026: Awarding video · Puncak Harlah ke-43'],
  ['2026-12-20', 'Awarding video · Puncak Harlah ke-43', 33, ['Awarding video · Puncak Harlah ke-43', 'Jadwal telah lewat', 'Jadwal telah lewat', 'Hari acara'], 'Awarding video · Puncak Harlah ke-43', ''],
  ['2026-12-21', 'Seluruh jadwal rangkaian telah lewat', 33, Array(4).fill('Jadwal telah lewat'), '', ''],
];

for (const [key, phase, offset, badges, today, next] of cases) {
  test(`shows the official schedule on ${key} WIB`, async ({ page }) => {
    // Each instant is still the previous date in the browser's Pacific time zone.
    await page.clock.setFixedTime(new Date(`${key}T00:00:00+07:00`));
    await page.goto('/');
    const { find, slider, badge, reset } = ui(page);
    await expect(find('mode')).toHaveText('Hari ini');
    await expect(find('date')).toHaveAttribute('datetime', key);
    await expect(find('phase')).toHaveText(phase);
    await expect(slider).toHaveValue(String(offset));
    await expect(reset).toBeDisabled();
    for (const [i, id] of ['video', 'dialog', 'cup', 'finale'].entries()) {
      await expect(badge(id)).toHaveText(badges[i]);
    }
    if (today) await expect(find('today')).toHaveText(`Hari ini: ${today}`);
    else await expect(find('today')).toBeHidden();
    if (next) await expect(find('next')).toHaveText(`Berikutnya · ${next}`);
    else await expect(find('next')).toBeHidden();
  });
}

test('calendar progress and illustrative map progress use different scales', () => {
  for (const [key, days, u] of [
    ['2026-11-16', 0, 0], ['2026-11-17', 0, 0], ['2026-11-21', 4, 1 / 3],
    ['2026-11-23', 6, (1 + 2 / 22) / 3], ['2026-12-02', 15, 1 / 2],
    ['2026-12-13', 26, 2 / 3], ['2026-12-20', 33, 1], ['2026-12-21', 33, 1],
  ]) {
    const state = getJourneyState(key);
    expect(state.progress).toBe(days / 33);
    expect(state.routeProgress).toBe(u);
  }
});

test('preview and milestone selection do not change live date or finale countdown', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-22T17:00:00Z'));
  await page.goto('/');
  const countdown = page.locator('#countdown');
  const originalCountdown = await countdown.textContent();
  await page.getByRole('link', { name: 'Timeline', exact: true }).click();
  await expect(page).toHaveURL(/\/#timeline$/);
  const { section, find, slider, reset, detail } = ui(page);
  await expect(find('date')).toHaveText('23 November 2026 WIB');
  await expect(detail()).toHaveText('Kompetisi Kreatif Video');
  const announcement = section.locator('[role="status"]');
  await expect(announcement).toBeEmpty();
  await slider.evaluate((input) => {
    input.value = '26';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(find('mode')).toHaveText('Pratinjau');
  await expect(find('date')).toHaveText('13 Desember 2026 WIB');
  await expect(find('today')).toHaveText('Pada tanggal pilihan: Batas pengumpulan video · El Muna Fun Cup');
  await expect(section.locator('output')).toHaveText('13 Desember 2026');
  await expect(announcement).toBeEmpty();
  await slider.dispatchEvent('change');
  await expect(announcement).toContainText('Pratinjau, 13 Desember 2026 WIB');

  const dialog = section.getByRole('button', { name: /^Dialog Interaktif/ });
  await dialog.press('Enter');
  await expect(dialog).toBeFocused();
  await expect(dialog).toHaveAttribute('aria-pressed', 'true');
  await expect(detail()).toHaveText('Dialog Interaktif');
  await expect(find('date')).toHaveText('13 Desember 2026 WIB');
  await expect(slider).toHaveValue('26');
  await expect(page.getByRole('dialog')).toBeHidden();

  await reset.press('Enter');
  await expect(find('mode')).toHaveText('Hari ini');
  await expect(find('date')).toHaveText('23 November 2026 WIB');
  await expect(slider).toHaveValue('6');
  await expect(detail()).toHaveText('Kompetisi Kreatif Video');
  await expect(announcement).toContainText('Hari ini, 23 November 2026 WIB');
  await expect(countdown).toHaveText(originalCountdown);
});

test('rolls over at WIB midnight, pauses while hidden and keeps a preview fixed', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-22T16:59:15Z') });
  await page.clock.pauseAt(new Date('2026-11-22T16:59:30Z'));
  await page.goto('/');
  const { section, find, slider, reset } = ui(page);
  const visibility = (hidden) => page.evaluate((value) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await expect(find('date')).toHaveAttribute('datetime', '2026-11-22');
  await page.clock.runFor(60_000);
  await expect(find('date')).toHaveAttribute('datetime', '2026-11-23');
  await expect(section.locator('[role="status"]')).toContainText('23 November 2026 WIB');

  await visibility(true);
  await page.clock.setSystemTime(new Date('2026-11-23T17:00:00Z'));
  await page.clock.runFor(120_000);
  await expect(find('date')).toHaveAttribute('datetime', '2026-11-23');
  await visibility(false);
  await expect(find('date')).toHaveAttribute('datetime', '2026-11-24');

  await slider.fill('26');
  await visibility(true);
  await page.clock.setSystemTime(new Date('2026-11-24T17:00:00Z'));
  await visibility(false);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(find('mode')).toHaveText('Pratinjau');
  await expect(find('date')).toHaveAttribute('datetime', '2026-12-13');
  await reset.press('Enter');
  await expect(find('date')).toHaveAttribute('datetime', '2026-11-25');
});

test('WebGL fallback leaves schedule, preview and details usable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...options) {
      return type.startsWith('webgl') ? null : original.call(this, type, ...options);
    };
  });
  await page.clock.setFixedTime(new Date('2026-11-23T04:00:00Z'));
  await page.goto('/#timeline');
  const { section, find, slider, detail } = ui(page);
  await section.getByRole('heading', { name: 'Perjalanan kita. Hari demi hari.' }).scrollIntoViewIfNeeded();
  await expect(find('fallback')).toHaveText('Visual 3D tidak tersedia. Status dan jadwal tetap dapat digunakan.');
  await expect(find('fallback')).toBeVisible();
  await expect(section.locator('[data-journey-node]:visible')).toHaveCount(0);
  await slider.fill('26');
  await section.getByRole('button', { name: /^El Muna Fun Cup/ }).press('Enter');
  await expect(find('today')).toContainText('Batas pengumpulan video · El Muna Fun Cup');
  await expect(detail()).toHaveText('El Muna Fun Cup');
  expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('shows the full static schedule and proposal links, not stale live status', async ({ page }) => {
    await page.goto('/#timeline');
    const { section, find, slider, reset } = ui(page);
    await expect(find('js-note')).toBeVisible();
    await expect(find('status')).toBeHidden();
    await expect(slider).toBeDisabled();
    await expect(reset).toBeDisabled();
    for (const [id, range, time, href] of [
      ['video', '17 November–20 Desember 2026', 'Pendaftaran gratis', 'video'],
      ['dialog', '21 November 2026', '19.00 WIB', 'dialog'],
      ['cup', '13 Desember 2026', '08.00 WIB', 'badminton'],
      ['finale', '20 Desember 2026', '19.00 WIB–selesai', 'finale'],
    ]) {
      const select = section.locator(`[data-journey-select="${id}"]`);
      const article = section.locator(`[data-journey-detail="${id}"]`);
      await expect(select).toBeDisabled();
      await expect(select.getByText(range, { exact: true })).toBeVisible();
      await expect(article.getByText(time, { exact: true })).toBeVisible();
      await expect(article.getByRole('link')).toHaveAttribute('href', `/proposal.html#${href}`);
    }
    const phases = section.locator('[data-journey-detail="video"] dd');
    await expect(phases).toHaveText([
      '17–29 November 2026', '29 November–13 Desember 2026', '13 Desember 2026',
      '17 Desember 2026', '20 Desember 2026',
    ]);
  });
});
