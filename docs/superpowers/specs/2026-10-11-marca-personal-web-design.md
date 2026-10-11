# Web de marca personal Ezequiel Frias: diseño

Fecha: 2026-10-11
Estado: aprobado en conversación, pendiente de revisión escrita

## 1. Objetivo

Una web propia que haga dos trabajos:

1. **Home**: mostrar qué ofrece Ezequiel (recursos, consultoría y, a futuro, workshops, conferencias y comunidad) y derivar a empresas hacia la agencia AIMA.
2. **Bóveda**: publicar todos los recursos que comparte en redes (prompts, plantillas, guías, paso a paso) para que la comunidad vea el paso a paso completo.

Éxito al lanzar:

- Quien comenta una palabra clave en un reel recibe por ManyChat un link `/r/<slug>` y encuentra ahí el recurso completo.
- La bóveda permite encontrar cualquier recurso por búsqueda o filtros.
- Los recursos premium capturan emails que quedan en Supabase y en Brevo.
- Publicar un recurso nuevo es agregar un archivo `.mdx` y hacer `git push`.
- Activar una oferta futura (workshop, comunidad) es cambiar una línea de configuración.

## 2. Referencias analizadas

| Referencia | Qué tomamos | Qué evitamos |
|---|---|---|
| juanbertorello.com | Home con lista numerada "Qué hay acá", escalera de ofertas, bloque separado para la agencia, `/r/<slug>` con palabra clave de ManyChat, "siguiente paso" al final de cada recurso | Bóveda agrupada solo por semana, sin búsqueda ni filtros; gating que envía todo el contenido al navegador |
| tododeia.com | Búsqueda, filtros por tipo, contador, prompts con botón Copiar, etiquetas de tiempo y pasos, recursos relacionados, `llms.txt` | Hero con demasiados botones, contadores inconsistentes, sin prueba social |
| Bóveda Revolutia (Netlify) | Categorías con etiquetas de color, contadores | Contadores manuales desactualizados, contenido en Docs y Notion externos, estética "IA oscura" genérica |

## 3. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Stack | Next.js (App Router) + TypeScript, desplegado en Vercel |
| Contenido | Archivos MDX en el repo, uno por recurso |
| Acceso | Mixto: la mayoría libre; bloques `<Premium>` piden email |
| Alcance del desbloqueo | Un email desbloquea todo el contenido premium por 1 año; cada desbloqueo se registra por recurso |
| Leads | Supabase (base propia) + Brevo (envíos y newsletter) |
| Ofertas al lanzar | Bóveda y Consultoría activas; Workshops y Comunidad ocultas |
| Agencia | Bloque "Para empresas" que enlaza a https://cubolabsia.com (AIMA) |
| Ubicación | `Desarrollo/Páginas webs/marca-personal-web/`, repo git propio |
| Diseño visual | Fuera de este documento; se define en una fase posterior usando el branding existente |

## 4. Arquitectura

### 4.1 Rutas

| Ruta | Tipo | Contenido |
|---|---|---|
| `/` | Estática | Home |
| `/recursos` | Estática | Bóveda con búsqueda y filtros en el cliente |
| `/r/[slug]` | Dinámica (se renderiza por request; el MDX compilado se cachea en memoria) | Página de un recurso. Siempre dinámica para que nunca se sirva una versión estática "bloqueada" a quien ya desbloqueó |
| `/descargas/[archivo]` | Route handler (GET) | Entrega archivos de `contenido/descargas/`; los que están dentro de `<Premium>` exigen la cookie de acceso |
| `/api/desbloquear` | Route handler (POST) | Recibe email + slug, registra lead, fija cookie |
| `/api/suscribir` | Route handler (POST) | Alta en newsletter sin desbloqueo |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Generadas | SEO y buscadores con IA |
| `/r/[slug]/opengraph-image` | Generada | Imagen para compartir por recurso |

Slug no existente en `/r/[slug]` responde 404 con link a la bóveda.

### 4.2 Ofertas configurables

Archivo `src/config/ofertas.ts`:

```ts
type EstadoOferta = 'activo' | 'proximamente' | 'oculto';
interface Oferta {
  id: 'recursos' | 'consultoria' | 'workshops' | 'comunidad' | 'empresas';
  titulo: string;
  descripcion: string;
  etiqueta?: string;      // "gratis", "45 minutos"
  href: string;           // interno o externo
  estado: EstadoOferta;
}
```

La sección "Qué hay acá" de la home se genera desde este archivo. `proximamente` se muestra sin link y con etiqueta "Próximamente"; `oculto` no se muestra. Las páginas propias de workshops y comunidad se crean cuando haya algo concreto que ofrecer.

Datos de marca (nombre, redes, Cal.com, URL de AIMA) viven en `src/config/marca.ts`, tomados de `marca-personal/creador-contenido-reels/marca/config.md`:

