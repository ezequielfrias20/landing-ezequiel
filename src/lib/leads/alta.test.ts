import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { procesarAlta, VENTANA_MS, type ClienteBrevo, type DependenciasAlta } from './alta';
import { RepositorioMemoria } from './memoria';

let reloj: Date;
let repo: RepositorioMemoria;
let brevo: { sincronizarContacto: Mock<ClienteBrevo['sincronizarContacto']> };
let deps: DependenciasAlta;

beforeEach(() => {
  reloj = new Date('2026-10-11T12:00:00Z');
  repo = new RepositorioMemoria(() => reloj);
  brevo = { sincronizarContacto: vi.fn<ClienteBrevo['sincronizarContacto']>().mockResolvedValue(undefined) };
  deps = {
    repositorio: repo,
    brevo,
    existeRecurso: (slug) => slug === 'checklist-erp',
    ahora: () => reloj,
    registrarError: vi.fn(),
  };
});

const desbloquear = (cuerpo: unknown, ipHash = 'ip-1') => procesarAlta({ cuerpo, ipHash, modo: 'desbloqueo' }, deps);

describe('procesarAlta', () => {
  it('registra lead, desbloqueo y contacto en Brevo', async () => {
    const r = await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp', origen: 'manychat' });
    expect(r.estado).toBe(200);
    expect(r).toMatchObject({ leadId: expect.any(String) });
    expect(repo.desbloqueos).toEqual([{ leadId: expect.any(String), slug: 'checklist-erp', origen: 'manychat' }]);
    expect(brevo.sincronizarContacto).toHaveBeenCalledWith('ana@correo.com', 'checklist-erp');
    expect(repo.leads.get('ana@correo.com')?.brevoSincronizado).toBe(true);
  });

  it('normaliza el email: mayúsculas y espacios son el mismo lead', async () => {
    await desbloquear({ email: ' Ana@Correo.COM ', slug: 'checklist-erp' });
    await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp' });
    expect([...repo.leads.keys()]).toEqual(['ana@correo.com']);
    expect(repo.desbloqueos).toHaveLength(2);
  });

  it('el campo trampa responde 200 sin guardar nada', async () => {
    const r = await desbloquear({ email: 'bot@spam.com', slug: 'checklist-erp', sitio_web: 'http://spam' });
    expect(r).toEqual({ estado: 200, leadId: null, mensaje: expect.any(String) });
    expect(repo.leads.size).toBe(0);
    expect(brevo.sincronizarContacto).not.toHaveBeenCalled();
  });

  it.each([
    [{ email: 'no-es-email', slug: 'checklist-erp' }],
    [{ slug: 'checklist-erp' }],
    [null],
    ['texto'],
  ])('responde 400 con email inválido: %j', async (cuerpo) => {
    expect((await desbloquear(cuerpo)).estado).toBe(400);
  });

  it('responde 400 si el recurso no existe o falta', async () => {
    expect((await desbloquear({ email: 'ana@correo.com', slug: 'fantasma' })).estado).toBe(400);
    expect((await desbloquear({ email: 'ana@correo.com' })).estado).toBe(400);
  });

  it('en modo newsletter no exige slug y registra slug "newsletter"', async () => {
    const r = await procesarAlta({ cuerpo: { email: 'ana@correo.com' }, ipHash: 'ip-1', modo: 'newsletter' }, deps);
    expect(r.estado).toBe(200);
    expect(repo.desbloqueos[0].slug).toBe('newsletter');
    expect(brevo.sincronizarContacto).toHaveBeenCalledWith('ana@correo.com', null);
  });

  it('limpia el origen', async () => {
    await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp', origen: ' ManyChat!<script> ' });
    expect(repo.desbloqueos[0].origen).toBe('manychatscript');
  });

  it('corta en 429 al sexto intento dentro de un minuto y se libera después', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await desbloquear({ email: `p${i}@correo.com`, slug: 'checklist-erp' })).estado).toBe(200);
    }
    expect((await desbloquear({ email: 'p6@correo.com', slug: 'checklist-erp' })).estado).toBe(429);
    expect((await desbloquear({ email: 'otra@correo.com', slug: 'checklist-erp' }, 'ip-2')).estado).toBe(200);
    reloj = new Date(reloj.getTime() + VENTANA_MS + 1);
    expect((await desbloquear({ email: 'p6@correo.com', slug: 'checklist-erp' })).estado).toBe(200);
  });

  it('bajo concurrencia desde la misma IP, solo 5 pasan y 1 recibe 429', async () => {
    const respuestas = await Promise.all(
      Array.from({ length: 6 }, (_, i) => desbloquear({ email: `c${i}@correo.com`, slug: 'checklist-erp' })),
    );
    const estados = respuestas.map((r) => r.estado);
    expect(estados.filter((e) => e === 200).length).toBeLessThanOrEqual(5);
    expect(estados.filter((e) => e !== 200).every((e) => e === 429)).toBe(true);
  });

  it('responde 503 si la base de datos falla', async () => {
    repo.guardarLead = vi.fn().mockRejectedValue(new Error('caída'));
    const r = await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp' });
    expect(r.estado).toBe(503);
    expect(deps.registrarError).toHaveBeenCalled();
  });

  it('si Brevo falla, desbloquea igual y deja el lead pendiente de sincronizar', async () => {
    brevo.sincronizarContacto.mockRejectedValue(new Error('brevo caído'));
    const r = await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp' });
    expect(r.estado).toBe(200);
    expect(repo.leads.get('ana@correo.com')?.brevoSincronizado).toBe(false);
    expect(deps.registrarError).toHaveBeenCalled();
  });
});
