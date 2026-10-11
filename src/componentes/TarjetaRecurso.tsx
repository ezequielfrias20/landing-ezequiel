import Link from 'next/link';
import { ETIQUETAS_TEMA, ETIQUETAS_TIPO } from '@/config/taxonomia';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export function TarjetaRecurso({ entrada }: { entrada: EntradaIndice }) {
  return (
    <Link
      href={`/r/${entrada.slug}`}
      className="flex h-full flex-col rounded-lg border border-linea bg-superficie p-5 transition hover:border-tinta"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
        <span>{ETIQUETAS_TIPO[entrada.tipo]}</span>
        {entrada.nuevo && <span className="rounded bg-tinta px-1.5 py-0.5 text-white">Nuevo</span>}
        {entrada.premium && (
          <svg
            role="img"
            aria-label="Incluye contenido premium"
            viewBox="0 0 24 24"
            className="ml-auto h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{entrada.titulo}</h3>
      <p className="mt-1 flex-1 text-sm text-suave">{entrada.resumen}</p>
      <p className="mt-3 text-xs text-suave">{entrada.temas.map((t) => ETIQUETAS_TEMA[t]).join(' · ')}</p>
    </Link>
  );
}
