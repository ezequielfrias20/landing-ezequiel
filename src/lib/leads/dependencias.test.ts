import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearDependencias, ErrorConfiguracion } from './dependencias';
import { RepositorioMemoria } from './memoria';
import { RepositorioSupabase } from './supabase';

afterEach(() => vi.unstubAllEnvs());

describe('crearDependencias', () => {
  it('usa memoria cuando ALMACEN_LEADS=memoria y reutiliza la misma instancia', () => {
    vi.stubEnv('ALMACEN_LEADS', 'memoria');
    vi.stubEnv('VERCEL', '');
    const a = crearDependencias();
    expect(a.repositorio).toBeInstanceOf(RepositorioMemoria);
    expect(crearDependencias().repositorio).toBe(a.repositorio);
  });

  it('prohíbe memoria en Vercel', () => {
    vi.stubEnv('ALMACEN_LEADS', 'memoria');
    vi.stubEnv('VERCEL', '1');
    expect(() => crearDependencias()).toThrow(ErrorConfiguracion);
  });

  it('exige las variables de Supabase y Brevo', () => {
    vi.stubEnv('ALMACEN_LEADS', '');
    vi.stubEnv('SUPABASE_URL', '');
    expect(() => crearDependencias()).toThrow(/SUPABASE_URL/);
  });

  it('arma Supabase con las variables completas', () => {
    vi.stubEnv('ALMACEN_LEADS', '');
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'clave');
    vi.stubEnv('BREVO_API_KEY', 'clave');
    vi.stubEnv('BREVO_LISTA_ID', '3');
    expect(crearDependencias().repositorio).toBeInstanceOf(RepositorioSupabase);
  });
});
