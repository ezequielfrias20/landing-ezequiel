import type { Tema, TipoRecurso } from '@/config/taxonomia';
import type { Frontmatter } from './esquema';
import type { PaqueteMaterial } from './material/esquema';

interface RecursoBase extends Omit<Frontmatter, 'herramientas'> {
  slug: string;
  archivo: string;
  /** Slugs de herramientas: los de la taxonomía (MDX) o los del material. */
  herramientas: string[];
  /** Nombre visible de cada herramienta, en el mismo orden. */
  nombresHerramientas: string[];
  premium: boolean;
  pasos: number;
  /** Todos los archivos que el recurso ofrece (frontmatter + <Descarga> del cuerpo). */
  archivosDescarga: string[];
  /** Archivos referenciados por <Descarga> dentro de <Premium>. */
  descargasPremium: string[];
}

export interface RecursoMdx extends RecursoBase {
  origen: 'mdx';
  cuerpo: string;
}

export interface RecursoMaterial extends RecursoBase {
  origen: 'material';
  material: PaqueteMaterial;
}

export type Recurso = RecursoMdx | RecursoMaterial;

/** Versión liviana y serializable para la bóveda: nunca incluye el cuerpo. */
export interface EntradaIndice {
  slug: string;
  titulo: string;
  resumen: string;
  /** Para que quien viene de un reel encuentre el recurso buscando la palabra que comentó. */
  palabraClave?: string;
  tipo: TipoRecurso;
  temas: Tema[];
  herramientas: string[];
  nombresHerramientas: string[];
  fecha: string;
  premium: boolean;
  nuevo: boolean;
}
