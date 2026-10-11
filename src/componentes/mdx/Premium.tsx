import { cookies } from 'next/headers';
import type { ReactElement, ReactNode } from 'react';
import { FormularioEmail } from '@/componentes/FormularioEmail';
import { NOMBRE_COOKIE, secretoAcceso, verificarToken } from '@/lib/acceso/token';

export async function Premium({ slug, children }: { slug: string; children: ReactNode }): Promise<ReactElement> {
  const almacen = await cookies();
  const acceso = verificarToken(almacen.get(NOMBRE_COOKIE)?.value, secretoAcceso());
  if (acceso) return <div data-premium="desbloqueado">{children}</div>;

  return (
    <aside data-premium="bloqueado" className="not-prose my-8 rounded-lg border border-linea bg-superficie p-6">
      <p className="text-lg font-semibold">El resto de este recurso es para la comunidad</p>
      <p className="mt-1 text-suave">
        Deja tu email y lo desbloqueas al instante, junto con todos los demás recursos premium.
      </p>
      <div className="mt-4">
        <FormularioEmail endpoint="/api/desbloquear" slug={slug} textoBoton="Desbloquear" alExito="refrescar" />
      </div>
      <p className="mt-2 text-sm text-suave">Te escribo cuando hay algo nuevo. Te das de baja cuando quieras.</p>
    </aside>
  );
}
