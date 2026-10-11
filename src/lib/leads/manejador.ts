import { NextResponse } from 'next/server';
import { crearToken, NOMBRE_COOKIE, opcionesCookie, secretoAcceso } from '@/lib/acceso/token';
import { hashIp, procesarAlta, type DependenciasAlta, type ModoAlta } from './alta';
import { crearDependencias } from './dependencias';

const MENSAJE_FALLA = 'No pudimos guardar tu email, prueba de nuevo.';

export async function manejarAlta(request: Request, modo: ModoAlta): Promise<Response> {
  let cuerpo: unknown = null;
  try {
    cuerpo = await request.json();
  } catch {
    // Cuerpo inválido: procesarAlta lo rechaza con 400.
  }

  let secreto: string;
  let deps: DependenciasAlta;
  try {
    secreto = secretoAcceso();
    deps = crearDependencias();
  } catch (error) {
    console.error('[leads] configuración incompleta', error);
    return NextResponse.json({ ok: false, mensaje: MENSAJE_FALLA }, { status: 503 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida';
  const resultado = await procesarAlta({ cuerpo, ipHash: hashIp(ip, secreto), modo }, deps);
  const respuesta = NextResponse.json(
    { ok: resultado.estado === 200, mensaje: resultado.mensaje },
    { status: resultado.estado },
  );

  if (modo === 'desbloqueo' && resultado.estado === 200 && resultado.leadId) {
    const seguro = new URL(request.url).protocol === 'https:';
    respuesta.cookies.set(NOMBRE_COOKIE, crearToken(resultado.leadId, secreto), opcionesCookie(seguro));
  }
  return respuesta;
}
