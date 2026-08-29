import type { Categoria } from '@/types';
import type { CategoriasDataSource } from '@/data/contracts';
import type { Tables, TablesUpdate } from './database.types';
import { supabase } from './client';
import { getCasalSession } from './session';

function rowToCategoria(row: Tables<'categorias'>): Categoria {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo as Categoria['tipo'],
    cor: row.cor ?? undefined,
    icone: row.icone ?? undefined,
    padrao: row.padrao,
  };
}

function friendlyError(error: { code?: string; message: string }): Error {
  if (error.code === '23505') {
    return new Error('Já existe uma categoria com este nome e tipo');
  }
  return new Error(error.message);
}

export const supabaseCategorias: CategoriasDataSource = {
  async getCategorias() {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('casal_id', session.casalId)
      .order('nome');
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToCategoria);
  },

  async createCategoria(categoria) {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('categorias')
      .insert({
        casal_id: session.casalId,
        nome: categoria.nome.trim(),
        tipo: categoria.tipo,
        cor: categoria.cor ?? null,
        icone: categoria.icone ?? null,
      })
      .select()
      .single();
    if (error) throw friendlyError(error);
    return rowToCategoria(data);
  },

  async updateCategoria(id, categoria) {
    const payload: TablesUpdate<'categorias'> = {};
    if (categoria.nome !== undefined) payload.nome = categoria.nome.trim();
    if (categoria.tipo !== undefined) payload.tipo = categoria.tipo;
    if (categoria.cor !== undefined) payload.cor = categoria.cor;
    if (categoria.icone !== undefined) payload.icone = categoria.icone;

    const { data, error } = await supabase
      .from('categorias')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw friendlyError(error);
    return rowToCategoria(data);
  },

  async deleteCategoria(id) {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
