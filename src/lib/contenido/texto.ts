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

export function partirPlaceholders(texto: string): { texto: string; placeholder: boolean }[] {
  return texto
    .split(/(\[[^\]\n]+\])/g)
    .filter((parte) => parte !== '')
    .map((parte) => ({ texto: parte, placeholder: /^\[[^\]\n]+\]$/.test(parte) }));
}
