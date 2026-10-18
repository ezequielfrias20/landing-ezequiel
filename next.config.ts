import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Las pruebas E2E compilan en otra carpeta para no pisar el build de desarrollo.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Las rutas leen contenido/ desde disco en runtime: Vercel debe incluirlo en cada función.
  outputFileTracingIncludes: { '/**': ['./contenido/**/*'] },
  // Propuestas a clientes: solo se llega con el link, ningún buscador las indexa.
  async headers() {
    return [{ source: '/propuestas/:archivo*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  // Next 16 procesa Tailwind con este loader (create-next-app lo genera aquí, sin postcss.config).
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
