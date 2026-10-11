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
  // Activo: relleno de tinta (el contraste más alto de la paleta), sin gastar el acento.
  const chip = (activo: boolean) =>
    `chip min-h-9 shrink-0 px-3.5 transition-colors ${
      activo
        ? 'border-tinta bg-tinta text-fondo'
        : 'bg-superficie text-tinta hover:border-linea-fuerte hover:bg-superficie-2'
    }`;
  // El conteo va en su propio span pero dentro del nombre accesible: "Plantilla (1)".
  const conteoClase = (activo: boolean) => `font-normal ${activo ? '' : 'text-suave'}`;

  return (
    <fieldset className="grid min-w-0 gap-3 sm:grid-cols-[8.5rem_1fr] sm:items-start">
      <legend className="sr-only">{titulo}</legend>
      <p aria-hidden="true" className="etiqueta pt-2.5 text-suave">
        {titulo}
      </p>
      {/* En móvil cada grupo es una fila que se desliza de lado, a sangre, para no apilar tres bloques de chips. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        <button type="button" aria-pressed={valor === null} className={chip(valor === null)} onClick={() => alCambiar(null)}>
          Todos <span className={conteoClase(valor === null)}>({total})</span>
        </button>
        {visibles.map((o) => (
          <button key={o} type="button" aria-pressed={valor === o} className={chip(valor === o)} onClick={() => alCambiar(o)}>
            {etiquetas[o]} <span className={conteoClase(valor === o)}>({conteo[o]})</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
