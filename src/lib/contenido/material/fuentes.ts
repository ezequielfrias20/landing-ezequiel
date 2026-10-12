import type { PaqueteMaterial } from './esquema';

/** Número de cada fuente por orden de primera aparición en los bloques (igual que ref() en armar.py). */
export function numerarFuentes(c: PaqueteMaterial['contenido']): Map<string, number> {
  const n = new Map<string, number>();
  for (const s of c.secciones) {
    for (const b of s.bloques) {
      const f = 'fuente' in b ? b.fuente : undefined;
      if (f && !n.has(f)) n.set(f, n.size + 1);
    }
  }
  return n;
}

export function fuentesCitadas(p: PaqueteMaterial) {
  const porId = new Map(p.fuentes.map((f) => [f.id, f]));
  return [...numerarFuentes(p.contenido)].flatMap(([id, n]) => {
    const f = porId.get(id);
    return f ? [{ id, n, titulo: f.titulo, url: f.url, dominio: new URL(f.url).hostname.replace(/^www\./, '') }] : [];
  });
}
