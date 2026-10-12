import {
  ETIQUETAS_TEMA, ETIQUETAS_TIPO, HERRAMIENTAS, TEMAS, TIPOS,
  type Tema, type TipoRecurso,
} from '@/config/taxonomia';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export interface Filtros {
  q: string;
  tipo: TipoRecurso | null;
  tema: Tema | null;
  herramienta: string | null;
}

export const FILTROS_VACIOS: Filtros = { q: '', tipo: null, tema: null, herramienta: null };

export function normalizarTexto(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function enLista<T extends string>(lista: readonly T[], valor: string | null): T | null {
  return valor !== null && (lista as readonly string[]).includes(valor) ? (valor as T) : null;
}

export function leerFiltros(params: URLSearchParams): Filtros {
  return {
    q: (params.get('q') ?? '').slice(0, 100),
    tipo: enLista(TIPOS, params.get('tipo')),
    tema: enLista(TEMAS, params.get('tema')),
    herramienta: enLista(HERRAMIENTAS, params.get('herramienta')),
  };
}

export function escribirFiltros(f: Filtros): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set('q', f.q.trim());
  if (f.tipo) params.set('tipo', f.tipo);
  if (f.tema) params.set('tema', f.tema);
  if (f.herramienta) params.set('herramienta', f.herramienta);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function hayFiltros(f: Filtros): boolean {
  return f.q.trim() !== '' || f.tipo !== null || f.tema !== null || f.herramienta !== null;
}

function textoBuscable(e: EntradaIndice): string {
  return normalizarTexto(
    [
      e.titulo,
      e.resumen,
      e.palabraClave ?? '',
      ETIQUETAS_TIPO[e.tipo],
      ...e.temas.map((t) => ETIQUETAS_TEMA[t]),
      ...e.nombresHerramientas,
    ].join(' '),
  );
}

export function filtrarRecursos(indice: EntradaIndice[], f: Filtros): EntradaIndice[] {
  const palabras = normalizarTexto(f.q).split(/\s+/).filter(Boolean);
  return indice.filter(
    (e) =>
      (!f.tipo || e.tipo === f.tipo) &&
      (!f.tema || e.temas.includes(f.tema)) &&
      (!f.herramienta || e.herramientas.includes(f.herramienta)) &&
      palabras.every((p) => textoBuscable(e).includes(p)),
  );
}

export function contarPor(indice: EntradaIndice[], campo: 'tipo' | 'temas' | 'herramientas'): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const e of indice) {
    const valores = campo === 'tipo' ? [e.tipo] : e[campo];
    for (const v of valores) conteo[v] = (conteo[v] ?? 0) + 1;
  }
  return conteo;
}
