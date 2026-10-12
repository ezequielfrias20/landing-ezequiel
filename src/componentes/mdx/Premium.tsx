import { cookies } from 'next/headers';
import type { ReactElement, ReactNode } from 'react';
import { FormularioEmail } from '@/componentes/FormularioEmail';
import { emailActivo } from '@/config/email';
import { NOMBRE_COOKIE, secretoAcceso, verificarToken } from '@/lib/acceso/token';

export async function Premium({ slug, children }: { slug: string; children: ReactNode }): Promise<ReactElement> {
  if (!emailActivo()) return <div data-premium="libre">{children}</div>;
  const almacen = await cookies();
  const acceso = verificarToken(almacen.get(NOMBRE_COOKIE)?.value, secretoAcceso());
  if (acceso) return <div data-premium="desbloqueado">{children}</div>;

  return (
    <aside
      data-premium="bloqueado"
      className="not-prose relative my-12 overflow-hidden rounded-xl border border-acento bg-superficie p-7 shadow-brillo sm:p-10"
    >
      {/* Líneas de texto fingidas y desvanecidas: sugieren que el recurso sigue, sin enviar nada de él. */}
      <div aria-hidden="true" className="pointer-events-none mb-8 space-y-3 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]">
        <div className="h-3 w-11/12 rounded-full bg-superficie-3" />
        <div className="h-3 w-9/12 rounded-full bg-superficie-3" />
        <div className="h-3 w-10/12 rounded-full bg-superficie-3" />
      </div>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-acento-suave text-acento-texto">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
        <p className="etiqueta font-bold text-acento-texto">Contenido premium</p>
      </div>
      <p className="mt-5 text-[clamp(1.5rem,1.1rem+1.4vw,2rem)] font-black leading-[1.1] tracking-titulo">
        El resto de este recurso es para la comunidad
      </p>
      <p className="mt-3 max-w-xl leading-relaxed text-suave">
        Deja tu email y lo desbloqueas al instante, junto con todos los demás recursos premium.
      </p>
      <div className="mt-7">
        <FormularioEmail endpoint="/api/desbloquear" slug={slug} textoBoton="Desbloquear" alExito="refrescar" />
      </div>
      <p className="mt-4 text-sm text-suave">Te escribo cuando hay algo nuevo. Te das de baja cuando quieras.</p>
    </aside>
  );
}
