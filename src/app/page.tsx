import { CajaNewsletter } from '@/componentes/CajaNewsletter';
import { Consultoria } from '@/componentes/home/Consultoria';
import { Hero } from '@/componentes/home/Hero';
import { ParaEmpresas } from '@/componentes/home/ParaEmpresas';
import { QueEncuentras } from '@/componentes/home/QueEncuentras';
import { UltimosRecursos } from '@/componentes/home/UltimosRecursos';
import { crearIndice } from '@/lib/contenido/consultas';
import { obtenerRecursos } from '@/lib/contenido/recursos';

export const revalidate = 86400;

export default function Inicio() {
  const ultimos = crearIndice(obtenerRecursos().slice(0, 6), new Date());
  return (
    <main className="mx-auto max-w-6xl px-4">
      <Hero />
      <QueEncuentras />
      <UltimosRecursos entradas={ultimos} />
      <Consultoria />
      <ParaEmpresas />
      <CajaNewsletter />
    </main>
  );
}
