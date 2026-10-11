# Marca personal web

Sitio de marca personal con una bóveda de recursos en MDX. Algunos recursos son libres y otros desbloquean contenido y descargas a cambio del email. Hecho con Next.js 16, Supabase (leads) y Brevo (lista de email).

## Desarrollo

```bash
cp .env.example .env.local   # completa los valores; ver .env.example
npm install
npm run dev
```

Las variables de entorno están documentadas en `.env.example`. Para probar sin Supabase ni Brevo usa `ALMACEN_LEADS=memoria`.

## Comandos

- `npm run validar-contenido`: valida frontmatter, sintaxis y renderizado de todos los recursos (también corre antes de `npm run build`).
- `npm test`: pruebas unitarias (Vitest).
- `npm run test:e2e`: pruebas de extremo a extremo (Playwright, build de producción con fixtures).
- `npm run lint` y `npx tsc --noEmit`: lint y tipos.

## Agregar un recurso

Crea un archivo `.mdx` en `contenido/recursos/`. La guía completa está en `contenido/COMO-ESCRIBIR-RECURSOS.md`. Después corre `npm run validar-contenido`.

## Deploy

1. Supabase: crea el proyecto y aplica la migración de `supabase/migrations/`.
2. Brevo: crea la lista de la bóveda, el atributo de contacto `ULTIMO_RECURSO` (texto) y una API key.
3. Vercel: importa el repositorio y define las variables de `.env.example`, incluida `SITIO_URL` (URL pública sin barra final). Sin ella se usa el dominio de producción de Vercel.
