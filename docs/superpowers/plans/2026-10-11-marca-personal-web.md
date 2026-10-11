# Web de marca personal Ezequiel Frias: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la web de marca personal (home con ofertas + bóveda de recursos con contenido premium por email) lista para desplegar en Vercel.

**Architecture:** Next.js App Router. Los recursos son archivos MDX en `contenido/recursos/` leídos desde disco y validados con Zod; el MDX se compila en el servidor con `@mdx-js/mdx`. El bloque `<Premium>` es un Server Component que lee una cookie firmada (HMAC) y solo renderiza su contenido si es válida. Los emails pasan por una función pura (`procesarAlta`) con dependencias inyectadas: Supabase (o memoria en pruebas) y Brevo.

**Tech Stack:** Next.js ≥15 (App Router, TypeScript, Tailwind v4), `@mdx-js/mdx`, `gray-matter`, `zod@4`, `remark-gfm`, `@supabase/supabase-js`, `@vercel/analytics`, Vitest, Playwright, `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-11-marca-personal-web-design.md`

## Global Constraints

- Ruta del proyecto: `/Users/ezequielfrias/Documents/Cubo/mi-universo/Desarrollo/Páginas webs/marca-personal-web` (contiene "Páginas" con tilde y un espacio: siempre entre comillas en la shell).
- Node ≥ 20 (la máquina tiene v24.19.0). npm como gestor.
- Next.js ≥ 15: `params` y `cookies()` son asíncronos (`await params`, `await cookies()`).
- Código, nombres internos y copy en español. Copy en español neutro latinoamericano, tuteo, frases cortas, concreto.
- Sin emojis en la web. Sin cifras, testimonios ni casos inventados. Datos faltantes se marcan `porConfirmar`.
- El contenido dentro de `<Premium>` nunca llega al navegador de quien no desbloqueó (ni HTML, ni payload RSC, ni JS, ni índice de búsqueda, ni `llms.txt`).
- Un email desbloquea todo lo premium por 365 días (cookie `ef_acceso`, `httpOnly`, `sameSite=lax`, `secure` cuando la request es https).
- Diseño visual fuera de alcance: estilos mínimos y neutros con Tailwind y tokens en `src/app/globals.css`, para que la fase de diseño los reemplace.
- Contenido: `contenido/recursos/<slug>.mdx` y `contenido/descargas/<archivo>`.
- Variables de entorno: `ACCESO_SECRET` (≥32 caracteres), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, `BREVO_LISTA_ID`, `SITIO_URL`; solo para pruebas: `ALMACEN_LEADS=memoria`, `DIR_RECURSOS`, `DIR_DESCARGAS`, `NEXT_DIST_DIR`.
- Todo commit termina con la línea `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Desviaciones respecto del spec (ya reflejadas en el spec)

- `/r/[slug]` es siempre dinámica (no estática para recursos libres). Motivo: si Next prerenderiza una página con `<Premium>` sin cookie, serviría para siempre la versión bloqueada a quien ya desbloqueó.
- Las descargas viven en `contenido/descargas/` y se sirven por `/descargas/[archivo]`; las que están dentro de `<Premium>` exigen la cookie. En `public/` cualquiera podría bajarlas sin email.

## Review Focus

1. **Despliegue en Vercel sin los archivos de `contenido/`**: las rutas leen MDX desde disco en runtime; si la función serverless no los incluye, `/r/*` da 500 en producción aunque en local funcione. Se espera que cargue. Cubierto por `outputFileTracingIncludes` (Task 1) y el smoke test del deploy (Task 11).
2. **Mismo email escrito distinto** (`" Ana@Correo.COM "` y `ana@correo.com`): debe ser un solo lead. Test en Task 4.
3. **Búsqueda sin tildes** (`clinica`, `diagnostico`): debe encontrar títulos con tilde. Test en Task 7.
4. **Cookie vencida, adulterada o firmada con un secreto anterior** (p. ej. tras rotar `ACCESO_SECRET`): se muestra el formulario otra vez, sin error 500. Tests en Task 3 y Task 6.
5. **Link compartido con un filtro que ya no existe** (`/recursos?tema=viejo`): se ignora ese filtro y se ven todos los recursos, no una bóveda vacía. Test en Task 7.

---

## Mapa de archivos

```
marca-personal-web/
├── next.config.ts                     distDir configurable, tracing de contenido/
├── vitest.config.ts
├── playwright.config.ts               build + start con fixtures y leads en memoria
├── .env.example
├── scripts/validar-contenido.ts       corre en prebuild
├── supabase/migrations/20261011000000_leads.sql
├── contenido/
│   ├── COMO-ESCRIBIR-RECURSOS.md      guía para crear recursos con Claude
│   ├── recursos/*.mdx
│   └── descargas/*
├── e2e/
│   ├── fixtures/recursos/{guia-libre,plantilla-premium}.mdx
│   ├── fixtures/descargas/premium-e2e.pdf
│   ├── recurso.spec.ts  boveda.spec.ts  home.spec.ts  seo.spec.ts
├── public/marca/perfil.jpg
└── src/
    ├── config/        marca.ts  ofertas.ts  taxonomia.ts
    ├── lib/
    │   ├── contenido/ esquema.ts  tipos.ts  analizar.ts  consultas.ts  recursos.ts  mdx.ts  embed.ts  texto.ts
    │   ├── acceso/    token.ts
    │   ├── leads/     alta.ts  memoria.ts  supabase.ts  brevo.ts  dependencias.ts  manejador.ts
    │   ├── boveda/    filtros.ts
    │   └── seo/       llms.ts
    ├── componentes/
    │   ├── mdx/       Paso.tsx Nota.tsx Video.tsx Descarga.tsx Prompt.tsx CajaPrompt.tsx Premium.tsx index.tsx
    │   ├── boveda/    Boveda.tsx  GrupoFiltros.tsx
    │   ├── home/      Hero.tsx QueEncuentras.tsx UltimosRecursos.tsx Consultoria.tsx ParaEmpresas.tsx
    │   ├── FormularioEmail.tsx  CajaNewsletter.tsx  SiguientePaso.tsx  TarjetaRecurso.tsx
    │   └── Encabezado.tsx  Pie.tsx
    └── app/
        ├── layout.tsx  page.tsx  globals.css  sitemap.ts  robots.ts
        ├── llms.txt/route.ts
        ├── recursos/page.tsx
        ├── r/[slug]/page.tsx  not-found.tsx  opengraph-image.tsx
        ├── descargas/[archivo]/route.ts
        └── api/desbloquear/route.ts  api/suscribir/route.ts
```

---

### Task 1: Proyecto base y configuración de marca

**Files:**
- Create: proyecto Next.js en `marca-personal-web/` (conservando `docs/`)
- Create: `next.config.ts`, `vitest.config.ts`, `.env.example`, `src/config/marca.ts`, `src/config/ofertas.ts`, `src/config/taxonomia.ts`, `public/marca/perfil.jpg`
- Modify: `package.json` (scripts), `.gitignore`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/layout.tsx`
- Test: `src/config/ofertas.test.ts`

**Interfaces:**
- Produces: `marca` (objeto de marca); `Oferta`, `EstadoOferta`, `ofertas`, `ofertasVisibles(lista?)`, `esEnlaceExterno(href)`; `TIPOS`, `TipoRecurso`, `ETIQUETAS_TIPO`, `TEMAS`, `Tema`, `ETIQUETAS_TEMA`, `HERRAMIENTAS`, `Herramienta`, `ETIQUETAS_HERRAMIENTA`.

- [ ] **Step 1: Crear el proyecto conservando `docs/`**

`create-next-app` exige carpeta vacía, así que se aparta `docs/` y se devuelve después:

```bash
cd "/Users/ezequielfrias/Documents/Cubo/mi-universo/Desarrollo/Páginas webs"
mv marca-personal-web/docs ./_docs_marca_tmp && rmdir marca-personal-web
npx create-next-app@latest marca-personal-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
mv ./_docs_marca_tmp marca-personal-web/docs
cd marca-personal-web
npx next --version
```

Expected: versión ≥ 15. Si es menor, detenerse y avisar.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install @mdx-js/mdx gray-matter zod@^4 remark-gfm @supabase/supabase-js @vercel/analytics
npm install -D vitest @playwright/test tsx @types/mdx @tailwindcss/typography
npx playwright install chromium
```

- [ ] **Step 3: Configuración**

`next.config.ts` (reemplaza el generado):

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Las pruebas E2E compilan en otra carpeta para no pisar el build de desarrollo.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Las rutas leen contenido/ desde disco en runtime: Vercel debe incluirlo en cada función.
  outputFileTracingIncludes: { '/**': ['./contenido/**/*'] },
};

export default nextConfig;
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.{ts,tsx}'] },
});
```

En `package.json`, dentro de `"scripts"`, agregar (sin quitar `dev`, `build`, `start`, `lint`):

```json
"test": "vitest run",
"test:e2e": "playwright test",
"validar-contenido": "NODE_ENV=production tsx scripts/validar-contenido.ts",
"prebuild": "npm run validar-contenido"
```

`prebuild` apunta a un script que se crea en Task 2. Hasta entonces, crear un placeholder ejecutable para que `npm run build` funcione:

```bash
mkdir -p scripts && echo "console.log('validar-contenido: pendiente de Task 2');" > scripts/validar-contenido.ts
```

Agregar al final de `.gitignore`:

```
/.next-e2e
/test-results
/playwright-report
/.playwright-mcp
```

`.env.example`:

```bash
# Firma de la cookie de acceso. Generar con: openssl rand -base64 48
ACCESO_SECRET=
# Supabase (Project Settings > API)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
# Brevo (SMTP & API > API keys) y el ID numérico de la lista "Bóveda"
BREVO_API_KEY=
BREVO_LISTA_ID=
# URL pública del sitio, sin barra final. porConfirmar: dominio definitivo.
SITIO_URL=http://localhost:3000
# Solo desarrollo y pruebas: guarda leads en memoria y no llama a Brevo.
# ALMACEN_LEADS=memoria
```

Crear `.env.local` para desarrollo:

```bash
printf 'ACCESO_SECRET=%s\nALMACEN_LEADS=memoria\nSITIO_URL=http://localhost:3000\n' "$(openssl rand -base64 48)" > .env.local
```

- [ ] **Step 4: Configuración de marca, ofertas y taxonomía**

`src/config/marca.ts`:

```ts
export const marca = {
  nombre: 'Ezequiel Frias',
  posicionamiento: 'Automatización e IA para negocios',
  descripcion:
    'Construyo sistemas de IA y automatización para negocios y enseño el paso a paso de cómo los armo.',
  foto: '/marca/perfil.jpg',
  diagnostico: {
    url: 'https://cal.com/ezequiel-frias-pes36u/diagnostico-de-automatizacion-con-ia',
    boton: 'Agendar diagnóstico',
    detalle: '45 minutos · trae tu caso · sales con un plan de una página',
  },
  agencia: { nombre: 'AIMA', url: 'https://cubolabsia.com' },
  redes: [
    { nombre: 'Instagram', usuario: '@ezequielfrias.ia', url: 'https://www.instagram.com/ezequielfrias.ia/' },
    { nombre: 'TikTok', usuario: '@ezequielfriasa', url: 'https://www.tiktok.com/@ezequielfriasa' },
    { nombre: 'YouTube', usuario: '@ezequielfrias4589', url: 'https://www.youtube.com/@ezequielfrias4589' },
  ],
  // porConfirmar: email de contacto.
  email: null as string | null,
} as const;
```

`src/config/taxonomia.ts`:

```ts
export const TIPOS = ['prompt', 'plantilla', 'guia', 'paso-a-paso'] as const;
export type TipoRecurso = (typeof TIPOS)[number];
export const ETIQUETAS_TIPO: Record<TipoRecurso, string> = {
  prompt: 'Prompt',
  plantilla: 'Plantilla',
  guia: 'Guía',
  'paso-a-paso': 'Paso a paso',
};

export const TEMAS = [
  'clinicas', 'inmobiliarias', 'retail', 'gestion',
  'atencion-cliente', 'finanzas', 'contenido', 'productividad',
] as const;
export type Tema = (typeof TEMAS)[number];
export const ETIQUETAS_TEMA: Record<Tema, string> = {
  clinicas: 'Clínicas',
  inmobiliarias: 'Inmobiliarias',
  retail: 'Tiendas',
  gestion: 'Gestión',
  'atencion-cliente': 'Atención al cliente',
  finanzas: 'Finanzas',
  contenido: 'Contenido',
  productividad: 'Productividad',
};

export const HERRAMIENTAS = [
  'claude', 'chatgpt', 'gemini', 'n8n', 'make', 'manychat',
  'whatsapp', 'google-sheets', 'excel', 'notion',
] as const;
export type Herramienta = (typeof HERRAMIENTAS)[number];
export const ETIQUETAS_HERRAMIENTA: Record<Herramienta, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  n8n: 'n8n',
  make: 'Make',
  manychat: 'ManyChat',
  whatsapp: 'WhatsApp',
  'google-sheets': 'Google Sheets',
  excel: 'Excel',
  notion: 'Notion',
};
```

- [ ] **Step 5: Escribir el test de ofertas (falla)**

`src/config/ofertas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { esEnlaceExterno, ofertas, ofertasVisibles, type Oferta } from './ofertas';

describe('ofertasVisibles', () => {
  it('oculta las ofertas en estado oculto y mantiene activas y próximamente', () => {
    const lista: Oferta[] = [
      { id: 'recursos', titulo: 'A', descripcion: '', href: '/recursos', estado: 'activo' },
      { id: 'workshops', titulo: 'B', descripcion: '', href: '#', estado: 'proximamente' },
      { id: 'comunidad', titulo: 'C', descripcion: '', href: '#', estado: 'oculto' },
    ];
    expect(ofertasVisibles(lista).map((o) => o.id)).toEqual(['recursos', 'workshops']);
  });

  it('al lanzar muestra recursos, consultoría y empresas', () => {
    expect(ofertasVisibles(ofertas).map((o) => o.id)).toEqual(['recursos', 'consultoria', 'empresas']);
  });
});

describe('esEnlaceExterno', () => {
  it('distingue URLs absolutas de rutas internas', () => {
    expect(esEnlaceExterno('https://cubolabsia.com')).toBe(true);
    expect(esEnlaceExterno('/recursos')).toBe(false);
  });
});
```

- [ ] **Step 6: Correr el test**

Run: `npm test -- src/config/ofertas.test.ts`
Expected: FAIL, no encuentra `./ofertas`.

- [ ] **Step 7: Implementar `src/config/ofertas.ts`**

```ts
import { marca } from './marca';

export type EstadoOferta = 'activo' | 'proximamente' | 'oculto';

export interface Oferta {
  id: 'recursos' | 'consultoria' | 'workshops' | 'comunidad' | 'empresas';
  titulo: string;
  descripcion: string;
  etiqueta?: string;
  href: string;
  estado: EstadoOferta;
}

// Para activar una oferta futura, cambia su estado a 'activo' o 'proximamente'.
export const ofertas: Oferta[] = [
  {
    id: 'recursos',
    titulo: 'Recursos',
    descripcion: 'Prompts, plantillas y guías paso a paso de todo lo que muestro en redes.',
    etiqueta: 'gratis',
    href: '/recursos',
    estado: 'activo',
  },
  {
    id: 'consultoria',
    titulo: 'Diagnóstico de automatización',
    descripcion: 'Una llamada para ver qué conviene automatizar primero en tu negocio.',
    etiqueta: '45 minutos',
    href: marca.diagnostico.url,
    estado: 'activo',
  },
  {
    id: 'workshops',
    titulo: 'Workshops y charlas',
    descripcion: 'Talleres en vivo y charlas para equipos y eventos.',
    href: '#',
    estado: 'oculto',
  },
  {
    id: 'comunidad',
    titulo: 'Comunidad',
    descripcion: 'Un espacio para aprender con otros que están automatizando su negocio.',
    href: '#',
    estado: 'oculto',
  },
  {
    id: 'empresas',
    titulo: 'Para empresas',
    descripcion: 'Si buscas un equipo que diseñe e implemente el sistema completo, lo hacemos desde AIMA.',
    href: marca.agencia.url,
    estado: 'activo',
  },
];

export function ofertasVisibles(lista: Oferta[] = ofertas): Oferta[] {
  return lista.filter((o) => o.estado !== 'oculto');
}

export function esEnlaceExterno(href: string): boolean {
  return /^https?:\/\//.test(href);
}
```

- [ ] **Step 8: Correr el test**

Run: `npm test -- src/config/ofertas.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 9: Base visual neutra, foto y limpieza del boilerplate**

```bash
mkdir -p public/marca
cp "/Users/ezequielfrias/Documents/Cubo/mi-universo/marca-personal/creador-contenido-reels/marca/perfil.jpeg" public/marca/perfil.jpg
rm -f public/*.svg
```

`src/app/globals.css` (reemplaza todo):

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Tokens neutros provisorios: la fase de diseño los reemplaza por el branding. */
@theme {
  --color-fondo: #fafafa;
  --color-superficie: #ffffff;
  --color-tinta: #171717;
  --color-suave: #5f5f5f;
  --color-linea: #e5e5e5;
  --color-acento: #171717;
}

