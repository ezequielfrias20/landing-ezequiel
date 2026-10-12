import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Parrafos, TextoMarcado } from './TextoMarcado';

const html = (t: string) => renderToStaticMarkup(<TextoMarcado texto={t} />);

describe('TextoMarcado', () => {
  it('interpreta **negrita** y `código`, como fmt() de armar.py', () => {
    expect(html('Usa **/brag** y `node -v`.')).toBe('Usa <strong>/brag</strong> y <code>node -v</code>.');
  });

  it('código dentro de negrita', () => {
    expect(html('**corre `x`**')).toBe('<strong>corre <code>x</code></strong>');
  });

  it('nunca interpreta HTML ni llaves', () => {
    expect(html('<script>alert(1)</script> & {{tu producto}}')).toBe('&lt;script&gt;alert(1)&lt;/script&gt; &amp; {{tu producto}}');
  });
});

describe('Parrafos', () => {
  it('parte en párrafos por línea en blanco', () => {
    expect(renderToStaticMarkup(<Parrafos texto={'Uno.\n\nDos **b**.'} />)).toBe('<div><p>Uno.</p><p>Dos <strong>b</strong>.</p></div>');
  });
});
