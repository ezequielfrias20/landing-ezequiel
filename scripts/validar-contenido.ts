import { ErrorContenido } from '@/lib/contenido/analizar';
import { verificarRenderMateriales } from '@/lib/contenido/material/verificarRender';
import { obtenerRecursos } from '@/lib/contenido/recursos';
import { verificarRender } from '@/lib/contenido/verificarRender';

async function main() {
  try {
    const recursos = obtenerRecursos();
    const errores = [...(await verificarRender(recursos)), ...verificarRenderMateriales(recursos)];
    if (errores.length > 0) throw new ErrorContenido(errores.join('\n'));
    console.log(`Contenido válido: ${recursos.length} recursos.`);
  } catch (error) {
    if (error instanceof ErrorContenido) {
      console.error(`\nContenido inválido:\n${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
