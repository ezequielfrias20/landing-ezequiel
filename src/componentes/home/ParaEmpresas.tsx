import { marca } from '@/config/marca';

export function ParaEmpresas() {
  return (
    <section className="my-10 rounded-lg border border-linea bg-superficie p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Para empresas</p>
      <h2 className="mt-1 text-2xl font-bold">¿Necesitas un equipo que lo implemente?</h2>
      <p className="mt-3 max-w-2xl text-suave">
        Cuando el proyecto es más grande que una llamada, lo diseñamos e implementamos desde {marca.agencia.nombre}.
      </p>
      <a href={marca.agencia.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-md border border-tinta px-4 py-2 font-medium">
        Conocer {marca.agencia.nombre}
      </a>
    </section>
  );
}
