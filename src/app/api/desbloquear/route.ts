import { manejarAlta } from '@/lib/leads/manejador';

export async function POST(request: Request) {
  return manejarAlta(request, 'desbloqueo');
}
