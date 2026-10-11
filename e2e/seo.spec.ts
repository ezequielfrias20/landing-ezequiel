import { expect, test } from '@playwright/test';

test('llms.txt lista los recursos', async ({ request }) => {
  const txt = await (await request.get('/llms.txt')).text();
  expect(txt).toContain('[Plantilla de inventario](http://localhost:3100/r/plantilla-premium)');
});

test('sitemap incluye cada recurso', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('http://localhost:3100/r/guia-libre');
});

test('cada recurso tiene título y descripción propios', async ({ page }) => {
  await page.goto('/r/guia-libre');
  await expect(page).toHaveTitle('Asistente de WhatsApp para tu clínica · Ezequiel Frias');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /califique pacientes/);
});

test('la imagen OG del recurso se genera', async ({ request }) => {
  const r = await request.get('/r/guia-libre/opengraph-image');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toBe('image/png');
});
