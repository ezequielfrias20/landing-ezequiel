import type { ReactNode } from 'react';

export function Paso({ n, titulo, children }: { n: string | number; titulo?: string; children: ReactNode }) {
  const numero = /^\d+$/.test(String(n)) ? String(n).padStart(2, '0') : String(n);
  return (
    <section data-paso={n} className="my-14 border-t border-linea-fuerte pt-8 first:mt-8">
      <div className="not-prose flex items-start gap-5 sm:gap-7">
        <p className="shrink-0">
          <span className="etiqueta block text-suave">Paso</span>{' '}
          <span className="mt-1 block font-mono text-[3rem] font-bold leading-none tracking-titulo text-tinta sm:text-[4rem]">
            {numero}
          </span>
        </p>
        {titulo && (
          <h3 className="pt-6 text-2xl font-black leading-[1.1] tracking-titulo sm:pt-7 sm:text-[1.875rem]">{titulo}</h3>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
