'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
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
  // Si la URL cambia desde fuera (p. ej. el enlace "Recursos" del encabezado), el input la sigue.
  const [qUrl, setQUrl] = useState(filtros.q);
  if (filtros.q !== qUrl) {
    setQUrl(filtros.q);
    setQ(filtros.q);
  }

  const actuales: Filtros = { ...filtros, q };
  const resultados = useMemo(() => filtrarRecursos(indice, { ...filtros, q }), [indice, filtros, q]);
  const conteos = useMemo(
    () => ({ tipo: contarPor(indice, 'tipo'), temas: contarPor(indice, 'temas'), herramientas: contarPor(indice, 'herramientas') }),
    [indice],
  );

  function aplicar(cambios: Partial<Filtros>) {
    router.replace(`${pathname}${escribirFiltros({ ...actuales, ...cambios })}`, { scroll: false });
  }

  function limpiar() {
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
        onChange={(e) => {
          setQ(e.target.value);
          aplicar({ q: e.target.value });
        }}
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
