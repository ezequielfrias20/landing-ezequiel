import Link from 'next/link';
import { ETIQUETAS_TEMA, ETIQUETAS_TIPO } from '@/config/taxonomia';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export function TarjetaRecurso({ entrada }: { entrada: EntradaIndice }) {
  return (
    <Link
      href={`/r/${entrada.slug}`}
      className="group panel flex h-full flex-col rounded-lg p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-linea-fuerte hover:shadow-elevada"
    >
      <div className="flex items-center gap-2">
        <span className="chip bg-superficie-2 text-tinta">{ETIQUETAS_TIPO[entrada.tipo]}</span>
        {entrada.nuevo && <span className="chip border-transparent bg-acento-suave text-acento-texto">Nuevo</span>}
        {entrada.premium && (
          <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-linea text-suave">
            <svg
              role="img"
              aria-label="Incluye contenido premium"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
        )}
      </div>
      <h3 className="mt-5 text-xl font-black leading-[1.15] tracking-titulo">{entrada.titulo}</h3>
      <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-suave">{entrada.resumen}</p>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-linea pt-4">
        <p className="etiqueta truncate text-[0.6875rem] text-suave">
          {entrada.temas.map((t) => ETIQUETAS_TEMA[t]).join(' · ')}
        </p>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-suave transition-transform duration-300 group-hover:translate-x-1 group-hover:text-tinta"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
