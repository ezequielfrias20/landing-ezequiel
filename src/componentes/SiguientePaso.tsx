import { marca } from '@/config/marca';

export function SiguientePaso() {
  return (
    <section className="revelar panel my-14 rounded-xl p-7 sm:p-10" aria-labelledby="siguiente-paso">
      <p className="etiqueta text-suave">El siguiente paso</p>
      <h2 id="siguiente-paso" className="titular mt-3 text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] leading-[1.05]">
        ¿Quieres que esto funcione en tu negocio?
      </h2>
      <p className="etiqueta mt-5 leading-relaxed text-tinta">{marca.diagnostico.detalle}</p>
      <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="boton boton-primario mt-7">
        {marca.diagnostico.boton}
      </a>
    </section>
  );
}
