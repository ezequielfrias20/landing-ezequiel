import type { ReactNode } from 'react';

const TITULOS = { truco: 'El truco', ojo: 'Ojo' } as const;

export function Nota({ tipo = 'truco', children }: { tipo?: keyof typeof TITULOS; children: ReactNode }) {
  const truco = tipo === 'truco';
  return (
    <aside className="not-prose panel relative my-8 overflow-hidden rounded-md py-5 pl-6 pr-5 sm:pl-7">
      {/* Filete lateral: acento para el truco, aviso para el ojo. */}
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${truco ? 'bg-acento' : 'bg-aviso'}`} />
      <p className={`etiqueta font-bold ${truco ? 'text-acento-texto' : 'text-tinta'}`}>{TITULOS[tipo]}</p>
      <div className="mt-2 leading-relaxed [&_p]:mt-2 [&_p:first-child]:mt-0 [&_strong]:font-bold">{children}</div>
    </aside>
  );
}
