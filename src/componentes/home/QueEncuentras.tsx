import Link from 'next/link';
import { esEnlaceExterno, ofertasVisibles } from '@/config/ofertas';

export function QueEncuentras() {
  const ofertas = ofertasVisibles();
  return (
    <section className="py-10">
      <h2 id="que-encuentras" className="text-2xl font-bold">
        Qué encuentras aquí
      </h2>
      <ol aria-label="Qué encuentras aquí" className="mt-6 divide-y divide-linea border-y border-linea">
        {ofertas.map((oferta, i) => {
          const contenido = (
            <>
              <span className="w-10 font-mono text-suave">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1">
                <span className="block font-semibold">{oferta.titulo}</span>
                <span className="block text-sm text-suave">{oferta.descripcion}</span>
              </span>
              {oferta.estado === 'proximamente' ? (
                <span className="rounded-full border border-linea px-2 py-0.5 text-xs">Próximamente</span>
              ) : (
                oferta.etiqueta && <span className="rounded-full border border-linea px-2 py-0.5 text-xs">{oferta.etiqueta}</span>
              )}
            </>
          );
          const clases = 'flex items-center gap-4 py-4';
          return (
            <li key={oferta.id}>
              {oferta.estado === 'proximamente' ? (
                <div className={clases}>{contenido}</div>
              ) : esEnlaceExterno(oferta.href) ? (
                <a href={oferta.href} target="_blank" rel="noopener noreferrer" className={clases}>
                  {contenido}
                </a>
              ) : (
                <Link href={oferta.href} className={clases}>
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
