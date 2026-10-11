import { describe, expect, it, vi } from 'vitest';
import { ClienteBrevoHttp } from './brevo';

describe('ClienteBrevoHttp', () => {
  it('crea o actualiza el contacto en la lista con el último recurso', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    await new ClienteBrevoHttp('clave', 7, fetchFalso).sincronizarContacto('ana@correo.com', 'checklist-erp');
    const [url, init] = fetchFalso.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/contacts');
    expect(init.method).toBe('POST');
    expect(init.headers['api-key']).toBe('clave');
    expect(JSON.parse(init.body)).toEqual({
      email: 'ana@correo.com',
      attributes: { ULTIMO_RECURSO: 'checklist-erp' },
      listIds: [7],
      updateEnabled: true,
    });
  });

  it('lanza si Brevo responde con error', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response('mal', { status: 401 }));
    await expect(new ClienteBrevoHttp('clave', 7, fetchFalso).sincronizarContacto('a@b.co', 'x')).rejects.toThrow(/401/);
  });
});