body {
  background: var(--color-fondo);
  color: var(--color-tinta);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

`src/app/layout.tsx` (reemplaza; se completa en Task 8 y Task 9):

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = { title: 'Ezequiel Frias' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` (provisorio hasta Task 8):

```tsx
export default function Inicio() {
  return <main className="p-8">Ezequiel Frias</main>;
}
```

- [ ] **Step 10: Verificar y commitear**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: todo pasa.

```bash
git add -A
git commit -m "chore: proyecto base Next.js con configuración de marca y ofertas" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Modelo de contenido (carga, validación e índice)

**Files:**
- Create: `src/lib/contenido/esquema.ts`, `src/lib/contenido/tipos.ts`, `src/lib/contenido/analizar.ts`, `src/lib/contenido/consultas.ts`, `src/lib/contenido/recursos.ts`, `contenido/recursos/.gitkeep`, `contenido/descargas/.gitkeep`
- Modify: `scripts/validar-contenido.ts`
- Test: `src/lib/contenido/analizar.test.ts`, `src/lib/contenido/consultas.test.ts`

**Interfaces:**
- Consumes: `TIPOS`, `TEMAS`, `HERRAMIENTAS` y tipos de `@/config/taxonomia`.
- Produces:
  - `esquemaFrontmatter`, `type Frontmatter`
  - `interface Recurso extends Frontmatter { slug: string; archivo: string; cuerpo: string; premium: boolean; pasos: number; archivosDescarga: string[]; descargasPremium: string[] }`
  - `interface EntradaIndice { slug; titulo; resumen; palabraClave?: string; tipo: TipoRecurso; temas: Tema[]; herramientas: Herramienta[]; fecha: string; premium: boolean; nuevo: boolean }`
  - `class ErrorContenido extends Error`
  - `analizarRecurso(archivo: string, fuente: string): Recurso`
  - `leerRecursos(opciones: { dir: string; incluirBorradores: boolean }): Recurso[]` (ordenados por fecha desc, luego slug)
  - `validarColeccion(recursos: Recurso[], existeDescarga: (archivo: string) => boolean): void`
  - `normalizarClave(s: string): string`
  - `crearIndice(recursos: Recurso[], ahora: Date): EntradaIndice[]`, `esNuevo(fecha: Date, ahora: Date): boolean`
  - `recursosRelacionados(recurso: Recurso, todos: Recurso[], max?: number): Recurso[]`
  - `buscarDuenoDescarga(archivo: string, recursos: Recurso[]): { recurso: Recurso; premium: boolean } | null`
  - `metaRecurso(r: Pick<Recurso, 'pasos' | 'duracion'>): string`
  - `dirRecursos(): string`, `dirDescargas(): string`, `obtenerRecursos(): Recurso[]`, `obtenerRecurso(slug: string): Recurso | null`

- [ ] **Step 1: Esquema y tipos**

`src/lib/contenido/esquema.ts`:

```ts
import { z } from 'zod';
import { HERRAMIENTAS, TEMAS, TIPOS } from '@/config/taxonomia';

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
        archivo: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/, 'minúsculas, números, punto, guion o guion bajo'),
      }),
    )
    .default([]),
  relacionados: z.array(z.string()).default([]),
  borrador: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof esquemaFrontmatter>;
```

`src/lib/contenido/tipos.ts`:

```ts
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
```

- [ ] **Step 2: Escribir los tests de `analizar` (fallan)**

`src/lib/contenido/analizar.test.ts`:

```ts
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { analizarRecurso, ErrorContenido, leerRecursos, normalizarClave, validarColeccion } from './analizar';

const BASE = `titulo: Checklist ERP
resumen: Las 15 funciones del reel.
tipo: plantilla
temas: [retail]
fecha: 2026-10-01`;

const mdx = (front: string, cuerpo = 'Hola.') => `---\n${front}\n---\n${cuerpo}\n`;

describe('analizarRecurso', () => {
  it('toma el slug del nombre de archivo y aplica valores por defecto', () => {
    const r = analizarRecurso('checklist-erp.mdx', mdx(BASE));
    expect(r.slug).toBe('checklist-erp');
    expect(r.herramientas).toEqual([]);
    expect(r.descargas).toEqual([]);
    expect(r.borrador).toBe(false);
    expect(r.fecha.toISOString().slice(0, 10)).toBe('2026-10-01');
    expect(r.premium).toBe(false);
  });

  it('detecta premium, cuenta pasos y separa descargas libres y premium', () => {
    const cuerpo = [
      '<Paso n="1">Uno</Paso>',
      '<Paso n="2" titulo="Dos">Dos</Paso>',
      '<Descarga archivo="libre.pdf" nombre="Libre" />',
      '<Premium>',
      'Secreto',
      '<Descarga archivo="pro.xlsx" nombre="Pro" />',
      '</Premium>',
    ].join('\n');
    const front = `${BASE}\ndescargas:\n  - nombre: Guía\n    archivo: guia.pdf`;
    const r = analizarRecurso('a.mdx', mdx(front, cuerpo));
    expect(r.premium).toBe(true);
    expect(r.pasos).toBe(2);
    expect(r.descargasPremium).toEqual(['pro.xlsx']);
    expect(r.archivosDescarga.sort()).toEqual(['guia.pdf', 'libre.pdf', 'pro.xlsx']);
  });

  it('rechaza nombres de archivo que no son slugs', () => {
    expect(() => analizarRecurso('Checklist ERP.mdx', mdx(BASE))).toThrow(ErrorContenido);
  });

  it('informa el archivo y el campo cuando el frontmatter es inválido', () => {
    const fuente = mdx(BASE.replace('tipo: plantilla', 'tipo: video'));
    expect(() => analizarRecurso('erp.mdx', fuente)).toThrow(/erp\.mdx[\s\S]*tipo/);
  });

  it('rechaza campos desconocidos (errores de tipeo)', () => {
    expect(() => analizarRecurso('erp.mdx', mdx(`${BASE}\ntitlo: x`))).toThrow(/titlo/);
  });

  it('rechaza palabras clave en minúsculas', () => {
    expect(() => analizarRecurso('erp.mdx', mdx(`${BASE}\npalabraClave: erp`))).toThrow(/palabraClave/);
  });
});

describe('leerRecursos', () => {
  it('lee .mdx, ordena por fecha descendente y excluye borradores si se pide', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recursos-'));
    fs.writeFileSync(path.join(dir, 'viejo.mdx'), mdx(BASE));
    fs.writeFileSync(path.join(dir, 'nuevo.mdx'), mdx(BASE.replace('2026-10-01', '2026-10-05')));
    fs.writeFileSync(path.join(dir, 'borrador.mdx'), mdx(`${BASE}\nborrador: true`));
    fs.writeFileSync(path.join(dir, 'nota.txt'), 'ignorar');
    expect(leerRecursos({ dir, incluirBorradores: false }).map((r) => r.slug)).toEqual(['nuevo', 'viejo']);
    expect(leerRecursos({ dir, incluirBorradores: true })).toHaveLength(3);
  });

  it('devuelve lista vacía si la carpeta no existe', () => {
    expect(leerRecursos({ dir: '/no/existe', incluirBorradores: false })).toEqual([]);
  });
});

describe('validarColeccion', () => {
  const r = (archivo: string, extra = '', cuerpo = 'x') => analizarRecurso(archivo, mdx(`${BASE}${extra}`, cuerpo));
  const siempre = () => true;

  it('acepta una colección válida', () => {
    expect(() => validarColeccion([r('a.mdx', '\npalabraClave: ERP'), r('b.mdx', '\nrelacionados: [a]')], siempre)).not.toThrow();
  });

  it('rechaza palabras clave repetidas aunque difieran en tildes', () => {
    const lista = [r('a.mdx', '\npalabraClave: CLÍNICA'), r('b.mdx', '\npalabraClave: CLINICA')];
    expect(() => validarColeccion(lista, siempre)).toThrow(/CLINICA[\s\S]*a\.mdx/);
  });

  it('rechaza relacionados inexistentes', () => {
    expect(() => validarColeccion([r('a.mdx', '\nrelacionados: [fantasma]')], siempre)).toThrow(/fantasma/);
  });

  it('rechaza descargas cuyo archivo no existe', () => {
    const lista = [r('a.mdx', '', '<Descarga archivo="falta.pdf" nombre="x" />')];
    expect(() => validarColeccion(lista, () => false)).toThrow(/falta\.pdf/);
  });

  it('rechaza una descarga libre del frontmatter que también está dentro de <Premium>', () => {
    const front = '\ndescargas:\n  - nombre: X\n    archivo: x.pdf';
    const cuerpo = '<Premium>\n<Descarga archivo="x.pdf" nombre="X" />\n</Premium>';
    expect(() => validarColeccion([r('a.mdx', front, cuerpo)], siempre)).toThrow(/x\.pdf/);
  });
});

describe('normalizarClave', () => {
  it('quita tildes y pasa a mayúsculas', () => {
    expect(normalizarClave('Clínica')).toBe('CLINICA');
  });
});
```

- [ ] **Step 3: Correr los tests**

Run: `npm test -- src/lib/contenido/analizar.test.ts`
Expected: FAIL, no encuentra `./analizar`.

- [ ] **Step 4: Implementar `src/lib/contenido/analizar.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { esquemaFrontmatter } from './esquema';
import type { Recurso } from './tipos';

export class ErrorContenido extends Error {}

const PATRON_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PATRON_PREMIUM = /<Premium>([\s\S]*?)<\/Premium>/g;
const PATRON_DESCARGA = /<Descarga[^>]*\barchivo="([^"]+)"/g;

function archivosEn(texto: string): string[] {
  return [...texto.matchAll(PATRON_DESCARGA)].map((m) => m[1]);
}

function extraerDescargasPremium(cuerpo: string): string[] {
  const bloques = [...cuerpo.matchAll(PATRON_PREMIUM)].map((m) => m[1]);
  return [...new Set(bloques.flatMap(archivosEn))];
}

export function analizarRecurso(archivo: string, fuente: string): Recurso {
  const slug = path.basename(archivo, '.mdx');
  if (!PATRON_SLUG.test(slug)) {
    throw new ErrorContenido(`${archivo}: el nombre debe ir en minúsculas y con guiones (ej. checklist-erp.mdx)`);
  }
  const { data, content } = matter(fuente);
  const resultado = esquemaFrontmatter.safeParse(data);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => `  - ${i.path.join('.') || '(frontmatter)'}: ${i.message}`)
      .join('\n');
    throw new ErrorContenido(`${archivo}: frontmatter inválido\n${detalle}`);
  }
  const front = resultado.data;
  return {
    ...front,
    slug,
    archivo,
    cuerpo: content,
    premium: /<Premium>/.test(content),
    pasos: (content.match(/<Paso[\s>]/g) ?? []).length,
    archivosDescarga: [...new Set([...front.descargas.map((d) => d.archivo), ...archivosEn(content)])],
    descargasPremium: extraerDescargasPremium(content),
  };
}

export function leerRecursos({ dir, incluirBorradores }: { dir: string; incluirBorradores: boolean }): Recurso[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => analizarRecurso(f, fs.readFileSync(path.join(dir, f), 'utf8')))
    .filter((r) => incluirBorradores || !r.borrador)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || a.slug.localeCompare(b.slug));
}

export function normalizarClave(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
}

export function validarColeccion(recursos: Recurso[], existeDescarga: (archivo: string) => boolean): void {
  const errores: string[] = [];
  const slugs = new Set(recursos.map((r) => r.slug));
  const claves = new Map<string, string>();

  for (const r of recursos) {
    if (r.palabraClave) {
      const clave = normalizarClave(r.palabraClave);
      const otro = claves.get(clave);
      if (otro) errores.push(`${r.archivo}: la palabra clave ${clave} ya la usa ${otro}`);
      else claves.set(clave, r.archivo);
    }
    for (const rel of r.relacionados) {
      if (!slugs.has(rel)) errores.push(`${r.archivo}: relacionados incluye "${rel}", que no existe`);
    }
    for (const archivo of r.archivosDescarga) {
      if (!existeDescarga(archivo)) errores.push(`${r.archivo}: la descarga "${archivo}" no está en contenido/descargas/`);
    }
    for (const d of r.descargas) {
      if (r.descargasPremium.includes(d.archivo)) {
        errores.push(`${r.archivo}: "${d.archivo}" está en descargas (libre) y dentro de <Premium>; déjalo en un solo lugar`);
      }
    }
  }
  if (errores.length > 0) throw new ErrorContenido(errores.join('\n'));
}
```

- [ ] **Step 5: Correr los tests**

Run: `npm test -- src/lib/contenido/analizar.test.ts`
Expected: PASS.

- [ ] **Step 6: Escribir los tests de `consultas` (fallan)**

`src/lib/contenido/consultas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { analizarRecurso } from './analizar';
import { buscarDuenoDescarga, crearIndice, esNuevo, metaRecurso, recursosRelacionados } from './consultas';

function recurso(slug: string, opciones: { temas?: string; fecha?: string; relacionados?: string; cuerpo?: string } = {}) {
  const front = [
    `titulo: Título ${slug}`,
    'resumen: Resumen.',
    'tipo: guia',
    `temas: [${opciones.temas ?? 'retail'}]`,
    `fecha: ${opciones.fecha ?? '2026-10-01'}`,
    opciones.relacionados ? `relacionados: [${opciones.relacionados}]` : '',
  ].filter(Boolean).join('\n');
  return analizarRecurso(`${slug}.mdx`, `---\n${front}\n---\n${opciones.cuerpo ?? 'Cuerpo SECRETO'}\n`);
}

describe('crearIndice', () => {
  it('no incluye el cuerpo y marca nuevos los de los últimos 14 días', () => {
    const ahora = new Date('2026-10-15T12:00:00Z');
    const indice = crearIndice([recurso('a', { fecha: '2026-10-10' }), recurso('b', { fecha: '2026-09-01' })], ahora);
    expect(JSON.stringify(indice)).not.toContain('SECRETO');
    expect(indice[0]).toEqual({
      slug: 'a', titulo: 'Título a', resumen: 'Resumen.', palabraClave: undefined, tipo: 'guia', temas: ['retail'],
      herramientas: [], fecha: '2026-10-10', premium: false, nuevo: true,
    });
    expect(indice[1].nuevo).toBe(false);
  });
});

describe('esNuevo', () => {
  it('considera nuevo hasta 14 días inclusive', () => {
    const ahora = new Date('2026-10-15T00:00:00Z');
    expect(esNuevo(new Date('2026-10-01T00:00:00Z'), ahora)).toBe(true);
    expect(esNuevo(new Date('2026-09-30T00:00:00Z'), ahora)).toBe(false);
  });
});

describe('recursosRelacionados', () => {
  it('usa los relacionados declarados en orden', () => {
    const todos = [recurso('a', { relacionados: 'c, b' }), recurso('b'), recurso('c')];
    expect(recursosRelacionados(todos[0], todos).map((r) => r.slug)).toEqual(['c', 'b']);
  });

  it('sin relacionados, elige hasta 3 que compartan tema, priorizando más temas en común', () => {
    const todos = [
      recurso('a', { temas: 'retail, finanzas' }),
      recurso('b', { temas: 'retail' }),
      recurso('c', { temas: 'retail, finanzas' }),
      recurso('d', { temas: 'clinicas' }),
      recurso('e', { temas: 'finanzas' }),
      recurso('f', { temas: 'retail' }),
    ];
    const res = recursosRelacionados(todos[0], todos).map((r) => r.slug);
    expect(res[0]).toBe('c');
    expect(res).toHaveLength(3);
    expect(res).not.toContain('a');
    expect(res).not.toContain('d');
  });
});

describe('buscarDuenoDescarga', () => {
  const libre = recurso('libre', { cuerpo: '<Descarga archivo="x.pdf" nombre="X" />' });
  const pro = recurso('pro', { cuerpo: '<Premium>\n<Descarga archivo="y.pdf" nombre="Y" />\n</Premium>' });

  it('identifica descargas libres y premium', () => {
    expect(buscarDuenoDescarga('x.pdf', [libre, pro])).toMatchObject({ premium: false, recurso: { slug: 'libre' } });
    expect(buscarDuenoDescarga('y.pdf', [libre, pro])).toMatchObject({ premium: true, recurso: { slug: 'pro' } });
  });

  it('devuelve null si ningún recurso ofrece el archivo', () => {
    expect(buscarDuenoDescarga('z.pdf', [libre, pro])).toBeNull();
  });
});

describe('metaRecurso', () => {
  it('arma la línea de pasos y duración', () => {
    expect(metaRecurso({ pasos: 5, duracion: '10 min' })).toBe('5 pasos · 10 min');
    expect(metaRecurso({ pasos: 1, duracion: undefined })).toBe('1 paso');
    expect(metaRecurso({ pasos: 0, duracion: undefined })).toBe('');
  });
});
```

- [ ] **Step 7: Correr los tests**

Run: `npm test -- src/lib/contenido/consultas.test.ts`
Expected: FAIL, no encuentra `./consultas`.

- [ ] **Step 8: Implementar `src/lib/contenido/consultas.ts`**

```ts
import type { EntradaIndice, Recurso } from './tipos';

const DIA_MS = 24 * 60 * 60 * 1000;

export function esNuevo(fecha: Date, ahora: Date): boolean {
  return ahora.getTime() - fecha.getTime() <= 14 * DIA_MS;
}

export function crearIndice(recursos: Recurso[], ahora: Date): EntradaIndice[] {
  return recursos.map((r) => ({
    slug: r.slug,
    titulo: r.titulo,
    resumen: r.resumen,
    palabraClave: r.palabraClave,
    tipo: r.tipo,
    temas: r.temas,
    herramientas: r.herramientas,
    fecha: r.fecha.toISOString().slice(0, 10),
    premium: r.premium,
    nuevo: esNuevo(r.fecha, ahora),
  }));
}

export function recursosRelacionados(recurso: Recurso, todos: Recurso[], max = 3): Recurso[] {
  const otros = todos.filter((r) => r.slug !== recurso.slug);
  if (recurso.relacionados.length > 0) {
    return recurso.relacionados
      .map((slug) => otros.find((r) => r.slug === slug))
      .filter((r): r is Recurso => r !== undefined)
      .slice(0, max);
  }
  const enComun = (r: Recurso) => r.temas.filter((t) => recurso.temas.includes(t)).length;
  return otros
    .filter((r) => enComun(r) > 0)
    .sort((a, b) => enComun(b) - enComun(a) || b.fecha.getTime() - a.fecha.getTime())
    .slice(0, max);
}

export function buscarDuenoDescarga(
  archivo: string,
  recursos: Recurso[],
): { recurso: Recurso; premium: boolean } | null {
  const premium = recursos.find((r) => r.descargasPremium.includes(archivo));
  if (premium) return { recurso: premium, premium: true };
  const libre = recursos.find((r) => r.archivosDescarga.includes(archivo));
  return libre ? { recurso: libre, premium: false } : null;
}

export function metaRecurso(r: Pick<Recurso, 'pasos' | 'duracion'>): string {
  const partes: string[] = [];
  if (r.pasos > 0) partes.push(`${r.pasos} ${r.pasos === 1 ? 'paso' : 'pasos'}`);
  if (r.duracion) partes.push(r.duracion);
  return partes.join(' · ');
}
```

- [ ] **Step 9: Correr los tests**

Run: `npm test -- src/lib/contenido`
Expected: PASS.

- [ ] **Step 10: Acceso a la colección y script de validación**

`src/lib/contenido/recursos.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { leerRecursos, validarColeccion } from './analizar';
import type { Recurso } from './tipos';

export function dirRecursos(): string {
  return path.join(process.cwd(), process.env.DIR_RECURSOS ?? 'contenido/recursos');
}

export function dirDescargas(): string {
  return path.join(process.cwd(), process.env.DIR_DESCARGAS ?? 'contenido/descargas');
}

let cache: Recurso[] | null = null;

/** En producción lee y valida una sola vez; en desarrollo relee para ver cambios al instante. */
export function obtenerRecursos(): Recurso[] {
  const produccion = process.env.NODE_ENV === 'production';
  if (cache && produccion) return cache;
  const recursos = leerRecursos({ dir: dirRecursos(), incluirBorradores: !produccion });
  validarColeccion(recursos, (archivo) => fs.existsSync(path.join(dirDescargas(), archivo)));
  cache = recursos;
  return recursos;
}

export function obtenerRecurso(slug: string): Recurso | null {
  return obtenerRecursos().find((r) => r.slug === slug) ?? null;
}
```

`scripts/validar-contenido.ts` (reemplaza el placeholder):

```ts
import { ErrorContenido } from '@/lib/contenido/analizar';
import { obtenerRecursos } from '@/lib/contenido/recursos';

try {
  const recursos = obtenerRecursos();
  console.log(`Contenido válido: ${recursos.length} recursos.`);
} catch (error) {
  if (error instanceof ErrorContenido) {
    console.error(`\nContenido inválido:\n${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
```

```bash
mkdir -p contenido/recursos contenido/descargas
touch contenido/recursos/.gitkeep contenido/descargas/.gitkeep
```

- [ ] **Step 11: Verificar el script**

Run: `npm run validar-contenido`
Expected: `Contenido válido: 0 recursos.`

Prueba de fallo: crear `contenido/recursos/prueba.mdx` con `---\ntitulo: x\n---\n`, correr `npm run validar-contenido`. Expected: exit 1 con `prueba.mdx: frontmatter inválido` y la lista de campos. Borrar `prueba.mdx`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: modelo de contenido MDX con validación e índice de la bóveda" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Token de acceso

**Files:**
- Create: `src/lib/acceso/token.ts`
- Test: `src/lib/acceso/token.test.ts`

**Interfaces:**
- Produces: `NOMBRE_COOKIE = 'ef_acceso'`, `DURACION_ACCESO_SEG`, `crearToken(leadId: string, secreto: string, ahora?: Date): string`, `verificarToken(token: string | undefined | null, secreto: string, ahora?: Date): { leadId: string } | null`, `secretoAcceso(): string` (lanza si falta o < 32 caracteres), `opcionesCookie(seguro: boolean)`.

- [ ] **Step 1: Escribir el test (falla)**

`src/lib/acceso/token.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearToken, DURACION_ACCESO_SEG, secretoAcceso, verificarToken } from './token';

const SECRETO = 'a'.repeat(40);
const OTRO = 'b'.repeat(40);
const AHORA = new Date('2026-10-11T12:00:00Z');

describe('token de acceso', () => {
  it('verifica un token recién creado', () => {
    const token = crearToken('lead-1', SECRETO, AHORA);
    expect(verificarToken(token, SECRETO, AHORA)).toEqual({ leadId: 'lead-1' });
  });

  it('vence a los 365 días', () => {
    const token = crearToken('lead-1', SECRETO, AHORA);
    const casi = new Date(AHORA.getTime() + (DURACION_ACCESO_SEG - 1) * 1000);
    const despues = new Date(AHORA.getTime() + DURACION_ACCESO_SEG * 1000);
    expect(verificarToken(token, SECRETO, casi)).not.toBeNull();
    expect(verificarToken(token, SECRETO, despues)).toBeNull();
  });

  it('rechaza un token firmado con otro secreto (p. ej. tras rotarlo)', () => {
    expect(verificarToken(crearToken('lead-1', OTRO, AHORA), SECRETO, AHORA)).toBeNull();
  });

  it('rechaza un token con la carga alterada', () => {
    const [, firma] = crearToken('lead-1', SECRETO, AHORA).split('.');
    const carga = Buffer.from(JSON.stringify({ l: 'otro', e: 9999999999 })).toString('base64url');
    expect(verificarToken(`${carga}.${firma}`, SECRETO, AHORA)).toBeNull();
  });

  it.each([undefined, null, '', 'basura', 'a.b.c', '.', 'x.'])('rechaza %s sin lanzar', (valor) => {
    expect(verificarToken(valor as string | undefined, SECRETO, AHORA)).toBeNull();
  });
});

describe('secretoAcceso', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('exige al menos 32 caracteres', () => {
    vi.stubEnv('ACCESO_SECRET', 'corto');
    expect(() => secretoAcceso()).toThrow(/ACCESO_SECRET/);
    vi.stubEnv('ACCESO_SECRET', SECRETO);
    expect(secretoAcceso()).toBe(SECRETO);
  });
});
```

- [ ] **Step 2: Correr el test**

Run: `npm test -- src/lib/acceso`
Expected: FAIL, no encuentra `./token`.

- [ ] **Step 3: Implementar `src/lib/acceso/token.ts`**

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

export const NOMBRE_COOKIE = 'ef_acceso';
export const DURACION_ACCESO_SEG = 365 * 24 * 60 * 60;

interface Carga {
  l: string; // id del lead
  e: number; // expiración en segundos epoch
}

function firmar(datos: string, secreto: string): string {
  return createHmac('sha256', secreto).update(datos).digest('base64url');
}

export function crearToken(leadId: string, secreto: string, ahora = new Date()): string {
  const carga: Carga = { l: leadId, e: Math.floor(ahora.getTime() / 1000) + DURACION_ACCESO_SEG };
  const datos = Buffer.from(JSON.stringify(carga)).toString('base64url');
  return `${datos}.${firmar(datos, secreto)}`;
}

export function verificarToken(
  token: string | undefined | null,
  secreto: string,
  ahora = new Date(),
): { leadId: string } | null {
  if (!token || !secreto) return null;
  const partes = token.split('.');
  if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
  const [datos, firma] = partes;
  const esperada = Buffer.from(firmar(datos, secreto));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  try {
    const carga = JSON.parse(Buffer.from(datos, 'base64url').toString('utf8')) as Partial<Carga>;
    if (typeof carga.l !== 'string' || typeof carga.e !== 'number') return null;
    if (carga.e * 1000 <= ahora.getTime()) return null;
    return { leadId: carga.l };
  } catch {
    return null;
  }
}

export function secretoAcceso(): string {
  const secreto = process.env.ACCESO_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error('ACCESO_SECRET falta o tiene menos de 32 caracteres');
  }
  return secreto;
}

export function opcionesCookie(seguro: boolean) {
  return {
    httpOnly: true,
    secure: seguro,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACION_ACCESO_SEG,
  };
}
```

- [ ] **Step 4: Correr el test**

Run: `npm test -- src/lib/acceso`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: token firmado para el acceso premium" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Lógica de altas (desbloqueo y newsletter)

**Files:**
- Create: `src/lib/leads/alta.ts`, `src/lib/leads/memoria.ts`
- Test: `src/lib/leads/alta.test.ts`

**Interfaces:**
- Produces:
  - `interface RepositorioLeads { contarIntentosDesde(ipHash: string, desde: Date): Promise<number>; registrarIntento(ipHash: string): Promise<void>; guardarLead(email: string): Promise<{ id: string; brevoSincronizado: boolean }>; registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }): Promise<void>; marcarBrevoSincronizado(leadId: string): Promise<void> }`
  - `interface ClienteBrevo { sincronizarContacto(email: string, ultimoRecurso: string): Promise<void> }`
  - `interface DependenciasAlta { repositorio: RepositorioLeads; brevo: ClienteBrevo; existeRecurso(slug: string): boolean; ahora(): Date; registrarError(mensaje: string, error: unknown): void }`
  - `type ModoAlta = 'desbloqueo' | 'newsletter'`
  - `type ResultadoAlta = { estado: 200; leadId: string | null; mensaje: string } | { estado: 400 | 429 | 503; mensaje: string }`
  - `procesarAlta(entrada: { cuerpo: unknown; ipHash: string; modo: ModoAlta }, deps: DependenciasAlta): Promise<ResultadoAlta>`
  - `normalizarEmail(v: unknown): string | null`, `normalizarOrigen(v: unknown): string | null`, `hashIp(ip: string, secreto: string): string`
  - `LIMITE_INTENTOS = 5`, `VENTANA_MS = 60_000`
  - `class RepositorioMemoria implements RepositorioLeads` con campos públicos `leads: Map<string, { id; email; brevoSincronizado }>`, `desbloqueos`, `intentos`.

- [ ] **Step 1: Repositorio en memoria**

`src/lib/leads/memoria.ts` (se usa en tests y en E2E; no lleva lógica de negocio):

```ts
import { randomUUID } from 'node:crypto';
import type { RepositorioLeads } from './alta';

export class RepositorioMemoria implements RepositorioLeads {
  leads = new Map<string, { id: string; email: string; brevoSincronizado: boolean }>();
  desbloqueos: { leadId: string; slug: string; origen: string | null }[] = [];
  intentos: { ipHash: string; en: Date }[] = [];

  constructor(private readonly ahora: () => Date = () => new Date()) {}

  async contarIntentosDesde(ipHash: string, desde: Date) {
    return this.intentos.filter((i) => i.ipHash === ipHash && i.en >= desde).length;
  }

  async registrarIntento(ipHash: string) {
    this.intentos.push({ ipHash, en: this.ahora() });
  }

  async guardarLead(email: string) {
    let lead = this.leads.get(email);
    if (!lead) {
      lead = { id: randomUUID(), email, brevoSincronizado: false };
      this.leads.set(email, lead);
    }
    return { id: lead.id, brevoSincronizado: lead.brevoSincronizado };
  }

  async registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }) {
    this.desbloqueos.push(d);
  }

  async marcarBrevoSincronizado(leadId: string) {
    for (const lead of this.leads.values()) if (lead.id === leadId) lead.brevoSincronizado = true;
  }
}
```

- [ ] **Step 2: Escribir el test (falla)**

`src/lib/leads/alta.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { procesarAlta, VENTANA_MS, type DependenciasAlta } from './alta';
import { RepositorioMemoria } from './memoria';

let reloj: Date;
let repo: RepositorioMemoria;
let brevo: { sincronizarContacto: ReturnType<typeof vi.fn> };
let deps: DependenciasAlta;

beforeEach(() => {
  reloj = new Date('2026-10-11T12:00:00Z');
  repo = new RepositorioMemoria(() => reloj);
  brevo = { sincronizarContacto: vi.fn().mockResolvedValue(undefined) };
  deps = {
    repositorio: repo,
    brevo,
    existeRecurso: (slug) => slug === 'checklist-erp',
    ahora: () => reloj,
    registrarError: vi.fn(),
  };
});

const desbloquear = (cuerpo: unknown, ipHash = 'ip-1') => procesarAlta({ cuerpo, ipHash, modo: 'desbloqueo' }, deps);

describe('procesarAlta', () => {
  it('registra lead, desbloqueo y contacto en Brevo', async () => {
    const r = await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp', origen: 'manychat' });
    expect(r.estado).toBe(200);
    expect(r).toMatchObject({ leadId: expect.any(String) });
    expect(repo.desbloqueos).toEqual([{ leadId: expect.any(String), slug: 'checklist-erp', origen: 'manychat' }]);
    expect(brevo.sincronizarContacto).toHaveBeenCalledWith('ana@correo.com', 'checklist-erp');
    expect(repo.leads.get('ana@correo.com')?.brevoSincronizado).toBe(true);
  });

  it('normaliza el email: mayúsculas y espacios son el mismo lead', async () => {
    await desbloquear({ email: ' Ana@Correo.COM ', slug: 'checklist-erp' });
    await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp' });
    expect([...repo.leads.keys()]).toEqual(['ana@correo.com']);
    expect(repo.desbloqueos).toHaveLength(2);
  });

  it('el campo trampa responde 200 sin guardar nada', async () => {
    const r = await desbloquear({ email: 'bot@spam.com', slug: 'checklist-erp', sitio_web: 'http://spam' });
    expect(r).toEqual({ estado: 200, leadId: null, mensaje: expect.any(String) });
    expect(repo.leads.size).toBe(0);
    expect(brevo.sincronizarContacto).not.toHaveBeenCalled();
  });

  it.each([
    [{ email: 'no-es-email', slug: 'checklist-erp' }],
    [{ slug: 'checklist-erp' }],
    [null],
    ['texto'],
  ])('responde 400 con email inválido: %j', async (cuerpo) => {
    expect((await desbloquear(cuerpo)).estado).toBe(400);
  });

  it('responde 400 si el recurso no existe o falta', async () => {
    expect((await desbloquear({ email: 'ana@correo.com', slug: 'fantasma' })).estado).toBe(400);
    expect((await desbloquear({ email: 'ana@correo.com' })).estado).toBe(400);
  });

  it('en modo newsletter no exige slug y registra slug "newsletter"', async () => {
    const r = await procesarAlta({ cuerpo: { email: 'ana@correo.com' }, ipHash: 'ip-1', modo: 'newsletter' }, deps);
    expect(r.estado).toBe(200);
    expect(repo.desbloqueos[0].slug).toBe('newsletter');
    expect(brevo.sincronizarContacto).toHaveBeenCalledWith('ana@correo.com', 'newsletter');
  });

  it('limpia el origen', async () => {
    await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp', origen: ' ManyChat!<script> ' });
    expect(repo.desbloqueos[0].origen).toBe('manychatscript');
  });

  it('corta en 429 al sexto intento dentro de un minuto y se libera después', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await desbloquear({ email: `p${i}@correo.com`, slug: 'checklist-erp' })).estado).toBe(200);
    }
    expect((await desbloquear({ email: 'p6@correo.com', slug: 'checklist-erp' })).estado).toBe(429);
    expect((await desbloquear({ email: 'otra@correo.com', slug: 'checklist-erp' }, 'ip-2')).estado).toBe(200);
    reloj = new Date(reloj.getTime() + VENTANA_MS + 1);
    expect((await desbloquear({ email: 'p6@correo.com', slug: 'checklist-erp' })).estado).toBe(200);
  });

  it('responde 503 si la base de datos falla', async () => {
    repo.guardarLead = vi.fn().mockRejectedValue(new Error('caída'));
    const r = await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp' });
    expect(r.estado).toBe(503);
    expect(deps.registrarError).toHaveBeenCalled();
  });

  it('si Brevo falla, desbloquea igual y deja el lead pendiente de sincronizar', async () => {
    brevo.sincronizarContacto.mockRejectedValue(new Error('brevo caído'));
    const r = await desbloquear({ email: 'ana@correo.com', slug: 'checklist-erp' });
    expect(r.estado).toBe(200);
    expect(repo.leads.get('ana@correo.com')?.brevoSincronizado).toBe(false);
    expect(deps.registrarError).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Correr el test**

Run: `npm test -- src/lib/leads/alta.test.ts`
Expected: FAIL, no encuentra `./alta`.

- [ ] **Step 4: Implementar `src/lib/leads/alta.ts`**

```ts
import { createHash } from 'node:crypto';

export interface RepositorioLeads {
  contarIntentosDesde(ipHash: string, desde: Date): Promise<number>;
  registrarIntento(ipHash: string): Promise<void>;
  guardarLead(email: string): Promise<{ id: string; brevoSincronizado: boolean }>;
  registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }): Promise<void>;
  marcarBrevoSincronizado(leadId: string): Promise<void>;
}

