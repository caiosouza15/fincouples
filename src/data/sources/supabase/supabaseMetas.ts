import type { MetaFinanceira } from '@/types';
import type { MetasDataSource } from '@/data/contracts';
import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './client';
import { getCasalSession } from './session';
import { dbDateToDate, dateToDbDate } from './dateUtils';

function rowToMeta(row: Tables<'metas'>): MetaFinanceira {
  return {
    id: row.id,
    casalId: row.casal_id,
    titulo: row.titulo,
    categoriaId: row.categoria_id ?? undefined,
    valorObjetivo: row.valor_objetivo,
    valorAtual: row.valor_atual,
    prazo: row.prazo ? dbDateToDate(row.prazo) : undefined,
    concluida: row.concluida,
    mesReferencia: row.mes_referencia ?? undefined,
  };
}

export const supabaseMetas: MetasDataSource = {
  async getMetas() {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('casal_id', session.casalId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToMeta);
  },

  async createMeta(meta) {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('metas')
      .insert({
        casal_id: session.casalId,
        titulo: meta.titulo,
        categoria_id: meta.categoriaId ?? null,
        valor_objetivo: meta.valorObjetivo,
        valor_atual: meta.valorAtual ?? 0,
        prazo: meta.prazo ? dateToDbDate(meta.prazo) : null,
        concluida: meta.concluida ?? false,
        mes_referencia: meta.mesReferencia ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToMeta(data);
  },

  async updateMeta(id, meta) {
    const payload: TablesUpdate<'metas'> = {};
    if (meta.titulo !== undefined) payload.titulo = meta.titulo;
    if (meta.categoriaId !== undefined) payload.categoria_id = meta.categoriaId;
    if (meta.valorObjetivo !== undefined) payload.valor_objetivo = meta.valorObjetivo;
    if (meta.valorAtual !== undefined) payload.valor_atual = meta.valorAtual;
    if (meta.prazo !== undefined) payload.prazo = meta.prazo ? dateToDbDate(meta.prazo) : null;
    if (meta.concluida !== undefined) payload.concluida = meta.concluida;
    if (meta.mesReferencia !== undefined) payload.mes_referencia = meta.mesReferencia;

    const { data, error } = await supabase
      .from('metas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToMeta(data);
  },

  async deleteMeta(id) {
    const { error } = await supabase.from('metas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
