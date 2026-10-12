import type { PaqueteMaterial } from '@/lib/contenido/material/esquema';

export function Logo({ herramienta, materialSlug, tam = 'md' }: { herramienta: PaqueteMaterial['herramientas'][string]; materialSlug: string; tam?: 'md' | 'lg' }) {
  const caja = tam === 'lg' ? 'h-16 w-16 rounded-[18px] sm:h-20 sm:w-20' : 'h-14 w-14 rounded-[16px]';
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden border border-linea ${caja}`} style={{ background: herramienta.fondo }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- la imagen sale de una ruta propia y su tamaño es fijo */}
      <img src={`/materiales/${materialSlug}/${herramienta.logo}`} alt={herramienta.nombre} className="h-[56%] w-[56%] object-contain" loading="lazy" />
    </span>
  );
}
