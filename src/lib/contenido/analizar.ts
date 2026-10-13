import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { ETIQUETAS_HERRAMIENTA } from '@/config/taxonomia';
import { esquemaFrontmatter, PATRON_ARCHIVO_DESCARGA } from './esquema';
import { imagenesDe } from './material/analizar';
import type { Recurso, RecursoMdx } from './tipos';

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

const COMPONENTES = ['Premium', 'Paso', 'Prompt', 'Nota', 'Descarga', 'Video'];
const PATRON_ETIQUETA_COMPONENTE = /<\/?(premium|paso|prompt|nota|descarga|video)\b/gi;

/** Etiquetas de componentes escritas con otra capitalización: MDX las trataría como HTML y no como componente. */
function erroresDeMayusculas(archivo: string, cuerpo: string): string[] {
  const errores: string[] = [];
  for (const m of cuerpo.matchAll(PATRON_ETIQUETA_COMPONENTE)) {
    const escrito = m[1];
    const correcto = COMPONENTES.find((c) => c.toLowerCase() === escrito.toLowerCase())!;
    if (escrito === correcto) continue;
    const etiqueta = m[0].slice(1).startsWith('/') ? `</${escrito}>` : `<${escrito}>`;
    const debe = m[0].startsWith('</') ? `</${correcto}>` : `<${correcto}>`;
    errores.push(
      correcto === 'Video'
        ? `${archivo}: ${etiqueta} en minúsculas es HTML, no el componente; usa <Video url="…" />`
        : `${archivo}: ${etiqueta} debe escribirse ${debe} (con mayúscula inicial exacta)`,
    );
  }
  return [...new Set(errores)];
}

function contar(texto: string, patron: RegExp): number {
  return [...texto.matchAll(patron)].length;
}

export function analizarRecurso(archivo: string, fuente: string): RecursoMdx {
  const slug = path.basename(archivo, '.mdx');
  if (!PATRON_SLUG.test(slug)) {
    throw new ErrorContenido(`${archivo}: el nombre debe ir en minúsculas y con guiones (ej. checklist-erp.mdx)`);
  }
  let parseado: matter.GrayMatterFile<string>;
  try {
    // Con opciones, gray-matter no usa su caché (que tras un YAML roto devolvería datos vacíos).
    parseado = matter(fuente, {});
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new ErrorContenido(`${archivo}: el frontmatter no es YAML válido\n  - ${mensaje}`);
  }
  const { data, content } = parseado;
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
    origen: 'mdx',
    slug,
    archivo,
    cuerpo: content,
    nombresHerramientas: front.herramientas.map((h) => ETIQUETAS_HERRAMIENTA[h]),
    premium: /<Premium>/.test(content),
    pasos: (content.match(/<Paso[\s>]/g) ?? []).length,
    archivosDescarga: [...new Set([...front.descargas.map((d) => d.archivo), ...archivosEn(content)])],
    descargasPremium: extraerDescargasPremium(content),
  };
}

export function leerRecursos({ dir, incluirBorradores }: { dir: string; incluirBorradores: boolean }): RecursoMdx[] {
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

export function validarColeccion(
  recursos: Recurso[],
  existeDescarga: (archivo: string) => boolean,
  existeImagen: (slug: string, rel: string) => boolean,
): void {
  const errores: string[] = [];
  const slugs = new Set(recursos.map((r) => r.slug));
  const claves = new Map<string, string>();
  const vistos = new Map<string, string>();
  for (const r of recursos) {
    const otro = vistos.get(r.slug);
    if (otro) errores.push(`${r.archivo}: el slug ${r.slug} ya lo usa ${otro}`);
    else vistos.set(r.slug, r.archivo);
  }

  for (const r of recursos) {
    if (r.origen === 'mdx' && r.palabraClave) {
      const clave = normalizarClave(r.palabraClave);
      const otro = claves.get(clave);
      if (otro) errores.push(`${r.archivo}: la palabra clave ${clave} ya la usa ${otro}`);
      else claves.set(clave, r.archivo);
    }
    if (r.origen === 'mdx') {
      if (/<Premium\b(?!>)/.test(r.cuerpo) || contar(r.cuerpo, /<Premium>/g) !== contar(r.cuerpo, /<\/Premium>/g)) {
        errores.push(`${r.archivo}: escribe el bloque premium exactamente como <Premium> … </Premium>`);
      }
      errores.push(...erroresDeMayusculas(r.archivo, r.cuerpo));
      const enCuerpo = archivosEn(r.cuerpo);
      if (contar(r.cuerpo, /<Descarga\b/g) !== enCuerpo.length) {
        errores.push(`${r.archivo}: cada <Descarga> necesita archivo="nombre.ext" entre comillas dobles`);
      }
      for (const archivo of enCuerpo) {
        if (!PATRON_ARCHIVO_DESCARGA.test(archivo)) {
          errores.push(`${r.archivo}: el archivo "${archivo}" de <Descarga> debe ir en minúsculas, números, punto, guion o guion bajo`);
        }
      }
    }
    if (r.origen === 'material') {
      for (const rel of imagenesDe(r.material)) {
        if (!existeImagen(r.slug, rel)) errores.push(`${r.archivo}: falta ${rel} en materiales/${r.slug}/`);
      }
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
