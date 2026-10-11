import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compilarMdx } from './mdx';

describe('compilarMdx', () => {
  it('compila markdown, tablas GFM y componentes propios', async () => {
    const Contenido = await compilarMdx(
      'prueba',
      '# Título\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n<Paso n="1">Hacer algo</Paso>',
    );
    const Paso = ({ n, children }: { n: string; children: ReactNode }) => <div data-paso={n}>{children}</div>;
    const html = renderToStaticMarkup(<Contenido components={{ Paso }} />);
    expect(html).toContain('<h1>Título</h1>');
    expect(html).toContain('<table>');
    expect(html).toContain('data-paso="1"');
  });
});
