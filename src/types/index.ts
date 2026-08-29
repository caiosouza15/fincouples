// Entidades principais conforme documentação

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  createdAt: Date;
}

// Adaptação para casal (dois usuários)
export interface Casal {
  id: string;
  usuario1Id: string;
  usuario2Id: string;
  createdAt: Date;
}

export interface Conta {
  id: string;
  casalId: string; // Mudança: agora é casalId
  nome: string;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  saldo: number;
  ativa: boolean;
  icone?: string; // Para exibir logo do banco
  proprietarioId?: 'usuario1' | 'usuario2'; // Opcional para compatibilidade
  nomeProprietario?: string; // Opcional, cache do nome
}

export interface CartaoCredito {
  id: string;
  casalId: string; // Mudança: agora é casalId
  nome: string;
  limite: number;
  limiteDisponivel: number; // Calculado: limite - fatura atual
  faturaAtual: number;
  fechamento: number; // Dia do mês
  vencimento: number; // Dia do mês
  ativo: boolean;
  icone?: string;
  proprietarioId?: 'usuario1' | 'usuario2'; // Opcional para compatibilidade
  tipo?: 'principal' | 'adicional'; // Opcional
  nomeProprietario?: string; // Opcional, cache do nome
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor?: string;
  icone?: string;
  padrao?: boolean; // Categoria padrão (não editável/deletável). No mock, inferido pelo prefixo "padrao-" do id.
}

export interface Lancamento {
  id: string;
  casalId: string; // Mudança: agora é casalId
  tipo: 'receita' | 'despesa';
  categoriaId: string;
  contaId?: string;
  cartaoId?: string;
  valor: number;
  descricao: string;
  data: Date;
  pago?: boolean;
  parcelado?: boolean; // Se a despesa é parcelada
  totalParcelas?: number; // Total de parcelas (se parcelado)
  parcelaAtual?: number; // Número da parcela atual (1, 2, 3...)
  lancamentoPaiId?: string; // ID do lançamento original (para agrupar parcelas)
  pessoaId?: 'usuario1' | 'usuario2'; // Opcional para compatibilidade
  nomePessoa?: string; // Opcional, cache do nome
}

export interface MetaFinanceira {
  id: string;
  casalId: string; // Mudança: agora é casalId
  titulo: string;
  categoriaId?: string; // Meta por categoria (ex: Alimentação)
  valorObjetivo: number;
  valorAtual: number;
  prazo?: Date;
  concluida: boolean;
  mesReferencia?: string; // Ex: "2024-11"
}

// Tipos auxiliares para o dashboard
export interface ResumoMensal {
  receita: number;
  despesa: number;
  resultado: number; // receita - despesa
  mes: string;
}

export interface MaiorGasto {
  categoriaId: string;
  categoria: Categoria;
  valor: number;
}

export interface TarefaOnboarding {
  id: string;
  titulo: string;
  completa: boolean;
}

export interface FaturaCartao {
  id: string;
  cartaoId: string;
  mesReferencia: string; // formato YYYY-MM
  valorTotal: number; // Soma dos lançamentos do cartão no período
  valorPago: number; // Valor já pago (para pagamento parcial)
  status: 'nao_pago' | 'pago_parcial' | 'pago_total';
  dataFechamento: Date; // Data de fechamento da fatura
  dataVencimento: Date; // Data de vencimento da fatura
  pago: boolean; // Campo auxiliar para compatibilidade
}
