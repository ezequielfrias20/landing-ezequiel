/** Un paquete de material mínimo y válido, como lo escribe el dashboard. */
export function paqueteBueno(cambios: Record<string, unknown> = {}) {
  return {
    contenido: {
      id: '2026-10-09-1008', version: 1, guion_hash: 'sha256:x', generado: '2026-10-11T22:45:00Z', verificado: '2026-10-11',
      formato: 'plantilla', promesa: 'p', palabra: 'ESTRENO', nombre_pdf: 'brag-video',
      portada: { titulo: 'Tu proyecto, en video', acento: 'la skill /brag', subtitulo: 'Qué es /brag y cómo se instala.', herramientas: ['claude'] },
      te_llevas: { puntos: ['Los **dos** comandos.'], tiempo: '15 minutos', empieza_por: 'La sección 02' },
      secciones: [
        {
          id: 's1', titulo: 'La skill se llama /brag', bloques: [
            { tipo: 'haz', texto: 'Apunta a `/brag`.' },
            { tipo: 'herramienta', slug: 'claude', nombre: 'Claude', que_hace: 'Escribe.', precio: 'Gratis', url: 'https://claude.ai', fuente: 'f1' },
            { tipo: 'captura', archivo: 'sitio.png', pie: 'El sitio.', fuente: 'f2' },
            { tipo: 'pagina' },
            { tipo: 'dato', valor: '15.223', texto: 'estrellas.', fuente: 'f1' },
            { tipo: 'micro', texto: 'Mira el video.' },
          ],
        },
      ],
      despues: { titulo: 'Después', texto: 'Uno.\n\nDos.' },
      cierre: { titulo: 'Agenda', texto: 'Llamada.' },
    },
    fuentes: [
      { id: 'f1', titulo: 'README', url: 'https://github.com/latent-spaces/brag', dato: 'd', cita: 'c', verificado: '2026-10-11' },
      { id: 'f2', titulo: 'Sitio', url: 'https://latent-spaces.github.io/brag', dato: 'd' },
      { id: 'f3', titulo: 'Sin citar', url: 'https://ejemplo.com' },
    ],
    herramientas: { claude: { nombre: 'Claude', logo: 'logos/claude.svg', fondo: '#FFFFFF' } },
    pdf: 'brag-video.pdf',
    fecha: '2026-10-11',
    video: 'https://www.instagram.com/reel/ABC/',
    origen: { material: '2026-10-09-1008', version: 1 },
    ...cambios,
  };
}
