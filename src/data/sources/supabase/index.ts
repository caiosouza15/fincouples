import { supabaseContas } from './supabaseContas';
import { supabaseCartoes } from './supabaseCartoes';
import { supabaseCategorias } from './supabaseCategorias';
import { supabaseLancamentos } from './supabaseLancamentos';
import { supabaseFaturas } from './supabaseFaturas';
import { supabaseMetas } from './supabaseMetas';
import { supabaseCasal } from './supabaseCasal';
import type { DataSource } from '@/data/contracts';

export const supabaseDataSource: DataSource = {
  contas: supabaseContas,
  cartoes: supabaseCartoes,
  categorias: supabaseCategorias,
  lancamentos: supabaseLancamentos,
  faturas: supabaseFaturas,
  metas: supabaseMetas,
  casal: supabaseCasal,
};

export { supabase } from './client';
export { getCasalSession } from './session';
