import type { ReactNode } from 'react';

/** Etiqueta mono + titular Inter 900: la cabecera de cada bloque de la home. */
export function EncabezadoSeccion({
  id,
  etiqueta,
  titulo,
  accion,
}: {
  id?: string;
  etiqueta: string;
  titulo: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p className="etiqueta text-suave">{etiqueta}</p>
        <h2 id={id} className="titular mt-3 text-[clamp(2rem,1.3rem+2.6vw,3.25rem)]">
          {titulo}
        </h2>
      </div>
      {accion}
    </div>
  );
}
