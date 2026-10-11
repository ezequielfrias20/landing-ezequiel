import type { ReactNode } from 'react';
import { extraerTexto } from '@/lib/contenido/texto';
import { CajaPrompt } from './CajaPrompt';

export function Prompt({ titulo = 'Prompt', children }: { titulo?: string; children: ReactNode }) {
  return <CajaPrompt titulo={titulo} texto={extraerTexto(children).trim()} />;
}
