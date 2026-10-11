import { marca } from './marca';

export type EstadoOferta = 'activo' | 'proximamente' | 'oculto';

export interface Oferta {
  id: 'recursos' | 'consultoria' | 'workshops' | 'comunidad' | 'empresas';
  titulo: string;
  descripcion: string;
  etiqueta?: string;
  href: string;
  estado: EstadoOferta;
}

// Para activar una oferta futura, cambia su estado a 'activo' o 'proximamente'.
export const ofertas: Oferta[] = [
  {
    id: 'recursos',
    titulo: 'Recursos',
    descripcion: 'Prompts, plantillas y guías paso a paso de todo lo que muestro en redes.',
    etiqueta: 'gratis',
    href: '/recursos',
    estado: 'activo',
  },
  {
    id: 'consultoria',
    titulo: 'Diagnóstico de automatización',
    descripcion: 'Una llamada para ver qué conviene automatizar primero en tu negocio.',
    etiqueta: '45 minutos',
    href: marca.diagnostico.url,
    estado: 'activo',
  },
  {
    id: 'workshops',
    titulo: 'Workshops y charlas',
    descripcion: 'Talleres en vivo y charlas para equipos y eventos.',
    href: '#',
    estado: 'oculto',
  },
  {
    id: 'comunidad',
    titulo: 'Comunidad',
    descripcion: 'Un espacio para aprender con otros que están automatizando su negocio.',
    href: '#',
    estado: 'oculto',
  },
  {
    id: 'empresas',
    titulo: 'Para empresas',
    descripcion: 'Si buscas un equipo que diseñe e implemente el sistema completo, lo hacemos desde AIMA.',
    href: marca.agencia.url,
    estado: 'activo',
  },
];

export function ofertasVisibles(lista: Oferta[] = ofertas): Oferta[] {
  return lista.filter((o) => o.estado !== 'oculto');
}

export function esEnlaceExterno(href: string): boolean {
  return /^https?:\/\//.test(href);
}
