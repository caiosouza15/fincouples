import type { Conta } from '@/types';
import type { ContasDataSource } from '@/data/contracts';
import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './client';
import { getCasalSession, nomeDaPessoa, type CasalSession } from './session';

function rowToConta(row: Tables<'contas'>, session: CasalSession): Conta {
  return {
    id: row.id,
    casalId: row.casal_id,
    nome: row.nome,
    tipo: row.tipo as Conta['tipo'],
    saldo: row.saldo,
    ativa: row.ativa,
    icone: row.icone ?? undefined,
    proprietarioId: (row.proprietario_id as Conta['proprietarioId']) ?? undefined,
    nomeProprietario: nomeDaPessoa(row.proprietario_id, session),
  };
}

export const supabaseContas: ContasDataSource = {
  async getContas() {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('contas')
      .select('*')
      .eq('casal_id', session.casalId)
      .order('nome');
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToConta(row, session));
  },

  async createConta(conta) {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('contas')
      .insert({
        casal_id: session.casalId,
        nome: conta.nome,
        tipo: conta.tipo,
        saldo: conta.saldo,
        ativa: conta.ativa,
        icone: conta.icone ?? null,
        proprietario_id: conta.proprietarioId ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToConta(data, session);
  },

  async updateConta(id, conta) {
    const session = await getCasalSession();
    const payload: TablesUpdate<'contas'> = {};
    if (conta.nome !== undefined) payload.nome = conta.nome;
    if (conta.tipo !== undefined) payload.tipo = conta.tipo;
    if (conta.saldo !== undefined) payload.saldo = conta.saldo;
    if (conta.ativa !== undefined) payload.ativa = conta.ativa;
    if (conta.icone !== undefined) payload.icone = conta.icone;
    if (conta.proprietarioId !== undefined) payload.proprietario_id = conta.proprietarioId;

    const { data, error } = await supabase
      .from('contas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToConta(data, session);
  },

  async deleteConta(id) {
    const { error } = await supabase.from('contas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
