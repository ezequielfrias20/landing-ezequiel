import { marca } from '@/config/marca';

export function Consultoria() {
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold">Diagnóstico de automatización</h2>
      <p className="mt-3 max-w-2xl text-suave">
        Me cuentas cómo funciona hoy tu negocio y vemos juntos qué conviene automatizar primero.
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide">{marca.diagnostico.detalle}</p>
      <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-md bg-acento px-4 py-2 font-medium text-white">
        {marca.diagnostico.boton}
      </a>
    </section>
  );
}
