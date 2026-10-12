import type { EntradaIndice, Recurso } from './tipos';
import { emailActivo } from '@/config/email';

const DIA_MS = 24 * 60 * 60 * 1000;

export function esNuevo(fecha: Date, ahora: Date): boolean {
  return ahora.getTime() - fecha.getTime() <= 14 * DIA_MS;
}

export function crearIndice(recursos: Recurso[], ahora: Date): EntradaIndice[] {
  return recursos.map((r) => ({
    slug: r.slug,
    titulo: r.titulo,
    resumen: r.resumen,
    palabraClave: r.palabraClave,
    tipo: r.tipo,
    temas: r.temas,
    herramientas: r.herramientas,
    nombresHerramientas: r.nombresHerramientas,
    fecha: r.fecha.toISOString().slice(0, 10),
    premium: r.premium && emailActivo(),
    nuevo: esNuevo(r.fecha, ahora),
  }));
}

export function recursosRelacionados(recurso: Recurso, todos: Recurso[], max = 3): Recurso[] {
  const otros = todos.filter((r) => r.slug !== recurso.slug);
  if (recurso.relacionados.length > 0) {
    return recurso.relacionados
      .map((slug) => otros.find((r) => r.slug === slug))
      .filter((r): r is Recurso => r !== undefined)
      .slice(0, max);
  }
  const enComun = (r: Recurso) => r.temas.filter((t) => recurso.temas.includes(t)).length;
  return otros
    .filter((r) => enComun(r) > 0)
    .sort((a, b) => enComun(b) - enComun(a) || b.fecha.getTime() - a.fecha.getTime())
    .slice(0, max);
}

export function buscarDuenoDescarga(
  archivo: string,
  recursos: Recurso[],
): { recurso: Recurso; premium: boolean } | null {
  const premium = recursos.find((r) => r.descargasPremium.includes(archivo));
  if (premium) return { recurso: premium, premium: true };
  const libre = recursos.find((r) => r.archivosDescarga.includes(archivo));
  return libre ? { recurso: libre, premium: false } : null;
}

export function metaRecurso(r: Pick<Recurso, 'pasos' | 'duracion'>): string {
  const partes: string[] = [];
  if (r.pasos > 0) partes.push(`${r.pasos} ${r.pasos === 1 ? 'paso' : 'pasos'}`);
  if (r.duracion) partes.push(r.duracion);
  return partes.join(' · ');
}
