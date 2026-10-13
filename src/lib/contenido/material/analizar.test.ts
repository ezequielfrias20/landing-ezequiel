import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ErrorContenido } from '../analizar';
import { analizarMaterial, imagenesDe, leerMateriales } from './analizar';
import { paqueteBueno } from './fixture';

const conContenido = (c: Record<string, unknown>) => {
  const p = paqueteBueno();
  return { ...p, contenido: { ...p.contenido, ...c } };
};

describe('analizarMaterial', () => {
  it('arma el Recurso con los campos comunes', () => {
    const r = analizarMaterial('brag-video', paqueteBueno());
    expect(r).toMatchObject({
      origen: 'material', slug: 'brag-video', titulo: 'Tu proyecto, en video', resumen: 'Qué es /brag y cómo se instala.',
      palabraClave: 'ESTRENO', tipo: 'paso-a-paso', temas: ['ia-practica'], herramientas: ['claude'], nombresHerramientas: ['Claude'],
      duracion: '15 minutos', video: 'https://www.instagram.com/reel/ABC/', premium: false, pasos: 1,
      descargas: [{ nombre: 'El material en PDF', archivo: 'brag-video.pdf' }], archivosDescarga: ['brag-video.pdf'], descargasPremium: [],
      relacionados: [], borrador: false, archivo: 'materiales/brag-video/material.json',
    });
    expect(r.fecha.toISOString().slice(0, 10)).toBe('2026-10-11');
  });

  it('mapea el formato al tipo de la web', () => {
    expect(analizarMaterial('brag-video', conContenido({ formato: 'checklist' })).tipo).toBe('plantilla');
    expect(analizarMaterial('brag-video', conContenido({ formato: 'mapa' })).tipo).toBe('guia');
    expect(analizarMaterial('brag-video', conContenido({ formato: 'mini-auditoria' })).tipo).toBe('guia');
  });

  it('recorta el resumen a 300 caracteres en un límite de palabra', () => {
    const largo = 'palabra '.repeat(60).trim();
    const p = paqueteBueno();
    const r = analizarMaterial('brag-video', { ...p, contenido: { ...p.contenido, portada: { ...p.contenido.portada, subtitulo: largo } } });
    expect(r.resumen.length).toBeLessThanOrEqual(300);
    expect(r.resumen.endsWith('palabra…')).toBe(true);
  });

  it('rechaza un tipo de bloque desconocido nombrando el material', () => {
    const p = paqueteBueno();
    const malo = { ...p, contenido: { ...p.contenido, secciones: [{ id: 's1', titulo: 'x', bloques: [{ tipo: 'video', url: 'x' }] }] } };
    expect(() => analizarMaterial('brag-video', malo)).toThrow(ErrorContenido);
    expect(() => analizarMaterial('brag-video', malo)).toThrow(/materiales\/brag-video/);
  });

  it('rechaza un bloque al que le falta un campo', () => {
    const p = paqueteBueno();
    const malo = { ...p, contenido: { ...p.contenido, secciones: [{ id: 's1', titulo: 'x', bloques: [{ tipo: 'dato', valor: '1', texto: 't' }] }] } };
    expect(() => analizarMaterial('brag-video', malo)).toThrow(/fuente/);
  });

  it('exige que la carpeta se llame como nombre_pdf y que el pdf coincida', () => {
    expect(() => analizarMaterial('otro-nombre', paqueteBueno())).toThrow(/nombre_pdf/);
    expect(() => analizarMaterial('brag-video', paqueteBueno({ pdf: 'otro.pdf' }))).toThrow(/brag-video\.pdf/);
  });

  it('exige el logo de cada herramienta usada y cada fuente citada', () => {
    expect(() => analizarMaterial('brag-video', paqueteBueno({ herramientas: {} }))).toThrow(/claude/);
    expect(() => analizarMaterial('brag-video', paqueteBueno({ fuentes: [] }))).toThrow(/f1/);
  });

  it('tolera campos extra en bloques y fuentes (material-apoyo puede sumar datos)', () => {
    const p = paqueteBueno();
    const extra = { ...p, contenido: { ...p.contenido, secciones: [{ id: 's1', titulo: 'x', bloques: [{ tipo: 'haz', texto: 't', nota: 'extra' }] }] } };
    expect(() => analizarMaterial('brag-video', extra)).not.toThrow();
  });

  it.each([
    ['la URL de una herramienta', () => {
      const p = paqueteBueno();
      p.contenido.secciones[0]!.bloques[1]!.url = 'javascript:alert(1)';
      return p;
    }],
    ['la URL de una fuente', () => {
      const p = paqueteBueno();
      p.fuentes[0]!.url = 'javascript:alert(1)';
      return p;
    }],
    ['la URL del video', () => paqueteBueno({ video: 'javascript:alert(1)' })],
  ])('rechaza protocolos no HTTP(S) en %s', (_caso, paquete) => {
    expect(() => analizarMaterial('brag-video', paquete())).toThrow(/URL|protocol/i);
  });

  it('acepta una comparativa con el encabezado de la primera columna vacío', () => {
    const p = paqueteBueno();
    const comparativa = {
      ...p,
      contenido: {
        ...p.contenido,
        secciones: [{ id: 's1', titulo: 'x', bloques: [{ tipo: 'comparativa', columnas: ['', 'Para qué sirve'], filas: [['Claude', 'Escribir']] }] }],
      },
    };
    expect(() => analizarMaterial('brag-video', comparativa)).not.toThrow();
  });
});

describe('imagenesDe', () => {
  it('lista logos y capturas sin repetir', () => {
    expect(imagenesDe(analizarMaterial('brag-video', paqueteBueno()).material)).toEqual(['logos/claude.svg', 'capturas/sitio.png']);
  });
});

describe('leerMateriales', () => {
  it('lee cada carpeta con material.json y da un error claro si el JSON está roto', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'materiales-'));
    fs.mkdirSync(path.join(dir, 'brag-video'));
    fs.writeFileSync(path.join(dir, 'brag-video', 'material.json'), JSON.stringify(paqueteBueno()));
    expect(leerMateriales(dir).map((r) => r.slug)).toEqual(['brag-video']);
    fs.mkdirSync(path.join(dir, 'roto'));
    fs.writeFileSync(path.join(dir, 'roto', 'material.json'), '{');
    expect(() => leerMateriales(dir)).toThrow(/materiales\/roto\/material\.json: no es JSON válido/);
  });

  it('sin carpeta devuelve []', () => {
    expect(leerMateriales('/no/existe')).toEqual([]);
  });
});
