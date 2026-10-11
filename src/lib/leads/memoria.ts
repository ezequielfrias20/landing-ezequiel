import { randomUUID } from 'node:crypto';
import type { RepositorioLeads } from './alta';

export class RepositorioMemoria implements RepositorioLeads {
  leads = new Map<string, { id: string; email: string; brevoSincronizado: boolean }>();
  desbloqueos: { leadId: string; slug: string; origen: string | null }[] = [];
  intentos: { ipHash: string; en: Date }[] = [];

  constructor(private readonly ahora: () => Date = () => new Date()) {}

  async contarIntentosDesde(ipHash: string, desde: Date) {
    return this.intentos.filter((i) => i.ipHash === ipHash && i.en >= desde).length;
  }

  async registrarIntento(ipHash: string) {
    this.intentos.push({ ipHash, en: this.ahora() });
  }

  async guardarLead(email: string) {
    let lead = this.leads.get(email);
    if (!lead) {
      lead = { id: randomUUID(), email, brevoSincronizado: false };
      this.leads.set(email, lead);
    }
    return { id: lead.id, brevoSincronizado: lead.brevoSincronizado };
  }

  async registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }) {
    this.desbloqueos.push(d);
  }

  async marcarBrevoSincronizado(leadId: string) {
    for (const lead of this.leads.values()) if (lead.id === leadId) lead.brevoSincronizado = true;
  }
}
