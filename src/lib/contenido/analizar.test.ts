import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { analizarRecurso, ErrorContenido, leerRecursos, normalizarClave, validarColeccion } from './analizar';

const BASE = `titulo: Checklist ERP
resumen: Las 15 funciones del reel.
tipo: plantilla
temas: [retail]
fecha: 2026-10-01`;

const mdx = (front: string, cuerpo = 'Hola.') => `---\n${front}\n---\n${cuerpo}\n`;

describe('analizarRecurso', () => {
  it('toma el slug del nombre de archivo y aplica valores por defecto', () => {
    const r = analizarRecurso('checklist-erp.mdx', mdx(BASE));
    expect(r.slug).toBe('checklist-erp');
    expect(r.herramientas).toEqual([]);
    expect(r.descargas).toEqual([]);
    expect(r.borrador).toBe(false);
    expect(r.fecha.toISOString().slice(0, 10)).toBe('2026-10-01');
    expect(r.premium).toBe(false);
  });

  it('detecta premium, cuenta pasos y separa descargas libres y premium', () => {
    const cuerpo = [
      '<Paso n="1">Uno</Paso>',
      '<Paso n="2" titulo="Dos">Dos</Paso>',
      '<Descarga archivo="libre.pdf" nombre="Libre" />',
      '<Premium>',
      'Secreto',
      '<Descarga archivo="pro.xlsx" nombre="Pro" />',
      '</Premium>',
    ].join('\n');
    const front = `${BASE}\ndescargas:\n  - nombre: Guía\n    archivo: guia.pdf`;
    const r = analizarRecurso('a.mdx', mdx(front, cuerpo));
    expect(r.premium).toBe(true);
    expect(r.pasos).toBe(2);
    expect(r.descargasPremium).toEqual(['pro.xlsx']);
    expect(r.archivosDescarga.sort()).toEqual(['guia.pdf', 'libre.pdf', 'pro.xlsx']);
  });

  it('rechaza nombres de archivo que no son slugs', () => {
    expect(() => analizarRecurso('Checklist ERP.mdx', mdx(BASE))).toThrow(ErrorContenido);
  });

  it('informa el archivo y el campo cuando el frontmatter es inválido', () => {
    const fuente = mdx(BASE.replace('tipo: plantilla', 'tipo: video'));
    expect(() => analizarRecurso('erp.mdx', fuente)).toThrow(/erp\.mdx[\s\S]*tipo/);
  });

  it('rechaza campos desconocidos (errores de tipeo)', () => {
    expect(() => analizarRecurso('erp.mdx', mdx(`${BASE}\ntitlo: x`))).toThrow(/titlo/);
  });

  it('rechaza palabras clave en minúsculas', () => {
    expect(() => analizarRecurso('erp.mdx', mdx(`${BASE}\npalabraClave: erp`))).toThrow(/palabraClave/);
  });
});

describe('leerRecursos', () => {
  it('lee .mdx, ordena por fecha descendente y excluye borradores si se pide', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recursos-'));
    fs.writeFileSync(path.join(dir, 'viejo.mdx'), mdx(BASE));
    fs.writeFileSync(path.join(dir, 'nuevo.mdx'), mdx(BASE.replace('2026-10-01', '2026-10-05')));
    fs.writeFileSync(path.join(dir, 'borrador.mdx'), mdx(`${BASE}\nborrador: true`));
    fs.writeFileSync(path.join(dir, 'nota.txt'), 'ignorar');
    expect(leerRecursos({ dir, incluirBorradores: false }).map((r) => r.slug)).toEqual(['nuevo', 'viejo']);
    expect(leerRecursos({ dir, incluirBorradores: true })).toHaveLength(3);
  });

  it('devuelve lista vacía si la carpeta no existe', () => {
    expect(leerRecursos({ dir: '/no/existe', incluirBorradores: false })).toEqual([]);
  });
});

describe('validarColeccion', () => {
  const r = (archivo: string, extra = '', cuerpo = 'x') => analizarRecurso(archivo, mdx(`${BASE}${extra}`, cuerpo));
  const siempre = () => true;

  it('acepta una colección válida', () => {
    expect(() => validarColeccion([r('a.mdx', '\npalabraClave: ERP'), r('b.mdx', '\nrelacionados: [a]')], siempre)).not.toThrow();
  });

  it('rechaza palabras clave repetidas aunque difieran en tildes', () => {
    const lista = [r('a.mdx', '\npalabraClave: CLÍNICA'), r('b.mdx', '\npalabraClave: CLINICA')];
    expect(() => validarColeccion(lista, siempre)).toThrow(/CLINICA[\s\S]*a\.mdx/);
  });

  it('rechaza relacionados inexistentes', () => {
    expect(() => validarColeccion([r('a.mdx', '\nrelacionados: [fantasma]')], siempre)).toThrow(/fantasma/);
  });

  it('rechaza descargas cuyo archivo no existe', () => {
    const lista = [r('a.mdx', '', '<Descarga archivo="falta.pdf" nombre="x" />')];
    expect(() => validarColeccion(lista, () => false)).toThrow(/falta\.pdf/);
  });

  it('rechaza una descarga libre del frontmatter que también está dentro de <Premium>', () => {
    const front = '\ndescargas:\n  - nombre: X\n    archivo: x.pdf';
    const cuerpo = '<Premium>\n<Descarga archivo="x.pdf" nombre="X" />\n</Premium>';
    expect(() => validarColeccion([r('a.mdx', front, cuerpo)], siempre)).toThrow(/x\.pdf/);
  });
});

describe('normalizarClave', () => {
  it('quita tildes y pasa a mayúsculas', () => {
    expect(normalizarClave('Clínica')).toBe('CLINICA');
  });
});
