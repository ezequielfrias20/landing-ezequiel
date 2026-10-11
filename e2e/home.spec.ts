import { expect, test } from '@playwright/test';

test('la home muestra las ofertas activas y oculta las futuras', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ezequiel Frias');
  const lista = page.getByRole('list', { name: 'Qué encuentras aquí' });
  await expect(lista.getByRole('link', { name: /Recursos/ })).toHaveAttribute('href', '/recursos');
  await expect(lista.getByRole('link', { name: /Diagnóstico de automatización/ })).toHaveAttribute('href', /cal\.com/);
  await expect(page.getByText('Workshops y charlas')).toHaveCount(0);
  await expect(page.getByText('Comunidad', { exact: true })).toHaveCount(0);
});

test('el bloque para empresas lleva a AIMA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Conocer AIMA' })).toHaveAttribute('href', 'https://cubolabsia.com');
});

test('muestra los últimos recursos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Asistente de WhatsApp para tu clínica/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Plantilla de inventario/ })).toBeVisible();
});

test('la suscripción al newsletter confirma', async ({ page }) => {
  await page.goto('/');
  const caja = page.locator('section', { hasText: 'Recibe los próximos recursos' });
  await caja.getByLabel('Tu email').fill('carla@ejemplo.com');
  await caja.getByRole('button', { name: 'Suscribirme' }).click();
  await expect(caja.getByRole('status')).toHaveText('Listo, te aviso cuando haya algo nuevo.');
});
