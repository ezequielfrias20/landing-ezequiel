import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Boveda } from '@/componentes/boveda/Boveda';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import { crearIndice } from '@/lib/contenido/consultas';
import { obtenerRecursos } from '@/lib/contenido/recursos';

// Recalcula a diario para que la etiqueta "Nuevo" no quede vieja entre deploys.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Recursos',
  description: 'Prompts, plantillas y guías paso a paso de todo lo que comparto en redes.',
  alternates: { canonical: '/recursos' },
};

export default function PaginaRecursos() {
  const indice = crearIndice(obtenerRecursos(), new Date());
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Bóveda</p>
      <h1 className="mt-1 text-3xl font-bold">Recursos</h1>
      <p className="mt-2 max-w-2xl text-suave">
        Prompts, plantillas y guías paso a paso de todo lo que comparto en redes. Si llegaste desde un reel, búscalo
        por su nombre o por la palabra que comentaste.
      </p>
      {/* El fallback muestra todas las tarjetas sin filtros: sirve para SEO y sin JavaScript. */}
      <Suspense
        fallback={
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {indice.map((e) => (
              <TarjetaRecurso key={e.slug} entrada={e} />
            ))}
          </div>
        }
      >
        <Boveda indice={indice} />
      </Suspense>
    </main>
  );
}
