import { expect, test } from '@playwright/test';

test('la página del material muestra sus partes y no el cierre', async ({ page }) => {
  await page.goto('/r/material-e2e');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu proyecto, en video');
  await expect(page.getByText('Material de apoyo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lo que te llevas' })).toBeVisible();
  await expect(page.getByText('Haz esto')).toBeVisible();
  await expect(page.getByText('Lo que viene después')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fuentes' })).toBeVisible();
  await expect(page.getByText('Llamada.')).toHaveCount(0);
  const logo = page.locator('img[alt="Claude"]').first();
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
});

test('descarga el PDF y copia un comando', async ({ page }) => {
  await page.goto('/r/material-e2e');
  const pdf = await page.request.get('/descargas/material-e2e.pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  await page.getByText('Copiar', { exact: true }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('npx un-comando-muy-largo');
});

test('en un celular la página no desborda a lo ancho', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/r/material-e2e');
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(ancho).toBeLessThanOrEqual(0);
});

test('el material aparece en la bóveda y se encuentra por su palabra', async ({ page }) => {
  await page.goto('/recursos?q=pruebae');
  await expect(page.getByRole('link', { name: /Tu proyecto, en video/ })).toBeVisible();
});
