import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { compilarMdxSinCache } from './mdx';

const pasaHijos = ({ children }: { children?: ReactNode }) => createElement('div', null, children);
const nulo = () => null;

const COMPONENTES_PRUEBA = { Premium: pasaHijos, Paso: pasaHijos, Nota: pasaHijos, Prompt: pasaHijos, Video: nulo, Descarga: nulo };

/**
 * Compila y renderiza cada cuerpo MDX con componentes de prueba, con el mismo
 * pipeline que usa el sitio. Devuelve un error `archivo: mensaje` por cada fallo.
 */
export async function verificarRender(recursos: { archivo: string; cuerpo: string }[]): Promise<string[]> {
  const errores: string[] = [];
  for (const { archivo, cuerpo } of recursos) {
    try {
      const Contenido = await compilarMdxSinCache(cuerpo);
      renderToStaticMarkup(createElement(Contenido, { components: COMPONENTES_PRUEBA }));
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      errores.push(`${archivo}: ${mensaje.split('\n')[0]}`);
    }
  }
  return errores;
}