export interface ClienteBrevo {
  sincronizarContacto(email: string, ultimoRecurso: string): Promise<void>;
}

export interface DependenciasAlta {
  repositorio: RepositorioLeads;
  brevo: ClienteBrevo;
  existeRecurso(slug: string): boolean;
  ahora(): Date;
  registrarError(mensaje: string, error: unknown): void;
}

export type ModoAlta = 'desbloqueo' | 'newsletter';

export type ResultadoAlta =
  | { estado: 200; leadId: string | null; mensaje: string }
  | { estado: 400 | 429 | 503; mensaje: string };

export const LIMITE_INTENTOS = 5;
export const VENTANA_MS = 60_000;

export function normalizarEmail(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const email = valor.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

export function normalizarOrigen(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const origen = valor.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 50);
  return origen || null;
}

export function hashIp(ip: string, secreto: string): string {
  return createHash('sha256').update(`${secreto}:${ip}`).digest('hex');
}

export async function procesarAlta(
  entrada: { cuerpo: unknown; ipHash: string; modo: ModoAlta },
  deps: DependenciasAlta,
): Promise<ResultadoAlta> {
  const cuerpo = (typeof entrada.cuerpo === 'object' && entrada.cuerpo !== null ? entrada.cuerpo : {}) as Record<
    string,
    unknown
  >;

  // Campo trampa: los humanos no lo ven. Al bot se le responde "éxito" para que no reintente.
  if (typeof cuerpo.sitio_web === 'string' && cuerpo.sitio_web.trim() !== '') {
    return { estado: 200, leadId: null, mensaje: 'Listo.' };
  }

  const email = normalizarEmail(cuerpo.email);
  if (!email) return { estado: 400, mensaje: 'Revisa tu email, parece que tiene un error.' };

  let slug = 'newsletter';
  if (entrada.modo === 'desbloqueo') {
    if (typeof cuerpo.slug !== 'string' || !deps.existeRecurso(cuerpo.slug)) {
      return { estado: 400, mensaje: 'Ese recurso no existe.' };
    }
    slug = cuerpo.slug;
  }
  const origen = normalizarOrigen(cuerpo.origen);

  let lead: { id: string; brevoSincronizado: boolean };
  try {
    const desde = new Date(deps.ahora().getTime() - VENTANA_MS);
    if ((await deps.repositorio.contarIntentosDesde(entrada.ipHash, desde)) >= LIMITE_INTENTOS) {
      return { estado: 429, mensaje: 'Demasiados intentos. Espera un minuto y prueba de nuevo.' };
    }
    await deps.repositorio.registrarIntento(entrada.ipHash);
    lead = await deps.repositorio.guardarLead(email);
    await deps.repositorio.registrarDesbloqueo({ leadId: lead.id, slug, origen });
  } catch (error) {
    deps.registrarError('No se pudo guardar el lead', error);
    return { estado: 503, mensaje: 'No pudimos guardar tu email, prueba de nuevo.' };
  }

  try {
    await deps.brevo.sincronizarContacto(email, slug);
    if (!lead.brevoSincronizado) await deps.repositorio.marcarBrevoSincronizado(lead.id);
  } catch (error) {
    deps.registrarError('No se pudo sincronizar con Brevo', error);
  }

  return {
    estado: 200,
    leadId: lead.id,
    mensaje: entrada.modo === 'desbloqueo' ? 'Listo, ya tienes acceso.' : 'Listo, te aviso cuando haya algo nuevo.',
  };
}
```

- [ ] **Step 5: Correr el test**

Run: `npm test -- src/lib/leads/alta.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: lógica de altas con campo trampa, límite de intentos y tolerancia a fallas de Brevo" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Supabase, Brevo y rutas `/api/desbloquear` y `/api/suscribir`

