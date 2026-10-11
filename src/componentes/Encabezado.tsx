import Link from 'next/link';
import { marca } from '@/config/marca';

export function Encabezado() {
  return (
    <header className="border-b border-linea">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold">
          {marca.nombre}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/recursos">Recursos</Link>
          <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-acento px-3 py-1.5 font-medium text-white">
            {marca.diagnostico.boton}
          </a>
        </div>
      </nav>
    </header>
  );
}
