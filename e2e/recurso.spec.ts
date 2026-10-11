import { expect, test, type Response } from '@playwright/test';

const MARCA = 'SECRETO-E2E-7F3A';
// Rutas públicas que nunca deben contener contenido premium. Task 9 agrega más.
const RUTAS_PUBLICAS = ['/r/plantilla-premium', '/r/guia-libre', '/recursos'];

test('el contenido premium no llega al navegador sin email', async ({ page, request }) => {
  for (const ruta of RUTAS_PUBLICAS) {
    expect(await (await request.get(ruta)).text(), ruta).not.toContain(MARCA);
  }

  const cuerpos: Promise<string>[] = [];
  const sinLeer: string[] = [];
  // Cada cuerpo con tope de tiempo. Si no se puede leer, se registra la URL para fallar abajo.
  const leer = async (r: Response) => {
    const texto = await Promise.race([
      r.text().catch(() => null),
      new Promise<null>((listo) => setTimeout(() => listo(null), 3000)),
    ]);
    if (texto === null) sinLeer.push(r.url());
    return texto ?? '';
  };
  page.on('response', (r) => cuerpos.push(leer(r)));
  await page.goto('/r/plantilla-premium');
  await expect(page.getByRole('button', { name: 'Desbloquear' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  for (const cuerpo of await Promise.all(cuerpos)) expect(cuerpo).not.toContain(MARCA);
  // Ninguna respuesta puede quedar sin leer: no se podría verificar que no contenga la marca.
  expect(sinLeer, `cuerpos ilegibles: ${sinLeer.join(', ')}`).toEqual([]);
});

test('desbloquear con email muestra el contenido y persiste al recargar', async ({ page }) => {
  await page.goto('/r/plantilla-premium?ref=manychat');
  await page.locator('[data-premium="bloqueado"]').getByLabel('Tu email').fill('ana@ejemplo.com');
  await page.getByRole('button', { name: 'Desbloquear' }).click();
  await expect(page.getByText(MARCA)).toBeVisible();
  await page.reload();
  await expect(page.getByText(MARCA)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Descargar: PDF premium' })).toBeVisible();
});

test('la descarga premium redirige sin acceso y se entrega con acceso', async ({ page }) => {
  const sinAcceso = await page.request.get('/descargas/premium-e2e.pdf', { maxRedirects: 0 });
  expect(sinAcceso.status()).toBe(303);
  expect(sinAcceso.headers()['location']).toContain('/r/plantilla-premium');

  await page.goto('/r/plantilla-premium');
  await page.locator('[data-premium="bloqueado"]').getByLabel('Tu email').fill('beto@ejemplo.com');
  await page.getByRole('button', { name: 'Desbloquear' }).click();
  await expect(page.getByText(MARCA)).toBeVisible();

  const conAcceso = await page.request.get('/descargas/premium-e2e.pdf');
  expect(conAcceso.status()).toBe(200);
  expect(conAcceso.headers()['content-type']).toBe('application/pdf');
});

test('el botón Copiar copia el prompt completo', async ({ page }) => {
  await page.goto('/r/guia-libre');
  await page.getByRole('button', { name: 'Copiar' }).click();
  await expect(page.getByRole('button', { name: 'Copiado' })).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toBe('Actúa como asistente de [NOMBRE DE LA CLÍNICA].\nResponde en tono cercano.');
});

test('un recurso inexistente responde 404 con salida a la bóveda', async ({ page }) => {
  const respuesta = await page.goto('/r/no-existe');
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Ir a los recursos' })).toBeVisible();
});
