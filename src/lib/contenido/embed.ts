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
