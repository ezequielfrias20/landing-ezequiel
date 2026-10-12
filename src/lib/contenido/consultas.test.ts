import { describe, expect, it, vi } from 'vitest';
import { analizarRecurso } from './analizar';
import { buscarDuenoDescarga, crearIndice, esNuevo, metaRecurso, recursosRelacionados } from './consultas';

function recurso(slug: string, opciones: { temas?: string; fecha?: string; relacionados?: string; cuerpo?: string } = {}) {
  const front = [
    `titulo: Título ${slug}`,
    'resumen: Resumen.',
    'tipo: guia',
    `temas: [${opciones.temas ?? 'retail'}]`,
    `fecha: ${opciones.fecha ?? '2026-10-01'}`,
    opciones.relacionados ? `relacionados: [${opciones.relacionados}]` : '',
  ].filter(Boolean).join('\n');
  return analizarRecurso(`${slug}.mdx`, `---\n${front}\n---\n${opciones.cuerpo ?? 'Cuerpo SECRETO'}\n`);
}

describe('crearIndice', () => {
  it('no incluye el cuerpo y marca nuevos los de los últimos 14 días', () => {
    const ahora = new Date('2026-10-15T12:00:00Z');
    const indice = crearIndice([recurso('a', { fecha: '2026-10-10' }), recurso('b', { fecha: '2026-09-01' })], ahora);
    expect(JSON.stringify(indice)).not.toContain('SECRETO');
    expect(indice[0]).toEqual({
      slug: 'a', titulo: 'Título a', resumen: 'Resumen.', palabraClave: undefined, tipo: 'guia', temas: ['retail'],
      herramientas: [], fecha: '2026-10-10', premium: false, nuevo: true,
    });
    expect(indice[1].nuevo).toBe(false);
  });
});

describe('crearIndice con el email apagado', () => {
  it('no marca premium aunque el recurso tenga <Premium>', () => {
    const pro = recurso('pro', { cuerpo: '<Premium>\nx\n</Premium>' });
    vi.stubEnv('EMAIL_ACTIVO', '');
    expect(crearIndice([pro], new Date())[0].premium).toBe(false);
    vi.stubEnv('EMAIL_ACTIVO', '1');
    expect(crearIndice([pro], new Date())[0].premium).toBe(true);
    vi.unstubAllEnvs();
  });
});

describe('esNuevo', () => {
  it('considera nuevo hasta 14 días inclusive', () => {
    const ahora = new Date('2026-10-15T00:00:00Z');
    expect(esNuevo(new Date('2026-10-01T00:00:00Z'), ahora)).toBe(true);
    expect(esNuevo(new Date('2026-09-30T00:00:00Z'), ahora)).toBe(false);
  });
});

describe('recursosRelacionados', () => {
  it('usa los relacionados declarados en orden', () => {
    const todos = [recurso('a', { relacionados: 'c, b' }), recurso('b'), recurso('c')];
    expect(recursosRelacionados(todos[0], todos).map((r) => r.slug)).toEqual(['c', 'b']);
  });

  it('sin relacionados, elige hasta 3 que compartan tema, priorizando más temas en común', () => {
    const todos = [
      recurso('a', { temas: 'retail, finanzas' }),
      recurso('b', { temas: 'retail' }),
      recurso('c', { temas: 'retail, finanzas' }),
      recurso('d', { temas: 'clinicas' }),
      recurso('e', { temas: 'finanzas' }),
      recurso('f', { temas: 'retail' }),
    ];
    const res = recursosRelacionados(todos[0], todos).map((r) => r.slug);
    expect(res[0]).toBe('c');
    expect(res).toHaveLength(3);
    expect(res).not.toContain('a');
    expect(res).not.toContain('d');
  });
});

describe('buscarDuenoDescarga', () => {
  const libre = recurso('libre', { cuerpo: '<Descarga archivo="x.pdf" nombre="X" />' });
  const pro = recurso('pro', { cuerpo: '<Premium>\n<Descarga archivo="y.pdf" nombre="Y" />\n</Premium>' });

  it('identifica descargas libres y premium', () => {
    expect(buscarDuenoDescarga('x.pdf', [libre, pro])).toMatchObject({ premium: false, recurso: { slug: 'libre' } });
    expect(buscarDuenoDescarga('y.pdf', [libre, pro])).toMatchObject({ premium: true, recurso: { slug: 'pro' } });
  });

  it('devuelve null si ningún recurso ofrece el archivo', () => {
    expect(buscarDuenoDescarga('z.pdf', [libre, pro])).toBeNull();
  });
});

describe('metaRecurso', () => {
  it('arma la línea de pasos y duración', () => {
    expect(metaRecurso({ pasos: 5, duracion: '10 min' })).toBe('5 pasos · 10 min');
    expect(metaRecurso({ pasos: 1, duracion: undefined })).toBe('1 paso');
    expect(metaRecurso({ pasos: 0, duracion: undefined })).toBe('');
  });
});
