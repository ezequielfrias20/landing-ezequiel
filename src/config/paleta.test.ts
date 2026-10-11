import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PALETA } from './paleta';

// Mide las paletas que de verdad usa la web (las variables de globals.css), como
// tests/test_paletas.py mide las de los videos.
const css = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf8');

function bloque(selector: string): Record<string, string> {
  const inicio = css.indexOf(`${selector} {`);
  if (inicio < 0) throw new Error(`no está el bloque ${selector}`);
  const cuerpo = css.slice(inicio, css.indexOf('}', inicio));
  return Object.fromEntries([...cuerpo.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]));
}

const paletas = {
  oscuro: bloque(':root[data-tema="oscuro"]'),
  claro: bloque(':root[data-tema="claro"]'),
};

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const SUELOS = ['fondo', 'fondo-2', 'fondo-borde', 'superficie', 'superficie-2'];

describe.each(Object.entries(paletas))('paleta %s', (nombre, p) => {
  it('el texto principal, el secundario y el acento-texto dan ≥4.5:1 sobre todos los suelos', () => {
    for (const texto of ['tinta', 'suave', 'acento-texto']) {
      for (const suelo of SUELOS) {
        expect(contraste(p[texto], p[suelo]), `${texto} sobre ${suelo}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('tinta sobre acento-pastilla da ≥4.5:1 (pastilla del hero, bloque AIMA)', () => {
    expect(contraste(p.tinta, p['acento-pastilla'])).toBeGreaterThanOrEqual(4.5);
  });

  it('sobre-acento sobre acento llega al mínimo de texto grande (3:1)', () => {
    expect(contraste(p['sobre-acento'], p.acento)).toBeGreaterThanOrEqual(3);
  });

  it('el chip Nuevo (acento-texto sobre acento-suave) llega a 3:1', () => {
    expect(contraste(p['acento-texto'], p['acento-suave'])).toBeGreaterThanOrEqual(3);
  });

  it('ningún suelo ni superficie es negro o blanco puro', () => {
    for (const suelo of [...SUELOS, 'superficie-3']) expect(['#000000', '#ffffff']).not.toContain(p[suelo]);
  });

  it('paleta.ts es copia exacta de las variables', () => {
    const copia = PALETA[nombre as keyof typeof PALETA];
    expect(copia.fondo).toBe(p.fondo);
    expect(copia.fondo2).toBe(p['fondo-2']);
    expect(copia.superficie).toBe(p.superficie);
    expect(copia.tinta).toBe(p.tinta);
    expect(copia.suave).toBe(p.suave);
    expect(copia.linea).toBe(p.linea);
    expect(copia.acento).toBe(p.acento);
    expect(copia.acentoPastilla).toBe(p['acento-pastilla']);
  });
});

it('la paleta clara por preferencia del sistema es idéntica a la elegida', () => {
  expect(bloque(':root:not([data-tema])')).toEqual(paletas.claro);
});
