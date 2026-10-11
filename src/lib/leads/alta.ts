import { createHash } from 'node:crypto';

export interface RepositorioLeads {
  contarIntentosDesde(ipHash: string, desde: Date): Promise<number>;
  registrarIntento(ipHash: string): Promise<void>;
  guardarLead(email: string): Promise<{ id: string; brevoSincronizado: boolean }>;
  registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }): Promise<void>;
  marcarBrevoSincronizado(leadId: string): Promise<void>;
}

export interface ClienteBrevo {
  sincronizarContacto(email: string, ultimoRecurso: string | null): Promise<void>;
}

export interface DependenciasAlta {
  repositorio: RepositorioLeads;
  brevo: ClienteBrevo;
  existeRecurso(slug: string): boolean;
  ahora(): Date;
  registrarError(mensaje: string, error: unknown): void;
}

export type ModoAlta = 'desbloqueo' | 'newsletter';

export type ResultadoAlta =
  | { estado: 200; leadId: string | null; mensaje: string }
  | { estado: 400 | 429 | 503; mensaje: string };

export const LIMITE_INTENTOS = 5;
export const VENTANA_MS = 60_000;

export function normalizarEmail(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const email = valor.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

export function normalizarOrigen(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const origen = valor.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 50);
  return origen || null;
}

export function hashIp(ip: string, secreto: string): string {
  return createHash('sha256').update(`${secreto}:${ip}`).digest('hex');
}

export async function procesarAlta(
  entrada: { cuerpo: unknown; ipHash: string; modo: ModoAlta },
  deps: DependenciasAlta,
): Promise<ResultadoAlta> {
  const cuerpo = (typeof entrada.cuerpo === 'object' && entrada.cuerpo !== null ? entrada.cuerpo : {}) as Record<
    string,
    unknown
  >;

  // Campo trampa: los humanos no lo ven. Al bot se le responde "éxito" para que no reintente.
  if (typeof cuerpo.sitio_web === 'string' && cuerpo.sitio_web.trim() !== '') {
    return { estado: 200, leadId: null, mensaje: 'Listo.' };
  }

  const email = normalizarEmail(cuerpo.email);
  if (!email) return { estado: 400, mensaje: 'Revisa tu email, parece que tiene un error.' };

  let slug = 'newsletter';
  if (entrada.modo === 'desbloqueo') {
    if (typeof cuerpo.slug !== 'string' || !deps.existeRecurso(cuerpo.slug)) {
      return { estado: 400, mensaje: 'Ese recurso no existe.' };
    }
    slug = cuerpo.slug;
  }
  const origen = normalizarOrigen(cuerpo.origen);

  let lead: { id: string; brevoSincronizado: boolean };
  try {
    const desde = new Date(deps.ahora().getTime() - VENTANA_MS);
    await deps.repositorio.registrarIntento(entrada.ipHash);
    if ((await deps.repositorio.contarIntentosDesde(entrada.ipHash, desde)) > LIMITE_INTENTOS) {
      return { estado: 429, mensaje: 'Demasiados intentos. Espera un minuto y prueba de nuevo.' };
    }
    lead = await deps.repositorio.guardarLead(email);
    await deps.repositorio.registrarDesbloqueo({ leadId: lead.id, slug, origen });
  } catch (error) {
    deps.registrarError('No se pudo guardar el lead', error);
    return { estado: 503, mensaje: 'No pudimos guardar tu email, prueba de nuevo.' };
  }

  try {
    await deps.brevo.sincronizarContacto(email, entrada.modo === 'desbloqueo' ? slug : null);
    if (!lead.brevoSincronizado) await deps.repositorio.marcarBrevoSincronizado(lead.id);
  } catch (error) {
    deps.registrarError('No se pudo sincronizar con Brevo', error);
  }

  return {
    estado: 200,
    leadId: lead.id,
    mensaje: entrada.modo === 'desbloqueo' ? 'Listo, ya tienes acceso.' : 'Listo, te aviso cuando haya algo nuevo.',
  };
}
