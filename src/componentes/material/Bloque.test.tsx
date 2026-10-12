import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Bloque } from '@/lib/contenido/material/esquema';
import { BloqueMaterial } from './Bloque';

const herramientas = { claude: { nombre: 'Claude', logo: 'logos/claude.svg', fondo: '#FFFFFF' } };
const refs = new Map([['f1', 1], ['f2', 2]]);
const html = (bloque: Bloque) => renderToStaticMarkup(<BloqueMaterial bloque={bloque} materialSlug="brag-video" herramientas={herramientas} refs={refs} />);

describe('BloqueMaterial', () => {
  it('haz lleva su etiqueta', () => expect(html({ tipo: 'haz', texto: 'Hazlo' })).toContain('Haz esto'));
  it('pagina no dibuja nada', () => expect(html({ tipo: 'pagina' })).toBe(''));
  it('pasos numera y muestra el código', () => {
    const h = html({ tipo: 'pasos', items: [{ texto: 'Mira Node', codigo: 'node -v' }, { texto: 'Listo' }] });
    expect(h).toMatch(/>1<[\s\S]*Mira Node[\s\S]*node -v[\s\S]*>2</);
    expect(h).toContain('aria-label="Copiar: node -v"');
  });
  it('prompt usa la ventana con su título y marca las llaves', () => {
    const h = html({ tipo: 'prompt', titulo: 'El pedido', texto: 'Para {{tu producto}}' });
    expect(h).toContain('Prompt · El pedido');
    expect(h).toContain('<mark');
  });
  it('herramienta: logo servido por la ruta del material, link y llamada a su fuente', () => {
    const h = html({ tipo: 'herramienta', slug: 'claude', nombre: 'Claude', que_hace: 'Escribe', precio: 'Gratis', url: 'https://claude.ai', fuente: 'f2' });
    expect(h).toContain('src="/materiales/brag-video/logos/claude.svg"');
    expect(h).toContain('href="https://claude.ai"');
    expect(h).toContain('href="#fuente-f2"');
    const toolLinkStart = h.indexOf('<a href="https://claude.ai"');
    const toolLinkContentStart = h.indexOf('>', toolLinkStart) + 1;
    const toolLinkEnd = h.indexOf('</a>', toolLinkContentStart);
    expect(h.slice(toolLinkContentStart, toolLinkEnd)).not.toContain('<a');
  });
  it('captura usa la ruta del material', () => {
    const h = html({ tipo: 'captura', archivo: 'sitio.png', pie: 'El sitio', fuente: 'f1' });
    expect(h).toContain('src="/materiales/brag-video/capturas/sitio.png"');
    expect(h).toMatch(/<img[^>]*alt=""/);
  });
  it('ojo antepone «Ojo con esto:»', () => expect(html({ tipo: 'ojo', texto: 'cuidado' })).toContain('Ojo con esto:'));
  it('micro lleva «Micro-paso · hoy, en 10 minutos»', () => expect(html({ tipo: 'micro', texto: 'x' })).toContain('Micro-paso · hoy, en 10 minutos'));
  it('ejemplo usa sus etiquetas o Antes/Después', () => {
    const h = html({ tipo: 'ejemplo', titulo: 'T', antes: 'a', despues: 'd' });
    expect(h).toContain('Ejemplo · T');
    expect(h).toMatch(/Antes[\s\S]*Después/);
    expect(html({ tipo: 'ejemplo', titulo: 'T', antes: 'a', despues: 'd', etiquetas: ['Tú escribes', 'Te devuelve'] })).toContain('Tú escribes');
  });
  it('comparativa es una tabla dentro de un contenedor con scroll propio', () => {
    const h = html({ tipo: 'comparativa', columnas: ['A', 'B'], filas: [['1', '2']] });
    expect(h).toMatch(/overflow-x-auto[\s\S]*<table/);
  });
  it('checklist y dato', () => {
    expect(html({ tipo: 'checklist', items: ['uno', 'dos'] })).toContain('dos');
    expect(html({ tipo: 'dato', valor: '15.223', texto: 'estrellas', fuente: 'f1' })).toContain('15.223');
  });
});
