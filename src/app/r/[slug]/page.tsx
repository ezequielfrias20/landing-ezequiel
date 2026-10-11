import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CajaNewsletter } from '@/componentes/CajaNewsletter';
import { componentesMdx } from '@/componentes/mdx';
import { Video } from '@/componentes/mdx/Video';
import { SiguientePaso } from '@/componentes/SiguientePaso';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import { crearIndice, metaRecurso, recursosRelacionados } from '@/lib/contenido/consultas';
import { compilarMdx } from '@/lib/contenido/mdx';
import { obtenerRecurso, obtenerRecursos } from '@/lib/contenido/recursos';

// Siempre dinámica: la cookie de acceso se evalúa en cada request.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  if (!recurso) return {};
  return { title: recurso.titulo, description: recurso.resumen, alternates: { canonical: `/r/${recurso.slug}` } };
}

export default async function PaginaRecurso({ params }: Props) {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  if (!recurso) notFound();

  const Contenido = await compilarMdx(recurso.slug, recurso.cuerpo);
  const relacionados = crearIndice(recursosRelacionados(recurso, obtenerRecursos()), new Date());
  const meta = metaRecurso(recurso);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-suave">
        <Link href="/recursos">Recursos</Link> / {ETIQUETAS_TIPO[recurso.tipo]}
      </nav>
      <header className="mt-4">
        <p className="text-sm font-medium uppercase tracking-wide">{ETIQUETAS_TIPO[recurso.tipo]}</p>
        <h1 className="mt-1 text-3xl font-bold">{recurso.titulo}</h1>
        <p className="mt-3 text-lg text-suave">{recurso.resumen}</p>
        {meta && <p className="mt-2 text-sm text-suave">{meta}</p>}
      </header>

      {recurso.video && <Video url={recurso.video} titulo={recurso.titulo} />}

      <article className="prose mt-8 max-w-none">
        <Contenido components={componentesMdx(recurso.slug)} />
      </article>

      {recurso.descargas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Descargas</h2>
          <ul className="mt-3 space-y-2">
            {recurso.descargas.map((d) => (
              <li key={d.archivo}>
                <a href={`/descargas/${d.archivo}`} className="underline">
                  {d.nombre}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiguientePaso />

      {relacionados.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Sigue con estos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relacionados.map((e) => (
              <TarjetaRecurso key={e.slug} entrada={e} />
            ))}
          </div>
        </section>
      )}

      <CajaNewsletter />
    </main>
  );
}
