import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearToken, DURACION_ACCESO_SEG, secretoAcceso, verificarToken } from './token';

const SECRETO = 'a'.repeat(40);
const OTRO = 'b'.repeat(40);
const AHORA = new Date('2026-10-11T12:00:00Z');

describe('token de acceso', () => {
  it('verifica un token recién creado', () => {
    const token = crearToken('lead-1', SECRETO, AHORA);
    expect(verificarToken(token, SECRETO, AHORA)).toEqual({ leadId: 'lead-1' });
  });

  it('vence a los 365 días', () => {
    const token = crearToken('lead-1', SECRETO, AHORA);
    const casi = new Date(AHORA.getTime() + (DURACION_ACCESO_SEG - 1) * 1000);
    const despues = new Date(AHORA.getTime() + DURACION_ACCESO_SEG * 1000);
    expect(verificarToken(token, SECRETO, casi)).not.toBeNull();
    expect(verificarToken(token, SECRETO, despues)).toBeNull();
  });

  it('rechaza un token firmado con otro secreto (p. ej. tras rotarlo)', () => {
    expect(verificarToken(crearToken('lead-1', OTRO, AHORA), SECRETO, AHORA)).toBeNull();
  });

  it('rechaza un token con la carga alterada', () => {
    const [, firma] = crearToken('lead-1', SECRETO, AHORA).split('.');
    const carga = Buffer.from(JSON.stringify({ l: 'otro', e: 9999999999 })).toString('base64url');
    expect(verificarToken(`${carga}.${firma}`, SECRETO, AHORA)).toBeNull();
  });

  it.each([undefined, null, '', 'basura', 'a.b.c', '.', 'x.'])('rechaza %s sin lanzar', (valor) => {
    expect(verificarToken(valor as string | undefined, SECRETO, AHORA)).toBeNull();
  });
});

describe('secretoAcceso', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('exige al menos 32 caracteres', () => {
    vi.stubEnv('ACCESO_SECRET', 'corto');
    expect(() => secretoAcceso()).toThrow(/ACCESO_SECRET/);
    vi.stubEnv('ACCESO_SECRET', SECRETO);
    expect(secretoAcceso()).toBe(SECRETO);
  });
});
