import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { esquemaFrontmatter } from './esquema';
import type { Recurso } from './tipos';

export class ErrorContenido extends Error {}

const PATRON_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PATRON_PREMIUM = /<Premium>([\s\S]*?)<\/Premium>/g;
const PATRON_DESCARGA = /<Descarga[^>]*\barchivo="([^"]+)"/g;

function archivosEn(texto: string): string[] {
  return [...texto.matchAll(PATRON_DESCARGA)].map((m) => m[1]);
}

function extraerDescargasPremium(cuerpo: string): string[] {
  const bloques = [...cuerpo.matchAll(PATRON_PREMIUM)].map((m) => m[1]);
  return [...new Set(bloques.flatMap(archivosEn))];
}

export function analizarRecurso(archivo: string, fuente: string): Recurso {
  const slug = path.basename(archivo, '.mdx');
  if (!PATRON_SLUG.test(slug)) {
    throw new ErrorContenido(`${archivo}: el nombre debe ir en minúsculas y con guiones (ej. checklist-erp.mdx)`);
  }
  const { data, content } = matter(fuente);
  const resultado = esquemaFrontmatter.safeParse(data);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => `  - ${i.path.join('.') || '(frontmatter)'}: ${i.message}`)
      .join('\n');
    throw new ErrorContenido(`${archivo}: frontmatter inválido\n${detalle}`);
  }
  const front = resultado.data;
  return {
    ...front,
    slug,
    archivo,
    cuerpo: content,
    premium: /<Premium>/.test(content),
    pasos: (content.match(/<Paso[\s>]/g) ?? []).length,
    archivosDescarga: [...new Set([...front.descargas.map((d) => d.archivo), ...archivosEn(content)])],
    descargasPremium: extraerDescargasPremium(content),
  };
}

export function leerRecursos({ dir, incluirBorradores }: { dir: string; incluirBorradores: boolean }): Recurso[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => analizarRecurso(f, fs.readFileSync(path.join(dir, f), 'utf8')))
    .filter((r) => incluirBorradores || !r.borrador)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || a.slug.localeCompare(b.slug));
}

export function normalizarClave(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
}

export function validarColeccion(recursos: Recurso[], existeDescarga: (archivo: string) => boolean): void {
  const errores: string[] = [];
  const slugs = new Set(recursos.map((r) => r.slug));
  const claves = new Map<string, string>();

  for (const r of recursos) {
    if (r.palabraClave) {
      const clave = normalizarClave(r.palabraClave);
      const otro = claves.get(clave);
      if (otro) errores.push(`${r.archivo}: la palabra clave ${clave} ya la usa ${otro}`);
      else claves.set(clave, r.archivo);
    }
    for (const rel of r.relacionados) {
      if (!slugs.has(rel)) errores.push(`${r.archivo}: relacionados incluye "${rel}", que no existe`);
    }
    for (const archivo of r.archivosDescarga) {
      if (!existeDescarga(archivo)) errores.push(`${r.archivo}: la descarga "${archivo}" no está en contenido/descargas/`);
    }
    for (const d of r.descargas) {
      if (r.descargasPremium.includes(d.archivo)) {
        errores.push(`${r.archivo}: "${d.archivo}" está en descargas (libre) y dentro de <Premium>; déjalo en un solo lugar`);
      }
    }
  }
  if (errores.length > 0) throw new ErrorContenido(errores.join('\n'));
}
