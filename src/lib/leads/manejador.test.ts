import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/contenido/recursos', () => ({
  obtenerRecurso: (slug: string) => (slug === 'checklist-erp' ? { slug } : null),
}));

vi.mock('./dependencias', async (importarOriginal) => {
  const original = await importarOriginal<typeof import('./dependencias')>();
  return { ...original, crearDependencias: vi.fn(original.crearDependencias) };
});

import { crearDependencias } from './dependencias';
import { manejarAlta } from './manejador';

let ip = 0;
const pedir = (
  cuerpo: unknown,
  url = 'https://sitio.com/api/desbloquear',
  direccion = `10.0.0.${++ip}`,
  extra: Record<string, string> = {},
) =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': direccion, ...extra },
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

  it('honeypot: 200 ok sin cookie', async () => {
    const r = await manejarAlta(
      pedir({ email: 'ana@correo.com', slug: 'checklist-erp', sitio_web: 'http://spam' }),
      'desbloqueo',
    );
    expect(r.status).toBe(200);
    expect((await r.json()).ok).toBe(true);
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('slug desconocido: 400 sin cookie', async () => {
    const r = await manejarAlta(pedir({ email: 'ana@correo.com', slug: 'no-existe' }), 'desbloqueo');
    expect(r.status).toBe(400);
    expect((await r.json()).ok).toBe(false);
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('la sexta petición desde la misma IP: 429 sin cookie', async () => {
    const cuerpo = { email: 'ana@correo.com', slug: 'checklist-erp' };
    for (let i = 0; i < 5; i++) {
      const ok = await manejarAlta(pedir(cuerpo, undefined, '203.0.113.9'), 'desbloqueo');
      expect(ok.status).toBe(200);
    }
    const r = await manejarAlta(pedir(cuerpo, undefined, '203.0.113.9'), 'desbloqueo');
    expect(r.status).toBe(429);
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('falla del repositorio: 503 con mensaje y sin cookie', async () => {
    const reales = vi.mocked(crearDependencias)();
    vi.mocked(crearDependencias).mockReturnValueOnce({
      ...reales,
      repositorio: {
        ...reales.repositorio,
        contarIntentosDesde: async () => 0,
        registrarIntento: async () => {},
        guardarLead: async () => {
          throw new Error('base caída');
        },
      },
      registrarError: () => {},
    });
    const r = await manejarAlta(pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }), 'desbloqueo');
    expect(r.status).toBe(503);
    expect((await r.json()).mensaje).toBe('No pudimos guardar tu email, prueba de nuevo.');
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('x-real-ip manda sobre x-forwarded-for: misma cubeta aunque cambie el reenviado', async () => {
    const cuerpo = { email: 'ana@correo.com', slug: 'checklist-erp' };
    for (let i = 0; i < 5; i++) {
      const ok = await manejarAlta(
        pedir(cuerpo, undefined, `198.51.100.${i}`, { 'x-real-ip': '192.0.2.77' }),
        'desbloqueo',
      );
      expect(ok.status).toBe(200);
    }
    const r = await manejarAlta(pedir(cuerpo, undefined, '198.51.100.99', { 'x-real-ip': '192.0.2.77' }), 'desbloqueo');
    expect(r.status).toBe(429);
  });

  it('content-type que no es JSON: 415 sin cookie', async () => {
    const r = await manejarAlta(
      pedir('{"email":"ana@correo.com","slug":"checklist-erp"}', undefined, undefined, { 'content-type': 'text/plain' }),
      'desbloqueo',
    );
    expect(r.status).toBe(415);
    expect(await r.json()).toEqual({ ok: false, mensaje: 'Formato no soportado.' });
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('Origin de otro sitio: 403 sin cookie', async () => {
    const r = await manejarAlta(
      pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }, undefined, undefined, { origin: 'https://malicioso.com' }),
      'desbloqueo',
    );
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ ok: false, mensaje: 'Origen no permitido.' });
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('Origin del mismo sitio: 200', async () => {
    const r = await manejarAlta(
      pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }, undefined, undefined, { origin: 'https://sitio.com' }),
      'desbloqueo',
    );
    expect(r.status).toBe(200);
  });

  it('detrás de proxy (x-forwarded-proto https) la cookie lleva Secure', async () => {
    const r = await manejarAlta(
      pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }, 'http://sitio.com/api/desbloquear', undefined, {
        'x-forwarded-proto': 'https',
      }),
      'desbloqueo',
    );
    expect(r.headers.get('set-cookie')).toMatch(/Secure/i);
  });
});
