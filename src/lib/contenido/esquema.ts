import { z } from 'zod';
import { HERRAMIENTAS, TEMAS, TIPOS } from '@/config/taxonomia';

export const PATRON_ARCHIVO_DESCARGA = /^[a-z0-9][a-z0-9._-]*$/;

export const esquemaFrontmatter = z.strictObject({
  titulo: z.string().min(1),
  resumen: z.string().min(1).max(300),
  palabraClave: z
    .string()
    .regex(/^[A-ZÁÉÍÓÚÑÜ0-9]+$/, 'debe ir en mayúsculas y sin espacios, como en ManyChat')
    .optional(),
  tipo: z.enum(TIPOS),
  temas: z.array(z.enum(TEMAS)).min(1),
  herramientas: z.array(z.enum(HERRAMIENTAS)).default([]),
  fecha: z.coerce.date(),
  duracion: z.string().optional(),
  video: z.url().optional(),
  descargas: z
    .array(
      z.strictObject({
        nombre: z.string().min(1),
        archivo: z.string().regex(PATRON_ARCHIVO_DESCARGA, 'minúsculas, números, punto, guion o guion bajo'),
      }),
    )
    .default([]),
  relacionados: z.array(z.string()).default([]),
  borrador: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof esquemaFrontmatter>;
