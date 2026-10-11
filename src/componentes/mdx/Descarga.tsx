export function Descarga({ archivo, nombre }: { archivo: string; nombre: string }) {
  return (
    <p className="not-prose my-6">
      <a href={`/descargas/${archivo}`} className="boton boton-primario">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
        Descargar: {nombre}
      </a>
    </p>
  );
}
