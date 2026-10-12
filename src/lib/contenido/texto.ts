import { isValidElement, type ReactNode } from 'react';

/** Convierte los hijos de <Prompt> en texto plano para copiar. */
export function extraerTexto(nodo: ReactNode): string {
  if (nodo == null || typeof nodo === 'boolean') return '';
  if (typeof nodo === 'string' || typeof nodo === 'number') return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(extraerTexto).join('');
  if (isValidElement<{ children?: ReactNode }>(nodo)) {
    const interno = extraerTexto(nodo.props.children);
    return nodo.type === 'p' ? `${interno}\n\n` : interno;
  }
  return '';
}

const PATRONES = {
  corchetes: { partir: /(\[[^\]\n]+\])/g, es: /^\[[^\]\n]+\]$/ },
  llaves: { partir: /(\{\{[^{}\n]{1,60}\}\})/g, es: /^\{\{[^{}\n]{1,60}\}\}$/ },
} as const;

export function partirPlaceholders(texto: string, patron: keyof typeof PATRONES = 'corchetes'): { texto: string; placeholder: boolean }[] {
  const p = PATRONES[patron];
  return texto
    .split(p.partir)
    .filter((parte) => parte !== '')
    .map((parte) => ({ texto: parte, placeholder: p.es.test(parte) }));
}
