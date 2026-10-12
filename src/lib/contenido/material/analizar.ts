import fs from 'node:fs';
import path from 'node:path';
import type { TipoRecurso } from '@/config/taxonomia';
import { ErrorContenido } from '../analizar';
import type { RecursoMaterial } from '../tipos';
import { esquemaPaquete, type PaqueteMaterial } from './esquema';
import { numerarFuentes } from './fuentes';

const TIPO_POR_FORMATO: Record<PaqueteMaterial['contenido']['formato'], TipoRecurso> = {
  plantilla: 'paso-a-paso', checklist: 'plantilla', mapa: 'guia', 'mini-auditoria': 'guia',
};

function recortar(s: string, max: number): string {
  if (s.length <= max) return s;
  const corte = s.slice(0, max - 1);
  return `${corte.slice(0, corte.lastIndexOf(' ')).replace(/[\s,.;:]+$/, '')}…`;
}

/** Slugs de herramientas que el material muestra con logo: portada y bloques herramienta. */
function herramientasUsadas(p: PaqueteMaterial): string[] {
  const enBloques = p.contenido.secciones.flatMap((s) => s.bloques.flatMap((b) => (b.tipo === 'herramienta' ? [b.slug] : [])));
  return [...new Set([...p.contenido.portada.herramientas, ...enBloques])];
}

export function imagenesDe(p: PaqueteMaterial): string[] {
  const logos = herramientasUsadas(p).flatMap((s) => (p.herramientas[s] ? [p.herramientas[s].logo] : []));
  const capturas = p.contenido.secciones.flatMap((s) => s.bloques.flatMap((b) => (b.tipo === 'captura' ? [`capturas/${b.archivo}`] : [])));
  return [...new Set([...logos, ...capturas])];
}

export function analizarMaterial(slug: string, json: unknown): RecursoMaterial {
  const archivo = `materiales/${slug}/material.json`;
  const r = esquemaPaquete.safeParse(json);
  if (!r.success) {
    const detalle = r.error.issues.map((i) => `  - ${i.path.join('.') || '(paquete)'}: ${i.message}`).join('\n');
    throw new ErrorContenido(`${archivo}: paquete inválido\n${detalle}`);
  }
  const p = r.data;
  const c = p.contenido;
  const errores: string[] = [];
  if (c.nombre_pdf !== slug) errores.push(`la carpeta se llama ${slug} pero nombre_pdf es ${c.nombre_pdf}`);
  if (p.pdf !== `${slug}.pdf`) errores.push(`el pdf tiene que llamarse ${slug}.pdf (dice ${p.pdf})`);
  for (const h of herramientasUsadas(p)) if (!p.herramientas[h]) errores.push(`falta el logo de la herramienta ${h} en herramientas`);
  const ids = new Set(p.fuentes.map((f) => f.id));
  for (const f of numerarFuentes(c).keys()) if (!ids.has(f)) errores.push(`la fuente ${f} se cita pero no está en fuentes`);
  if (errores.length) throw new ErrorContenido(`${archivo}:\n${errores.map((e) => `  - ${e}`).join('\n')}`);

  const herramientas = c.portada.herramientas;
  return {
    origen: 'material',
    material: p,
    slug,
    archivo,
    titulo: c.portada.titulo,
    resumen: recortar(c.portada.subtitulo, 300),
    palabraClave: c.palabra,
    tipo: TIPO_POR_FORMATO[c.formato],
    temas: ['ia-practica'],
    herramientas,
    nombresHerramientas: herramientas.map((h) => p.herramientas[h]?.nombre ?? h),
    fecha: new Date(`${p.fecha}T00:00:00Z`),
    duracion: c.te_llevas.tiempo,
    video: p.video,
    descargas: [{ nombre: 'El material en PDF', archivo: p.pdf }],
    relacionados: [],
    borrador: false,
    premium: false,
    pasos: c.secciones.length,
    archivosDescarga: [p.pdf],
    descargasPremium: [],
  };
}

export function leerMateriales(dir: string): RecursoMaterial[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const archivo = path.join(dir, d.name, 'material.json');
      if (!fs.existsSync(archivo)) throw new ErrorContenido(`materiales/${d.name}: falta material.json`);
      let json: unknown;
      try {
        json = JSON.parse(fs.readFileSync(archivo, 'utf8'));
      } catch {
        throw new ErrorContenido(`materiales/${d.name}/material.json: no es JSON válido`);
      }
      return analizarMaterial(d.name, json);
    });
}
