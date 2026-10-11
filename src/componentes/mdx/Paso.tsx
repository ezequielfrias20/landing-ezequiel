import type { ReactNode } from 'react';

export function Paso({ n, titulo, children }: { n: string | number; titulo?: string; children: ReactNode }) {
  return (
    <section data-paso={n} className="my-8">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Paso {n}</p>
      {titulo && <h3 className="mt-1">{titulo}</h3>}
      <div>{children}</div>
    </section>
  );
}
