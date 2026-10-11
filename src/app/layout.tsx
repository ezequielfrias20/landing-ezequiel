import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Encabezado } from '@/componentes/Encabezado';
import { Pie } from '@/componentes/Pie';
import { marca } from '@/config/marca';
import { sitioUrl } from '@/lib/seo/llms';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(sitioUrl()),
  title: { default: `${marca.nombre} · ${marca.posicionamiento}`, template: `%s · ${marca.nombre}` },
  description: marca.descripcion,
  openGraph: { locale: 'es_LA', siteName: marca.nombre, type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Encabezado />
        {children}
        <Pie />
        <Analytics />
      </body>
    </html>
  );
}