- Instagram: https://www.instagram.com/ezequielfrias.ia/
- TikTok: https://www.tiktok.com/@ezequielfriasa
- YouTube: https://www.youtube.com/@ezequielfrias4589
- Diagnóstico: https://cal.com/ezequiel-frias-pes36u/diagnostico-de-automatizacion-con-ia
- AIMA: https://cubolabsia.com
- Email de contacto: `porConfirmar`

### 4.3 Modelo de contenido

Un archivo por recurso en `contenido/recursos/<slug>.mdx`. El slug es el nombre del archivo.

Frontmatter, validado con Zod en build (un error de validación detiene el build con el archivo y campo exactos):

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `titulo` | string | sí | |
| `resumen` | string | sí | 1 a 3 frases, se usa en tarjetas y meta description |
| `palabraClave` | string | no | Palabra de ManyChat, en mayúsculas, única entre recursos |
| `tipo` | `prompt` \| `plantilla` \| `guia` \| `paso-a-paso` | sí | |
| `temas` | string[] | sí | Lista controlada en `src/config/taxonomia.ts` (p. ej. clinicas, inmobiliarias, retail, contenido, productividad) |
| `herramientas` | string[] | no | Lista controlada (claude, chatgpt, n8n, manychat, …) |
| `fecha` | fecha ISO | sí | Orden y etiqueta "Nuevo" (14 días) |
| `duracion` | string | no | "10 min" |
| `video` | URL | no | Reel de Instagram, TikTok o YouTube |
| `descargas` | `{nombre, archivo}[]` | no | Descargas libres. Archivos en `contenido/descargas/`, servidos por `/descargas/[archivo]`. Las descargas premium van como `<Descarga>` dentro de `<Premium>` |
| `relacionados` | slug[] | no | Deben existir; si falta, error de build |
| `borrador` | boolean | no | `true` excluye el recurso del build de producción |

`premium` no es un campo: se deriva de si el cuerpo contiene `<Premium>`. El número de pasos se deriva de los `<Paso>` del cuerpo.

Componentes MDX disponibles:

| Componente | Función |
|---|---|
| `<Paso n="1" titulo="…">` | Paso numerado |
| `<Prompt titulo="…">` | Caja de texto con botón Copiar; resalta `[placeholders]` |
| `<Video url="…" />` | Embed de Instagram, TikTok o YouTube según la URL |
| `<Descarga archivo="…" nombre="…" />` | Botón de descarga |
| `<Nota tipo="truco\|ojo">` | Callout |
| `<Premium>` | Delimita contenido que requiere email |

Flujo editorial: Ezequiel pasa el guion del reel a Claude, que genera el `.mdx`; revisa en local o en el preview de Vercel y hace merge a `main`.

### 4.4 Contenido premium y desbloqueo

Requisito de seguridad: el contenido dentro de `<Premium>` nunca llega al navegador de quien no desbloqueó (ni en HTML, ni en el payload RSC, ni en bundles de JS).

- `<Premium>` es un Server Component. Lee la cookie `ef_acceso` con `cookies()`.
  - Cookie válida: renderiza sus hijos.
  - Sin cookie o inválida: renderiza `<FormularioDesbloqueo slug>` y descarta los hijos.
- `/r/[slug]` es siempre dinámica, así que la cookie se evalúa en cada request.
- Un archivo referenciado por `<Descarga>` dentro de `<Premium>` solo se entrega con cookie válida; sin ella, `/descargas/<archivo>` redirige (303) a la página del recurso.
- `ef_acceso` es un token firmado con HMAC-SHA256 (`ACCESO_SECRET`) que contiene `leadId` y expiración (365 días). Cookie `httpOnly`, `secure`, `sameSite=lax`.

`POST /api/desbloquear` con `{ email, slug, origen?, sitio_web }`:

1. Si `sitio_web` (campo trampa oculto) viene con valor: responde 200 sin hacer nada.
2. Valida email (formato) y que `slug` exista. Si falla: 400 con mensaje en español.
3. Límite de intentos por IP: 5 por minuto, contados en la tabla `intentos` de Supabase (IP hasheada). Excedido: 429.
4. Upsert en `leads` por email; insert en `desbloqueos`.
5. Alta o actualización del contacto en Brevo (lista "Bóveda", atributo `ULTIMO_RECURSO`). Si Brevo falla, se registra el error y el desbloqueo continúa; el lead queda en Supabase con `brevo_sincronizado = false` para reintentar.
6. Fija la cookie y responde 200. El cliente hace `router.refresh()` y el contenido aparece.

Si Supabase falla, responde 503 con "No pudimos guardar tu email, prueba de nuevo" y no fija cookie.

