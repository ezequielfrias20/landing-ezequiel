import Link from 'next/link';
import { SelectorTema } from '@/componentes/tema/SelectorTema';
import { marca } from '@/config/marca';

export function Encabezado() {
  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-fondo/80 backdrop-blur-md supports-backdrop-filter:bg-fondo/70">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 rounded-sm">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-acento transition-transform group-hover:scale-125" />
          <span className="text-[1.0625rem] font-black tracking-titulo">{marca.nombre}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/recursos"
            className="etiqueta rounded-full px-3 py-2 text-tinta transition-colors hover:bg-superficie-2"
          >
            Recursos
          </Link>
          <a
            href={marca.diagnostico.url}
            target="_blank"
            rel="noopener noreferrer"
            className="boton boton-secundario hidden min-h-9 px-4 py-1.5 text-sm md:inline-flex"
          >
            {marca.diagnostico.boton}
          </a>
          <SelectorTema />
        </div>
      </nav>
    </header>
  );
}
