import type { MetadataRoute } from 'next';
import { obtenerRecursos } from '@/lib/contenido/recursos';
import { sitioUrl } from '@/lib/seo/llms';

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = sitioUrl();
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/recursos`, changeFrequency: 'daily', priority: 0.9 },
    ...obtenerRecursos().map((r) => ({ url: `${base}/r/${r.slug}`, lastModified: r.fecha, priority: 0.7 })),
  ];
}
