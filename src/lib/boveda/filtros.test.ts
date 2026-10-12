import { describe, expect, it } from 'vitest';
import type { EntradaIndice } from '@/lib/contenido/tipos';
import { contarPor, escribirFiltros, FILTROS_VACIOS, filtrarRecursos, hayFiltros, leerFiltros, opcionesHerramienta } from './filtros';

const e = (slug: string, extra: Partial<EntradaIndice> = {}): EntradaIndice => ({
  slug, titulo: slug, resumen: '', tipo: 'guia', temas: ['retail'], herramientas: [],
  nombresHerramientas: [], fecha: '2026-10-01', premium: false, nuevo: false, ...extra,
});

const INDICE = [
  e('whatsapp', { titulo: 'Asistente de WhatsApp para tu clínica', temas: ['clinicas'], herramientas: ['claude'], nombresHerramientas: ['Claude'], tipo: 'prompt' }),
  e('erp', { titulo: 'Checklist ERP', resumen: 'Diagnóstico de tu tienda', tipo: 'plantilla' }),
  e('cashea', { titulo: 'Plantilla Cashea', temas: ['retail', 'finanzas'], tipo: 'plantilla', herramientas: ['google-sheets'], nombresHerramientas: ['Google Sheets'] }),
];
const slugs = (lista: EntradaIndice[]) => lista.map((x) => x.slug);

describe('filtrarRecursos', () => {
  it('sin filtros devuelve todo', () => {
    expect(slugs(filtrarRecursos(INDICE, FILTROS_VACIOS))).toEqual(['whatsapp', 'erp', 'cashea']);
  });

  it('busca sin importar tildes ni mayúsculas', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'CLINICA' }))).toEqual(['whatsapp']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'diagnostico' }))).toEqual(['erp']);
  });

  it('busca también en etiquetas de tema y herramienta', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'sheets' }))).toEqual(['cashea']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'finanzas' }))).toEqual(['cashea']);
  });

  it('encuentra por palabra clave de ManyChat', () => {
    const indice = [e('erp', { palabraClave: 'ERP' }), e('otro')];
    expect(slugs(filtrarRecursos(indice, { ...FILTROS_VACIOS, q: 'erp' }))).toEqual(['erp']);
  });

  it('exige todas las palabras', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'plantilla cashea' }))).toEqual(['cashea']);
  });

  it('combina tipo, tema y herramienta', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, tipo: 'plantilla' }))).toEqual(['erp', 'cashea']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, tipo: 'plantilla', tema: 'finanzas' }))).toEqual(['cashea']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, herramienta: 'claude' }))).toEqual(['whatsapp']);
  });
});

describe('leerFiltros / escribirFiltros', () => {
  it('ignora valores desconocidos en la URL', () => {
    expect(leerFiltros(new URLSearchParams('tema=viejo&tipo=video&herramienta=x'))).toEqual(FILTROS_VACIOS);
  });

  it('ida y vuelta', () => {
    const f = { q: 'cashea', tipo: 'plantilla' as const, tema: 'retail' as const, herramienta: null };
    const qs = escribirFiltros(f);
    expect(qs).toBe('?q=cashea&tipo=plantilla&tema=retail');
    expect(leerFiltros(new URLSearchParams(qs))).toEqual(f);
    expect(escribirFiltros(FILTROS_VACIOS)).toBe('');
  });

  it('hayFiltros', () => {
    expect(hayFiltros(FILTROS_VACIOS)).toBe(false);
    expect(hayFiltros({ ...FILTROS_VACIOS, q: '  ' })).toBe(false);
    expect(hayFiltros({ ...FILTROS_VACIOS, tema: 'retail' })).toBe(true);
  });

  it('acepta herramientas de materiales si están en la lista dada', () => {
    expect(leerFiltros(new URLSearchParams('herramienta=higgsfield'), ['claude', 'higgsfield']).herramienta).toBe('higgsfield');
    expect(leerFiltros(new URLSearchParams('herramienta=higgsfield')).herramienta).toBeNull();
  });
});

it('opcionesHerramienta junta slugs y nombres del índice', () => {
  const indice = [
    e('a', { herramientas: ['claude', 'higgsfield'], nombresHerramientas: ['Claude', 'Higgsfield'] }),
    e('b', { herramientas: ['claude'], nombresHerramientas: ['Claude'] }),
  ];
  expect(opcionesHerramienta(indice)).toEqual({ opciones: ['claude', 'higgsfield'], etiquetas: { claude: 'Claude', higgsfield: 'Higgsfield' } });
});

it('busca también por el nombre de una herramienta de material', () => {
  const indice = [e('a', { herramientas: ['higgsfield'], nombresHerramientas: ['Higgsfield'] })];
  expect(filtrarRecursos(indice, { ...FILTROS_VACIOS, q: 'higgs' }).map((x) => x.slug)).toEqual(['a']);
});

describe('contarPor', () => {
  it('cuenta por tipo y por valores de listas', () => {
    expect(contarPor(INDICE, 'tipo')).toEqual({ prompt: 1, plantilla: 2 });
    expect(contarPor(INDICE, 'temas')).toEqual({ clinicas: 1, retail: 2, finanzas: 1 });
  });
});
