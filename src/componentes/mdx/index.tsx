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