**Files:**
- Create: `supabase/migrations/20261011000000_leads.sql`, `src/lib/leads/supabase.ts`, `src/lib/leads/brevo.ts`, `src/lib/leads/dependencias.ts`, `src/lib/leads/manejador.ts`, `src/app/api/desbloquear/route.ts`, `src/app/api/suscribir/route.ts`
- Test: `src/lib/leads/brevo.test.ts`, `src/lib/leads/dependencias.test.ts`, `src/lib/leads/manejador.test.ts`

**Interfaces:**
- Consumes: `RepositorioLeads`, `ClienteBrevo`, `DependenciasAlta`, `procesarAlta`, `hashIp`, `ModoAlta`, `RepositorioMemoria` (Task 4); `NOMBRE_COOKIE`, `crearToken`, `secretoAcceso`, `opcionesCookie` (Task 3); `obtenerRecurso` (Task 2).
- Produces: `RepositorioSupabase`, `crearClienteSupabase(url, clave)`, `ClienteBrevoHttp(apiKey, listaId, fetchImpl?)`, `ClienteBrevoNulo`, `ErrorConfiguracion`, `crearDependencias(): DependenciasAlta`, `manejarAlta(request: Request, modo: ModoAlta): Promise<Response>`.

- [ ] **Step 1: Migración SQL**

`supabase/migrations/20261011000000_leads.sql`:

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  creado_en timestamptz not null default now(),
  brevo_sincronizado boolean not null default false
);

create table desbloqueos (
  id bigint generated always as identity primary key,
  lead_id uuid not null references leads(id),
  slug text not null,
  origen text,
  creado_en timestamptz not null default now()
);

create table intentos (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  creado_en timestamptz not null default now()
);

create index intentos_ip_fecha on intentos (ip_hash, creado_en);
create index desbloqueos_slug on desbloqueos (slug);

-- Solo el servidor (service role) escribe y lee. Sin políticas públicas.
alter table leads enable row level security;
alter table desbloqueos enable row level security;
alter table intentos enable row level security;
```

- [ ] **Step 2: Escribir el test de Brevo (falla)**

`src/lib/leads/brevo.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { ClienteBrevoHttp } from './brevo';

describe('ClienteBrevoHttp', () => {
  it('crea o actualiza el contacto en la lista con el último recurso', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    await new ClienteBrevoHttp('clave', 7, fetchFalso).sincronizarContacto('ana@correo.com', 'checklist-erp');
    const [url, init] = fetchFalso.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/contacts');
    expect(init.method).toBe('POST');
    expect(init.headers['api-key']).toBe('clave');
    expect(JSON.parse(init.body)).toEqual({
      email: 'ana@correo.com',
      attributes: { ULTIMO_RECURSO: 'checklist-erp' },
      listIds: [7],
      updateEnabled: true,
    });
  });

  it('lanza si Brevo responde con error', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response('mal', { status: 401 }));
    await expect(new ClienteBrevoHttp('clave', 7, fetchFalso).sincronizarContacto('a@b.co', 'x')).rejects.toThrow(/401/);
  });
});
```

- [ ] **Step 3: Correr el test**

Run: `npm test -- src/lib/leads/brevo.test.ts`
Expected: FAIL, no encuentra `./brevo`.

- [ ] **Step 4: Implementar Brevo y Supabase**

`src/lib/leads/brevo.ts`:

```ts
import type { ClienteBrevo } from './alta';

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export class ClienteBrevoHttp implements ClienteBrevo {
  constructor(
    private readonly apiKey: string,
    private readonly listaId: number,
    private readonly fetchImpl: Fetch = (url, init) => fetch(url, init),
  ) {}

  async sincronizarContacto(email: string, ultimoRecurso: string): Promise<void> {
    const respuesta = await this.fetchImpl('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': this.apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        attributes: { ULTIMO_RECURSO: ultimoRecurso },
        listIds: [this.listaId],
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!respuesta.ok) throw new Error(`Brevo respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
}

/** Para desarrollo y pruebas: no llama a ningún servicio. */
export class ClienteBrevoNulo implements ClienteBrevo {
  async sincronizarContacto(): Promise<void> {}
}
```

`src/lib/leads/supabase.ts` (se verifica contra el proyecto real en Task 11):

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { RepositorioLeads } from './alta';

export function crearClienteSupabase(url: string, claveServicio: string): SupabaseClient {
  return createClient(url, claveServicio, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class RepositorioSupabase implements RepositorioLeads {
  constructor(private readonly db: SupabaseClient) {}

  async contarIntentosDesde(ipHash: string, desde: Date) {
    const { count, error } = await this.db
      .from('intentos')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('creado_en', desde.toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  async registrarIntento(ipHash: string) {
    const { error } = await this.db.from('intentos').insert({ ip_hash: ipHash });
    if (error) throw error;
  }

  async guardarLead(email: string) {
    const { data, error } = await this.db
      .from('leads')
      .upsert({ email }, { onConflict: 'email' })
      .select('id, brevo_sincronizado')
      .single();
    if (error) throw error;
    return { id: data.id as string, brevoSincronizado: data.brevo_sincronizado as boolean };
  }

  async registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }) {
    const { error } = await this.db.from('desbloqueos').insert({ lead_id: d.leadId, slug: d.slug, origen: d.origen });
    if (error) throw error;
  }

  async marcarBrevoSincronizado(leadId: string) {
    const { error } = await this.db.from('leads').update({ brevo_sincronizado: true }).eq('id', leadId);
    if (error) throw error;
  }
}
```

- [ ] **Step 5: Correr el test de Brevo**

Run: `npm test -- src/lib/leads/brevo.test.ts`
Expected: PASS.

- [ ] **Step 6: Escribir el test de dependencias (falla)**

`src/lib/leads/dependencias.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearDependencias, ErrorConfiguracion } from './dependencias';
import { RepositorioMemoria } from './memoria';
import { RepositorioSupabase } from './supabase';

afterEach(() => vi.unstubAllEnvs());

describe('crearDependencias', () => {
  it('usa memoria cuando ALMACEN_LEADS=memoria y reutiliza la misma instancia', () => {
    vi.stubEnv('ALMACEN_LEADS', 'memoria');
    vi.stubEnv('VERCEL', '');
    const a = crearDependencias();
    expect(a.repositorio).toBeInstanceOf(RepositorioMemoria);
    expect(crearDependencias().repositorio).toBe(a.repositorio);
  });

  it('prohíbe memoria en Vercel', () => {
    vi.stubEnv('ALMACEN_LEADS', 'memoria');
    vi.stubEnv('VERCEL', '1');
    expect(() => crearDependencias()).toThrow(ErrorConfiguracion);
  });

  it('exige las variables de Supabase y Brevo', () => {
    vi.stubEnv('ALMACEN_LEADS', '');
    vi.stubEnv('SUPABASE_URL', '');
    expect(() => crearDependencias()).toThrow(/SUPABASE_URL/);
  });

  it('arma Supabase con las variables completas', () => {
    vi.stubEnv('ALMACEN_LEADS', '');
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'clave');
    vi.stubEnv('BREVO_API_KEY', 'clave');
    vi.stubEnv('BREVO_LISTA_ID', '3');
    expect(crearDependencias().repositorio).toBeInstanceOf(RepositorioSupabase);
  });
});
```

- [ ] **Step 7: Correr el test**

Run: `npm test -- src/lib/leads/dependencias.test.ts`
Expected: FAIL, no encuentra `./dependencias`.

- [ ] **Step 8: Implementar `src/lib/leads/dependencias.ts`**

```ts
import { obtenerRecurso } from '@/lib/contenido/recursos';
import type { DependenciasAlta } from './alta';
import { ClienteBrevoHttp, ClienteBrevoNulo } from './brevo';
import { RepositorioMemoria } from './memoria';
import { crearClienteSupabase, RepositorioSupabase } from './supabase';

export class ErrorConfiguracion extends Error {}

let memoria: RepositorioMemoria | null = null;

export function crearDependencias(): DependenciasAlta {
  const comunes = {
    existeRecurso: (slug: string) => obtenerRecurso(slug) !== null,
    ahora: () => new Date(),
    registrarError: (mensaje: string, error: unknown) => console.error(`[leads] ${mensaje}`, error),
  };

  if (process.env.ALMACEN_LEADS === 'memoria') {
    if (process.env.VERCEL) throw new ErrorConfiguracion('ALMACEN_LEADS=memoria no se permite en Vercel');
    memoria ??= new RepositorioMemoria();
    return { ...comunes, repositorio: memoria, brevo: new ClienteBrevoNulo() };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_LISTA_ID } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BREVO_API_KEY || !BREVO_LISTA_ID) {
    throw new ErrorConfiguracion(
      'Faltan variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY o BREVO_LISTA_ID',
    );
  }
  return {
    ...comunes,
    repositorio: new RepositorioSupabase(crearClienteSupabase(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)),
    brevo: new ClienteBrevoHttp(BREVO_API_KEY, Number(BREVO_LISTA_ID)),
  };
}
```

- [ ] **Step 9: Correr el test**

Run: `npm test -- src/lib/leads/dependencias.test.ts`
Expected: PASS.

- [ ] **Step 10: Escribir el test del manejador HTTP (falla)**

`src/lib/leads/manejador.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/contenido/recursos', () => ({
  obtenerRecurso: (slug: string) => (slug === 'checklist-erp' ? { slug } : null),
}));

import { manejarAlta } from './manejador';

let ip = 0;
const pedir = (cuerpo: unknown, url = 'https://sitio.com/api/desbloquear') =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${++ip}` },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
  });

beforeEach(() => {
  vi.stubEnv('ALMACEN_LEADS', 'memoria');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('ACCESO_SECRET', 's'.repeat(40));
});
afterEach(() => vi.unstubAllEnvs());

describe('manejarAlta', () => {
  it('desbloqueo válido: 200 y cookie httpOnly segura en https', async () => {
    const r = await manejarAlta(pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }), 'desbloqueo');
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, mensaje: 'Listo, ya tienes acceso.' });
    const cookie = r.headers.get('set-cookie') ?? '';
    expect(cookie).toMatch(/^ef_acceso=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
  });

  it('en http (local) la cookie no lleva Secure', async () => {
    const r = await manejarAlta(
      pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }, 'http://localhost:3000/api/desbloquear'),
      'desbloqueo',
    );
    expect(r.headers.get('set-cookie')).not.toMatch(/Secure/i);
  });

  it('newsletter: 200 sin cookie', async () => {
    const r = await manejarAlta(pedir({ email: 'ana@correo.com' }), 'newsletter');
    expect(r.status).toBe(200);
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('cuerpo que no es JSON: 400', async () => {
    const r = await manejarAlta(pedir('esto no es json'), 'desbloqueo');
    expect(r.status).toBe(400);
    expect((await r.json()).ok).toBe(false);
  });

  it('sin ACCESO_SECRET: 503 sin cookie', async () => {
    vi.stubEnv('ACCESO_SECRET', '');
    const r = await manejarAlta(pedir({ email: 'ana@correo.com', slug: 'checklist-erp' }), 'desbloqueo');
    expect(r.status).toBe(503);
    expect(r.headers.get('set-cookie')).toBeNull();
  });
});
```

- [ ] **Step 11: Correr el test**

Run: `npm test -- src/lib/leads/manejador.test.ts`
Expected: FAIL, no encuentra `./manejador`.

- [ ] **Step 12: Implementar el manejador y las rutas**

`src/lib/leads/manejador.ts`:

```ts
import { NextResponse } from 'next/server';
import { crearToken, NOMBRE_COOKIE, opcionesCookie, secretoAcceso } from '@/lib/acceso/token';
import { hashIp, procesarAlta, type DependenciasAlta, type ModoAlta } from './alta';
import { crearDependencias } from './dependencias';

const MENSAJE_FALLA = 'No pudimos guardar tu email, prueba de nuevo.';

export async function manejarAlta(request: Request, modo: ModoAlta): Promise<Response> {
  let cuerpo: unknown = null;
  try {
    cuerpo = await request.json();
  } catch {
    // Cuerpo inválido: procesarAlta lo rechaza con 400.
  }

  let secreto: string;
  let deps: DependenciasAlta;
  try {
    secreto = secretoAcceso();
    deps = crearDependencias();
  } catch (error) {
    console.error('[leads] configuración incompleta', error);
    return NextResponse.json({ ok: false, mensaje: MENSAJE_FALLA }, { status: 503 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida';
  const resultado = await procesarAlta({ cuerpo, ipHash: hashIp(ip, secreto), modo }, deps);
  const respuesta = NextResponse.json(
    { ok: resultado.estado === 200, mensaje: resultado.mensaje },
    { status: resultado.estado },
  );

  if (modo === 'desbloqueo' && resultado.estado === 200 && resultado.leadId) {
    const seguro = new URL(request.url).protocol === 'https:';
    respuesta.cookies.set(NOMBRE_COOKIE, crearToken(resultado.leadId, secreto), opcionesCookie(seguro));
  }
  return respuesta;
}
```

`src/app/api/desbloquear/route.ts`:

```ts
import { manejarAlta } from '@/lib/leads/manejador';

export async function POST(request: Request) {
  return manejarAlta(request, 'desbloqueo');
}
```

`src/app/api/suscribir/route.ts`:

```ts
import { manejarAlta } from '@/lib/leads/manejador';

export async function POST(request: Request) {
  return manejarAlta(request, 'newsletter');
}
```

- [ ] **Step 13: Correr toda la suite y el tipado**

