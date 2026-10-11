import { marca } from '@/config/marca';

/** El momento de acento de la home: el único bloque lleno de terracota. */
export function ParaEmpresas() {
  return (
    <section className="revelar py-14 sm:py-20" aria-labelledby="para-empresas">
      {/* Relleno acento-pastilla con tinta encima: la pareja que da ≥4.5:1 en las dos paletas, a cualquier tamaño. */}
      <div className="relative overflow-hidden rounded-xl bg-acento-pastilla p-7 text-tinta shadow-brillo sm:p-10 lg:p-14">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 opacity-[0.14] sm:h-96 sm:w-96"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <circle cx="100" cy="100" r="40" />
          <circle cx="100" cy="100" r="64" />
          <circle cx="100" cy="100" r="88" />
        </svg>
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="etiqueta">Para empresas</p>
            <h2 id="para-empresas" className="titular mt-3 max-w-2xl text-[clamp(2.25rem,1.4rem+3.2vw,3.75rem)]">
              ¿Necesitas un equipo que lo implemente?
            </h2>
          </div>
          <div>
            <p className="max-w-md text-lg font-bold leading-relaxed">
              Cuando el proyecto es más grande que una llamada, lo diseñamos e implementamos desde {marca.agencia.nombre}.
            </p>
            <a
              href={marca.agencia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="boton mt-7 bg-tinta text-acento-pastilla hover:-translate-y-px"
            >
              Conocer {marca.agencia.nombre}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
