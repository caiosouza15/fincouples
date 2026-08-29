import type {
  Conta,
  CartaoCredito,
  Categoria,
  Lancamento,
  FaturaCartao,
  MetaFinanceira,
  Casal,
} from '@/types';

export interface ContasDataSource {
  getContas(): Promise<Conta[]>;
  createConta(conta: Omit<Conta, 'id'>): Promise<Conta>;
  updateConta(id: string, conta: Partial<Conta>): Promise<Conta>;
  deleteConta(id: string): Promise<void>;
}

export interface CartoesDataSource {
  getCartoes(): Promise<CartaoCredito[]>;
  createCartao(cartao: Omit<CartaoCredito, 'id'>): Promise<CartaoCredito>;
  updateCartao(id: string, cartao: Partial<CartaoCredito>): Promise<CartaoCredito>;
  deleteCartao(id: string): Promise<void>;
}

export interface CategoriasDataSource {
  getCategorias(): Promise<Categoria[]>;
  createCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria>;
  updateCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria>;
  deleteCategoria(id: string): Promise<void>;
}

export interface LancamentosDataSource {
  getLancamentos(): Promise<Lancamento[]>;
  createLancamento(lancamento: Omit<Lancamento, 'id'>): Promise<Lancamento>;
  updateLancamento(id: string, lancamento: Partial<Lancamento>): Promise<Lancamento>;
  deleteLancamento(id: string): Promise<void>;
  getLancamentosPorMes(mes: string): Promise<Lancamento[]>;
}

export interface FaturasDataSource {
  getFaturas(): Promise<FaturaCartao[]>;
  getFaturasPorCartao(cartaoId: string): Promise<FaturaCartao[]>;
  getFaturaPorMes(cartaoId: string, mesReferencia: string): Promise<FaturaCartao | null>;
  createFatura(fatura: Omit<FaturaCartao, 'id'>): Promise<FaturaCartao>;
  updateFatura(id: string, fatura: Partial<FaturaCartao>): Promise<FaturaCartao>;
  deleteFatura(id: string): Promise<void>;
}

export interface MetasDataSource {
  getMetas(): Promise<MetaFinanceira[]>;
  createMeta(meta: Omit<MetaFinanceira, 'id'>): Promise<MetaFinanceira>;
  updateMeta(id: string, meta: Partial<MetaFinanceira>): Promise<MetaFinanceira>;
  deleteMeta(id: string): Promise<void>;
}

export interface CasalDataSource {
  getCasal(): Promise<Casal | null>;
}

export interface DataSource {
  contas: ContasDataSource;
  cartoes: CartoesDataSource;
  categorias: CategoriasDataSource;
  lancamentos: LancamentosDataSource;
  faturas: FaturasDataSource;
  metas: MetasDataSource;
  casal: CasalDataSource;
}
