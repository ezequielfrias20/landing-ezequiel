import { ErrorContenido } from '@/lib/contenido/analizar';
import { obtenerRecursos } from '@/lib/contenido/recursos';

try {
  const recursos = obtenerRecursos();
  console.log(`Contenido válido: ${recursos.length} recursos.`);
} catch (error) {
  if (error instanceof ErrorContenido) {
    console.error(`\nContenido inválido:\n${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
