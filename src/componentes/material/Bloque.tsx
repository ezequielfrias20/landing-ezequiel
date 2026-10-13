import { CajaPrompt } from '@/componentes/mdx/CajaPrompt';
import type { Bloque, PaqueteMaterial } from '@/lib/contenido/material/esquema';
import { CodigoCopiable } from './CodigoCopiable';
import { Icono } from './Iconos';
import { Logo } from './Logo';
import { TextoMarcado } from './TextoMarcado';

type Props = { bloque: Bloque; materialSlug: string; herramientas: PaqueteMaterial['herramientas']; refs: Map<string, number> };

const etiqueta = 'etiqueta flex items-center gap-2 font-bold';

function Ref({ id, refs, className = '' }: { id?: string; refs: Map<string, number>; className?: string }) {
  const n = id ? refs.get(id) : undefined;
  if (!n) return null;
  return (
    <sup className={`ml-0.5 font-mono text-[0.65em] font-bold text-acento-texto ${className}`}>
      <a href={`#fuente-${id}`} aria-label={`Fuente ${n}`}>{n}</a>
    </sup>
  );
}

export function BloqueMaterial({ bloque: b, materialSlug, herramientas, refs }: Props) {
  switch (b.tipo) {
    case 'pagina':
      return null;
    case 'haz':
      return (
        <div className="rounded-xl bg-tinta p-6 text-fondo sm:p-7">
          <p className={`${etiqueta} text-acento`}><Icono nombre="arrow-right" />Haz esto</p>
          <p className="mt-3 text-lg font-bold leading-snug sm:text-xl"><TextoMarcado texto={b.texto} /></p>
        </div>
      );
    case 'pasos':
      return (
        <ol className="grid gap-5">
          {b.items.map((it, i) => (
            <li key={i} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-acento font-mono text-sm font-bold text-sobre-acento">{i + 1}</span>
              <div className="min-w-0 pt-1.5">
                <p className="leading-relaxed"><TextoMarcado texto={it.texto} /></p>
                {it.codigo && <CodigoCopiable codigo={it.codigo} />}
              </div>
            </li>
          ))}
        </ol>
      );
    case 'prompt':
      return <CajaPrompt titulo={`Prompt · ${b.titulo}`} texto={b.texto} marcador="llaves" />;
    case 'checklist':
      return (
        <ul className="grid gap-3">
          {b.items.map((x, i) => (
            <li key={i} className="panel flex items-start gap-4 rounded-lg px-5 py-4">
              <span aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 rounded-[6px] border-2 border-acento" />
              <span><TextoMarcado texto={x} /></span>
            </li>
          ))}
        </ul>
      );
    case 'comparativa':
      return (
        <div className="panel overflow-x-auto rounded-lg">
          <table className="w-full min-w-[28rem] border-collapse text-[0.9375rem]">
            <thead>
              <tr className="bg-superficie-2">
                {b.columnas.map((c, i) => <th key={i} className="etiqueta px-4 py-3 text-left text-suave">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {b.filas.map((f, i) => (
                <tr key={i} className="border-t border-linea">
                  {f.map((x, j) => <td key={j} className={`px-4 py-3 align-top ${j === 0 ? 'font-bold' : ''}`}><TextoMarcado texto={x} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'herramienta': {
      const h = herramientas[b.slug] ?? { nombre: b.nombre, logo: `logos/${b.slug}.svg`, fondo: '#FFFFFF' };
      return (
        <div className="panel relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-xl p-5 transition-colors hover:border-linea-fuerte">
          <Logo herramienta={h} materialSlug={materialSlug} tam="lg" decorativa />
          <div>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xl font-black tracking-titulo after:absolute after:inset-0">{b.nombre}</a>
            <p className="mt-1 text-suave"><TextoMarcado texto={b.que_hace} /></p>
            <span className="mt-2 inline-block rounded-full bg-ok/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-ok">
              {b.precio}
            </span>
            <Ref id={b.fuente} refs={refs} className="relative z-10" />
          </div>
        </div>
      );
    }
    case 'captura':
      return (
        <figure className="grid gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- captura servida por la ruta del material */}
          <img src={`/materiales/${materialSlug}/capturas/${b.archivo}`} alt="" loading="lazy" className="block max-h-[34rem] w-full rounded-lg border border-linea object-cover object-top" />
          <figcaption className="text-sm text-suave"><TextoMarcado texto={b.pie} /><Ref id={b.fuente} refs={refs} /></figcaption>
        </figure>
      );
    case 'ejemplo': {
      const [a, d] = b.etiquetas ?? ['Antes', 'Después'];
      return (
        <div className="grid gap-3">
          <p className={`${etiqueta} text-acento-texto`}><Icono nombre="lightbulb" />{`Ejemplo · ${b.titulo}`}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="panel rounded-lg p-5">
              <span className="etiqueta block text-suave">{a}</span>
              <p className="mt-2 whitespace-pre-line"><TextoMarcado texto={b.antes} /></p>
            </div>
            <div className="rounded-lg border border-acento bg-acento-suave p-5">
              <span className="etiqueta block text-acento-texto">{d}</span>
              <p className="mt-2 whitespace-pre-line"><TextoMarcado texto={b.despues} /></p>
            </div>
          </div>
        </div>
      );
    }
    case 'dato':
      return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 border-y-2 border-tinta py-5">
          <span className="text-5xl font-black leading-none tracking-titular text-acento-texto sm:text-6xl">{b.valor}</span>
          <p className="text-lg"><TextoMarcado texto={b.texto} /><Ref id={b.fuente} refs={refs} /></p>
        </div>
      );
    case 'ojo':
      return (
        <div className="flex gap-4 rounded-xl bg-aviso/15 p-5 sm:p-6">
          <Icono nombre="triangle-alert" className="mt-0.5 h-6 w-6 text-aviso" />
          <p><strong>Ojo con esto:</strong> <TextoMarcado texto={b.texto} /></p>
        </div>
      );
    case 'micro':
      return (
        <div className="flex items-start gap-4 rounded-xl bg-acento p-5 text-sobre-acento sm:p-6">
          <Icono nombre="zap" className="mt-1 h-6 w-6" />
          <div>
            <p className="etiqueta opacity-85">Micro-paso · hoy, en 10 minutos</p>
            <p className="mt-2 text-lg font-bold leading-snug"><TextoMarcado texto={b.texto} /></p>
          </div>
        </div>
      );
  }
}
