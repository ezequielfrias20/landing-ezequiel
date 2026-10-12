import { Video } from '@/componentes/mdx/Video';
import { marca } from '@/config/marca';
import { fuentesCitadas, numerarFuentes } from '@/lib/contenido/material/fuentes';
import type { RecursoMaterial } from '@/lib/contenido/tipos';
import { BloqueMaterial } from './Bloque';
import { Icono } from './Iconos';
import { Logo } from './Logo';
import { Parrafos, TextoMarcado } from './TextoMarcado';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fechaLarga = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
};

function BotonPdf({ archivo }: { archivo: string }) {
  return (
    <a href={`/descargas/${archivo}`} className="boton boton-primario">
      <Icono nombre="download" className="h-4 w-4" />
      Descargar el PDF
    </a>
  );
}

export function PaginaMaterial({ recurso }: { recurso: RecursoMaterial }) {
  const p = recurso.material;
  const c = p.contenido;
  const refs = numerarFuentes(c);
  const fuentes = fuentesCitadas(p);
  const etq = 'etiqueta flex items-center gap-2 font-bold';
  return (
    <div data-material={recurso.slug}>
      {/* Portada */}
      <header className="mt-8 border-b border-linea-fuerte pb-10">
        <div className="etiqueta flex justify-between text-suave">
          <span>Material de apoyo</span>
          <span className="text-acento-texto">{c.palabra}</span>
        </div>
        {c.portada.herramientas.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {c.portada.herramientas.map((h) => p.herramientas[h] && <Logo key={h} herramienta={p.herramientas[h]} materialSlug={recurso.slug} tam="lg" />)}
          </div>
        )}
        <h1 className="mt-8 text-[clamp(2.5rem,1.4rem+4.4vw,4.25rem)] font-black leading-[0.98] tracking-titular">
          <TextoMarcado texto={c.portada.titulo} />
          {c.portada.acento && (
            <>
              <br />
              <em className="not-italic text-acento-texto">
                <TextoMarcado texto={c.portada.acento} />
              </em>
            </>
          )}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-suave sm:text-xl">
          <TextoMarcado texto={c.portada.subtitulo} />
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-linea pt-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto fija de la marca */}
            <img src={marca.foto} alt={marca.nombre} className="h-12 w-12 rounded-full border-2 border-acento object-cover" />
            <div>
              <b className="block font-mono text-sm tracking-wide">{marca.nombre}</b>
              <span className="text-sm text-suave">{marca.redes[0].usuario}</span>
            </div>
          </div>
          <span className="font-mono text-xs text-suave">Verificado el {fechaLarga(c.verificado)}</span>
        </div>
        <div className="mt-8">
          <BotonPdf archivo={p.pdf} />
        </div>
      </header>

      {recurso.video && <Video url={recurso.video} titulo={recurso.titulo} />}

      {/* Lo que te llevas */}
      <section className="mt-12" aria-labelledby="te-llevas">
        <h2 id="te-llevas" className="titular text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)]">
          Lo que te llevas
        </h2>
        <ul className="mt-6 grid gap-3">
          {c.te_llevas.puntos.map((x, i) => (
            <li key={i} className="panel flex items-start gap-4 rounded-lg p-5">
              <Icono nombre="circle-check" className="mt-0.5 h-6 w-6 text-acento-texto" />
              <span className="text-lg">
                <TextoMarcado texto={x} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {([
            ['clock', 'Tiempo', c.te_llevas.tiempo],
            ['arrow-right', 'Empieza por', c.te_llevas.empieza_por],
          ] as const).map(([ico, t, v]) => (
            <div key={t} className="rounded-lg bg-tinta p-5 text-fondo">
              <p className={`${etq} text-acento`}>
                <Icono nombre={ico} />
                {t}
              </p>
              <p className="mt-2 text-lg font-bold">
                <TextoMarcado texto={v} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Secciones */}
      {c.secciones.map((s, i) => (
        <section key={s.id} id={s.id} className="mt-16 border-t border-linea-fuerte pt-8">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-acento-texto">{String(i + 1).padStart(2, '0')}</p>
          <h2 className="titular mt-2 text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)]">
            <TextoMarcado texto={s.titulo} />
          </h2>
          <div className="mt-6 grid gap-6">
            {s.bloques.map((b, j) => (
              <BloqueMaterial key={j} bloque={b} materialSlug={recurso.slug} herramientas={p.herramientas} refs={refs} />
            ))}
          </div>
        </section>
      ))}

      {/* Lo que viene después */}
      <section className="mt-16 rounded-xl bg-tinta p-7 text-fondo sm:p-10" aria-labelledby="despues">
        <p className={`${etq} text-acento`}>
          <Icono nombre="sparkles" />
          Lo que viene después
        </p>
        <h2 id="despues" className="titular mt-3 text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)]">
          <TextoMarcado texto={c.despues.titulo} />
        </h2>
        <Parrafos texto={c.despues.texto} className="mt-5 grid gap-4 text-lg opacity-90" />
      </section>

      {/* Fuentes */}
      {fuentes.length > 0 && (
        <section className="mt-16" aria-labelledby="fuentes">
          <h2 id="fuentes" className="titular text-[clamp(1.5rem,1.1rem+1.4vw,2rem)]">
            Fuentes
          </h2>
          <p className="mt-3 text-suave">
            Todo lo que afirma este material sale de aquí, verificado el {fechaLarga(c.verificado)}. Los precios y los límites cambian: si lo lees más
            adelante, revisa la fuente.
          </p>
          <ol className="mt-5 grid list-decimal gap-3 pl-6 marker:font-mono marker:font-bold marker:text-acento-texto">
            {fuentes.map((f) => (
              <li key={f.id} id={`fuente-${f.id}`} className="scroll-mt-24">
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-bold underline-offset-4 hover:underline">
                  {f.titulo}
                </a>
                <span className="block break-all font-mono text-xs text-suave">{f.dominio}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-12">
        <BotonPdf archivo={p.pdf} />
      </div>
    </div>
  );
}