`POST /api/suscribir` sigue los mismos pasos 1 a 5 sin slug ni cookie, con origen `newsletter`.

`origen` sale de `?utm_source` o `?ref` del link (p. ej. ManyChat enviará `/r/erp?ref=manychat`).

### 4.5 Base de datos (Supabase)

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
  slug text not null,        -- 'newsletter' para altas sin recurso
  origen text,
  creado_en timestamptz not null default now()
);

create table intentos (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  creado_en timestamptz not null default now()
);
create index on intentos (ip_hash, creado_en);
```

RLS activado sin políticas públicas: solo el servidor escribe con la service role key. Las claves viven en variables de entorno de Vercel.

### 4.6 Bóveda (`/recursos`)

- En build se genera un índice liviano (título, resumen, tipo, temas, herramientas, fecha, premium) sin el cuerpo de los recursos.
- Búsqueda instantánea en el cliente sobre título, resumen, temas y herramientas, sin distinguir acentos ni mayúsculas.
- Filtros por tipo, tema y herramienta, sincronizados con la URL (`/recursos?tema=clinicas&tipo=prompt`).
- Contadores derivados del índice; etiqueta "Nuevo" para recursos de los últimos 14 días; orden por fecha descendente.
- Tarjeta: etiqueta de tipo, título, resumen, temas y candado si es premium.
- Estado vacío: "No hay recursos con esos filtros" con botón para limpiarlos.

### 4.7 Página de recurso (`/r/[slug]`)

1. Encabezado: tipo, título, resumen, "N pasos · duración", video si existe.
2. Cuerpo MDX (libre, luego bloque premium o formulario).
3. Descargas.
4. "Siguiente paso": CTA al diagnóstico en Cal.com.
5. Recursos relacionados (los de `relacionados`; si no hay, 3 del mismo tema).
6. Caja de newsletter.

### 4.8 Home (`/`)

1. Hero: foto de perfil (`marca/perfil.jpeg`), nombre, posicionamiento "Automatización e IA para negocios", CTAs "Ver recursos" y "Agendar diagnóstico".
2. "Qué hay acá": lista numerada desde `ofertas.ts`.
3. Últimos 6 recursos desde el índice.
4. Consultoría: "45 minutos · trae tu caso · sales con un plan de una página" y botón a Cal.com.
5. Para empresas: bloque separado que enlaza a AIMA (cubolabsia.com).
6. Newsletter y footer con redes.

No se incluyen números, testimonios ni casos hasta que existan datos reales (regla de marca: nada inventado).

### 4.9 SEO y medición

- Metadata por página, sitemap, robots, imágenes OG por recurso.
- `llms.txt` con la lista de recursos públicos (título, resumen, URL).
- Vercel Analytics para tráfico; `desbloqueos` para conversión por recurso.

## 5. Reglas de copy

- Español neutro latinoamericano, tuteo, frases cortas, concreto.
- Sin cifras ni testimonios inventados; los datos faltantes se marcan `porConfirmar`.
- Sin emojis en la web.
- Código y nombres internos en español, como en `conferences/`.

## 6. Contenido de arranque

Migrar los 11 lead magnets de `marca-personal/creador-contenido-reels/contenido/lead-magnets/` a `.mdx`, conservando su palabra clave de ManyChat: RESPUESTAS, ERP, SUCURSALES, CLÍNICA, DATOS, DASHBOARD, POS, CASHEA, STOCK, TASA, CITAS. Para cada uno se decide qué parte es premium al migrarlo.

## 7. Pruebas

- **Unitarias (Vitest)**: validación de frontmatter, firma y verificación del token, lógica de filtros y búsqueda, handler de `/api/desbloquear` con Supabase y Brevo simulados (incluye trampa, 400, 429, falla de Brevo, falla de Supabase).
- **Build**: falla ante frontmatter inválido, palabras clave duplicadas o relacionados inexistentes.
- **E2E (Playwright)**:
  - Recurso premium sin cookie: el texto premium no aparece en el HTML ni en las respuestas de red.
  - Desbloqueo con email: el contenido aparece y persiste al recargar.
  - Filtros de la bóveda reflejados en la URL.
  - Botón Copiar de `<Prompt>`.

## 8. Fuera de alcance

- Diseño visual (paleta, tipografía, animaciones): fase siguiente, a partir del branding en `mi-universo/Marketing/branding/` y `marca-personal/creador-contenido-reels/marca/`.
- Login, pagos, área de alumnos.
- Páginas propias de workshops, conferencias y comunidad.
- Panel de administración.
- Configuración de ManyChat (solo se definen las URLs que debe enviar).

## 9. Pendientes del usuario

- Dominio de la web.
- Email de contacto.
- Cuentas: proyecto de Supabase, cuenta de Brevo y API key, proyecto en Vercel.
