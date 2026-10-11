import type { ClienteBrevo } from './alta';

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export class ClienteBrevoHttp implements ClienteBrevo {
  constructor(
    private readonly apiKey: string,
    private readonly listaId: number,
    private readonly fetchImpl: Fetch = (url, init) => fetch(url, init),
  ) {}

  async sincronizarContacto(email: string, ultimoRecurso: string | null): Promise<void> {
    const respuesta = await this.fetchImpl('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': this.apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        ...(ultimoRecurso === null ? {} : { attributes: { ULTIMO_RECURSO: ultimoRecurso } }),
        listIds: [this.listaId],
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!respuesta.ok) throw new Error(`Brevo respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
}

/** Para desarrollo y pruebas: no llama a ningún servicio. */
export class ClienteBrevoNulo implements ClienteBrevo {
  async sincronizarContacto(): Promise<void> {}
}
