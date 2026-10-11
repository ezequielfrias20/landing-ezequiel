import Link from 'next/link';

export default function RecursoNoEncontrado() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p className="etiqueta text-suave">Error 404</p>
      <h1 className="titular mt-4 text-[clamp(2.25rem,1.4rem+3.2vw,3.5rem)]">Ese recurso no existe o cambió de nombre</h1>
      <p className="mt-4 text-lg text-suave">Búscalo en la bóveda, ahí está todo.</p>
      <Link href="/recursos" className="boton boton-primario mt-8">
        Ir a los recursos
      </Link>
    </main>
  );
}
