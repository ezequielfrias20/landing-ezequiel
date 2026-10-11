import fs from 'node:fs';
import path from 'node:path';
import { leerRecursos, validarColeccion } from './analizar';
import type { Recurso } from './tipos';

export function dirRecursos(): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), process.env.DIR_RECURSOS ?? 'contenido/recursos');
}

export function dirDescargas(): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), process.env.DIR_DESCARGAS ?? 'contenido/descargas');
}

let cache: Recurso[] | null = null;

/** En producción lee y valida una sola vez; en desarrollo relee para ver cambios al instante. */
export function obtenerRecursos(): Recurso[] {
  const produccion = process.env.NODE_ENV === 'production';
  if (cache && produccion) return cache;
  const recursos = leerRecursos({ dir: dirRecursos(), incluirBorradores: !produccion });
  validarColeccion(recursos, (archivo) => fs.existsSync(path.join(dirDescargas(), archivo)));
  cache = recursos;
  return recursos;
}

export function obtenerRecurso(slug: string): Recurso | null {
  return obtenerRecursos().find((r) => r.slug === slug) ?? null;
}
