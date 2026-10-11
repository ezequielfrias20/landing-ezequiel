'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { aplicarTema, CLAVE_TEMA, guardarTema, temaDelSistema, temaGuardado, type Tema } from './tema';

function suscribir(aviso: () => void) {
  const observador = new MutationObserver(aviso);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  return () => observador.disconnect();
}

const leerTema = (): Tema => (document.documentElement.getAttribute('data-tema') === 'claro' ? 'claro' : 'oscuro');
// En el servidor no se sabe: el botón se pinta por CSS desde `data-tema` y el estado ARIA llega al hidratar.
const leerTemaServidor = (): Tema | null => null;

export function SelectorTema() {
  const tema = useSyncExternalStore(suscribir, leerTema, leerTemaServidor);

  useLayoutEffect(() => {
    // En desarrollo, el remontaje de Strict Mode limpia el atributo que puso el script: se repone.
    aplicarTema(temaGuardado() ?? temaDelSistema());
    // Sin elección guardada, el sitio sigue al sistema si cambia mientras está abierto.
    const consulta = window.matchMedia?.('(prefers-color-scheme: light)');
    const alCambiarSistema = () => {
      if (!temaGuardado()) aplicarTema(temaDelSistema());
    };
    const alGuardarEnOtraPestana = (e: StorageEvent) => {
      if (e.key === CLAVE_TEMA) aplicarTema(temaGuardado() ?? temaDelSistema());
    };
    consulta?.addEventListener('change', alCambiarSistema);
    window.addEventListener('storage', alGuardarEnOtraPestana);
    return () => {
      consulta?.removeEventListener('change', alCambiarSistema);
      window.removeEventListener('storage', alGuardarEnOtraPestana);
    };
  }, []);

  function alternar() {
    const nuevo: Tema = leerTema() === 'oscuro' ? 'claro' : 'oscuro';
    aplicarTema(nuevo);
    guardarTema(nuevo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Tema oscuro"
      aria-pressed={tema === null ? undefined : tema === 'oscuro'}
      title="Cambiar entre tema claro y oscuro"
      className="relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border border-linea bg-superficie p-1 transition-colors hover:border-linea-fuerte"
    >
      <span
        aria-hidden="true"
        className="absolute left-1 top-1 h-[1.625rem] w-[1.875rem] translate-x-[1.75rem] rounded-full bg-superficie-3 transition-transform duration-300 ease-out claro:translate-x-0"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="relative z-10 mx-[0.4375rem] h-4 w-4 text-suave claro:text-tinta"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="relative z-10 mx-[0.4375rem] h-4 w-4 text-tinta claro:text-suave"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
