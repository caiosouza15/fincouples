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
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor?: string;
  icone?: string;
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
