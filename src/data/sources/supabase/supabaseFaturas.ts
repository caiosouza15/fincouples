import type { FaturaCartao } from '@/types';
import type { FaturasDataSource } from '@/data/contracts';
import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './client';
import { getCasalSession } from './session';
import { dbDateToDate, dateToDbDate } from './dateUtils';

function rowToFatura(row: Tables<'faturas'>): FaturaCartao {
  return {
    id: row.id,
    cartaoId: row.cartao_id,
    mesReferencia: row.mes_referencia,
    valorTotal: row.valor_total,
    valorPago: row.valor_pago,
    status: row.status as FaturaCartao['status'],
    dataFechamento: dbDateToDate(row.data_fechamento),
    dataVencimento: dbDateToDate(row.data_vencimento),
    pago: row.status === 'pago_total',
  };
}

export const supabaseFaturas: FaturasDataSource = {
  async getFaturas() {
    const session = await getCasalSession();
    const { data: cartoes, error: cartoesError } = await supabase
      .from('cartoes')
      .select('id')
      .eq('casal_id', session.casalId);
    if (cartoesError) throw new Error(cartoesError.message);

    const cartaoIds = (cartoes ?? []).map((c) => c.id);
    if (cartaoIds.length === 0) return [];

    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .in('cartao_id', cartaoIds)
      .order('mes_referencia', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToFatura);
  },

  async getFaturasPorCartao(cartaoId) {
    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .eq('cartao_id', cartaoId)
      .order('mes_referencia', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToFatura);
  },

  async getFaturaPorMes(cartaoId, mesReferencia) {
    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .eq('cartao_id', cartaoId)
      .eq('mes_referencia', mesReferencia)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToFatura(data) : null;
  },

  async createFatura(fatura) {
    const { data, error } = await supabase
      .from('faturas')
      .insert({
        cartao_id: fatura.cartaoId,
        mes_referencia: fatura.mesReferencia,
        valor_total: fatura.valorTotal,
        valor_pago: fatura.valorPago,
        status: fatura.status,
        data_fechamento: dateToDbDate(fatura.dataFechamento),
        data_vencimento: dateToDbDate(fatura.dataVencimento),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToFatura(data);
  },

  async updateFatura(id, fatura) {
    const payload: TablesUpdate<'faturas'> = {};
    if (fatura.valorTotal !== undefined) payload.valor_total = fatura.valorTotal;
    if (fatura.valorPago !== undefined) payload.valor_pago = fatura.valorPago;
    if (fatura.status !== undefined) payload.status = fatura.status;
    if (fatura.dataFechamento !== undefined) payload.data_fechamento = dateToDbDate(fatura.dataFechamento);
    if (fatura.dataVencimento !== undefined) payload.data_vencimento = dateToDbDate(fatura.dataVencimento);

    const { data, error } = await supabase
      .from('faturas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToFatura(data);
  },

  async deleteFatura(id) {
    const { error } = await supabase.from('faturas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
