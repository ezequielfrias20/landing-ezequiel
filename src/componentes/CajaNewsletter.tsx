import { FormularioEmail } from './FormularioEmail';

export function CajaNewsletter() {
  return (
    <section className="my-12 rounded-lg border border-linea bg-superficie p-6">
      <h2 className="text-xl font-semibold">Recibe los próximos recursos en tu email</h2>
      <p className="mt-1 text-suave">Un email cuando hay algo nuevo. Te das de baja cuando quieras.</p>
      <div className="mt-4">
        <FormularioEmail endpoint="/api/suscribir" textoBoton="Suscribirme" alExito="mensaje" />
      </div>
    </section>
  );
}
