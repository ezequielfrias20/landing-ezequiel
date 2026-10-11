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
