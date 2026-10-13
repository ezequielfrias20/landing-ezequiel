import { expect, test } from '@playwright/test';

const tarjetas = (page: import('@playwright/test').Page) => page.locator('main a[href^="/r/"]');
// Los fixtures de la bóveda son 2 MDX + 1 material.

test('filtrar por tipo actualiza la URL y los resultados', async ({ page }) => {
  await page.goto('/recursos');
  await expect(tarjetas(page)).toHaveCount(3);
  await page.getByRole('button', { name: /^Plantilla \(1\)$/ }).click();
  await expect(page).toHaveURL(/\?tipo=plantilla$/);
  await expect(tarjetas(page)).toHaveCount(1);
  await expect(page.getByText('Plantilla de inventario')).toBeVisible();
});

test('la búsqueda ignora tildes', async ({ page }) => {
  await page.goto('/recursos');
  await page.getByLabel('Buscar recursos').fill('clinica');
  await expect(tarjetas(page)).toHaveCount(1);
  await expect(page.getByText('Asistente de WhatsApp para tu clínica')).toBeVisible();
});

test('estado vacío con opción de limpiar', async ({ page }) => {
  await page.goto('/recursos?q=zzzz');
  await expect(page.getByText('No hay recursos con esos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(tarjetas(page)).toHaveCount(3);
  await expect(page).toHaveURL(/\/recursos$/);
});

test('un filtro desconocido en la URL se ignora', async ({ page }) => {
  await page.goto('/recursos?tema=viejo');
  await expect(tarjetas(page)).toHaveCount(3);
});

test('el enlace Recursos del encabezado limpia la búsqueda anterior', async ({ page }) => {
  await page.goto('/recursos?q=zzzz');
  await expect(page.getByLabel('Buscar recursos')).toHaveValue('zzzz');
  await page.getByRole('banner').getByRole('link', { name: 'Recursos' }).click();
  await expect(page).toHaveURL(/\/recursos$/);
  await expect(page.getByLabel('Buscar recursos')).toHaveValue('');
  await expect(tarjetas(page)).toHaveCount(3);
});

test('escribir una búsqueda de dos palabras conserva el espacio y cada letra', async ({ page }) => {
  await page.goto('/recursos');
  const buscador = page.getByLabel('Buscar recursos');
  // Tecla por tecla, como una persona: antes la URL recortada pisaba el espacio y algunas letras.
  await buscador.pressSequentially('plantilla inventario', { delay: 5 });
  await expect(buscador).toHaveValue('plantilla inventario');
  await expect(page).toHaveURL(/\?q=plantilla\+inventario$/);
  await expect(buscador).toHaveValue('plantilla inventario');
  await expect(tarjetas(page)).toHaveCount(1);
  await expect(page.getByText('Plantilla de inventario')).toBeVisible();
});
