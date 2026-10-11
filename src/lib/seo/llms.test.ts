import { afterEach, describe, expect, it, vi } from 'vitest';
import { analizarRecurso } from '@/lib/contenido/analizar';
import { generarLlmsTxt, sitioUrl } from './llms';

const r = analizarRecurso(
  'checklist-erp.mdx',
  '---\ntitulo: Checklist ERP\nresumen: Las 15 funciones.\ntipo: plantilla\ntemas: [retail]\nfecha: 2026-10-01\n---\nLibre\n<Premium>\nPREMIUM-OCULTO\n</Premium>\n',
);

describe('generarLlmsTxt', () => {
  it('lista título, resumen y URL sin contenido del cuerpo', () => {
    const txt = generarLlmsTxt([r], 'https://ejemplo.com');
    expect(txt).toMatch(/^# Ezequiel Frias/);
    expect(txt).toContain('- [Checklist ERP](https://ejemplo.com/r/checklist-erp): Las 15 funciones. (Plantilla)');
    expect(txt).not.toContain('PREMIUM-OCULTO');
    expect(txt).not.toContain('Libre');
  });
});

describe('sitioUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('usa SITIO_URL sin barras finales', () => {
    vi.stubEnv('SITIO_URL', 'https://ezequiel.com///');
    expect(sitioUrl()).toBe('https://ezequiel.com');
  });

  it('trata SITIO_URL vacío como no definido y usa el dominio de producción de Vercel', () => {
    vi.stubEnv('SITIO_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'mi-sitio.vercel.app');
    expect(sitioUrl()).toBe('https://mi-sitio.vercel.app');
  });

  it('SITIO_URL tiene prioridad sobre Vercel', () => {
    vi.stubEnv('SITIO_URL', 'https://ezequiel.com');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'mi-sitio.vercel.app');
    expect(sitioUrl()).toBe('https://ezequiel.com');
  });

  it('sin nada definido cae a localhost', () => {
    vi.stubEnv('SITIO_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    expect(sitioUrl()).toBe('http://localhost:3000');
  });
});
