import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearToken } from '@/lib/acceso/token';

const SECRETO = 's'.repeat(40);
let valorCookie: string | undefined;

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (valorCookie ? { value: valorCookie } : undefined) }),
}));

import { Premium } from './Premium';

beforeEach(() => {
  vi.stubEnv('EMAIL_ACTIVO', '1');
  vi.stubEnv('ACCESO_SECRET', SECRETO);
  valorCookie = undefined;
});

async function renderizar() {
  const elemento = (await Premium({ slug: 'erp', children: <p>CONTENIDO-SECRETO</p> })) as ReactElement<
    Record<string, unknown>
  >;
  return { elemento, json: JSON.stringify(elemento) };
}

describe('<Premium>', () => {
  it('con el email apagado muestra el contenido sin formulario', async () => {
    vi.stubEnv('EMAIL_ACTIVO', '');
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('libre');
    expect(json).toContain('CONTENIDO-SECRETO');
  });

  it('sin cookie muestra el formulario y no incluye el contenido', async () => {
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('bloqueado');
    expect(json).not.toContain('CONTENIDO-SECRETO');
  });

  it('con cookie válida muestra el contenido', async () => {
    valorCookie = crearToken('lead-1', SECRETO);
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('desbloqueado');
    expect(json).toContain('CONTENIDO-SECRETO');
  });

  it('con cookie firmada con otro secreto vuelve a pedir email', async () => {
    valorCookie = crearToken('lead-1', 'x'.repeat(40));
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('bloqueado');
    expect(json).not.toContain('CONTENIDO-SECRETO');
  });

  it('con cookie vencida vuelve a pedir email', async () => {
    valorCookie = crearToken('lead-1', SECRETO, new Date('2020-01-01T00:00:00Z'));
    expect((await renderizar()).elemento.props['data-premium']).toBe('bloqueado');
  });
});
