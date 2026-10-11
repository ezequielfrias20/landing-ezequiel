'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import {
  ETIQUETAS_HERRAMIENTA, ETIQUETAS_TEMA, ETIQUETAS_TIPO, HERRAMIENTAS, TEMAS, TIPOS,
} from '@/config/taxonomia';
import { contarPor, escribirFiltros, filtrarRecursos, hayFiltros, leerFiltros, type Filtros } from '@/lib/boveda/filtros';
import type { EntradaIndice } from '@/lib/contenido/tipos';
import { GrupoFiltros } from './GrupoFiltros';

export function Boveda({ indice }: { indice: EntradaIndice[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filtros = useMemo(() => leerFiltros(new URLSearchParams(params.toString())), [params]);
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

  return (
    <div className="mt-8">
      <label htmlFor="buscar" className="sr-only">
        Buscar recursos
      </label>
      <input
        id="buscar"
        type="search"
        value={q}
        onChange={(e) => escribir(e.target.value)}
        onBlur={confirmarPendiente}
        placeholder="Busca por tema, herramienta o nombre"
        className="w-full rounded-lg border border-linea bg-superficie px-4 py-3"
      />

      <div className="mt-6 space-y-4">
        <GrupoFiltros titulo="Tipo" opciones={TIPOS} etiquetas={ETIQUETAS_TIPO} conteo={conteos.tipo} total={indice.length} valor={filtros.tipo} alCambiar={(tipo) => aplicar({ tipo })} />
        <GrupoFiltros titulo="Tema" opciones={TEMAS} etiquetas={ETIQUETAS_TEMA} conteo={conteos.temas} total={indice.length} valor={filtros.tema} alCambiar={(tema) => aplicar({ tema })} />
        <GrupoFiltros titulo="Herramienta" opciones={HERRAMIENTAS} etiquetas={ETIQUETAS_HERRAMIENTA} conteo={conteos.herramientas} total={indice.length} valor={filtros.herramienta} alCambiar={(herramienta) => aplicar({ herramienta })} />
      </div>

      <p className="mt-6 text-sm text-suave" aria-live="polite">
        {resultados.length} {resultados.length === 1 ? 'recurso' : 'recursos'}
      </p>

      {resultados.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-linea p-10 text-center">
          <p>No hay recursos con esos filtros.</p>
          {hayFiltros(actuales) && (
            <button type="button" onClick={limpiar} className="mt-3 underline">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((e) => (
            <TarjetaRecurso key={e.slug} entrada={e} />
          ))}
        </div>
      )}
    </div>
  );
}
