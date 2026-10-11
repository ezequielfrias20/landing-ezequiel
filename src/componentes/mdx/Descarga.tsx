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
