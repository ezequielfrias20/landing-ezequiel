import { describe, expect, it } from 'vitest';
import { verificarRender } from './verificarRender';

const rec = (cuerpo: string) => [{ archivo: 'a.mdx', cuerpo }];

describe('verificarRender', () => {
  it('un cuerpo válido no da errores', async () => {
    const cuerpo = '# Hola\n\n<Paso n="1" titulo="Uno">Texto</Paso>\n\n<Premium>\n\nsecreto\n\n</Premium>\n\n<Video url="https://youtu.be/abcdefghijk" />\n\n<Descarga archivo="a.pdf" nombre="A" />';
    expect(await verificarRender(rec(cuerpo))).toEqual([]);
  });

  it('{USD} (variable inexistente) es un error con el nombre del archivo', async () => {
    const errores = await verificarRender(rec('Cuesta {USD} al mes.'));
    expect(errores).toHaveLength(1);
    expect(errores[0]).toMatch(/^a\.mdx: .*USD/);
  });

  it('un <Paso> sin cerrar es un error', async () => {
    const errores = await verificarRender(rec('<Paso n="1">\n\nTexto sin cerrar'));
    expect(errores).toHaveLength(1);
    expect(errores[0]).toMatch(/^a\.mdx: /);
  });

  it('un componente inexistente (<Premiun>) es un error', async () => {
    const errores = await verificarRender(rec('<Premiun>\n\nsecreto\n\n</Premiun>'));
    expect(errores).toHaveLength(1);
    expect(errores[0]).toMatch(/^a\.mdx: .*Premiun/);
  });
});
