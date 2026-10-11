import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Encabezado } from '@/componentes/Encabezado';
import { Pie } from '@/componentes/Pie';
import './globals.css';

export const metadata: Metadata = { title: 'Ezequiel Frias' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Encabezado />
        {children}
        <Pie />
      </body>
    </html>
  );
}
