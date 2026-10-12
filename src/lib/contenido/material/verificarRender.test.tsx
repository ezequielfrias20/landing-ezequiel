import { describe, expect, it } from 'vitest';
import { analizarMaterial } from './analizar';
import { paqueteBueno } from './fixture';
import { verificarRenderMateriales } from './verificarRender';

describe('verificarRenderMateriales', () => {
  it('renderiza un material sin errores y no dibuja el cierre', () => {
    const r = analizarMaterial('brag-video', paqueteBueno());
    expect(verificarRenderMateriales([r])).toEqual([]);
  });
});
