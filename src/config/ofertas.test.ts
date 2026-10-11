import { describe, expect, it } from 'vitest';
import { esEnlaceExterno, ofertas, ofertasVisibles, type Oferta } from './ofertas';

describe('ofertasVisibles', () => {
  it('oculta las ofertas en estado oculto y mantiene activas y próximamente', () => {
    const lista: Oferta[] = [
      { id: 'recursos', titulo: 'A', descripcion: '', href: '/recursos', estado: 'activo' },
      { id: 'workshops', titulo: 'B', descripcion: '', href: '#', estado: 'proximamente' },
      { id: 'comunidad', titulo: 'C', descripcion: '', href: '#', estado: 'oculto' },
    ];
    expect(ofertasVisibles(lista).map((o) => o.id)).toEqual(['recursos', 'workshops']);
  });

  it('al lanzar muestra recursos, consultoría y empresas', () => {
    expect(ofertasVisibles(ofertas).map((o) => o.id)).toEqual(['recursos', 'consultoria', 'empresas']);
  });
});

describe('esEnlaceExterno', () => {
  it('distingue URLs absolutas de rutas internas', () => {
    expect(esEnlaceExterno('https://cubolabsia.com')).toBe(true);
    expect(esEnlaceExterno('/recursos')).toBe(false);
  });
});
