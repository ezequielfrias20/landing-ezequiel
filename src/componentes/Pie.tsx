import Link from 'next/link';
import { marca } from '@/config/marca';

export function Pie() {
  return (
    <footer className="mt-16 border-t border-linea">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold">{marca.nombre}</p>
          <p className="mt-1 text-suave">{marca.posicionamiento}</p>
        </div>
        <ul className="flex flex-wrap gap-4" aria-label="Redes">
          {marca.redes.map((red) => (
            <li key={red.nombre}>
              <a href={red.url} target="_blank" rel="noopener noreferrer">
                {red.nombre}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-4">
          <Link href="/recursos">Recursos</Link>
          <a href={marca.agencia.url} target="_blank" rel="noopener noreferrer">
            Empresas: {marca.agencia.nombre}
          </a>
        </div>
      </div>
    </footer>
  );
}
