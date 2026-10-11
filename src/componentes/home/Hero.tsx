import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { marca } from '@/config/marca';

const retraso = (s: number) => ({ '--retraso': `${s}s` }) as CSSProperties;

export function Hero() {
  const instagram = marca.redes.find((r) => r.nombre === 'Instagram');
  return (
    <section className="grid items-center gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:pb-28 lg:pt-20">
      <div>
        <h1 className="aparecer etiqueta flex flex-wrap items-center gap-x-3 gap-y-1 text-suave">
          <span className="text-tinta">{marca.nombre}</span>
          <span aria-hidden="true" className="h-px w-6 bg-linea-fuerte" />
          <span>{marca.posicionamiento}</span>
        </h1>
        {/* El titular hace de subtítulo de reel: Inter 900 y una palabra en la pastilla del karaoke. */}
        <p
          className="aparecer mt-6 text-[clamp(2.875rem,1.4rem+6.2vw,6.25rem)] font-black leading-[0.95] tracking-display"
          style={retraso(0.08)}
        >
          Sistemas con IA que{' '}
          <span className="relative inline-block whitespace-nowrap rounded-[0.18em] bg-acento-pastilla px-[0.16em] pb-[0.04em] text-tinta">
            trabajan
          </span>{' '}
          por tu negocio.
        </p>
        <p className="aparecer mt-7 max-w-xl text-lg leading-relaxed text-suave sm:text-xl" style={retraso(0.16)}>
          {marca.descripcion}
        </p>
        <div className="aparecer mt-9 flex flex-wrap gap-3" style={retraso(0.24)}>
          <Link href="/recursos" className="boton boton-primario">
            Ver recursos
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="boton boton-secundario">
            {marca.diagnostico.boton}
          </a>
        </div>
      </div>

      <figure className="aparecer relative mx-auto w-full max-w-104 lg:max-w-none" style={retraso(0.18)}>
        <div className="panel overflow-hidden rounded-xl p-2">
          <div className="relative aspect-5/4 overflow-hidden rounded-[24px] sm:aspect-4/5">
            {/* 4:5 (o 5:4 anclado arriba en móvil) sobre una foto cuadrada: el recorte deja fuera la marca de agua de la esquina. */}
            <Image
              src={marca.foto}
              alt={marca.nombre}
              fill
              priority
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 26rem, 90vw"
              className="object-cover object-top sm:object-center"
            />
          </div>
        </div>
        {instagram && (
          <figcaption className="absolute -bottom-4 left-6 sm:left-8">
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chip panel bg-superficie px-3.5 py-2 text-tinta transition-transform hover:-translate-y-0.5"
            >
              {instagram.usuario}
            </a>
          </figcaption>
        )}
      </figure>
    </section>
  );
}
