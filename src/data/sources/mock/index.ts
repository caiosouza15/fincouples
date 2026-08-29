import { mockContas } from './mockContas';
import { mockCartoes } from './mockCartoes';
import { mockCategorias } from './mockCategorias';
import { mockLancamentos } from './mockLancamentos';
import { mockFaturas } from './mockFaturas';
import { mockMetas } from './mockMetas';
import { mockCasal } from './mockCasal';
import type { DataSource } from '@/data/contracts';

export const mockDataSource: DataSource = {
  contas: mockContas,
  cartoes: mockCartoes,
  categorias: mockCategorias,
  lancamentos: mockLancamentos,
  faturas: mockFaturas,
  metas: mockMetas,
  casal: mockCasal,
};
