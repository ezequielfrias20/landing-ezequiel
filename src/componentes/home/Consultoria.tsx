import { marca } from '@/config/marca';

export function Consultoria() {
  const detalles = marca.diagnostico.detalle.split(' · ');
  return (
    <section className="revelar py-14 sm:py-20" aria-labelledby="consultoria">
      <div className="panel grid gap-10 rounded-xl p-7 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:p-14">
        <div>
          <p className="etiqueta text-suave">Consultoría</p>
          <h2 id="consultoria" className="titular mt-3 text-[clamp(2rem,1.3rem+2.6vw,3.25rem)]">
            Diagnóstico de automatización
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-suave">
            Me cuentas cómo funciona hoy tu negocio y vemos juntos qué conviene automatizar primero.
          </p>
          <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="boton boton-primario mt-8">
            {marca.diagnostico.boton}
          </a>
        </div>
        <dl className="border-t border-linea-fuerte">
          {detalles.map((d, i) => (
            <div key={d} className="flex items-baseline gap-5 border-b border-linea py-4">
              <dt className="font-mono text-sm font-bold text-suave">{String(i + 1).padStart(2, '0')}</dt>
              <dd className="font-mono text-sm uppercase tracking-etiqueta text-tinta">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
