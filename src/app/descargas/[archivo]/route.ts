import fs from 'node:fs/promises';
import path from 'node:path';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NOMBRE_COOKIE, secretoAcceso, verificarToken } from '@/lib/acceso/token';
import { buscarDuenoDescarga } from '@/lib/contenido/consultas';
import { dirDescargas, obtenerRecursos } from '@/lib/contenido/recursos';

const TIPOS_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.csv': 'text/csv; charset=utf-8',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

export async function GET(request: Request, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;
  // Sin barras ni rutas relativas: solo nombres de archivo planos.
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(archivo)) return new Response('No encontrado', { status: 404 });

  const dueno = buscarDuenoDescarga(archivo, obtenerRecursos());
  if (!dueno) return new Response('No encontrado', { status: 404 });

  if (dueno.premium) {
    const almacen = await cookies();
    if (!verificarToken(almacen.get(NOMBRE_COOKIE)?.value, secretoAcceso())) {
      return NextResponse.redirect(new URL(`/r/${dueno.recurso.slug}`, request.url), 303);
    }
  }

  const datos = await fs.readFile(path.join(dirDescargas(), archivo));
  return new Response(new Uint8Array(datos), {
    headers: {
      'content-type': TIPOS_MIME[path.extname(archivo)] ?? 'application/octet-stream',
      'content-disposition': `attachment; filename="${archivo}"`,
      'cache-control': dueno.premium ? 'private, no-store' : 'public, max-age=3600',
    },
  });
}
