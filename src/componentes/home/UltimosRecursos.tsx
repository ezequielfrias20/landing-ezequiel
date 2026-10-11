import Link from 'next/link';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import type { EntradaIndice } from '@/lib/contenido/tipos';
import { EncabezadoSeccion } from './EncabezadoSeccion';

export function UltimosRecursos({ entradas }: { entradas: EntradaIndice[] }) {
  if (entradas.length === 0) return null;
  return (
    <section className="revelar py-14 sm:py-20" aria-labelledby="ultimos-recursos">
      <EncabezadoSeccion
        id="ultimos-recursos"
        etiqueta="Bóveda"
        titulo="Lo último en la bóveda"
        accion={
          <Link href="/recursos" className="etiqueta group inline-flex items-center gap-2 rounded-full py-2 text-tinta">
            Ver todos
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        }
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entradas.map((e) => (
          <TarjetaRecurso key={e.slug} entrada={e} />
        ))}
      </div>
    </section>
  );
}
