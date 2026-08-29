import type { Lancamento } from '@/types';
import type { LancamentosDataSource } from '@/data/contracts';
import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './client';
import { getCasalSession, nomeDaPessoa, type CasalSession } from './session';
import { dbDateToDate, dateToDbDate } from './dateUtils';

function rowToLancamento(row: Tables<'lancamentos'>, session: CasalSession): Lancamento {
  return {
    id: row.id,
    casalId: row.casal_id,
    tipo: row.tipo as Lancamento['tipo'],
    categoriaId: row.categoria_id,
    contaId: row.conta_id ?? undefined,
    cartaoId: row.cartao_id ?? undefined,
    valor: row.valor,
    descricao: row.descricao,
    data: dbDateToDate(row.data),
    pago: row.pago,
    parcelado: row.parcelado,
    totalParcelas: row.total_parcelas ?? undefined,
    parcelaAtual: row.parcela_atual ?? undefined,
    lancamentoPaiId: row.lancamento_pai_id ?? undefined,
    pessoaId: (row.pessoa_id as Lancamento['pessoaId']) ?? undefined,
    nomePessoa: nomeDaPessoa(row.pessoa_id, session),
  };
}

function monthRange(mes: string): { start: string; end: string } {
  const [year, month] = mes.split('-').map(Number);
  const start = `${mes}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${mes}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

export const supabaseLancamentos: LancamentosDataSource = {
  async getLancamentos() {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('casal_id', session.casalId)
      .order('data', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToLancamento(row, session));
  },

  async getLancamentosPorMes(mes) {
    const session = await getCasalSession();
    const { start, end } = monthRange(mes);
    const { data, error } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('casal_id', session.casalId)
      .gte('data', start)
      .lte('data', end)
      .order('data', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToLancamento(row, session));
  },

  async createLancamento(lancamento) {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('lancamentos')
      .insert({
        casal_id: session.casalId,
        tipo: lancamento.tipo,
        categoria_id: lancamento.categoriaId,
        conta_id: lancamento.contaId ?? null,
        cartao_id: lancamento.cartaoId ?? null,
        valor: lancamento.valor,
        descricao: lancamento.descricao,
        data: dateToDbDate(lancamento.data),
        pago: lancamento.pago ?? false,
        parcelado: lancamento.parcelado ?? false,
        total_parcelas: lancamento.totalParcelas ?? null,
        parcela_atual: lancamento.parcelaAtual ?? null,
        lancamento_pai_id: lancamento.lancamentoPaiId ?? null,
        pessoa_id: lancamento.pessoaId ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToLancamento(data, session);
  },

  async updateLancamento(id, lancamento) {
    const session = await getCasalSession();
    const payload: TablesUpdate<'lancamentos'> = {};
    if (lancamento.tipo !== undefined) payload.tipo = lancamento.tipo;
    if (lancamento.categoriaId !== undefined) payload.categoria_id = lancamento.categoriaId;
    if (lancamento.contaId !== undefined) payload.conta_id = lancamento.contaId;
    if (lancamento.cartaoId !== undefined) payload.cartao_id = lancamento.cartaoId;
    if (lancamento.valor !== undefined) payload.valor = lancamento.valor;
    if (lancamento.descricao !== undefined) payload.descricao = lancamento.descricao;
    if (lancamento.data !== undefined) payload.data = dateToDbDate(lancamento.data);
    if (lancamento.pago !== undefined) payload.pago = lancamento.pago;
    if (lancamento.parcelado !== undefined) payload.parcelado = lancamento.parcelado;
    if (lancamento.totalParcelas !== undefined) payload.total_parcelas = lancamento.totalParcelas;
    if (lancamento.parcelaAtual !== undefined) payload.parcela_atual = lancamento.parcelaAtual;
    if (lancamento.lancamentoPaiId !== undefined) payload.lancamento_pai_id = lancamento.lancamentoPaiId;
    if (lancamento.pessoaId !== undefined) payload.pessoa_id = lancamento.pessoaId;

    const { data, error } = await supabase
      .from('lancamentos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToLancamento(data, session);
  },

  async deleteLancamento(id) {
    const { error } = await supabase.from('lancamentos').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
