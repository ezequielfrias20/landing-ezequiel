import { Fragment } from 'react';

/** **negrita** y `código`, igual que fmt() de armar.py. Todo lo demás es texto literal (React escapa). */
function codigo(s: string, clave: string) {
  return s.split(/(`[^`]+`)/g).filter(Boolean).map((p, i) =>
    p.startsWith('`') && p.endsWith('`') && p.length > 2 ? <code key={`${clave}-${i}`}>{p.slice(1, -1)}</code> : <Fragment key={`${clave}-${i}`}>{p}</Fragment>,
  );
}

export function TextoMarcado({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*.+?\*\*)/g).filter(Boolean).map((p, i) =>
        p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i}>{codigo(p.slice(2, -2), `b${i}`)}</strong> : <Fragment key={i}>{codigo(p, `t${i}`)}</Fragment>,
      )}
    </>
  );
}

export function Parrafos({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split('\n\n').map((p) => p.trim()).filter(Boolean);
  return (
    <div className={className}>
      {partes.map((p, i) => (
        <p key={i}>
          <TextoMarcado texto={p} />
        </p>
      ))}
    </div>
  );
}
