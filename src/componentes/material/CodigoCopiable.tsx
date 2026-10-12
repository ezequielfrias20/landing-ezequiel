'use client';

import { useState } from 'react';

export function CodigoCopiable({ codigo }: { codigo: string }) {
  const [estado, setEstado] = useState<'inicial' | 'copiado' | 'error'>('inicial');
  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setEstado('copiado');
    } catch {
      setEstado('error');
    }
    setTimeout(() => setEstado('inicial'), 2000);
  }
  return (
    <div className="panel mt-3 flex items-start gap-2 rounded-md py-2 pl-4 pr-2">
      <pre className="min-w-0 flex-1 overflow-x-auto py-1.5 font-mono text-[0.875rem] leading-relaxed text-tinta">
        <code>{codigo}</code>
      </pre>
      <button
        type="button"
        aria-label={`Copiar: ${codigo.slice(0, 40)}`}
        onClick={copiar}
        className={`chip min-h-8 shrink-0 transition-colors ${estado === 'copiado' ? 'border-tinta bg-tinta text-fondo' : 'bg-superficie text-tinta hover:border-linea-fuerte'}`}
      >
        {estado === 'copiado' ? 'Copiado' : estado === 'error' ? 'No se pudo copiar' : 'Copiar'}
      </button>
    </div>
  );
}
