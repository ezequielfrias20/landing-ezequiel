import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { extraerTexto, partirPlaceholders } from './texto';

describe('extraerTexto', () => {
  it('devuelve el string tal cual', () => {
    expect(extraerTexto('Actúa como [ROL]')).toBe('Actúa como [ROL]');
  });

  it('une párrafos con línea en blanco y recorre elementos anidados', () => {
    const nodo = [
      createElement('p', { key: 1 }, 'Línea uno'),
      createElement('p', { key: 2 }, 'Con ', createElement('strong', null, 'negrita')),
    ];
    expect(extraerTexto(nodo).trim()).toBe('Línea uno\n\nCon negrita');
  });
});

describe('partirPlaceholders', () => {
  it('separa los [placeholders]', () => {
    expect(partirPlaceholders('Hola [NOMBRE], tu cita es el [DÍA].')).toEqual([
      { texto: 'Hola ', placeholder: false },
      { texto: '[NOMBRE]', placeholder: true },
      { texto: ', tu cita es el ', placeholder: false },
      { texto: '[DÍA]', placeholder: true },
      { texto: '.', placeholder: false },
    ]);
  });

  it('partirPlaceholders con llaves marca {{…}} y deja los corchetes', () => {
    expect(partirPlaceholders('Hola {{nombre}} [x]', 'llaves')).toEqual([
      { texto: 'Hola ', placeholder: false }, { texto: '{{nombre}}', placeholder: true }, { texto: ' [x]', placeholder: false },
    ]);
  });
});
