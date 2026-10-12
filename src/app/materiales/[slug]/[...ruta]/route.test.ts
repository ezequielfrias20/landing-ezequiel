import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { analizarMaterial } from '@/lib/contenido/material/analizar';
import { paqueteBueno } from '@/lib/contenido/material/fixture';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mat-'));
fs.mkdirSync(path.join(dir, 'brag-video', 'logos'), { recursive: true });
fs.writeFileSync(path.join(dir, 'brag-video', 'logos', 'claude.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');

vi.mock('@/lib/contenido/recursos', () => ({
  obtenerRecurso: (s: string) => (s === 'brag-video' ? analizarMaterial('brag-video', paqueteBueno()) : null),
  dirMateriales: () => dir,
}));

import { GET } from './route';

const pedir = (slug: string, ruta: string[]) => GET(new Request('http://localhost/x'), { params: Promise.resolve({ slug, ruta }) });

describe('GET /materiales/[slug]/[...ruta]', () => {
  it('sirve un logo del material con su tipo y una CSP que apaga scripts del SVG', async () => {
    const r = await pedir('brag-video', ['logos', 'claude.svg']);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('image/svg+xml');
    expect(r.headers.get('content-security-policy')).toContain("default-src 'none'");
  });

  it('404 para rutas raras, carpetas no permitidas, slugs inexistentes o archivos que no están', async () => {
    expect((await pedir('brag-video', ['..', 'material.json'])).status).toBe(404);
    expect((await pedir('brag-video', ['material.json'])).status).toBe(404);
    expect((await pedir('brag-video', ['otros', 'claude.svg'])).status).toBe(404);
    expect((await pedir('no-existe', ['logos', 'claude.svg'])).status).toBe(404);
    expect((await pedir('brag-video', ['logos', 'falta.svg'])).status).toBe(404);
  });
});
