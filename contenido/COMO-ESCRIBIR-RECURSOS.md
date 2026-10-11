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
