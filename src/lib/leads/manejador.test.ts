import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/contenido/recursos', () => ({
  obtenerRecurso: (slug: string) => (slug === 'checklist-erp' ? { slug } : null),
}));

import { manejarAlta } from './manejador';

let ip = 0;
const pedir = (cuerpo: unknown, url = 'https://sitio.com/api/desbloquear') =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${++ip}` },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });

beforeEach(() => {
  vi.stubEnv('ALMACEN_LEADS', 'memoria');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('ACCESO_SECRET', 's'.repeat(40));
});
afterEach(() => vi.unstubAllEnvs());

describe('manejarAlta', () => {
  it('desbloqueo válido: 200 y cookie httpOnly segura en https', async () => {
    const r = await manejarAlta(pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }), 'desbloqueo');
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, mensaje: 'Listo, ya tienes acceso.' });
    const cookie = r.headers.get('set-cookie') ?? '';
    expect(cookie).toMatch(/^ef_acceso=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
  });

  it('en http (local) la cookie no lleva Secure', async () => {
    const r = await manejarAlta(
      pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }, 'http://localhost:3000/api/desbloquear'),
      'desbloqueo',
    );
    expect(r.headers.get('set-cookie')).not.toMatch(/Secure/i);
  });

  it('newsletter: 200 sin cookie', async () => {
    const r = await manejarAlta(pedir({ email: 'ana@correo.com' }), 'newsletter');
    expect(r.status).toBe(200);
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('cuerpo que no es JSON: 400', async () => {
    const r = await manejarAlta(pedir('esto no es json'), 'desbloqueo');
    expect(r.status).toBe(400);
    expect((await r.json()).ok).toBe(false);
  });

  it('sin ACCESO_SECRET: 503 sin cookie', async () => {
    vi.stubEnv('ACCESO_SECRET', '');
    const r = await manejarAlta(pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }), 'desbloqueo');
    expect(r.status).toBe(503);
    expect(r.headers.get('set-cookie')).toBeNull();
  });
});
