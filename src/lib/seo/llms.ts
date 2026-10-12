import { marca } from '@/config/marca';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import type { Recurso } from '@/lib/contenido/tipos';

export function sitioUrl(): string {
  const produccion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const base = process.env.SITIO_URL || (produccion ? `https://${produccion}` : 'http://localhost:3000');
  return base.replace(/\/+$/, '');
}

export function generarLlmsTxt(recursos: Recurso[], base: string): string {
  const lineas = [
    `# ${marca.nombre}`,
    '',
    `> ${marca.posicionamiento}. ${marca.descripcion}`,
    '',
    '## Recursos',
    '',
    ...recursos.filter((r) => r.origen === 'mdx').map((r) => `- [${r.titulo}](${base}/r/${r.slug}): ${r.resumen} (${ETIQUETAS_TIPO[r.tipo]})`),
    '',
    '## Servicios',
    '',
    `- [Diagnóstico de automatización](${marca.diagnostico.url}): ${marca.diagnostico.detalle}`,
    `- [${marca.agencia.nombre}](${marca.agencia.url}): implementación para empresas`,
    '',
  ];
  return lineas.join('\n');
}
