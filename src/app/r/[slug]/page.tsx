import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { CajaNewsletter } from '@/componentes/CajaNewsletter';
import { componentesMdx } from '@/componentes/mdx';
import { Video } from '@/componentes/mdx/Video';
import { SiguientePaso } from '@/componentes/SiguientePaso';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import { emailActivo } from '@/config/email';
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
  if (!recurso || recurso.origen !== 'mdx') notFound();

  const Contenido = await compilarMdx(recurso.slug, recurso.cuerpo);
  const relacionados = crearIndice(recursosRelacionados(recurso, obtenerRecursos()), new Date());
  const meta = metaRecurso(recurso);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Ruta" className="etiqueta flex items-center gap-2 text-suave">
          <Link href="/recursos" className="rounded-sm text-tinta underline-offset-4 hover:underline">
            Recursos
          </Link>
          <span aria-hidden="true">/</span>
          <span>{ETIQUETAS_TIPO[recurso.tipo]}</span>
        </nav>
        <header className="mt-8 border-b border-linea-fuerte pb-10">
          <div className="aparecer flex flex-wrap items-center gap-2">
            <span className="chip bg-superficie-2 text-tinta">{ETIQUETAS_TIPO[recurso.tipo]}</span>
            {recurso.premium && emailActivo() && <span className="chip border-transparent bg-acento-suave text-acento-texto">Premium</span>}
          </div>
          <h1
            className="aparecer mt-6 text-[clamp(2.25rem,1.3rem+3.8vw,3.875rem)] font-black leading-[1.02] tracking-titular"
            style={{ '--retraso': '0.06s' } as CSSProperties}
          >
            {recurso.titulo}
          </h1>
          <p className="aparecer mt-6 text-lg leading-relaxed text-suave sm:text-xl" style={{ '--retraso': '0.12s' } as CSSProperties}>
            {recurso.resumen}
          </p>
          {(meta || recurso.herramientas.length > 0) && (
            <dl className="aparecer etiqueta mt-8 flex flex-wrap gap-x-8 gap-y-3" style={{ '--retraso': '0.18s' } as CSSProperties}>
              {meta && (
                <div className="flex gap-2">
                  <dt className="text-suave">Formato</dt>
                  <dd className="text-tinta">{meta}</dd>
                </div>
              )}
              {recurso.herramientas.length > 0 && (
                <div className="flex gap-2">
                  <dt className="text-suave">Herramientas</dt>
                  <dd className="text-tinta">{recurso.nombresHerramientas.join(' · ')}</dd>
                </div>
              )}
            </dl>
          )}
        </header>

        {recurso.video && <Video url={recurso.video} titulo={recurso.titulo} />}

        <article className="prose prose-marca mt-10 max-w-none sm:prose-lg">
          <Contenido components={componentesMdx(recurso.slug)} />
        </article>

        {recurso.descargas.length > 0 && (
          <section className="mt-12" aria-labelledby="descargas">
            <h2 id="descargas" className="etiqueta text-suave">
              Descargas
            </h2>
            <ul className="mt-4 border-t border-linea">
              {recurso.descargas.map((d) => (
                <li key={d.archivo} className="border-b border-linea">
                  <a href={`/descargas/${d.archivo}`} className="group flex items-center justify-between gap-4 py-4 font-bold">
                    {d.nombre}
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-suave transition-transform group-hover:translate-y-0.5 group-hover:text-tinta" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <SiguientePaso />
      </div>

      {relacionados.length > 0 && (
        <section className="revelar mt-20" aria-labelledby="relacionados">
          <p className="etiqueta text-suave">Relacionados</p>
          <h2 id="relacionados" className="titular mt-3 text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)]">
            Sigue con estos
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
