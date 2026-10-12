import { defineConfig, devices } from '@playwright/test';

const PUERTO = 3100;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: `http://localhost:${PUERTO}` },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], permissions: ['clipboard-read', 'clipboard-write'] },
    },
  ],
  webServer: {
    // Build de producción con contenido de prueba y leads en memoria, en una carpeta aparte.
    command: `npm run build && npx next start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
      DIR_RECURSOS: 'e2e/fixtures/recursos',
      DIR_DESCARGAS: 'e2e/fixtures/descargas',
      DIR_MATERIALES: 'e2e/fixtures/materiales',
      ALMACEN_LEADS: 'memoria',
      EMAIL_ACTIVO: '1',
      ACCESO_SECRET: 'e2e-secreto-de-prueba-con-mas-de-32-caracteres',
      SITIO_URL: `http://localhost:${PUERTO}`,
    },
  },
});
