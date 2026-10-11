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
