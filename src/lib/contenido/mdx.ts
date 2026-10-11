import type { MDXContent } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';

/** Compila el cuerpo MDX con el pipeline del sitio, sin caché. */
export async function compilarMdxSinCache(cuerpo: string): Promise<MDXContent> {
  // Import dinámico: así también carga desde tsx (CJS) en scripts/validar-contenido.ts.
  const [{ evaluate }, { default: remarkGfm }] = await Promise.all([import('@mdx-js/mdx'), import('remark-gfm')]);
  const modulo = await evaluate(cuerpo, { ...runtime, remarkPlugins: [remarkGfm] });
  return modulo.default;
}

const cache = new Map<string, Promise<MDXContent>>();

/** Compila el cuerpo MDX en el servidor. En producción cachea por slug. */
export function compilarMdx(clave: string, cuerpo: string): Promise<MDXContent> {
  const usarCache = process.env.NODE_ENV === 'production';
  const enCache = usarCache ? cache.get(clave) : undefined;
  if (enCache) return enCache;
  const promesa = compilarMdxSinCache(cuerpo)
    .catch((error: unknown) => {
      cache.delete(clave);
      throw error;
    });
  if (usarCache) cache.set(clave, promesa);
  return promesa;
}
