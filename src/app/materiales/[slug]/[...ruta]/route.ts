import fs from 'node:fs/promises';
import path from 'node:path';
import { dirMateriales, obtenerRecurso } from '@/lib/contenido/recursos';

const TIPOS: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ARCHIVO = /^[a-z0-9][a-z0-9._-]*\.(svg|png|jpg)$/;
const no = () => new Response('No encontrado', { status: 404 });

/** Logos y capturas de un material (contenido/materiales/<slug>/<logos|capturas>/<archivo>). */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; ruta: string[] }> }) {
  const { slug, ruta } = await params;
  if (!SLUG.test(slug) || ruta.length !== 2 || !['logos', 'capturas'].includes(ruta[0]) || !ARCHIVO.test(ruta[1])) return no();
  if (obtenerRecurso(slug)?.origen !== 'material') return no();
  let datos: Buffer;
  try {
    datos = await fs.readFile(path.join(dirMateriales(), slug, ruta[0], ruta[1]));
  } catch {
    return no();
  }
  return new Response(new Uint8Array(datos), {
    headers: {
      'content-type': TIPOS[path.extname(ruta[1])],
      'cache-control': 'public, max-age=86400',
      // Un SVG abierto directo no puede correr scripts.
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
