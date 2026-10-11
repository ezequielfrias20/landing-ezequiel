import Link from 'next/link';
import { esEnlaceExterno, ofertasVisibles } from '@/config/ofertas';
import { EncabezadoSeccion } from './EncabezadoSeccion';

export function QueEncuentras() {
  const ofertas = ofertasVisibles();
  return (
    <section className="revelar py-14 sm:py-20" aria-labelledby="que-encuentras">
      <EncabezadoSeccion id="que-encuentras" etiqueta="Índice" titulo="Qué encuentras aquí" />
      <ol aria-label="Qué encuentras aquí" className="mt-10 border-t border-linea-fuerte">
        {ofertas.map((oferta, i) => {
          const proximamente = oferta.estado === 'proximamente';
          const contenido = (
            <>
              {/* Filete de acento que entra al pasar o enfocar: la fila se ilumina. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-acento transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100"
              />
              <span className="w-12 shrink-0 font-mono text-[1.75rem] font-bold leading-none tracking-titulo text-suave transition-colors group-hover:text-acento-texto group-focus-visible:text-acento-texto sm:w-24 sm:text-[3.5rem]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-black leading-tight tracking-titulo sm:text-[1.75rem]">{oferta.titulo}</span>
                <span className="mt-1.5 block max-w-xl text-[0.9375rem] leading-relaxed text-suave">{oferta.descripcion}</span>
                {(proximamente || oferta.etiqueta) && (
                  <span className={`chip mt-3 sm:hidden ${proximamente ? 'text-suave' : 'text-tinta'}`}>
                    {proximamente ? 'Próximamente' : oferta.etiqueta}
                  </span>
                )}
              </span>
              <span className="hidden shrink-0 sm:block">
                {proximamente ? (
                  <span className="chip text-suave">Próximamente</span>
                ) : (
                  oferta.etiqueta && <span className="chip text-tinta">{oferta.etiqueta}</span>
                )}
              </span>
              {!proximamente && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-1 h-5 w-5 shrink-0 text-suave transition-transform sm:mt-0 duration-300 group-hover:translate-x-1 group-hover:text-acento-texto group-focus-visible:text-acento-texto"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {esEnlaceExterno(oferta.href) ? <path d="M7 17 17 7M9 7h8v8" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
                </svg>
              )}
            </>
          );
          const clases =
            'group relative flex items-start gap-4 py-6 pl-1 pr-2 sm:items-center transition-colors sm:gap-6 sm:py-8 sm:pl-4 sm:pr-4';
          const interactivas = `${clases} outline-offset-[-2px] hover:bg-superficie/60 focus-visible:bg-superficie/60`;
          return (
            <li key={oferta.id} className="border-b border-linea">
              {proximamente ? (
                <div className={clases}>{contenido}</div>
              ) : esEnlaceExterno(oferta.href) ? (
                <a href={oferta.href} target="_blank" rel="noopener noreferrer" className={interactivas}>
                  {contenido}
                </a>
              ) : (
                <Link href={oferta.href} className={interactivas}>
                  {contenido}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