Run: `npm test && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: endpoints de desbloqueo y newsletter con Supabase y Brevo" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Página de recurso, componentes MDX, contenido premium y descargas

**Files:**
- Create: `src/lib/contenido/mdx.ts`, `src/lib/contenido/embed.ts`, `src/lib/contenido/texto.ts`, `src/componentes/mdx/{Paso,Nota,Video,Descarga,Prompt,CajaPrompt,Premium,index}.tsx`, `src/componentes/FormularioEmail.tsx`, `src/componentes/CajaNewsletter.tsx`, `src/componentes/SiguientePaso.tsx`, `src/componentes/TarjetaRecurso.tsx`, `src/app/r/[slug]/page.tsx`, `src/app/r/[slug]/not-found.tsx`, `src/app/descargas/[archivo]/route.ts`, `playwright.config.ts`, `e2e/fixtures/recursos/guia-libre.mdx`, `e2e/fixtures/recursos/plantilla-premium.mdx`, `e2e/fixtures/descargas/premium-e2e.pdf`, `e2e/recurso.spec.ts`
- Test: `src/lib/contenido/embed.test.ts`, `src/lib/contenido/texto.test.ts`, `src/lib/contenido/mdx.test.tsx`, `src/componentes/mdx/Premium.test.tsx`

**Interfaces:**
- Consumes: `obtenerRecursos`, `obtenerRecurso`, `dirDescargas`, `recursosRelacionados`, `crearIndice`, `buscarDuenoDescarga`, `metaRecurso`, `Recurso`, `EntradaIndice` (Task 2); `NOMBRE_COOKIE`, `verificarToken`, `secretoAcceso` (Task 3); `marca` (Task 1); `ETIQUETAS_TIPO`, `ETIQUETAS_TEMA` (Task 1).
- Produces: `compilarMdx(clave: string, cuerpo: string): Promise<MDXContent>`, `urlEmbed(url): { proveedor: 'youtube' | 'instagram' | 'tiktok'; src: string } | null`, `extraerTexto(nodo: ReactNode): string`, `partirPlaceholders(texto): { texto: string; placeholder: boolean }[]`, `componentesMdx(slug: string): MDXComponents`, `<FormularioEmail endpoint slug? textoBoton alExito />`, `<CajaNewsletter />`, `<SiguientePaso />`, `<TarjetaRecurso entrada={EntradaIndice} />`, constante E2E `RUTAS_PUBLICAS` en `e2e/recurso.spec.ts`.

- [ ] **Step 1: Escribir tests de utilidades (fallan)**

`src/lib/contenido/embed.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { urlEmbed } from './embed';

describe('urlEmbed', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abc123', 'https://www.youtube-nocookie.com/embed/abc123'],
    ['https://youtu.be/abc123', 'https://www.youtube-nocookie.com/embed/abc123'],
    ['https://youtube.com/shorts/abc123', 'https://www.youtube-nocookie.com/embed/abc123'],
    ['https://www.instagram.com/reel/C1x2y3/', 'https://www.instagram.com/reel/C1x2y3/embed'],
    ['https://www.instagram.com/p/C1x2y3/', 'https://www.instagram.com/p/C1x2y3/embed'],
    ['https://www.tiktok.com/@ezequielfriasa/video/7312345678901234567', 'https://www.tiktok.com/embed/v2/7312345678901234567'],
  ])('%s', (url, src) => {
    expect(urlEmbed(url)?.src).toBe(src);
  });

  it('devuelve null para URLs no soportadas o inválidas', () => {
    expect(urlEmbed('https://vimeo.com/123')).toBeNull();
    expect(urlEmbed('no es url')).toBeNull();
    expect(urlEmbed('https://www.instagram.com/ezequielfrias.ia/')).toBeNull();
  });
});
```

`src/lib/contenido/texto.test.ts`:

```ts
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { extraerTexto, partirPlaceholders } from './texto';

describe('extraerTexto', () => {
  it('devuelve el string tal cual', () => {
    expect(extraerTexto('Actúa como [ROL]')).toBe('Actúa como [ROL]');
  });

  it('une párrafos con línea en blanco y recorre elementos anidados', () => {
    const nodo = [
      createElement('p', { key: 1 }, 'Línea uno'),
      createElement('p', { key: 2 }, 'Con ', createElement('strong', null, 'negrita')),
    ];
    expect(extraerTexto(nodo).trim()).toBe('Línea uno\n\nCon negrita');
  });
});

describe('partirPlaceholders', () => {
  it('separa los [placeholders]', () => {
    expect(partirPlaceholders('Hola [NOMBRE], tu cita es el [DÍA].')).toEqual([
      { texto: 'Hola ', placeholder: false },
      { texto: '[NOMBRE]', placeholder: true },
      { texto: ', tu cita es el ', placeholder: false },
      { texto: '[DÍA]', placeholder: true },
      { texto: '.', placeholder: false },
    ]);
  });
});
```

`src/lib/contenido/mdx.test.tsx`:

```tsx
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compilarMdx } from './mdx';

describe('compilarMdx', () => {
  it('compila markdown, tablas GFM y componentes propios', async () => {
    const Contenido = await compilarMdx(
      'prueba',
      '# Título\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n<Paso n="1">Hacer algo</Paso>',
    );
    const Paso = ({ n, children }: { n: string; children: ReactNode }) => <div data-paso={n}>{children}</div>;
    const html = renderToStaticMarkup(<Contenido components={{ Paso }} />);
    expect(html).toContain('<h1>Título</h1>');
    expect(html).toContain('<table>');
    expect(html).toContain('data-paso="1"');
  });
});
```

- [ ] **Step 2: Correr los tests**

Run: `npm test -- src/lib/contenido`
Expected: FAIL en `embed`, `texto` y `mdx` (módulos inexistentes); los de Task 2 siguen pasando.

- [ ] **Step 3: Implementar las utilidades**

`src/lib/contenido/embed.ts`:

```ts
export type Embed = { proveedor: 'youtube' | 'instagram' | 'tiktok'; src: string };

const youtube = (id: string): Embed => ({ proveedor: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` });

export function urlEmbed(url: string): Embed | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m)\./, '');

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return id ? youtube(id) : null;
  }
  if (host === 'youtube.com') {
    const v = u.searchParams.get('v');
    if (v) return youtube(v);
    const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/);
    return m ? youtube(m[1]) : null;
  }
  if (host === 'instagram.com') {
    const m = u.pathname.match(/^\/(reel|reels|p)\/([\w-]+)/);
    if (!m) return null;
    const tipo = m[1] === 'p' ? 'p' : 'reel';
    return { proveedor: 'instagram', src: `https://www.instagram.com/${tipo}/${m[2]}/embed` };
  }
  if (host === 'tiktok.com') {
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? { proveedor: 'tiktok', src: `https://www.tiktok.com/embed/v2/${m[1]}` } : null;
  }
  return null;
}
```

`src/lib/contenido/texto.ts`:

```ts
import { isValidElement, type ReactNode } from 'react';

/** Convierte los hijos de <Prompt> en texto plano para copiar. */
export function extraerTexto(nodo: ReactNode): string {
  if (nodo == null || typeof nodo === 'boolean') return '';
  if (typeof nodo === 'string' || typeof nodo === 'number') return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(extraerTexto).join('');
  if (isValidElement<{ children?: ReactNode }>(nodo)) {
    const interno = extraerTexto(nodo.props.children);
    return nodo.type === 'p' ? `${interno}\n\n` : interno;
  }
  return '';
}

export function partirPlaceholders(texto: string): { texto: string; placeholder: boolean }[] {
  return texto
    .split(/(\[[^\]\n]+\])/g)
    .filter((parte) => parte !== '')
    .map((parte) => ({ texto: parte, placeholder: /^\[[^\]\n]+\]$/.test(parte) }));
}
```

`src/lib/contenido/mdx.ts`:

```ts
import { evaluate } from '@mdx-js/mdx';
import type { MDXContent } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';

const cache = new Map<string, Promise<MDXContent>>();

/** Compila el cuerpo MDX en el servidor. En producción cachea por slug. */
export function compilarMdx(clave: string, cuerpo: string): Promise<MDXContent> {
  const usarCache = process.env.NODE_ENV === 'production';
  const enCache = usarCache ? cache.get(clave) : undefined;
  if (enCache) return enCache;
  const promesa = evaluate(cuerpo, { ...runtime, remarkPlugins: [remarkGfm] })
    .then((modulo) => modulo.default)
    .catch((error: unknown) => {
      cache.delete(clave);
      throw error;
    });
  if (usarCache) cache.set(clave, promesa);
  return promesa;
}
```

- [ ] **Step 4: Correr los tests**

Run: `npm test -- src/lib/contenido`
Expected: PASS.

- [ ] **Step 5: Formulario de email (cliente)**

`src/componentes/FormularioEmail.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';

