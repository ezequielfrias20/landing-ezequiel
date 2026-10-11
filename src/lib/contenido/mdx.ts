import { evaluate } from '@mdx-js/mdx';
import type { MDXContent } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';

const cache = new Map<string, Promise<MDXContent>>();

/** Compila el cuerpo MDX en el servidor. En producción cachea por slug. */
export function compilarMdx(clave: string, cuerpo: string): Promise<MDXContent> {
  const usarCache = process.env.NODE_ENV === 'production';
  const enCache = usarCache ? cache.get(clave) : undefined;
  if (enCache) return enCache;
  const promesa = evaluate(cuerpo, { ...runtime, remarkPlugins: [remarkGfm] })
    .then((modulo) => modulo.default)
    .catch((error: unknown) => {
      cache.delete(clave);
      throw error;
    });
  if (usarCache) cache.set(clave, promesa);
  return promesa;
}
