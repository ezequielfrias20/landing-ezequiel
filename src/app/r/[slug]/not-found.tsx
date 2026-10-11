import Link from 'next/link';

export default function RecursoNoEncontrado() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Ese recurso no existe o cambió de nombre</h1>
      <p className="mt-2 text-suave">Búscalo en la bóveda, ahí está todo.</p>
      <Link href="/recursos" className="mt-6 inline-block rounded-md bg-acento px-4 py-2 font-medium text-white">
        Ir a los recursos
      </Link>
    </main>
  );
}
