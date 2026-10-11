'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';

type Estado =
  | { tipo: 'inicial' }
  | { tipo: 'enviando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; mensaje: string };

interface Props {
  endpoint: '/api/desbloquear' | '/api/suscribir';
  slug?: string;
  textoBoton: string;
  /** 'refrescar' vuelve a pedir la página al servidor (desbloqueo); 'mensaje' muestra la confirmación. */
  alExito: 'refrescar' | 'mensaje';
}

export function FormularioEmail({ endpoint, slug, textoBoton, alExito }: Props) {
  const router = useRouter();
  const id = useId();
  const [estado, setEstado] = useState<Estado>({ tipo: 'inicial' });

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const params = new URLSearchParams(window.location.search);
    setEstado({ tipo: 'enviando' });
    let respuesta: Response;
    try {
      respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: datos.get('email'),
          sitio_web: datos.get('sitio_web'),
          slug,
          origen: params.get('ref') ?? params.get('utm_source'),
        }),
      });
    } catch {
      setEstado({ tipo: 'error', mensaje: 'No hubo conexión. Prueba de nuevo.' });
      return;
    }
    let cuerpo: { ok: boolean; mensaje: string };
    try {
      cuerpo = (await respuesta.json()) as { ok: boolean; mensaje: string };
    } catch {
      // Respuesta que no es JSON (p. ej. un 5xx en HTML de la plataforma).
      setEstado({ tipo: 'error', mensaje: 'Algo falló de nuestro lado. Prueba de nuevo en un momento.' });
      return;
    }
    if (!respuesta.ok || !cuerpo.ok) {
      setEstado({ tipo: 'error', mensaje: cuerpo.mensaje });
      return;
    }
    setEstado({ tipo: 'listo', mensaje: cuerpo.mensaje });
    if (alExito === 'refrescar') router.refresh();
  }

  if (estado.tipo === 'listo' && alExito === 'mensaje') {
    return (
      <p role="status" className="panel flex items-center gap-3 rounded-lg bg-superficie-2 px-5 py-4 font-bold">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ok" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
        {estado.mensaje}
      </p>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col gap-2 rounded-xl border border-linea-fuerte bg-fondo p-2 transition-colors focus-within:border-tinta sm:flex-row sm:flex-wrap sm:rounded-full"
    >
      <label htmlFor={id} className="sr-only">
        Tu email
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@email.com"
        className="min-h-11 min-w-0 flex-1 rounded-full bg-transparent px-4 py-2 text-tinta outline-none placeholder:text-suave"
      />
      {/* Campo trampa para bots: oculto para personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          No llenes este campo
          <input name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        disabled={estado.tipo === 'enviando' || estado.tipo === 'listo'}
        className="boton boton-primario"
      >
        {estado.tipo === 'enviando' ? 'Enviando…' : estado.tipo === 'listo' ? 'Listo' : textoBoton}
      </button>
      {estado.tipo === 'error' && (
        <p role="alert" className="px-4 pb-2 text-sm font-bold text-alerta sm:basis-full">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
