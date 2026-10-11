import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Encabezado } from '@/componentes/Encabezado';
import { Pie } from '@/componentes/Pie';
import { SCRIPT_TEMA } from '@/componentes/tema/tema';
import { marca } from '@/config/marca';
import { PALETA } from '@/config/paleta';
import { sitioUrl } from '@/lib/seo/llms';
import './globals.css';

// Las dos familias de la marca, self-hosted (subset latino: incluye tildes, ñ, ¿ y ¡).
const inter = localFont({
  src: [
    { path: './fuentes/Inter-400.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/Inter-700.woff2', weight: '700', style: 'normal' },
    { path: './fuentes/Inter-900.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--fuente-inter',
  display: 'swap',
});

const mono = localFont({
  src: [
    { path: './fuentes/JetBrainsMono-400.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/JetBrainsMono-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--fuente-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(sitioUrl()),
  title: { default: `${marca.nombre} · ${marca.posicionamiento}`, template: `%s · ${marca.nombre}` },
  description: marca.descripcion,
  openGraph: { locale: 'es_LA', siteName: marca.nombre, type: 'website' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: PALETA.oscuro.fondo },
    { media: '(prefers-color-scheme: light)', color: PALETA.claro.fondo },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Pone el tema antes de pintar: sin parpadeo entre claro y oscuro. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <a
          href="#contenido"
          className="etiqueta sr-only z-50 rounded-full bg-tinta px-4 py-2 text-fondo focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <Encabezado />
        <div id="contenido">{children}</div>
        <Pie />
        <Analytics />
      </body>
    </html>
  );
}
