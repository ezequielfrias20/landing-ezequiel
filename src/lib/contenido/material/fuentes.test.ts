import { describe, expect, it } from 'vitest';
import type { PaqueteMaterial } from './esquema';
import { fuentesCitadas, numerarFuentes } from './fuentes';
import { paqueteBueno } from './fixture';

describe('fuentes', () => {
  const p = paqueteBueno() as unknown as PaqueteMaterial;

  it('numera por orden de primera aparición, como armar.py', () => {
    expect([...numerarFuentes(p.contenido)]).toEqual([['f1', 1], ['f2', 2]]);
  });

  it('lista solo las citadas, con su dominio', () => {
    expect(fuentesCitadas(p)).toEqual([
      { id: 'f1', n: 1, titulo: 'README', url: 'https://github.com/latent-spaces/brag', dato: 'd', dominio: 'github.com' },
      { id: 'f2', n: 2, titulo: 'Sitio', url: 'https://latent-spaces.github.io/brag', dato: 'd', dominio: 'latent-spaces.github.io' },
    ]);
  });
});
