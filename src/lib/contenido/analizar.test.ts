import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { analizarRecurso, ErrorContenido, leerRecursos, normalizarClave, validarColeccion } from './analizar';
import { analizarMaterial } from './material/analizar';
import { paqueteBueno } from './material/fixture';

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
    expect(() => validarColeccion([r('a.mdx', '\npalabraClave: ERP'), r('b.mdx', '\nrelacionados: [a]')], siempre, () => true)).not.toThrow();
  });

  it('rechaza palabras clave repetidas aunque difieran en tildes', () => {
    const lista = [r('a.mdx', '\npalabraClave: CLÍNICA'), r('b.mdx', '\npalabraClave: CLINICA')];
    expect(() => validarColeccion(lista, siempre, () => true)).toThrow(/CLINICA[\s\S]*a\.mdx/);
  });

  it('rechaza relacionados inexistentes', () => {
    expect(() => validarColeccion([r('a.mdx', '\nrelacionados: [fantasma]')], siempre, () => true)).toThrow(/fantasma/);
  });

  it('rechaza descargas cuyo archivo no existe', () => {
    const lista = [r('a.mdx', '', '<Descarga archivo="falta.pdf" nombre="x" />')];
    expect(() => validarColeccion(lista, () => false, () => true)).toThrow(/falta\.pdf/);
  });

  it('rechaza una descarga libre del frontmatter que también está dentro de <Premium>', () => {
    const front = '\ndescargas:\n  - nombre: X\n    archivo: x.pdf';
    const cuerpo = '<Premium>\n<Descarga archivo="x.pdf" nombre="X" />\n</Premium>';
    expect(() => validarColeccion([r('a.mdx', front, cuerpo)], siempre, () => true)).toThrow(/x\.pdf/);
  });
});

describe('validarColeccion: sintaxis del cuerpo', () => {
  const r = (cuerpo: string) => analizarRecurso('a.mdx', mdx(BASE, cuerpo));
  const siempre = () => true;

  it('rechaza <Premium> con espacios o atributos', () => {
    expect(() => validarColeccion([r('<Premium >\nx\n</Premium>')], siempre, () => true)).toThrow(/a\.mdx.*<Premium>/);
    expect(() => validarColeccion([r('<Premium plan="x">\nx\n</Premium>')], siempre, () => true)).toThrow(/a\.mdx.*<Premium>/);
  });

  it('rechaza <Premium> sin cierre', () => {
    expect(() => validarColeccion([r('<Premium>\n<Descarga archivo="p.pdf" nombre="P" />')], siempre, () => true)).toThrow(/a\.mdx.*<Premium>/);
  });

  it('rechaza <Descarga> sin archivo entre comillas dobles', () => {
    expect(() => validarColeccion([r("<Descarga archivo='x.pdf' nombre=\"X\" />")], siempre, () => true)).toThrow(/a\.mdx.*comillas dobles/);
    expect(() => validarColeccion([r('<Descarga nombre="X" />')], siempre, () => true)).toThrow(/comillas dobles/);
  });

  it('rechaza nombres de archivo inválidos en el cuerpo', () => {
    expect(() => validarColeccion([r('<Descarga archivo="../../.env" nombre="X" />')], siempre, () => true)).toThrow(/a\.mdx[\s\S]*\.\.\/\.\.\/\.env/);
  });
});

describe('YAML inválido', () => {
  it('nombra el archivo', () => {
    const fuente = '---\ntitulo: [sin cerrar\n---\nx\n';
    expect(() => analizarRecurso('roto.mdx', fuente)).toThrow(ErrorContenido);
    expect(() => analizarRecurso('roto.mdx', fuente)).toThrow(/roto\.mdx: el frontmatter no es YAML válido/);
  });
});

describe('normalizarClave', () => {
  it('quita tildes y pasa a mayúsculas', () => {
    expect(normalizarClave('Clínica')).toBe('CLINICA');
  });
});

describe('validarColeccion: mayúsculas de los componentes', () => {
  const r = (cuerpo: string) => analizarRecurso('a.mdx', mdx(BASE, cuerpo));
  const siempre = () => true;

  it('rechaza <premium> en minúsculas (se publicaría abierto)', () => {
    expect(() => validarColeccion([r('<premium>SECRETO</premium>')], siempre, () => true)).toThrow(/a\.mdx[\s\S]*<premium>[\s\S]*<Premium>/);
  });

  it.each(['<PREMIUM>x</PREMIUM>', '<Premium>x</premium>'])(
    'rechaza variantes mal escritas de Premium: %s',
    (cuerpo) => {
      expect(() => validarColeccion([r(cuerpo)], siempre, () => true)).toThrow(/a\.mdx/);
    },
  );

  it.each([
    ['<paso n="1">x</paso>', 'Paso'],
    ['<prompt>x</prompt>', 'Prompt'],
    ['<nota tipo="truco">x</nota>', 'Nota'],
    ['<descarga archivo="a.pdf" />', 'Descarga'],
  ])('rechaza %s y pide %s', (cuerpo, esperado) => {
    expect(() => validarColeccion([r(cuerpo)], siempre, () => true)).toThrow(new RegExp(`a\\.mdx[\\s\\S]*<${esperado}>`));
  });

  it('rechaza <video> en minúsculas y apunta a <Video url="…" />', () => {
    expect(() => validarColeccion([r('<video src="x.mp4"></video>')], siempre, () => true)).toThrow(/a\.mdx[\s\S]*<Video url="…" \/>/);
  });

  it('acepta los componentes bien escritos', () => {
    const cuerpo = '<Paso n="1">x</Paso>\n\n<Nota tipo="truco">y</Nota>\n\n<Video url="https://youtu.be/abcdefghijk" />\n\n<Prompt>z</Prompt>\n\n<Premium>w</Premium>';
    expect(() => validarColeccion([r(cuerpo)], siempre, () => true)).not.toThrow();
  });
});

describe('validarColeccion con materiales', () => {
  const mdx = (slug: string, palabra: string) =>
    analizarRecurso(`${slug}.mdx`, `---\ntitulo: T\nresumen: R\ntipo: guia\ntemas: [retail]\nfecha: 2026-10-01\npalabraClave: ${palabra}\n---\nx\n`);
  const material = () => analizarMaterial('brag-video', paqueteBueno());

  it('rechaza un slug repetido entre MDX y material', () => {
    expect(() => validarColeccion([mdx('brag-video', 'OTRA'), material()], () => true, () => true)).toThrow(/brag-video/);
  });

  it('permite que un MDX y un material compartan palabra clave', () => {
    expect(() => validarColeccion([mdx('otro', 'ESTRENO'), material()], () => true, () => true)).not.toThrow();
  });

  it('sigue rechazando una palabra clave repetida entre dos MDX', () => {
    expect(() => validarColeccion([mdx('uno', 'REPETIDA'), mdx('dos', 'REPETIDA')], () => true, () => true)).toThrow(/REPETIDA/);
  });

  it('rechaza una imagen del material que no está en su carpeta', () => {
    expect(() => validarColeccion([material()], () => true, (_s, rel) => rel !== 'capturas/sitio.png')).toThrow(/capturas\/sitio\.png/);
  });

  it('rechaza el PDF del material si falta en descargas', () => {
    expect(() => validarColeccion([material()], () => false, () => true)).toThrow(/brag-video\.pdf/);
  });
});
