/**
 * Colores de la marca para donde no llegan las variables CSS (meta theme-color, imágenes OG).
 * La fuente en la web es src/app/globals.css; estos valores son copia exacta de esas variables
 * (y estas, de Marketing/editor-videos/scripts/tokens.py). Si cambias uno, cambia el otro.
 */
export const PALETA = {
  oscuro: {
    fondo: '#161412',
    fondo2: '#1b1816',
    superficie: '#201d1a',
    tinta: '#eee8df',
    suave: '#a39c91',
    linea: '#36312b',
    acento: '#e27b52',
    acentoPastilla: '#9b573c',
  },
  claro: {
    fondo: '#ece7de',
    fondo2: '#f2eee6',
    superficie: '#f7f4ee',
    tinta: '#1c1a16',
    suave: '#635d54',
    linea: '#d8d1c4',
    acento: '#c45f38',
    acentoPastilla: '#c86d49',
  },
} as const;
