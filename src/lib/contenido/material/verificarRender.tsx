import { renderToStaticMarkup } from 'react-dom/server';
import { PaginaMaterial } from '@/componentes/material/PaginaMaterial';
import type { Recurso } from '../tipos';

/** Renderiza cada material con su página real. Devuelve `archivo: mensaje` por cada fallo. */
export function verificarRenderMateriales(recursos: Recurso[]): string[] {
  const errores: string[] = [];
  for (const r of recursos) {
    if (r.origen !== 'material') continue;
    try {
      renderToStaticMarkup(<PaginaMaterial recurso={r} />);
    } catch (error) {
      errores.push(`${r.archivo}: ${(error instanceof Error ? error.message : String(error)).split('\n')[0]}`);
    }
  }
  return errores;
}
