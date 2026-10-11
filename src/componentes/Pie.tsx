import Link from 'next/link';
import { marca } from '@/config/marca';

export function Pie() {
  return (
    <footer className="mt-24 border-t border-linea">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="titular text-4xl sm:text-5xl">{marca.nombre}</p>
            <p className="etiqueta mt-4 text-suave">{marca.posicionamiento}</p>
          </div>
          <div>
            <p className="etiqueta text-suave">Redes</p>
            <ul className="mt-4 space-y-2.5" aria-label="Redes">
              {marca.redes.map((red) => (
                <li key={red.nombre}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-3 rounded-sm"
                  >
                    <span className="font-bold underline-offset-4 group-hover:underline">{red.nombre}</span>
                    <span className="font-mono text-xs text-suave">{red.usuario}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="etiqueta text-suave">Sitio</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/recursos" className="rounded-sm font-bold underline-offset-4 hover:underline">
                  Recursos
                </Link>
              </li>
              <li>
                <a
                  href={marca.diagnostico.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm font-bold underline-offset-4 hover:underline"
                >
                  {marca.diagnostico.boton}
                </a>
              </li>
              <li>
                <a
                  href={marca.agencia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm font-bold underline-offset-4 hover:underline"
                >
                  Empresas: {marca.agencia.nombre}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-linea pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="etiqueta text-suave">© {new Date().getFullYear()} {marca.nombre}</p>
          <p className="etiqueta text-suave">{marca.redes[0].usuario}</p>
        </div>
      </div>
    </footer>
  );
}
