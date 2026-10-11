import type { Herramienta, Tema, TipoRecurso } from '@/config/taxonomia';
import type { Frontmatter } from './esquema';

export interface Recurso extends Frontmatter {
  slug: string;
  archivo: string;
  cuerpo: string;
  premium: boolean;
  pasos: number;
  /** Todos los archivos que el recurso ofrece (frontmatter + <Descarga> del cuerpo). */
  archivosDescarga: string[];
  /** Archivos referenciados por <Descarga> dentro de <Premium>. */
  descargasPremium: string[];
}

/** Versión liviana y serializable para la bóveda: nunca incluye el cuerpo. */
export interface EntradaIndice {
  slug: string;
  titulo: string;
  resumen: string;
  /** Para que quien viene de un reel encuentre el recurso buscando la palabra que comentó. */
  palabraClave?: string;
  tipo: TipoRecurso;
  temas: Tema[];
  herramientas: Herramienta[];
  fecha: string;
  premium: boolean;
  nuevo: boolean;
}
