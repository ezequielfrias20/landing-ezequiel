export type Tema = 'oscuro' | 'claro';

export const CLAVE_TEMA = 'tema';

/**
 * Corre en <head> antes de pintar: elección guardada > preferencia del sistema > oscuro.
 * Pone `data-tema` en <html>. Sin JavaScript, el CSS cae a la preferencia del sistema.
 */
export const SCRIPT_TEMA = `(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem("${CLAVE_TEMA}")}catch(e){}if(t!=="claro"&&t!=="oscuro"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"claro":"oscuro"}d.setAttribute("data-tema",t)})()`;

export function temaGuardado(): Tema | null {
  try {
    const t = localStorage.getItem(CLAVE_TEMA);
    return t === 'claro' || t === 'oscuro' ? t : null;
  } catch {
    return null;
  }
}

export function temaDelSistema(): Tema {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
}

export function aplicarTema(tema: Tema) {
  document.documentElement.setAttribute('data-tema', tema);
}

export function guardarTema(tema: Tema) {
  try {
    localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): el cambio vale para esta visita.
  }
}
