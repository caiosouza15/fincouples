import type { Casal } from '@/types';
import type { CasalDataSource } from '@/data/contracts';
import { supabase } from './client';
import { getCasalSession } from './session';

export const supabaseCasal: CasalDataSource = {
  async getCasal() {
    const session = await getCasalSession();
    const { data, error } = await supabase
      .from('casais')
      .select('*')
      .eq('id', session.casalId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      usuario1Id: data.usuario1_id,
      usuario2Id: data.usuario2_id ?? '',
      createdAt: new Date(data.created_at),
    } satisfies Casal;
  },
};
