import type { ReactNode } from 'react';

const TITULOS = { truco: 'El truco', ojo: 'Ojo' } as const;

export function Nota({ tipo = 'truco', children }: { tipo?: keyof typeof TITULOS; children: ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-lg border-l-4 border-acento bg-superficie p-4">
      <p className="font-semibold">{TITULOS[tipo]}</p>
      <div className="mt-1">{children}</div>
    </aside>
  );
}
