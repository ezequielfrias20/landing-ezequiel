'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import {
  ETIQUETAS_TEMA, ETIQUETAS_TIPO, TEMAS, TIPOS,
} from '@/config/taxonomia';
import { contarPor, escribirFiltros, filtrarRecursos, hayFiltros, leerFiltros, opcionesHerramienta, type Filtros } from '@/lib/boveda/filtros';
import type { EntradaIndice } from '@/lib/contenido/tipos';
import { GrupoFiltros } from './GrupoFiltros';

export function Boveda({ indice }: { indice: EntradaIndice[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const herramientas = useMemo(() => opcionesHerramienta(indice), [indice]);
  const filtros = useMemo(() => leerFiltros(new URLSearchParams(params.toString()), herramientas.opciones), [params, herramientas]);
  const [q, setQ] = useState(filtros.q);
  // La búsqueda llega a la URL con debounce: escribir en la URL en cada tecla hacía que URLs
  // intermedias (y recortadas) volvieran tarde y pisaran el espacio o letras ya escritas.
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pendiente, setPendiente] = useState(false);
  // Si la URL cambia desde fuera (p. ej. el enlace "Recursos" del encabezado), el input la sigue.
  // Solo si de verdad difiere de lo escrito (recortado) y no hay una escritura en camino.
  const [qUrl, setQUrl] = useState(filtros.q);
  if (filtros.q !== qUrl) {
    setQUrl(filtros.q);
    if (!pendiente && filtros.q !== q.trim()) setQ(filtros.q);
  }
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const actuales: Filtros = { ...filtros, q };
  const resultados = useMemo(() => filtrarRecursos(indice, { ...filtros, q }), [indice, filtros, q]);
  const conteos = useMemo(
    () => ({ tipo: contarPor(indice, 'tipo'), temas: contarPor(indice, 'temas'), herramientas: contarPor(indice, 'herramientas') }),
    [indice],
  );

  function navegar(f: Filtros) {
    router.replace(`${pathname}${escribirFiltros(f)}`, { scroll: false });
  }

  function cancelarPendiente() {
    clearTimeout(temporizador.current);
    temporizador.current = undefined;
    setPendiente(false);
  }

  function aplicar(cambios: Partial<Filtros>) {
    cancelarPendiente();
    navegar({ ...actuales, ...cambios });
  }

  function escribir(valor: string) {
    setQ(valor);
    clearTimeout(temporizador.current);
    setPendiente(true);
    temporizador.current = setTimeout(() => {
      temporizador.current = undefined;
      setPendiente(false);
      navegar({ ...filtros, q: valor });
    }, 300);
  }

  // Al salir del buscador (p. ej. para tocar un enlace) la búsqueda pendiente se escribe ya,
  // para que no llegue después y deshaga esa navegación.
  function confirmarPendiente() {
    if (temporizador.current === undefined) return;
    aplicar({});
  }

  function limpiar() {
    cancelarPendiente();
    setQ('');
    router.replace(pathname, { scroll: false });
  }

  // "/" enfoca el buscador, como en una barra de comandos.
  const buscador = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const destino = e.target as HTMLElement | null;
      if (destino?.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      buscador.current?.focus();
    }
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  return (
    <div className="mt-10">
      <div className="panel group flex items-center gap-3 rounded-lg px-4 transition-[border-color,box-shadow] focus-within:border-tinta focus-within:shadow-elevada sm:px-5">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-suave" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label htmlFor="buscar" className="sr-only">
          Buscar recursos
        </label>
        <input
          ref={buscador}
          id="buscar"
          type="search"
          value={q}
          onChange={(e) => escribir(e.target.value)}
          onBlur={confirmarPendiente}
          placeholder="Busca por tema o la palabra del reel"
          className="h-14 min-w-0 flex-1 bg-transparent text-base text-tinta outline-none placeholder:text-suave sm:h-16 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd aria-hidden="true" className="chip hidden bg-superficie-2 px-2 py-1 text-suave sm:inline-flex">
          /
        </kbd>
      </div>

      <div className="mt-8 space-y-5">
        <GrupoFiltros titulo="Tipo" opciones={TIPOS} etiquetas={ETIQUETAS_TIPO} conteo={conteos.tipo} total={indice.length} valor={filtros.tipo} alCambiar={(tipo) => aplicar({ tipo })} />
        <GrupoFiltros titulo="Tema" opciones={TEMAS} etiquetas={ETIQUETAS_TEMA} conteo={conteos.temas} total={indice.length} valor={filtros.tema} alCambiar={(tema) => aplicar({ tema })} />
        <GrupoFiltros<string> titulo="Herramienta" opciones={herramientas.opciones} etiquetas={herramientas.etiquetas} conteo={conteos.herramientas} total={indice.length} valor={filtros.herramienta} alCambiar={(herramienta) => aplicar({ herramienta })} />
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-linea-fuerte pt-5">
        <p className="etiqueta text-tinta" aria-live="polite">
          <span className="font-bold">{String(resultados.length).padStart(2, '0')}</span>{' '}
          {resultados.length === 1 ? 'recurso' : 'recursos'}
        </p>
        {hayFiltros(actuales) && resultados.length > 0 && (
          <button type="button" onClick={limpiar} className="etiqueta rounded-full px-2 py-1 text-suave underline-offset-4 hover:text-tinta hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      {resultados.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-linea-fuerte px-6 py-16 text-center">
          <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full border border-linea bg-superficie text-suave">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5M8.5 11h5" />
            </svg>
          </span>
          <p className="mt-5 text-xl font-black tracking-titulo">No hay recursos con esos filtros.</p>
          <p className="mt-2 max-w-sm text-suave">Prueba con menos palabras o con la palabra que comentaste en el reel.</p>
          {hayFiltros(actuales) && (
            <button type="button" onClick={limpiar} className="boton boton-primario mt-6">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((e) => (
            <TarjetaRecurso key={e.slug} entrada={e} />
          ))}
        </div>
      )}
    </div>
  );
}
