import { ImageResponse } from 'next/og';
import { marca } from '@/config/marca';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import { obtenerRecurso } from '@/lib/contenido/recursos';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 72, background: '#fafafa', color: '#171717' }}>
        <div style={{ fontSize: 32, textTransform: 'uppercase', letterSpacing: 4 }}>
          {recurso ? ETIQUETAS_TIPO[recurso.tipo] : 'Recursos'}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{recurso?.titulo ?? marca.nombre}</div>
        <div style={{ fontSize: 32 }}>{marca.nombre}</div>
      </div>
    ),
    size,
  );
}
