import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analizarRecurso } from '@/lib/contenido/analizar';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'descargas-'));
fs.writeFileSync(path.join(dir, 'y.pdf'), '%PDF-1.4');
const pro = analizarRecurso('pro.mdx', `---\ntitulo: T\nresumen: R\ntipo: guia\ntemas: [retail]\nfecha: 2026-10-01\n---\n<Premium>\n<Descarga archivo="y.pdf" nombre="Y" />\n</Premium>\n`);

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock('@/lib/contenido/recursos', () => ({ obtenerRecursos: () => [pro], dirDescargas: () => dir }));

import { GET } from './route';

const pedir = () => GET(new Request('http://localhost/descargas/y.pdf'), { params: Promise.resolve({ archivo: 'y.pdf' }) });

describe('GET /descargas/[archivo]', () => {
  beforeEach(() => vi.unstubAllEnvs());

  it('con el email apagado entrega la descarga premium sin cookie', async () => {
    vi.stubEnv('EMAIL_ACTIVO', '');
    const r = await pedir();
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('application/pdf');
  });

  it('con el email prendido y sin cookie redirige al recurso', async () => {
    vi.stubEnv('EMAIL_ACTIVO', '1');
    vi.stubEnv('ACCESO_SECRET', 's'.repeat(40));
    const r = await pedir();
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toContain('/r/pro');
  });
});