type Estado =
  | { tipo: 'inicial' }
  | { tipo: 'enviando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; mensaje: string };

interface Props {
  endpoint: '/api/desbloquear' | '/api/suscribir';
  slug?: string;
  textoBoton: string;
  /** 'refrescar' vuelve a pedir la página al servidor (desbloqueo); 'mensaje' muestra la confirmación. */
  alExito: 'refrescar' | 'mensaje';
}

export function FormularioEmail({ endpoint, slug, textoBoton, alExito }: Props) {
  const router = useRouter();
  const id = useId();
  const [estado, setEstado] = useState<Estado>({ tipo: 'inicial' });

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const params = new URLSearchParams(window.location.search);
    setEstado({ tipo: 'enviando' });
    try {
      const respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: datos.get('email'),
          sitio_web: datos.get('sitio_web'),
          slug,
          origen: params.get('ref') ?? params.get('utm_source'),
        }),
      });
      const cuerpo = (await respuesta.json()) as { ok: boolean; mensaje: string };
      if (!respuesta.ok || !cuerpo.ok) {
        setEstado({ tipo: 'error', mensaje: cuerpo.mensaje });
        return;
      }
      setEstado({ tipo: 'listo', mensaje: cuerpo.mensaje });
      if (alExito === 'refrescar') router.refresh();
    } catch {
      setEstado({ tipo: 'error', mensaje: 'No hubo conexión. Prueba de nuevo.' });
    }
  }

  if (estado.tipo === 'listo' && alExito === 'mensaje') {
    return <p role="status">{estado.mensaje}</p>;
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor={id} className="sr-only">
        Tu email
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@email.com"
        className="flex-1 rounded-md border border-linea bg-superficie px-3 py-2"
      />
      {/* Campo trampa para bots: oculto para personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          No llenes este campo
          <input name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        disabled={estado.tipo === 'enviando'}
        className="rounded-md bg-acento px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {estado.tipo === 'enviando' ? 'Enviando…' : textoBoton}
      </button>
      {estado.tipo === 'error' && (
        <p role="alert" className="text-sm text-red-700 sm:basis-full">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 6: Escribir el test de `<Premium>` (falla)**

`src/componentes/mdx/Premium.test.tsx`:

```tsx
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearToken } from '@/lib/acceso/token';

const SECRETO = 's'.repeat(40);
let valorCookie: string | undefined;

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (valorCookie ? { value: valorCookie } : undefined) }),
}));

import { Premium } from './Premium';

beforeEach(() => {
  vi.stubEnv('ACCESO_SECRET', SECRETO);
  valorCookie = undefined;
});

async function renderizar() {
  const elemento = (await Premium({ slug: 'erp', children: <p>CONTENIDO-SECRETO</p> })) as ReactElement<
    Record<string, unknown>
  >;
  return { elemento, json: JSON.stringify(elemento) };
}

describe('<Premium>', () => {
  it('sin cookie muestra el formulario y no incluye el contenido', async () => {
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('bloqueado');
    expect(json).not.toContain('CONTENIDO-SECRETO');
  });

  it('con cookie válida muestra el contenido', async () => {
    valorCookie = crearToken('lead-1', SECRETO);
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('desbloqueado');
    expect(json).toContain('CONTENIDO-SECRETO');
  });

  it('con cookie firmada con otro secreto vuelve a pedir email', async () => {
    valorCookie = crearToken('lead-1', 'x'.repeat(40));
    const { elemento, json } = await renderizar();
    expect(elemento.props['data-premium']).toBe('bloqueado');
    expect(json).not.toContain('CONTENIDO-SECRETO');
  });

  it('con cookie vencida vuelve a pedir email', async () => {
    valorCookie = crearToken('lead-1', SECRETO, new Date('2020-01-01T00:00:00Z'));
    expect((await renderizar()).elemento.props['data-premium']).toBe('bloqueado');
  });
});
```

- [ ] **Step 7: Correr el test**

Run: `npm test -- src/componentes/mdx/Premium.test.tsx`
Expected: FAIL, no encuentra `./Premium`.

- [ ] **Step 8: Implementar los componentes MDX**

`src/componentes/mdx/Premium.tsx` (Server Component: **sin** `'use client'`, para que sus hijos nunca se serialicen al navegador):

```tsx
import { cookies } from 'next/headers';
import type { ReactElement, ReactNode } from 'react';
import { FormularioEmail } from '@/componentes/FormularioEmail';
import { NOMBRE_COOKIE, secretoAcceso, verificarToken } from '@/lib/acceso/token';

export async function Premium({ slug, children }: { slug: string; children: ReactNode }): Promise<ReactElement> {
  const almacen = await cookies();
  const acceso = verificarToken(almacen.get(NOMBRE_COOKIE)?.value, secretoAcceso());
  if (acceso) return <div data-premium="desbloqueado">{children}</div>;

  return (
    <aside data-premium="bloqueado" className="not-prose my-8 rounded-lg border border-linea bg-superficie p-6">
      <p className="text-lg font-semibold">El resto de este recurso es para la comunidad</p>
      <p className="mt-1 text-suave">
        Deja tu email y lo desbloqueas al instante, junto con todos los demás recursos premium.
      </p>
      <div className="mt-4">
        <FormularioEmail endpoint="/api/desbloquear" slug={slug} textoBoton="Desbloquear" alExito="refrescar" />
      </div>
      <p className="mt-2 text-sm text-suave">Te escribo cuando hay algo nuevo. Te das de baja cuando quieras.</p>
    </aside>
  );
}
```

`src/componentes/mdx/Paso.tsx`:

```tsx
import type { ReactNode } from 'react';

export function Paso({ n, titulo, children }: { n: string | number; titulo?: string; children: ReactNode }) {
  return (
    <section data-paso={n} className="my-8">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Paso {n}</p>
      {titulo && <h3 className="mt-1">{titulo}</h3>}
      <div>{children}</div>
    </section>
  );
}
```

`src/componentes/mdx/Nota.tsx`:

```tsx
import type { ReactNode } from 'react';

const TITULOS = { truco: 'El truco', ojo: 'Ojo' } as const;

export function Nota({ tipo = 'truco', children }: { tipo?: keyof typeof TITULOS; children: ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-lg border-l-4 border-acento bg-superficie p-4">
      <p className="font-semibold">{TITULOS[tipo]}</p>
      <div className="mt-1">{children}</div>
    </aside>
  );
}
```

`src/componentes/mdx/Video.tsx`:

```tsx
import { urlEmbed } from '@/lib/contenido/embed';

export function Video({ url, titulo = 'Video' }: { url: string; titulo?: string }) {
  const embed = urlEmbed(url);
  if (!embed) {
    return (
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Ver el video
        </a>
      </p>
    );
  }
  const vertical = embed.proveedor !== 'youtube';
  return (
    <div className={`not-prose my-6 ${vertical ? 'mx-auto max-w-sm' : ''}`}>
      <iframe
        src={embed.src}
        title={titulo}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full rounded-lg border border-linea ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`}
      />
    </div>
  );
}
```

`src/componentes/mdx/Descarga.tsx`:

```tsx
export function Descarga({ archivo, nombre }: { archivo: string; nombre: string }) {
  return (
    <p className="not-prose my-4">
      <a
        href={`/descargas/${archivo}`}
        className="inline-flex items-center gap-2 rounded-md border border-linea bg-superficie px-4 py-2 font-medium"
      >
        Descargar: {nombre}
      </a>
    </p>
  );
}
```

`src/componentes/mdx/CajaPrompt.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { partirPlaceholders } from '@/lib/contenido/texto';

export function CajaPrompt({ titulo, texto }: { titulo: string; texto: string }) {
  const [estado, setEstado] = useState<'inicial' | 'copiado' | 'error'>('inicial');

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado('copiado');
    } catch {
      setEstado('error');
    }
    setTimeout(() => setEstado('inicial'), 2000);
  }

  return (
    <figure className="not-prose my-6 rounded-lg border border-linea bg-superficie">
      <figcaption className="flex items-center justify-between border-b border-linea px-4 py-2">
        <span className="text-sm font-medium">{titulo}</span>
        <button type="button" onClick={copiar} className="rounded-md border border-linea px-3 py-1 text-sm">
          {estado === 'copiado' ? 'Copiado' : estado === 'error' ? 'No se pudo copiar' : 'Copiar'}
        </button>
      </figcaption>
      <pre className="whitespace-pre-wrap p-4 font-mono text-sm">
        {partirPlaceholders(texto).map((parte, i) =>
          parte.placeholder ? (
            <mark key={i} className="rounded bg-yellow-100 px-0.5">
              {parte.texto}
            </mark>
          ) : (
            <span key={i}>{parte.texto}</span>
          ),
        )}
      </pre>
    </figure>
  );
}
```

`src/componentes/mdx/Prompt.tsx` (servidor: convierte los hijos a texto y solo pasa el string al cliente):

```tsx
import type { ReactNode } from 'react';
import { extraerTexto } from '@/lib/contenido/texto';
import { CajaPrompt } from './CajaPrompt';

export function Prompt({ titulo = 'Prompt', children }: { titulo?: string; children: ReactNode }) {
  return <CajaPrompt titulo={titulo} texto={extraerTexto(children).trim()} />;
}
```

`src/componentes/mdx/index.tsx`:

```tsx
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import { Descarga } from './Descarga';
import { Nota } from './Nota';
import { Paso } from './Paso';
import { Premium } from './Premium';
import { Prompt } from './Prompt';
import { Video } from './Video';

export function componentesMdx(slug: string): MDXComponents {
  return {
    Paso,
    Prompt,
    Video,
    Descarga,
    Nota,
    Premium: ({ children }: { children: ReactNode }) => <Premium slug={slug}>{children}</Premium>,
  };
}
```

- [ ] **Step 9: Correr los tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 10: Componentes compartidos de página**

`src/componentes/TarjetaRecurso.tsx` (sin hooks: se usa desde servidor y desde la bóveda en cliente):

```tsx
import Link from 'next/link';
import { ETIQUETAS_TEMA, ETIQUETAS_TIPO } from '@/config/taxonomia';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export function TarjetaRecurso({ entrada }: { entrada: EntradaIndice }) {
  return (
    <Link
      href={`/r/${entrada.slug}`}
      className="flex h-full flex-col rounded-lg border border-linea bg-superficie p-5 transition hover:border-tinta"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
        <span>{ETIQUETAS_TIPO[entrada.tipo]}</span>
        {entrada.nuevo && <span className="rounded bg-tinta px-1.5 py-0.5 text-white">Nuevo</span>}
        {entrada.premium && (
          <svg
            role="img"
            aria-label="Incluye contenido premium"
            viewBox="0 0 24 24"
            className="ml-auto h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{entrada.titulo}</h3>
      <p className="mt-1 flex-1 text-sm text-suave">{entrada.resumen}</p>
      <p className="mt-3 text-xs text-suave">{entrada.temas.map((t) => ETIQUETAS_TEMA[t]).join(' · ')}</p>
    </Link>
  );
}
```

`src/componentes/SiguientePaso.tsx`:

```tsx
import { marca } from '@/config/marca';

export function SiguientePaso() {
  return (
    <section className="my-12 rounded-lg border border-linea bg-superficie p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">El siguiente paso</p>
      <h2 className="mt-1 text-xl font-semibold">¿Quieres que esto funcione en tu negocio?</h2>
      <p className="mt-2 text-suave">{marca.diagnostico.detalle}.</p>
      <a
        href={marca.diagnostico.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-md bg-acento px-4 py-2 font-medium text-white"
      >
        {marca.diagnostico.boton}
      </a>
    </section>
  );
}
```

`src/componentes/CajaNewsletter.tsx`:

```tsx
import { FormularioEmail } from './FormularioEmail';

export function CajaNewsletter() {
  return (
    <section className="my-12 rounded-lg border border-linea bg-superficie p-6">
      <h2 className="text-xl font-semibold">Recibe los próximos recursos en tu email</h2>
      <p className="mt-1 text-suave">Un email cuando hay algo nuevo. Te das de baja cuando quieras.</p>
      <div className="mt-4">
        <FormularioEmail endpoint="/api/suscribir" textoBoton="Suscribirme" alExito="mensaje" />
      </div>
    </section>
  );
}
```

- [ ] **Step 11: Página `/r/[slug]` y 404**

`src/app/r/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CajaNewsletter } from '@/componentes/CajaNewsletter';
import { componentesMdx } from '@/componentes/mdx';
import { Video } from '@/componentes/mdx/Video';
import { SiguientePaso } from '@/componentes/SiguientePaso';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import { crearIndice, metaRecurso, recursosRelacionados } from '@/lib/contenido/consultas';
import { compilarMdx } from '@/lib/contenido/mdx';
import { obtenerRecurso, obtenerRecursos } from '@/lib/contenido/recursos';

// Siempre dinámica: la cookie de acceso se evalúa en cada request.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  if (!recurso) return {};
  return { title: recurso.titulo, description: recurso.resumen, alternates: { canonical: `/r/${recurso.slug}` } };
}

export default async function PaginaRecurso({ params }: Props) {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  if (!recurso) notFound();

  const Contenido = await compilarMdx(recurso.slug, recurso.cuerpo);
  const relacionados = crearIndice(recursosRelacionados(recurso, obtenerRecursos()), new Date());
  const meta = metaRecurso(recurso);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-suave">
        <Link href="/recursos">Recursos</Link> / {ETIQUETAS_TIPO[recurso.tipo]}
      </nav>
      <header className="mt-4">
        <p className="text-sm font-medium uppercase tracking-wide">{ETIQUETAS_TIPO[recurso.tipo]}</p>
        <h1 className="mt-1 text-3xl font-bold">{recurso.titulo}</h1>
        <p className="mt-3 text-lg text-suave">{recurso.resumen}</p>
        {meta && <p className="mt-2 text-sm text-suave">{meta}</p>}
      </header>

      {recurso.video && <Video url={recurso.video} titulo={recurso.titulo} />}

      <article className="prose mt-8 max-w-none">
        <Contenido components={componentesMdx(recurso.slug)} />
      </article>

      {recurso.descargas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Descargas</h2>
          <ul className="mt-3 space-y-2">
            {recurso.descargas.map((d) => (
              <li key={d.archivo}>
                <a href={`/descargas/${d.archivo}`} className="underline">
                  {d.nombre}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SiguientePaso />

      {relacionados.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Sigue con estos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relacionados.map((e) => (
              <TarjetaRecurso key={e.slug} entrada={e} />
            ))}
          </div>
        </section>
      )}

      <CajaNewsletter />
    </main>
  );
}
```

`src/app/r/[slug]/not-found.tsx`:

```tsx
import Link from 'next/link';

export default function RecursoNoEncontrado() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Ese recurso no existe o cambió de nombre</h1>
      <p className="mt-2 text-suave">Búscalo en la bóveda, ahí está todo.</p>
      <Link href="/recursos" className="mt-6 inline-block rounded-md bg-acento px-4 py-2 font-medium text-white">
        Ir a los recursos
      </Link>
    </main>
  );
}
```

- [ ] **Step 12: Ruta de descargas**

`src/app/descargas/[archivo]/route.ts`:

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NOMBRE_COOKIE, secretoAcceso, verificarToken } from '@/lib/acceso/token';
import { buscarDuenoDescarga } from '@/lib/contenido/consultas';
import { dirDescargas, obtenerRecursos } from '@/lib/contenido/recursos';

const TIPOS_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.csv': 'text/csv; charset=utf-8',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

export async function GET(request: Request, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;
  // Sin barras ni rutas relativas: solo nombres de archivo planos.
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(archivo)) return new Response('No encontrado', { status: 404 });

  const dueno = buscarDuenoDescarga(archivo, obtenerRecursos());
  if (!dueno) return new Response('No encontrado', { status: 404 });

  if (dueno.premium) {
    const almacen = await cookies();
    if (!verificarToken(almacen.get(NOMBRE_COOKIE)?.value, secretoAcceso())) {
      return NextResponse.redirect(new URL(`/r/${dueno.recurso.slug}`, request.url), 303);
    }
  }

  const datos = await fs.readFile(path.join(dirDescargas(), archivo));
  return new Response(new Uint8Array(datos), {
    headers: {
      'content-type': TIPOS_MIME[path.extname(archivo)] ?? 'application/octet-stream',
      'content-disposition': `attachment; filename="${archivo}"`,
      'cache-control': dueno.premium ? 'private, no-store' : 'public, max-age=3600',
    },
  });
}
```

- [ ] **Step 13: Fixtures E2E y configuración de Playwright**

`e2e/fixtures/recursos/guia-libre.mdx`:

```mdx
---
titulo: Asistente de WhatsApp para tu clínica
resumen: El guion completo para que tu asistente califique pacientes por WhatsApp.
palabraClave: CLÍNICA
tipo: guia
temas: [clinicas, atencion-cliente]
herramientas: [claude, whatsapp]
fecha: 2026-10-01
duracion: 10 min
relacionados: [plantilla-premium]
---

Introducción libre.

<Paso n="1" titulo="Define el rol">
Copia este prompt.
</Paso>

<Prompt titulo="Prompt base">
{`Actúa como asistente de [NOMBRE DE LA CLÍNICA].
Responde en tono cercano.`}
</Prompt>
```

`e2e/fixtures/recursos/plantilla-premium.mdx`:

```mdx
---
titulo: Plantilla de inventario
resumen: Controla el stock de tu tienda sin Excel roto.
palabraClave: STOCK
tipo: plantilla
temas: [retail]
herramientas: [google-sheets]
fecha: 2026-09-20
---

Parte libre visible para todos.

<Premium>
SECRETO-E2E-7F3A contenido premium.

<Descarga archivo="premium-e2e.pdf" nombre="PDF premium" />
</Premium>
```

```bash
mkdir -p e2e/fixtures/descargas
printf '%%PDF-1.4\n%% e2e\n' > e2e/fixtures/descargas/premium-e2e.pdf
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const PUERTO = 3100;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: `http://localhost:${PUERTO}` },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], permissions: ['clipboard-read', 'clipboard-write'] },
    },
  ],
  webServer: {
    // Build de producción con contenido de prueba y leads en memoria, en una carpeta aparte.
    command: `npm run build && npx next start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
      DIR_RECURSOS: 'e2e/fixtures/recursos',
      DIR_DESCARGAS: 'e2e/fixtures/descargas',
      ALMACEN_LEADS: 'memoria',
      ACCESO_SECRET: 'e2e-secreto-de-prueba-con-mas-de-32-caracteres',
      SITIO_URL: `http://localhost:${PUERTO}`,
    },
  },
});
```

Nota: el límite es de 5 altas por minuto por IP y todas las pruebas comparten IP. Mantener el total de altas de la suite E2E en 4 o menos.

- [ ] **Step 14: Escribir las pruebas E2E del recurso**

`e2e/recurso.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const MARCA = 'SECRETO-E2E-7F3A';
// Rutas públicas que nunca deben contener contenido premium. Tasks 7 y 9 agregan más.
const RUTAS_PUBLICAS = ['/r/plantilla-premium', '/r/guia-libre'];

test('el contenido premium no llega al navegador sin email', async ({ page, request }) => {
  for (const ruta of RUTAS_PUBLICAS) {
    expect(await (await request.get(ruta)).text(), ruta).not.toContain(MARCA);
  }

  const cuerpos: Promise<string>[] = [];
  page.on('response', (r) => cuerpos.push(r.text().catch(() => '')));
  await page.goto('/r/plantilla-premium');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Desbloquear' })).toBeVisible();
  for (const cuerpo of await Promise.all(cuerpos)) expect(cuerpo).not.toContain(MARCA);
});

test('desbloquear con email muestra el contenido y persiste al recargar', async ({ page }) => {
  await page.goto('/r/plantilla-premium?ref=manychat');
  await page.getByLabel('Tu email').fill('ana@ejemplo.com');
  await page.getByRole('button', { name: 'Desbloquear' }).click();
  await expect(page.getByText(MARCA)).toBeVisible();
  await page.reload();
  await expect(page.getByText(MARCA)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Descargar: PDF premium' })).toBeVisible();
});

test('la descarga premium redirige sin acceso y se entrega con acceso', async ({ page }) => {
  const sinAcceso = await page.request.get('/descargas/premium-e2e.pdf', { maxRedirects: 0 });
  expect(sinAcceso.status()).toBe(303);
  expect(sinAcceso.headers()['location']).toContain('/r/plantilla-premium');

  await page.goto('/r/plantilla-premium');
  await page.getByLabel('Tu email').fill('beto@ejemplo.com');
  await page.getByRole('button', { name: 'Desbloquear' }).click();
  await expect(page.getByText(MARCA)).toBeVisible();

  const conAcceso = await page.request.get('/descargas/premium-e2e.pdf');
  expect(conAcceso.status()).toBe(200);
  expect(conAcceso.headers()['content-type']).toBe('application/pdf');
});

test('el botón Copiar copia el prompt completo', async ({ page }) => {
  await page.goto('/r/guia-libre');
  await page.getByRole('button', { name: 'Copiar' }).click();
  await expect(page.getByRole('button', { name: 'Copiado' })).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toBe('Actúa como asistente de [NOMBRE DE LA CLÍNICA].\nResponde en tono cercano.');
});

test('un recurso inexistente responde 404 con salida a la bóveda', async ({ page }) => {
  const respuesta = await page.goto('/r/no-existe');
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Ir a los recursos' })).toBeVisible();
});
```

- [ ] **Step 15: Correr todo**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run test:e2e`
Expected: PASS. Si la prueba de persistencia falla porque la página llega cacheada, revisar que `export const dynamic = 'force-dynamic'` esté en `src/app/r/[slug]/page.tsx`.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "feat: página de recurso con MDX, bloque premium protegido y descargas" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Bóveda `/recursos`

**Files:**
- Create: `src/lib/boveda/filtros.ts`, `src/componentes/boveda/Boveda.tsx`, `src/componentes/boveda/GrupoFiltros.tsx`, `src/app/recursos/page.tsx`, `e2e/boveda.spec.ts`
- Modify: `e2e/recurso.spec.ts` (agregar `/recursos` a `RUTAS_PUBLICAS`)
- Test: `src/lib/boveda/filtros.test.ts`

**Interfaces:**
- Consumes: `EntradaIndice`, `crearIndice`, `obtenerRecursos` (Task 2); `TarjetaRecurso` (Task 6); taxonomía (Task 1).
- Produces: `interface Filtros { q: string; tipo: TipoRecurso | null; tema: Tema | null; herramienta: Herramienta | null }`, `FILTROS_VACIOS`, `normalizarTexto(s)`, `leerFiltros(params: URLSearchParams): Filtros`, `escribirFiltros(f: Filtros): string` (devuelve `''` o `'?…'`), `filtrarRecursos(indice, f): EntradaIndice[]`, `contarPor(indice, campo: 'tipo' | 'temas' | 'herramientas'): Record<string, number>`, `hayFiltros(f): boolean`.

- [ ] **Step 1: Escribir el test (falla)**

`src/lib/boveda/filtros.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { EntradaIndice } from '@/lib/contenido/tipos';
import { contarPor, escribirFiltros, FILTROS_VACIOS, filtrarRecursos, hayFiltros, leerFiltros } from './filtros';

const e = (slug: string, extra: Partial<EntradaIndice> = {}): EntradaIndice => ({
  slug, titulo: slug, resumen: '', tipo: 'guia', temas: ['retail'], herramientas: [],
  fecha: '2026-10-01', premium: false, nuevo: false, ...extra,
});

const INDICE = [
  e('whatsapp', { titulo: 'Asistente de WhatsApp para tu clínica', temas: ['clinicas'], herramientas: ['claude'], tipo: 'prompt' }),
  e('erp', { titulo: 'Checklist ERP', resumen: 'Diagnóstico de tu tienda', tipo: 'plantilla' }),
  e('cashea', { titulo: 'Plantilla Cashea', temas: ['retail', 'finanzas'], tipo: 'plantilla', herramientas: ['google-sheets'] }),
];
const slugs = (lista: EntradaIndice[]) => lista.map((x) => x.slug);

describe('filtrarRecursos', () => {
  it('sin filtros devuelve todo', () => {
    expect(slugs(filtrarRecursos(INDICE, FILTROS_VACIOS))).toEqual(['whatsapp', 'erp', 'cashea']);
  });

  it('busca sin importar tildes ni mayúsculas', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'CLINICA' }))).toEqual(['whatsapp']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'diagnostico' }))).toEqual(['erp']);
  });

  it('busca también en etiquetas de tema y herramienta', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'sheets' }))).toEqual(['cashea']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'finanzas' }))).toEqual(['cashea']);
  });

  it('encuentra por palabra clave de ManyChat', () => {
    const indice = [e('erp', { palabraClave: 'ERP' }), e('otro')];
    expect(slugs(filtrarRecursos(indice, { ...FILTROS_VACIOS, q: 'erp' }))).toEqual(['erp']);
  });

  it('exige todas las palabras', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, q: 'plantilla cashea' }))).toEqual(['cashea']);
  });

  it('combina tipo, tema y herramienta', () => {
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, tipo: 'plantilla' }))).toEqual(['erp', 'cashea']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, tipo: 'plantilla', tema: 'finanzas' }))).toEqual(['cashea']);
    expect(slugs(filtrarRecursos(INDICE, { ...FILTROS_VACIOS, herramienta: 'claude' }))).toEqual(['whatsapp']);
  });
});

describe('leerFiltros / escribirFiltros', () => {
  it('ignora valores desconocidos en la URL', () => {
    expect(leerFiltros(new URLSearchParams('tema=viejo&tipo=video&herramienta=x'))).toEqual(FILTROS_VACIOS);
  });

  it('ida y vuelta', () => {
    const f = { q: 'cashea', tipo: 'plantilla' as const, tema: 'retail' as const, herramienta: null };
    const qs = escribirFiltros(f);
    expect(qs).toBe('?q=cashea&tipo=plantilla&tema=retail');
    expect(leerFiltros(new URLSearchParams(qs))).toEqual(f);
    expect(escribirFiltros(FILTROS_VACIOS)).toBe('');
  });

  it('hayFiltros', () => {
    expect(hayFiltros(FILTROS_VACIOS)).toBe(false);
    expect(hayFiltros({ ...FILTROS_VACIOS, q: '  ' })).toBe(false);
    expect(hayFiltros({ ...FILTROS_VACIOS, tema: 'retail' })).toBe(true);
  });
});

describe('contarPor', () => {
  it('cuenta por tipo y por valores de listas', () => {
    expect(contarPor(INDICE, 'tipo')).toEqual({ prompt: 1, plantilla: 2 });
    expect(contarPor(INDICE, 'temas')).toEqual({ clinicas: 1, retail: 2, finanzas: 1 });
  });
});
```

- [ ] **Step 2: Correr el test**

Run: `npm test -- src/lib/boveda`
Expected: FAIL, no encuentra `./filtros`.

- [ ] **Step 3: Implementar `src/lib/boveda/filtros.ts`**

```ts
import {
  ETIQUETAS_HERRAMIENTA, ETIQUETAS_TEMA, ETIQUETAS_TIPO, HERRAMIENTAS, TEMAS, TIPOS,
  type Herramienta, type Tema, type TipoRecurso,
} from '@/config/taxonomia';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export interface Filtros {
  q: string;
  tipo: TipoRecurso | null;
  tema: Tema | null;
  herramienta: Herramienta | null;
}

export const FILTROS_VACIOS: Filtros = { q: '', tipo: null, tema: null, herramienta: null };

export function normalizarTexto(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

function enLista<T extends string>(lista: readonly T[], valor: string | null): T | null {
  return valor !== null && (lista as readonly string[]).includes(valor) ? (valor as T) : null;
}

export function leerFiltros(params: URLSearchParams): Filtros {
  return {
    q: (params.get('q') ?? '').slice(0, 100),
    tipo: enLista(TIPOS, params.get('tipo')),
    tema: enLista(TEMAS, params.get('tema')),
    herramienta: enLista(HERRAMIENTAS, params.get('herramienta')),
  };
}

export function escribirFiltros(f: Filtros): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set('q', f.q.trim());
  if (f.tipo) params.set('tipo', f.tipo);
  if (f.tema) params.set('tema', f.tema);
  if (f.herramienta) params.set('herramienta', f.herramienta);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function hayFiltros(f: Filtros): boolean {
  return f.q.trim() !== '' || f.tipo !== null || f.tema !== null || f.herramienta !== null;
}

function textoBuscable(e: EntradaIndice): string {
  return normalizarTexto(
    [
      e.titulo,
      e.resumen,
      e.palabraClave ?? '',
      ETIQUETAS_TIPO[e.tipo],
      ...e.temas.map((t) => ETIQUETAS_TEMA[t]),
      ...e.herramientas.map((h) => ETIQUETAS_HERRAMIENTA[h]),
    ].join(' '),
  );
}

export function filtrarRecursos(indice: EntradaIndice[], f: Filtros): EntradaIndice[] {
  const palabras = normalizarTexto(f.q).split(/\s+/).filter(Boolean);
  return indice.filter(
    (e) =>
      (!f.tipo || e.tipo === f.tipo) &&
      (!f.tema || e.temas.includes(f.tema)) &&
      (!f.herramienta || e.herramientas.includes(f.herramienta)) &&
      palabras.every((p) => textoBuscable(e).includes(p)),
  );
}

export function contarPor(indice: EntradaIndice[], campo: 'tipo' | 'temas' | 'herramientas'): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const e of indice) {
    const valores = campo === 'tipo' ? [e.tipo] : e[campo];
    for (const v of valores) conteo[v] = (conteo[v] ?? 0) + 1;
  }
  return conteo;
}
```

- [ ] **Step 4: Correr el test**

Run: `npm test -- src/lib/boveda`
Expected: PASS.

- [ ] **Step 5: Componentes de la bóveda**

`src/componentes/boveda/GrupoFiltros.tsx`:

```tsx
'use client';

interface Props<T extends string> {
  titulo: string;
  opciones: readonly T[];
  etiquetas: Record<T, string>;
  conteo: Record<string, number>;
  total: number;
  valor: T | null;
  alCambiar: (valor: T | null) => void;
}

export function GrupoFiltros<T extends string>({ titulo, opciones, etiquetas, conteo, total, valor, alCambiar }: Props<T>) {
  const visibles = opciones.filter((o) => (conteo[o] ?? 0) > 0);
  if (visibles.length === 0) return null;
  const chip = (activo: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${activo ? 'border-tinta bg-tinta text-white' : 'border-linea bg-superficie'}`;

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mb-1 w-full text-xs font-medium uppercase tracking-wide text-suave">{titulo}</legend>
      <button type="button" aria-pressed={valor === null} className={chip(valor === null)} onClick={() => alCambiar(null)}>
        Todos ({total})
      </button>
      {visibles.map((o) => (
        <button key={o} type="button" aria-pressed={valor === o} className={chip(valor === o)} onClick={() => alCambiar(o)}>
          {etiquetas[o]} ({conteo[o]})
        </button>
      ))}
    </fieldset>
  );
}
```

`src/componentes/boveda/Boveda.tsx`:

```tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import {
  ETIQUETAS_HERRAMIENTA, ETIQUETAS_TEMA, ETIQUETAS_TIPO, HERRAMIENTAS, TEMAS, TIPOS,
} from '@/config/taxonomia';
import { contarPor, escribirFiltros, filtrarRecursos, hayFiltros, leerFiltros, type Filtros } from '@/lib/boveda/filtros';
import type { EntradaIndice } from '@/lib/contenido/tipos';
import { GrupoFiltros } from './GrupoFiltros';

export function Boveda({ indice }: { indice: EntradaIndice[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filtros = useMemo(() => leerFiltros(new URLSearchParams(params.toString())), [params]);
  const [q, setQ] = useState(filtros.q);

  const actuales: Filtros = { ...filtros, q };
  const resultados = useMemo(() => filtrarRecursos(indice, { ...filtros, q }), [indice, filtros, q]);
  const conteos = useMemo(
    () => ({ tipo: contarPor(indice, 'tipo'), temas: contarPor(indice, 'temas'), herramientas: contarPor(indice, 'herramientas') }),
    [indice],
  );

  function aplicar(cambios: Partial<Filtros>) {
    router.replace(`${pathname}${escribirFiltros({ ...actuales, ...cambios })}`, { scroll: false });
  }

  function limpiar() {
    setQ('');
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="mt-8">
      <label htmlFor="buscar" className="sr-only">
        Buscar recursos
      </label>
      <input
        id="buscar"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          aplicar({ q: e.target.value });
        }}
        placeholder="Busca por tema, herramienta o nombre"
        className="w-full rounded-lg border border-linea bg-superficie px-4 py-3"
      />

      <div className="mt-6 space-y-4">
        <GrupoFiltros titulo="Tipo" opciones={TIPOS} etiquetas={ETIQUETAS_TIPO} conteo={conteos.tipo} total={indice.length} valor={filtros.tipo} alCambiar={(tipo) => aplicar({ tipo })} />
        <GrupoFiltros titulo="Tema" opciones={TEMAS} etiquetas={ETIQUETAS_TEMA} conteo={conteos.temas} total={indice.length} valor={filtros.tema} alCambiar={(tema) => aplicar({ tema })} />
        <GrupoFiltros titulo="Herramienta" opciones={HERRAMIENTAS} etiquetas={ETIQUETAS_HERRAMIENTA} conteo={conteos.herramientas} total={indice.length} valor={filtros.herramienta} alCambiar={(herramienta) => aplicar({ herramienta })} />
      </div>

      <p className="mt-6 text-sm text-suave" aria-live="polite">
        {resultados.length} {resultados.length === 1 ? 'recurso' : 'recursos'}
      </p>

      {resultados.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-linea p-10 text-center">
          <p>No hay recursos con esos filtros.</p>
          {hayFiltros(actuales) && (
            <button type="button" onClick={limpiar} className="mt-3 underline">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((e) => (
            <TarjetaRecurso key={e.slug} entrada={e} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Página `/recursos`**

`src/app/recursos/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Boveda } from '@/componentes/boveda/Boveda';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import { crearIndice } from '@/lib/contenido/consultas';
import { obtenerRecursos } from '@/lib/contenido/recursos';

// Recalcula a diario para que la etiqueta "Nuevo" no quede vieja entre deploys.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Recursos',
  description: 'Prompts, plantillas y guías paso a paso de todo lo que comparto en redes.',
  alternates: { canonical: '/recursos' },
};

export default function PaginaRecursos() {
  const indice = crearIndice(obtenerRecursos(), new Date());
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Bóveda</p>
      <h1 className="mt-1 text-3xl font-bold">Recursos</h1>
      <p className="mt-2 max-w-2xl text-suave">
        Prompts, plantillas y guías paso a paso de todo lo que comparto en redes. Si llegaste desde un reel, búscalo
        por su nombre o por la palabra que comentaste.
      </p>
      {/* El fallback muestra todas las tarjetas sin filtros: sirve para SEO y sin JavaScript. */}
      <Suspense
        fallback={
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {indice.map((e) => (
              <TarjetaRecurso key={e.slug} entrada={e} />
            ))}
          </div>
        }
      >
        <Boveda indice={indice} />
      </Suspense>
    </main>
  );
}
```

- [ ] **Step 7: E2E de la bóveda**

En `e2e/recurso.spec.ts`, cambiar la constante:

```ts
const RUTAS_PUBLICAS = ['/r/plantilla-premium', '/r/guia-libre', '/recursos'];
```

`e2e/boveda.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const tarjetas = (page: import('@playwright/test').Page) => page.locator('main a[href^="/r/"]');

