import { createHmac, timingSafeEqual } from 'node:crypto';

export const NOMBRE_COOKIE = 'ef_acceso';
export const DURACION_ACCESO_SEG = 365 * 24 * 60 * 60;

interface Carga {
  l: string; // id del lead
  e: number; // expiración en segundos epoch
}

function firmar(datos: string, secreto: string): string {
  return createHmac('sha256', secreto).update(datos).digest('base64url');
}

export function crearToken(leadId: string, secreto: string, ahora = new Date()): string {
  const carga: Carga = { l: leadId, e: Math.floor(ahora.getTime() / 1000) + DURACION_ACCESO_SEG };
  const datos = Buffer.from(JSON.stringify(carga)).toString('base64url');
  return `${datos}.${firmar(datos, secreto)}`;
}

export function verificarToken(
  token: string | undefined | null,
  secreto: string,
  ahora = new Date(),
): { leadId: string } | null {
  if (!token || !secreto) return null;
  const partes = token.split('.');
  if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
  const [datos, firma] = partes;
  const esperada = Buffer.from(firmar(datos, secreto));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  try {
    const carga = JSON.parse(Buffer.from(datos, 'base64url').toString('utf8')) as Partial<Carga>;
    if (typeof carga.l !== 'string' || typeof carga.e !== 'number') return null;
    if (carga.e * 1000 <= ahora.getTime()) return null;
    return { leadId: carga.l };
  } catch {
    return null;
  }
}

export function secretoAcceso(): string {
  const secreto = process.env.ACCESO_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error('ACCESO_SECRET falta o tiene menos de 32 caracteres');
  }
  return secreto;
}

export function opcionesCookie(seguro: boolean) {
  return {
    httpOnly: true,
    secure: seguro,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACION_ACCESO_SEG,
  };
}
