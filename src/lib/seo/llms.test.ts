import { describe, expect, it } from 'vitest';
import { analizarRecurso } from '@/lib/contenido/analizar';
import { generarLlmsTxt } from './llms';

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
