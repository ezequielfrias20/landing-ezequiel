'use client';

import { useState } from 'react';
import { partirPlaceholders } from '@/lib/contenido/texto';

export function CajaPrompt({ titulo, texto }: { titulo: string; texto: string }) {
  const [estado, setEstado] = useState<'inicial' | 'copiado' | 'error'>('inicial');

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado('copiado');
    } catch {
      setEstado('error');
    }
    setTimeout(() => setEstado('inicial'), 2000);
  }

  // Ventana estilo macOS: el semáforo es interfaz literal y no depende de la paleta (igual que en los videos).
  return (
    <figure className="not-prose panel my-8 overflow-hidden rounded-md">
      <figcaption className="flex items-center gap-3 border-b border-linea bg-superficie-2 py-2 pl-4 pr-2">
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </span>
        <span className="etiqueta min-w-0 flex-1 truncate text-center text-[0.6875rem] text-suave">{titulo}</span>
        <button
          type="button"
          onClick={copiar}
          className={`chip min-h-8 shrink-0 transition-colors ${
            estado === 'copiado' ? 'border-tinta bg-tinta text-fondo' : 'bg-superficie text-tinta hover:border-linea-fuerte'
          }`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            {estado === 'copiado' ? (
              <path d="m5 12 5 5L20 7" />
            ) : (
              <>
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </>
            )}
          </svg>
          {estado === 'copiado' ? 'Copiado' : estado === 'error' ? 'No se pudo copiar' : 'Copiar'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words px-5 py-5 font-mono text-[0.875rem] leading-[1.75] sm:text-[0.9375rem] text-tinta sm:px-6">
        {partirPlaceholders(texto).map((parte, i) =>
          parte.placeholder ? (
            <mark key={i} className="rounded-[4px] bg-acento-relleno px-1 text-tinta">
              {parte.texto}
            </mark>
          ) : (
            <span key={i}>{parte.texto}</span>
          ),
        )}
      </pre>
    </figure>
  );
}
