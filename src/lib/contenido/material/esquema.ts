import { z } from 'zod';
import { PATRON_ARCHIVO_DESCARGA } from '../esquema';

/** Paquete de material que escribe el dashboard (spec "Paquete de material").
 *  Los bloques son los de Reels/material-apoyo/scripts/validar_material.py (CAMPOS). Un tipo desconocido es error;
 *  un campo extra se tolera (z.object, no strict): material-apoyo puede sumar datos sin romper la web. */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const texto = z.string().min(1);
const ref = z.string().regex(/^f\d+$/, 'una fuente va como f1, f2…');
const conFuente = { fuente: ref.optional() };

export const esquemaBloque = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('haz'), texto, ...conFuente }),
  z.object({ tipo: z.literal('micro'), texto, ...conFuente }),
  z.object({ tipo: z.literal('ojo'), texto, ...conFuente }),
  z.object({ tipo: z.literal('pagina') }),
  z.object({ tipo: z.literal('pasos'), items: z.array(z.object({ texto, codigo: z.string().optional() })).min(1), ...conFuente }),
  z.object({ tipo: z.literal('prompt'), titulo: texto, texto, ...conFuente }),
  z.object({ tipo: z.literal('checklist'), items: z.array(texto).min(2), ...conFuente }),
  z.object({ tipo: z.literal('comparativa'), columnas: z.array(texto).min(2), filas: z.array(z.array(z.string())).min(1), ...conFuente }),
  z.object({ tipo: z.literal('herramienta'), slug: z.string().regex(SLUG), nombre: texto, que_hace: texto, precio: texto, url: z.url(), fuente: ref }),
  z.object({ tipo: z.literal('captura'), archivo: z.string().regex(/^[a-z0-9][a-z0-9-]*\.(png|jpg)$/), pie: texto, fuente: ref }),
  z.object({ tipo: z.literal('ejemplo'), titulo: texto, antes: texto, despues: texto, etiquetas: z.tuple([texto, texto]).optional(), ...conFuente }),
  z.object({ tipo: z.literal('dato'), valor: texto, texto, fuente: ref }),
]);

export const esquemaPaquete = z.strictObject({
  contenido: z.object({
    id: texto,
    version: z.number().int().positive(),
    verificado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    formato: z.enum(['plantilla', 'checklist', 'mapa', 'mini-auditoria']),
    palabra: z.string().regex(/^[A-ZÑ][A-ZÑ0-9]{2,11}$/),
    nombre_pdf: z.string().regex(SLUG),
    portada: z.object({ titulo: texto, acento: z.string().optional(), subtitulo: texto, herramientas: z.array(z.string().regex(SLUG)).default([]) }),
    te_llevas: z.object({ puntos: z.array(texto).min(1), tiempo: texto, empieza_por: texto }),
    secciones: z.array(z.object({ id: z.string().regex(/^s\d+$/), titulo: texto, bloques: z.array(esquemaBloque).min(1) })).min(1),
    despues: z.object({ titulo: texto, texto }),
    cierre: z.object({ titulo: z.string(), texto: z.string() }).optional(),
  }),
  fuentes: z.array(z.object({ id: ref, titulo: texto, url: z.url() })),
  herramientas: z.record(
    z.string().regex(SLUG),
    z.strictObject({
      nombre: texto,
      logo: z.string().regex(/^logos\/[a-z0-9][a-z0-9._-]*\.(svg|png)$/),
      fondo: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
  ),
  pdf: z.string().regex(PATRON_ARCHIVO_DESCARGA).refine((s) => s.endsWith('.pdf'), 'el pdf termina en .pdf'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  video: z.url().optional(),
  origen: z.object({ material: texto, version: z.number().int().positive() }),
});

export type PaqueteMaterial = z.infer<typeof esquemaPaquete>;
export type Bloque = z.infer<typeof esquemaBloque>;
