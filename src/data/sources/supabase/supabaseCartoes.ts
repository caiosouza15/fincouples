import type { CartaoCredito } from '@/types';
import type { CartoesDataSource } from '@/data/contracts';
import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './client';
import { getCasalSession, nomeDaPessoa, type CasalSession } from './session';

function rowToCartao(row: Tables<'cartoes'>, session: CasalSession): CartaoCredito {
  return {
    id: row.id,
    casalId: row.casal_id,
    nome: row.nome,
    limite: row.limite,
    // limite_disponivel é coluna gerada (limite - fatura_atual) no Postgres.
    limiteDisponivel: row.limite_disponivel ?? row.limite - row.fatura_atual,
    faturaAtual: row.fatura_atual,
    fechamento: row.fechamento,
    vencimento: row.vencimento,
    ativo: row.ativo,
    icone: row.icone ?? undefined,
    proprietarioId: (row.proprietario_id as CartaoCredito['proprietarioId']) ?? undefined,
    tipo: (row.tipo as CartaoCredito['tipo']) ?? undefined,
    nomeProprietario: nomeDaPessoa(row.proprietario_id, session),
  };
}

export const supabaseCartoes: CartoesDataSource = {
  async getCartoes() {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('casal_id', session.casalId)
      .order('nome');
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToCartao(row, session));
  },

  async createCartao(cartao) {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('cartoes')
      .insert({
        casal_id: session.casalId,
        nome: cartao.nome,
        limite: cartao.limite,
        fatura_atual: cartao.faturaAtual,
        fechamento: cartao.fechamento,
        vencimento: cartao.vencimento,
        ativo: cartao.ativo,
        icone: cartao.icone ?? null,
        proprietario_id: cartao.proprietarioId ?? null,
        tipo: cartao.tipo ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToCartao(data, session);
  },

  async updateCartao(id, cartao) {
    const session = await getCasalSession();
    const payload: TablesUpdate<'cartoes'> = {};
    if (cartao.nome !== undefined) payload.nome = cartao.nome;
    if (cartao.limite !== undefined) payload.limite = cartao.limite;
    if (cartao.faturaAtual !== undefined) payload.fatura_atual = cartao.faturaAtual;
    if (cartao.fechamento !== undefined) payload.fechamento = cartao.fechamento;
    if (cartao.vencimento !== undefined) payload.vencimento = cartao.vencimento;
    if (cartao.ativo !== undefined) payload.ativo = cartao.ativo;
    if (cartao.icone !== undefined) payload.icone = cartao.icone;
    if (cartao.proprietarioId !== undefined) payload.proprietario_id = cartao.proprietarioId;
    if (cartao.tipo !== undefined) payload.tipo = cartao.tipo;
    // limiteDisponivel nunca é enviado — é coluna gerada no banco.

    const { data, error } = await supabase
      .from('cartoes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToCartao(data, session);
  },

  async deleteCartao(id) {
    const { error } = await supabase.from('cartoes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
