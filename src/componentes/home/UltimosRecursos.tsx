import Link from 'next/link';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export function UltimosRecursos({ entradas }: { entradas: EntradaIndice[] }) {
  if (entradas.length === 0) return null;
  return (
    <section className="py-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Lo último en la bóveda</h2>
        <Link href="/recursos" className="text-sm underline">
          Ver todos
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entradas.map((e) => (
          <TarjetaRecurso key={e.slug} entrada={e} />
        ))}
      </div>
    </section>
  );
}
