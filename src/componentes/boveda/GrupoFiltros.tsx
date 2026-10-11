'use client';

interface Props<T extends string> {
  titulo: string;
  opciones: readonly T[];
  etiquetas: Record<T, string>;
  conteo: Record<string, number>;
  total: number;
  valor: T | null;
  alCambiar: (valor: T | null) => void;
}

export function GrupoFiltros<T extends string>({ titulo, opciones, etiquetas, conteo, total, valor, alCambiar }: Props<T>) {
  const visibles = opciones.filter((o) => (conteo[o] ?? 0) > 0);
  if (visibles.length === 0) return null;
  const chip = (activo: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${activo ? 'border-tinta bg-tinta text-white' : 'border-linea bg-superficie'}`;

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mb-1 w-full text-xs font-medium uppercase tracking-wide text-suave">{titulo}</legend>
      <button type="button" aria-pressed={valor === null} className={chip(valor === null)} onClick={() => alCambiar(null)}>
        Todos ({total})
      </button>
      {visibles.map((o) => (
        <button key={o} type="button" aria-pressed={valor === o} className={chip(valor === o)} onClick={() => alCambiar(o)}>
          {etiquetas[o]} ({conteo[o]})
        </button>
      ))}
    </fieldset>
  );
}
