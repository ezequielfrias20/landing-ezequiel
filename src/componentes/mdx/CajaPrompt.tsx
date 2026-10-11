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

  return (
    <figure className="not-prose my-6 rounded-lg border border-linea bg-superficie">
      <figcaption className="flex items-center justify-between border-b border-linea px-4 py-2">
        <span className="text-sm font-medium">{titulo}</span>
        <button type="button" onClick={copiar} className="rounded-md border border-linea px-3 py-1 text-sm">
          {estado === 'copiado' ? 'Copiado' : estado === 'error' ? 'No se pudo copiar' : 'Copiar'}
        </button>
      </figcaption>
      <pre className="whitespace-pre-wrap p-4 font-mono text-sm">
        {partirPlaceholders(texto).map((parte, i) =>
          parte.placeholder ? (
            <mark key={i} className="rounded bg-yellow-100 px-0.5">
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
