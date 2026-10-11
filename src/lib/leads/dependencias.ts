import { obtenerRecurso } from '@/lib/contenido/recursos';
import type { DependenciasAlta } from './alta';
import { ClienteBrevoHttp, ClienteBrevoNulo } from './brevo';
import { RepositorioMemoria } from './memoria';
import { crearClienteSupabase, RepositorioSupabase } from './supabase';

export class ErrorConfiguracion extends Error {}

let memoria: RepositorioMemoria | null = null;

export function crearDependencias(): DependenciasAlta {
  const comunes = {
    existeRecurso: (slug: string) => obtenerRecurso(slug) !== null,
    ahora: () => new Date(),
    registrarError: (mensaje: string, error: unknown) => console.error(`[leads] ${mensaje}`, error),
  };

  if (process.env.ALMACEN_LEADS === 'memoria') {
    if (process.env.VERCEL) throw new ErrorConfiguracion('ALMACEN_LEADS=memoria no se permite en Vercel');
    memoria ??= new RepositorioMemoria();
    return { ...comunes, repositorio: memoria, brevo: new ClienteBrevoNulo() };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_LISTA_ID } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BREVO_API_KEY || !BREVO_LISTA_ID) {
    throw new ErrorConfiguracion(
      'Faltan variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY o BREVO_LISTA_ID',
    );
  }
  const listaId = Number(BREVO_LISTA_ID);
  if (!Number.isInteger(listaId) || listaId <= 0) {
    throw new ErrorConfiguracion('BREVO_LISTA_ID debe ser un número entero positivo');
  }
  return {
    ...comunes,
    repositorio: new RepositorioSupabase(crearClienteSupabase(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)),
    brevo: new ClienteBrevoHttp(BREVO_API_KEY, listaId),
  };
}
