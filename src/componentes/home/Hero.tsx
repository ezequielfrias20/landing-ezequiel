import Image from 'next/image';
import Link from 'next/link';
import { marca } from '@/config/marca';

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-8 py-12 sm:flex-row sm:items-center">
      <Image src={marca.foto} alt={marca.nombre} width={160} height={160} priority className="rounded-full" />
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-suave">{marca.posicionamiento}</p>
        <h1 className="mt-2 text-4xl font-bold">{marca.nombre}</h1>
        <p className="mt-3 max-w-xl text-lg text-suave">{marca.descripcion}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/recursos" className="rounded-md bg-acento px-4 py-2 font-medium text-white">
            Ver recursos
          </Link>
          <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-linea bg-superficie px-4 py-2 font-medium">
            {marca.diagnostico.boton}
          </a>
        </div>
      </div>
    </section>
  );
}
