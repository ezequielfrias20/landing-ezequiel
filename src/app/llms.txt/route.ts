import { obtenerRecursos } from '@/lib/contenido/recursos';
import { generarLlmsTxt, sitioUrl } from '@/lib/seo/llms';

export const revalidate = 86400;

export function GET() {
  return new Response(generarLlmsTxt(obtenerRecursos(), sitioUrl()), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
