import type { Metadata } from 'next';
import { Suspense, type CSSProperties } from 'react';
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
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
      <p className="etiqueta aparecer text-suave">Bóveda · {indice.length} recursos</p>
      <h1 className="titular aparecer mt-4 text-[clamp(3rem,1.6rem+5.6vw,6rem)] tracking-display" style={{ '--retraso': '0.06s' } as CSSProperties}>
        Recursos
      </h1>
      <p className="aparecer mt-5 max-w-2xl text-lg leading-relaxed text-suave" style={{ '--retraso': '0.12s' } as CSSProperties}>
        Prompts, plantillas y guías paso a paso de todo lo que comparto en redes. Si llegaste desde un reel, búscalo
        por su nombre o por la palabra que comentaste.
      </p>
      {/* El fallback muestra todas las tarjetas sin filtros: sirve para SEO y sin JavaScript. */}
      <Suspense
        fallback={
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