test('filtrar por tipo actualiza la URL y los resultados', async ({ page }) => {
  await page.goto('/recursos');
  await expect(tarjetas(page)).toHaveCount(2);
  await page.getByRole('button', { name: /^Plantilla \(1\)$/ }).click();
  await expect(page).toHaveURL(/\?tipo=plantilla$/);
  await expect(tarjetas(page)).toHaveCount(1);
  await expect(page.getByText('Plantilla de inventario')).toBeVisible();
});

test('la búsqueda ignora tildes', async ({ page }) => {
  await page.goto('/recursos');
  await page.getByLabel('Buscar recursos').fill('clinica');
  await expect(tarjetas(page)).toHaveCount(1);
  await expect(page.getByText('Asistente de WhatsApp para tu clínica')).toBeVisible();
});

test('estado vacío con opción de limpiar', async ({ page }) => {
  await page.goto('/recursos?q=zzzz');
  await expect(page.getByText('No hay recursos con esos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(tarjetas(page)).toHaveCount(2);
  await expect(page).toHaveURL(/\/recursos$/);
});

test('un filtro desconocido en la URL se ignora', async ({ page }) => {
  await page.goto('/recursos?tema=viejo');
  await expect(tarjetas(page)).toHaveCount(2);
});
```

- [ ] **Step 8: Correr todo**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run test:e2e`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: bóveda con búsqueda sin tildes y filtros en la URL" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Home, encabezado y pie

**Files:**
- Create: `src/componentes/Encabezado.tsx`, `src/componentes/Pie.tsx`, `src/componentes/home/{Hero,QueEncuentras,UltimosRecursos,Consultoria,ParaEmpresas}.tsx`, `e2e/home.spec.ts`
- Modify: `src/app/page.tsx`, `src/app/layout.tsx`

**Interfaces:**
- Consumes: `marca`, `ofertasVisibles`, `esEnlaceExterno` (Task 1); `crearIndice`, `obtenerRecursos` (Task 2); `TarjetaRecurso`, `CajaNewsletter` (Task 6).
- Produces: `<Encabezado />`, `<Pie />`, componentes de la home.

- [ ] **Step 1: Escribir el E2E de la home (falla)**

`e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('la home muestra las ofertas activas y oculta las futuras', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ezequiel Frias');
  const lista = page.getByRole('list', { name: 'Qué encuentras aquí' });
  await expect(lista.getByRole('link', { name: /Recursos/ })).toHaveAttribute('href', '/recursos');
  await expect(lista.getByRole('link', { name: /Diagnóstico de automatización/ })).toHaveAttribute('href', /cal\.com/);
  await expect(page.getByText('Workshops y charlas')).toHaveCount(0);
  await expect(page.getByText('Comunidad', { exact: true })).toHaveCount(0);
});

test('el bloque para empresas lleva a AIMA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Conocer AIMA' })).toHaveAttribute('href', 'https://cubolabsia.com');
});

test('muestra los últimos recursos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Asistente de WhatsApp para tu clínica/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Plantilla de inventario/ })).toBeVisible();
});

test('la suscripción al newsletter confirma', async ({ page }) => {
  await page.goto('/');
  const caja = page.locator('section', { hasText: 'Recibe los próximos recursos' });
  await caja.getByLabel('Tu email').fill('carla@ejemplo.com');
  await caja.getByRole('button', { name: 'Suscribirme' }).click();
  await expect(caja.getByRole('status')).toHaveText('Listo, te aviso cuando haya algo nuevo.');
});
```

- [ ] **Step 2: Correr el E2E**

Run: `npx playwright test e2e/home.spec.ts`
Expected: FAIL (la home es el placeholder de Task 1).

- [ ] **Step 3: Encabezado, pie y layout**

`src/componentes/Encabezado.tsx`:

```tsx
import Link from 'next/link';
import { marca } from '@/config/marca';

export function Encabezado() {
  return (
    <header className="border-b border-linea">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold">
          {marca.nombre}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/recursos">Recursos</Link>
          <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-acento px-3 py-1.5 font-medium text-white">
            {marca.diagnostico.boton}
          </a>
        </div>
      </nav>
    </header>
  );
}
```

`src/componentes/Pie.tsx`:

```tsx
import Link from 'next/link';
import { marca } from '@/config/marca';

export function Pie() {
  return (
    <footer className="mt-16 border-t border-linea">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold">{marca.nombre}</p>
          <p className="mt-1 text-suave">{marca.posicionamiento}</p>
        </div>
        <ul className="flex flex-wrap gap-4" aria-label="Redes">
          {marca.redes.map((red) => (
            <li key={red.nombre}>
              <a href={red.url} target="_blank" rel="noopener noreferrer">
                {red.nombre}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-4">
          <Link href="/recursos">Recursos</Link>
          <a href={marca.agencia.url} target="_blank" rel="noopener noreferrer">
            Empresas: {marca.agencia.nombre}
          </a>
        </div>
      </div>
    </footer>
  );
}
```

`src/app/layout.tsx` (reemplaza):

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Encabezado } from '@/componentes/Encabezado';
import { Pie } from '@/componentes/Pie';
import './globals.css';

export const metadata: Metadata = { title: 'Ezequiel Frias' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Encabezado />
        {children}
        <Pie />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Secciones de la home**

`src/componentes/home/Hero.tsx`:

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { marca } from '@/config/marca';

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-8 py-12 sm:flex-row sm:items-center">
      <Image src={marca.foto} alt={marca.nombre} width={160} height={160} priority className="rounded-full" />
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-suave">{marca.posicionamiento}</p>
        <h1 className="mt-2 text-4xl font-bold">{marca.nombre}</h1>
        <p className="mt-3 max-w-xl text-lg text-suave">{marca.descripcion}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/recursos" className="rounded-md bg-acento px-4 py-2 font-medium text-white">
            Ver recursos
          </Link>
          <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-linea bg-superficie px-4 py-2 font-medium">
            {marca.diagnostico.boton}
          </a>
        </div>
      </div>
    </section>
  );
}
```

`src/componentes/home/QueEncuentras.tsx`:

```tsx
import Link from 'next/link';
import { esEnlaceExterno, ofertasVisibles } from '@/config/ofertas';

