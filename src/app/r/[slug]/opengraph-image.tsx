import { ImageResponse } from 'next/og';
import { marca } from '@/config/marca';
import { PALETA } from '@/config/paleta';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import { obtenerRecurso } from '@/lib/contenido/recursos';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 72,
          background: `radial-gradient(120% 90% at 50% 42%, ${PALETA.oscuro.fondo2} 0%, ${PALETA.oscuro.fondo} 70%)`,
          color: PALETA.oscuro.tinta,
        }}
      >
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              textTransform: 'uppercase',
              letterSpacing: 5,
              padding: '10px 22px',
              borderRadius: 999,
              border: `2px solid ${PALETA.oscuro.linea}`,
              background: PALETA.oscuro.superficie,
            }}
          >
            {recurso ? ETIQUETAS_TIPO[recurso.tipo] : 'Recursos'}
          </div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.06, letterSpacing: -2 }}>{recurso?.titulo ?? marca.nombre}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: PALETA.oscuro.acento }} />
          <div style={{ fontWeight: 800 }}>{marca.nombre}</div>
          <div style={{ color: PALETA.oscuro.suave }}>{marca.posicionamiento}</div>
        </div>
      </div>
    ),
    size,
  );
}
