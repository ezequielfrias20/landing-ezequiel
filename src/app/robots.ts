import type { MetadataRoute } from 'next';
import { sitioUrl } from '@/lib/seo/llms';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${sitioUrl()}/sitemap.xml`,
  };
}
