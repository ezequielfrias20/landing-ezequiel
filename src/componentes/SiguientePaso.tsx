import { marca } from '@/config/marca';

export function SiguientePaso() {
  return (
    <section className="my-12 rounded-lg border border-linea bg-superficie p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">El siguiente paso</p>
      <h2 className="mt-1 text-xl font-semibold">¿Quieres que esto funcione en tu negocio?</h2>
      <p className="mt-2 text-suave">{marca.diagnostico.detalle}.</p>
      <a
        href={marca.diagnostico.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-md bg-acento px-4 py-2 font-medium text-white"
      >
        {marca.diagnostico.boton}
      </a>
    </section>
  );
}
