import { FormularioEmail } from './FormularioEmail';
import { emailActivo } from '@/config/email';

export function CajaNewsletter() {
  if (!emailActivo()) return null;
  return (
    <section className="revelar my-14 sm:my-20" aria-labelledby="newsletter">
      <div className="panel grid gap-8 rounded-xl p-7 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-12">
        <div>
          <p className="etiqueta text-suave">Newsletter</p>
          <h2 id="newsletter" className="titular mt-3 text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] leading-[1.05]">
            Recibe los próximos recursos en tu email
          </h2>
          <p className="mt-4 text-suave">Un email cuando hay algo nuevo. Te das de baja cuando quieras.</p>
        </div>
        <FormularioEmail endpoint="/api/suscribir" textoBoton="Suscribirme" alExito="mensaje" />
      </div>
    </section>
  );
}
