import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { RepositorioLeads } from './alta';

export function crearClienteSupabase(url: string, claveServicio: string): SupabaseClient {
  return createClient(url, claveServicio, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class RepositorioSupabase implements RepositorioLeads {
  constructor(private readonly db: SupabaseClient) {}

  async contarIntentosDesde(ipHash: string, desde: Date) {
    const { count, error } = await this.db
      .from('intentos')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('creado_en', desde.toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  async registrarIntento(ipHash: string) {
    const { error } = await this.db.from('intentos').insert({ ip_hash: ipHash });
    if (error) throw error;
  }

  async guardarLead(email: string) {
    const { data, error } = await this.db
      .from('leads')
      .upsert({ email }, { onConflict: 'email' })
      .select('id, brevo_sincronizado')
      .single();
    if (error) throw error;
    return { id: data.id as string, brevoSincronizado: data.brevo_sincronizado as boolean };
  }

  async registrarDesbloqueo(d: { leadId: string; slug: string; origen: string | null }) {
    const { error } = await this.db.from('desbloqueos').insert({ lead_id: d.leadId, slug: d.slug, origen: d.origen });
    if (error) throw error;
  }

  async marcarBrevoSincronizado(leadId: string) {
    const { error } = await this.db.from('leads').update({ brevo_sincronizado: true }).eq('id', leadId);
    if (error) throw error;
  }
}