export function QueEncuentras() {
  const ofertas = ofertasVisibles();
  return (
    <section className="py-10">
      <h2 id="que-encuentras" className="text-2xl font-bold">
        Qué encuentras aquí
      </h2>
      <ol aria-label="Qué encuentras aquí" className="mt-6 divide-y divide-linea border-y border-linea">
        {ofertas.map((oferta, i) => {
          const contenido = (
            <>
              <span className="w-10 font-mono text-suave">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1">
                <span className="block font-semibold">{oferta.titulo}</span>
                <span className="block text-sm text-suave">{oferta.descripcion}</span>
              </span>
              {oferta.estado === 'proximamente' ? (
                <span className="rounded-full border border-linea px-2 py-0.5 text-xs">Próximamente</span>
              ) : (
                oferta.etiqueta && <span className="rounded-full border border-linea px-2 py-0.5 text-xs">{oferta.etiqueta}</span>
              )}
            </>
          );
          const clases = 'flex items-center gap-4 py-4';
          return (
            <li key={oferta.id}>
              {oferta.estado === 'proximamente' ? (
                <div className={clases}>{contenido}</div>
              ) : esEnlaceExterno(oferta.href) ? (
                <a href={oferta.href} target="_blank" rel="noopener noreferrer" className={clases}>
                  {contenido}
                </a>
              ) : (
                <Link href={oferta.href} className={clases}>
                  {contenido}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
```

`src/componentes/home/UltimosRecursos.tsx`:

```tsx
import Link from 'next/link';
import { TarjetaRecurso } from '@/componentes/TarjetaRecurso';
import type { EntradaIndice } from '@/lib/contenido/tipos';

export function UltimosRecursos({ entradas }: { entradas: EntradaIndice[] }) {
  if (entradas.length === 0) return null;
  return (
    <section className="py-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Lo último en la bóveda</h2>
        <Link href="/recursos" className="text-sm underline">
          Ver todos
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entradas.map((e) => (
          <TarjetaRecurso key={e.slug} entrada={e} />
        ))}
      </div>
    </section>
  );
}
```

`src/componentes/home/Consultoria.tsx`:

```tsx
import { marca } from '@/config/marca';

export function Consultoria() {
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold">Diagnóstico de automatización</h2>
      <p className="mt-3 max-w-2xl text-suave">
        Me cuentas cómo funciona hoy tu negocio y vemos juntos qué conviene automatizar primero.
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide">{marca.diagnostico.detalle}</p>
      <a href={marca.diagnostico.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-md bg-acento px-4 py-2 font-medium text-white">
        {marca.diagnostico.boton}
      </a>
    </section>
  );
}
```

`src/componentes/home/ParaEmpresas.tsx`:

```tsx
import { marca } from '@/config/marca';

export function ParaEmpresas() {
  return (
    <section className="my-10 rounded-lg border border-linea bg-superficie p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Para empresas</p>
      <h2 className="mt-1 text-2xl font-bold">¿Necesitas un equipo que lo implemente?</h2>
      <p className="mt-3 max-w-2xl text-suave">
        Cuando el proyecto es más grande que una llamada, lo diseñamos e implementamos desde {marca.agencia.nombre}.
      </p>
      <a href={marca.agencia.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-md border border-tinta px-4 py-2 font-medium">
        Conocer {marca.agencia.nombre}
      </a>
    </section>
  );
}
```

`src/app/page.tsx` (reemplaza):

```tsx
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
```

- [ ] **Step 5: Correr todo**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run test:e2e`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: home con ofertas configurables, últimos recursos y bloque para empresas" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: SEO, llms.txt y analítica

**Files:**
- Create: `src/lib/seo/llms.ts`, `src/app/llms.txt/route.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/r/[slug]/opengraph-image.tsx`, `e2e/seo.spec.ts`
- Modify: `src/app/layout.tsx` (metadata y `<Analytics />`), `e2e/recurso.spec.ts` (agregar `/llms.txt` y `/` a `RUTAS_PUBLICAS`)
- Test: `src/lib/seo/llms.test.ts`

**Interfaces:**
- Consumes: `Recurso`, `obtenerRecursos`, `obtenerRecurso` (Task 2); `marca`, `ETIQUETAS_TIPO` (Task 1).
- Produces: `sitioUrl(): string`, `generarLlmsTxt(recursos: Recurso[], base: string): string`.

- [ ] **Step 1: Escribir el test (falla)**

`src/lib/seo/llms.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { analizarRecurso } from '@/lib/contenido/analizar';
import { generarLlmsTxt } from './llms';

const r = analizarRecurso(
  'checklist-erp.mdx',
  '---\ntitulo: Checklist ERP\nresumen: Las 15 funciones.\ntipo: plantilla\ntemas: [retail]\nfecha: 2026-10-01\n---\nLibre\n<Premium>\nPREMIUM-OCULTO\n</Premium>\n',
);

describe('generarLlmsTxt', () => {
  it('lista título, resumen y URL sin contenido del cuerpo', () => {
    const txt = generarLlmsTxt([r], 'https://ejemplo.com');
    expect(txt).toMatch(/^# Ezequiel Frias/);
    expect(txt).toContain('- [Checklist ERP](https://ejemplo.com/r/checklist-erp): Las 15 funciones. (Plantilla)');
    expect(txt).not.toContain('PREMIUM-OCULTO');
    expect(txt).not.toContain('Libre');
  });
});
```

- [ ] **Step 2: Correr el test**

Run: `npm test -- src/lib/seo`
Expected: FAIL, no encuentra `./llms`.

- [ ] **Step 3: Implementar `src/lib/seo/llms.ts`**

```ts
import { marca } from '@/config/marca';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import type { Recurso } from '@/lib/contenido/tipos';

export function sitioUrl(): string {
  return (process.env.SITIO_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function generarLlmsTxt(recursos: Recurso[], base: string): string {
  const lineas = [
    `# ${marca.nombre}`,
    '',
    `> ${marca.posicionamiento}. ${marca.descripcion}`,
    '',
    '## Recursos',
    '',
    ...recursos.map((r) => `- [${r.titulo}](${base}/r/${r.slug}): ${r.resumen} (${ETIQUETAS_TIPO[r.tipo]})`),
    '',
    '## Servicios',
    '',
    `- [Diagnóstico de automatización](${marca.diagnostico.url}): ${marca.diagnostico.detalle}`,
    `- [${marca.agencia.nombre}](${marca.agencia.url}): implementación para empresas`,
    '',
  ];
  return lineas.join('\n');
}
```

- [ ] **Step 4: Correr el test**

Run: `npm test -- src/lib/seo`
Expected: PASS.

- [ ] **Step 5: Rutas de SEO**

`src/app/llms.txt/route.ts`:

```ts
import { obtenerRecursos } from '@/lib/contenido/recursos';
import { generarLlmsTxt, sitioUrl } from '@/lib/seo/llms';

export const revalidate = 86400;

export function GET() {
  return new Response(generarLlmsTxt(obtenerRecursos(), sitioUrl()), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
```

`src/app/sitemap.ts`:

```ts
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
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';
import { sitioUrl } from '@/lib/seo/llms';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${sitioUrl()}/sitemap.xml`,
  };
}
```

`src/app/r/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';
import { marca } from '@/config/marca';
import { ETIQUETAS_TIPO } from '@/config/taxonomia';
import { obtenerRecurso } from '@/lib/contenido/recursos';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recurso = obtenerRecurso(slug);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 72, background: '#fafafa', color: '#171717' }}>
        <div style={{ fontSize: 32, textTransform: 'uppercase', letterSpacing: 4 }}>
          {recurso ? ETIQUETAS_TIPO[recurso.tipo] : 'Recursos'}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{recurso?.titulo ?? marca.nombre}</div>
        <div style={{ fontSize: 32 }}>{marca.nombre}</div>
      </div>
    ),
    size,
  );
}
```

`src/app/layout.tsx`: reemplazar la línea `export const metadata …` y agregar Analytics:

```tsx
import { Analytics } from '@vercel/analytics/next';
import { marca } from '@/config/marca';
import { sitioUrl } from '@/lib/seo/llms';

export const metadata: Metadata = {
  metadataBase: new URL(sitioUrl()),
  title: { default: `${marca.nombre} · ${marca.posicionamiento}`, template: `%s · ${marca.nombre}` },
  description: marca.descripcion,
  openGraph: { locale: 'es_LA', siteName: marca.nombre, type: 'website' },
};
```

y dentro de `<body>`, después de `<Pie />`, agregar `<Analytics />`.

- [ ] **Step 6: E2E de SEO**

En `e2e/recurso.spec.ts`:

```ts
const RUTAS_PUBLICAS = ['/r/plantilla-premium', '/r/guia-libre', '/recursos', '/llms.txt', '/'];
```

`e2e/seo.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('llms.txt lista los recursos', async ({ request }) => {
  const txt = await (await request.get('/llms.txt')).text();
  expect(txt).toContain('[Plantilla de inventario](http://localhost:3100/r/plantilla-premium)');
});

test('sitemap incluye cada recurso', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('http://localhost:3100/r/guia-libre');
});

test('cada recurso tiene título y descripción propios', async ({ page }) => {
  await page.goto('/r/guia-libre');
  await expect(page).toHaveTitle('Asistente de WhatsApp para tu clínica · Ezequiel Frias');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /califique pacientes/);
});

test('la imagen OG del recurso se genera', async ({ request }) => {
  const r = await request.get('/r/guia-libre/opengraph-image');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toBe('image/png');
});
```

- [ ] **Step 7: Correr todo**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run test:e2e`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: sitemap, robots, llms.txt, imágenes OG y Vercel Analytics" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Contenido de arranque (11 lead magnets) y guía de autoría

**Files:**
- Create: `contenido/COMO-ESCRIBIR-RECURSOS.md`, 11 archivos `contenido/recursos/*.mdx`, 11 PDFs en `contenido/descargas/`
- Delete: `contenido/recursos/.gitkeep`, `contenido/descargas/.gitkeep`

**Interfaces:**
- Consumes: esquema de frontmatter (Task 2), componentes MDX (Task 6), taxonomía (Task 1).

Fuente: `/Users/ezequielfrias/Documents/Cubo/mi-universo/marca-personal/creador-contenido-reels/contenido/lead-magnets/<carpeta>/` con `ficha.md` (promesa, secciones, público), `lead-magnet.html` (texto final), `lead-magnet.pdf` y a veces `manychat.md`.

- [ ] **Step 1: Guía de autoría**

`contenido/COMO-ESCRIBIR-RECURSOS.md`:

````markdown
# Cómo escribir un recurso

Un recurso es un archivo `contenido/recursos/<slug>.mdx`. El slug (nombre del archivo) va en
minúsculas con guiones y es la URL: `checklist-erp.mdx` → `/r/checklist-erp`.

## Para crearlo con Claude

Pásale a Claude el guion del reel (y la ficha si existe) y pídele:
"Crea el recurso para la bóveda siguiendo contenido/COMO-ESCRIBIR-RECURSOS.md".
Después corre `npm run validar-contenido` y revísalo con `npm run dev`.

## Ficha (frontmatter)

```yaml
---
titulo: "Checklist ERP: las 15 funciones que debería tener tu tienda"   # obligatorio
resumen: "Las 15 funciones del reel, en el mismo orden."                 # obligatorio, máx. 300
palabraClave: ERP              # la de ManyChat, en mayúsculas; única
tipo: plantilla                # prompt | plantilla | guia | paso-a-paso
temas: [retail, gestion]       # ver src/config/taxonomia.ts
herramientas: [google-sheets]  # opcional, ver src/config/taxonomia.ts
fecha: 2026-10-11              # orden y etiqueta "Nuevo"
duracion: 5 min                # opcional
video: https://www.instagram.com/reel/XXXX/   # opcional
descargas:                     # opcional: descargas LIBRES
  - nombre: Checklist en PDF
    archivo: checklist-erp.pdf # el archivo va en contenido/descargas/
relacionados: [mapa-venta-pos] # opcional, slugs existentes
borrador: true                 # opcional: no se publica
---
```

Si necesitas un tema o herramienta nuevos, agrégalos en `src/config/taxonomia.ts` (lista y etiqueta).

## Bloques disponibles

- `<Paso n="1" titulo="Define el rol">…</Paso>`: pasos numerados (se cuentan solos en el encabezado).
- `<Prompt titulo="Prompt base">{`texto…`}</Prompt>`: caja con botón Copiar. Escribe el texto entre
  `` {` `` y `` `} `` para conservar los saltos de línea. Los `[PLACEHOLDERS]` se resaltan.
- `<Video url="…" />`: reel de Instagram, TikTok o video de YouTube.
- `<Descarga archivo="x.pdf" nombre="…" />`: botón de descarga (archivo en `contenido/descargas/`).
- `<Nota tipo="truco">…</Nota>` o `<Nota tipo="ojo">…</Nota>`: aviso destacado.
- `<Premium>…</Premium>`: lo de adentro pide email. Las `<Descarga>` dentro de `<Premium>` también
  quedan protegidas. Usa un solo bloque por recurso, al final de la parte libre.

## Reglas de copy

Español neutro, tuteo, frases cortas y concretas. Sin emojis. Sin cifras ni resultados inventados.
Deja libre lo suficiente para que el recurso valga por sí solo; lo premium es el detalle completo.
````

- [ ] **Step 2: Migrar los 11 lead magnets**

Tabla de partida (verificar `palabraClave`, título y público contra cada `ficha.md`; si la ficha contradice la tabla, manda la ficha):

| Carpeta origen | Slug destino | palabraClave | tipo | temas | fecha |
|---|---|---|---|---|---|
| base-de-conocimiento | base-de-conocimiento | RESPUESTAS | guia | [atencion-cliente] | 2026-09-09 |
| checklist-erp | checklist-erp | ERP | plantilla | [retail, gestion] | 2026-09-02 |
| dashboard-sucursales | tablero-de-sucursales | SUCURSALES | plantilla | [retail, gestion] | 2026-09-04 |
| guion-calificacion-whatsapp | guion-asistente-whatsapp | CLÍNICA | guia | [clinicas, atencion-cliente] | 2026-09-08 |
| indicadores-accionables | indicadores-accionables | DATOS | guia | [gestion] | 2026-09-11 |
| kpis-semanales | numeros-de-tu-semana | DASHBOARD | plantilla | [gestion] | 2026-09-05 |
| mapa-venta-pos | mapa-venta-pos | POS | guia | [retail] | 2026-09-03 |
| plantilla-cashea | plantilla-cashea | CASHEA | plantilla | [retail, finanzas] | 2026-09-06 |
| plantilla-inventario | plantilla-inventario | STOCK | plantilla | [retail] | 2026-09-02 |
| plantilla-usd-ves | plantilla-usd-ves | TASA | plantilla | [retail, finanzas] | 2026-09-02 |
| secuencia-confirmacion-citas | confirmacion-de-citas | CITAS | guia | [clinicas, atencion-cliente] | 2026-09-10 |

Para cada fila:

1. Leer `ficha.md` y el texto de `lead-magnet.html` (ignorar `<style>` y `@font-face`; el contenido está en el `<body>`).
2. Copiar el PDF: `cp "<origen>/lead-magnet.pdf" contenido/descargas/<slug>.pdf`.
3. Escribir `contenido/recursos/<slug>.mdx`:
   - `titulo`: título legible derivado de la ficha (p. ej. "Checklist ERP: las 15 funciones que debería tener tu tienda").
   - `resumen`: la promesa de la ficha en una o dos frases.
   - `duracion`: el "Se consume en" de la ficha, si existe.
   - Sin `video` (los enlaces de los reels están pendientes en las fichas; se agregan después).
   - `relacionados`: 2 o 3 slugs de la misma familia (p. ej. las plantillas de retail entre sí).
   - **Parte libre:** a quién va dirigido + la primera sección completa del documento.
   - **`<Premium>`:** el resto de las secciones, la página de cierre (cómo leer el resultado, pregunta final) y `<Descarga archivo="<slug>.pdf" nombre="<Título> en PDF" />`.
   - Usar `<Paso>` para secciones numeradas, `<Prompt>` para guiones o mensajes copiables (p. ej. los mensajes de confirmación de citas, el guion de WhatsApp) y `<Nota>` para los micro-pasos.
   - No mencionar AIMA. No incluir el CTA de la llamada (la página ya tiene "El siguiente paso").
4. Correr `npm run validar-contenido` después de cada archivo.

- [ ] **Step 3: Verificar**

```bash
rm -f contenido/recursos/.gitkeep contenido/descargas/.gitkeep
npm run validar-contenido
grep -h '^palabraClave' contenido/recursos/*.mdx | sort
```

Expected: `Contenido válido: 11 recursos.` y las 11 palabras clave: CASHEA, CITAS, CLÍNICA, DASHBOARD, DATOS, ERP, POS, RESPUESTAS, STOCK, SUCURSALES, TASA.

Revisión visual: `npm run dev`, abrir `http://localhost:3000/recursos` y tres recursos al azar; confirmar que la parte premium pide email y que, tras desbloquear (leads en memoria en `.env.local`), se ve el contenido y baja el PDF.

- [ ] **Step 4: Correr la suite completa**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build && npm run test:e2e`
Expected: PASS (el E2E usa fixtures, no este contenido).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "content: migrar los 11 lead magnets a la bóveda y guía de autoría" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Despliegue (requiere al usuario)

Cada paso que crea cuentas, guarda secretos o publica algo se confirma con el usuario antes de ejecutarlo.

**Files:**
- Modify: ninguno en código (salvo ajustes que surjan del smoke test).

- [ ] **Step 1: Supabase**

El usuario crea un proyecto en supabase.com. Abrir SQL Editor, pegar y ejecutar `supabase/migrations/20261011000000_leads.sql`. Anotar `Project URL` y `service_role key` (Project Settings > API).

- [ ] **Step 2: Brevo**

El usuario, en Brevo:
- Contactos > Listas: crear la lista "Bóveda" y anotar su ID numérico.
- Contactos > Configuración > Atributos: crear `ULTIMO_RECURSO` de tipo texto.
- SMTP & API > API keys: crear una clave.

- [ ] **Step 3: Repositorio y proyecto en Vercel**

```bash
cd "/Users/ezequielfrias/Documents/Cubo/mi-universo/Desarrollo/Páginas webs/marca-personal-web"
npx vercel link
for VAR in ACCESO_SECRET SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY BREVO_API_KEY BREVO_LISTA_ID SITIO_URL; do
  npx vercel env add "$VAR" production
  npx vercel env add "$VAR" preview
done
```

`ACCESO_SECRET` de producción: generar uno nuevo con `openssl rand -base64 48` (no reutilizar el de `.env.local`). `SITIO_URL`: la URL de Vercel hasta tener dominio (porConfirmar).

- [ ] **Step 4: Preview y smoke test**

```bash
npx vercel deploy
```

Con la URL de preview:
1. `/`, `/recursos`, `/r/checklist-erp` cargan (Review Focus 1: si `/r/*` da 500 con "ENOENT contenido/recursos", revisar `outputFileTracingIncludes` en `next.config.ts`).
2. `/descargas/checklist-erp.pdf` sin cookie redirige a `/r/checklist-erp`.
3. Desbloquear `/r/checklist-erp?ref=prueba` con un email real del usuario: el contenido aparece; en Supabase hay una fila en `leads` y otra en `desbloqueos` con `origen = prueba`; en Brevo el contacto está en la lista "Bóveda" con `ULTIMO_RECURSO = checklist-erp` y `brevo_sincronizado = true`.
4. El PDF baja con la cookie.
5. `/llms.txt` y `/sitemap.xml` responden.

- [ ] **Step 5: Producción**

Con el OK del usuario:

```bash
npx vercel deploy --prod
```

Cuando haya dominio: agregarlo en Vercel, actualizar `SITIO_URL` y redeployar.

- [ ] **Step 6: ManyChat**

El usuario actualiza el DM de cada flujo para enviar `https://<dominio>/r/<slug>?ref=manychat` en lugar del PDF (tabla de slugs en Task 10).

---

## Verificación final

- `npm test` (Vitest), `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:e2e` pasan.
- En preview de Vercel, el flujo completo de Task 11 Step 4 funciona con Supabase y Brevo reales.
- Ningún HTML, payload RSC, `/recursos`, `/llms.txt` ni descarga sin cookie expone contenido de `<Premium>` (cubierto por `e2e/recurso.spec.ts`).
