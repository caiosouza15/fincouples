import type { Lancamento, Conta, Categoria } from '@/types';
import { getCategorias } from '@/services/categoriasService';

const CASAL_ID = 'casal-1';

// Função para gerar data em um mês específico (mesesAtras: 0 = atual, 1 = anterior, etc.)
function getDateInMonth(monthsAgo: number, dayOfMonth: number = 15): Date {
  const now = new Date();
  
  // Calcular ano e mês alvo
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth() - monthsAgo;
  
  // Ajustar se o mês for negativo (ano anterior)
  while (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }
  
  // Criar data diretamente com ano, mês e dia para evitar problemas de timezone
  // Usar meio-dia (12:00) para evitar problemas de timezone
  const date = new Date(targetYear, targetMonth, dayOfMonth, 12, 0, 0, 0);
  
  return date;
}

// Função para gerar ID único
function generateId(): string {
  return crypto.randomUUID();
}

// Gerar contas mock
export function generateMockContas(): Conta[] {
  return [
    {
      id: generateId(),
      casalId: CASAL_ID,
      nome: 'Conta Corrente - Nubank',
      tipo: 'corrente',
      saldo: 3500.00,
      ativa: true,
      icone: 'bank',
    },
    {
      id: generateId(),
      casalId: CASAL_ID,
      nome: 'Poupança - Caixa',
      tipo: 'poupanca',
      saldo: 10000.00,
      ativa: true,
      icone: 'bank',
    },
    {
      id: generateId(),
      casalId: CASAL_ID,
      nome: 'Investimentos - XP',
      tipo: 'investimento',
      saldo: 25000.00,
      ativa: true,
      icone: 'bank',
    },
  ];
}

// Gerar lançamentos mock
export function generateMockLancamentos(
  contas: Conta[],
  categorias: Categoria[]
): Lancamento[] {
  if (contas.length === 0 || categorias.length === 0) {
    return [];
  }

  const despesaCategorias = categorias.filter(c => c.tipo === 'despesa');
  const receitaCategorias = categorias.filter(c => c.tipo === 'receita');

  const lancamentos: Lancamento[] = [];

  // Distribuir lançamentos nos últimos 4 meses
  // Mês atual (0 meses atrás)
  const despesasMesAtual = [
    { valor: 85.50, categoria: 'alimentacao', descricao: 'Supermercado semanal', dia: 2 },
    { valor: 45.00, categoria: 'transporte', descricao: 'Uber para trabalho', dia: 5 },
    { valor: 1200.00, categoria: 'moradia', descricao: 'Aluguel do mês', dia: 7 },
    { valor: 150.00, categoria: 'saude', descricao: 'Consulta médica', dia: 8 },
    { valor: 320.00, categoria: 'educacao', descricao: 'Curso online', dia: 10 },
    { valor: 65.00, categoria: 'alimentacao', descricao: 'Restaurante', dia: 12 },
    { valor: 180.00, categoria: 'compras', descricao: 'Roupas', dia: 15 },
    { valor: 95.00, categoria: 'transporte', descricao: 'Combustível', dia: 18 },
    { valor: 250.00, categoria: 'lazer', descricao: 'Cinema e jantar', dia: 20 },
    { valor: 45.00, categoria: 'assinaturas', descricao: 'Netflix', dia: 22 },
    { valor: 110.00, categoria: 'alimentacao', descricao: 'Mercado', dia: 25 },
    { valor: 75.00, categoria: 'contas', descricao: 'Conta de luz', dia: 28 },
  ];

  // Mês anterior (1 mês atrás)
  const despesasMesAnterior = [
    { valor: 200.00, categoria: 'saude', descricao: 'Farmácia', dia: 5 },
    { valor: 90.00, categoria: 'transporte', descricao: 'Uber', dia: 8 },
    { valor: 500.00, categoria: 'compras', descricao: 'Eletrônicos', dia: 12 },
    { valor: 120.00, categoria: 'alimentacao', descricao: 'Delivery', dia: 15 },
    { valor: 180.00, categoria: 'roupas', descricao: 'Roupas de inverno', dia: 18 },
    { valor: 60.00, categoria: 'lazer', descricao: 'Parque', dia: 22 },
    { valor: 85.00, categoria: 'contas', descricao: 'Internet', dia: 25 },
    { valor: 300.00, categoria: 'educacao', descricao: 'Material escolar', dia: 28 },
  ];

  // 2 meses atrás
  const despesas2MesesAtras = [
    { valor: 150.00, categoria: 'saude', descricao: 'Consulta dentista', dia: 10 },
    { valor: 220.00, categoria: 'transporte', descricao: 'Manutenção carro', dia: 15 },
    { valor: 350.00, categoria: 'compras', descricao: 'Móveis', dia: 20 },
    { valor: 95.00, categoria: 'alimentacao', descricao: 'Supermercado', dia: 25 },
    { valor: 130.00, categoria: 'lazer', descricao: 'Viagem', dia: 28 },
  ];

  // 3 meses atrás
  const despesas3MesesAtras = [
    { valor: 180.00, categoria: 'saude', descricao: 'Exames', dia: 8 },
    { valor: 280.00, categoria: 'compras', descricao: 'Eletrodomésticos', dia: 15 },
    { valor: 110.00, categoria: 'alimentacao', descricao: 'Restaurante', dia: 22 },
  ];

  // Receitas - Mês atual
  const receitasMesAtual = [
    { valor: 5000.00, categoria: 'salario', descricao: 'Salário mensal', dia: 5 },
    { valor: 800.00, categoria: 'outras-receitas', descricao: 'Freelance', dia: 15 },
  ];

  // Receitas - Mês anterior
  const receitasMesAnterior = [
    { valor: 5000.00, categoria: 'salario', descricao: 'Salário mensal', dia: 5 },
    { valor: 1200.00, categoria: 'outras-receitas', descricao: 'Projeto extra', dia: 12 },
    { valor: 300.00, categoria: 'rendimentos', descricao: 'Rendimento investimento', dia: 20 },
  ];

  // Receitas - 2 meses atrás
  const receitas2MesesAtras = [
    { valor: 5000.00, categoria: 'salario', descricao: 'Salário mensal', dia: 5 },
    { valor: 600.00, categoria: 'outras-receitas', descricao: 'Freelance', dia: 18 },
  ];

  // Receitas - 3 meses atrás
  const receitas3MesesAtras = [
    { valor: 5000.00, categoria: 'salario', descricao: 'Salário mensal', dia: 5 },
    { valor: 200.00, categoria: 'presentes', descricao: 'Presente recebido', dia: 15 },
  ];

  // Função auxiliar para criar despesas
  const criarDespesas = (items: Array<{ valor: number; categoria: string; descricao: string; dia: number }>, monthsAgo: number) => {
    items.forEach((item) => {
      const categoria = despesaCategorias.find(c => 
        c.nome.toLowerCase().includes(item.categoria) || 
        c.id.includes(item.categoria)
      );
      
      if (categoria && contas.length > 0) {
        const conta = contas[Math.floor(Math.random() * contas.length)]; // Conta aleatória
      lancamentos.push({
        id: generateId(),
        casalId: CASAL_ID,
        tipo: 'despesa',
        categoriaId: categoria.id,
        contaId: conta.id,
          valor: item.valor,
          descricao: item.descricao,
          data: getDateInMonth(monthsAgo, item.dia),
          pago: monthsAgo === 0 || (monthsAgo === 1 && item.dia <= 15), // Pagas se recentes
      });
    }
  });
  };

  // Função auxiliar para criar receitas
  const criarReceitas = (items: Array<{ valor: number; categoria: string; descricao: string; dia: number }>, monthsAgo: number) => {
    items.forEach((item) => {
      const categoria = receitaCategorias.find(c => 
        c.nome.toLowerCase().includes(item.categoria) || 
        c.id.includes(item.categoria)
      );
      
      if (categoria && contas.length > 0) {
        const conta = contas[Math.floor(Math.random() * contas.length)]; // Conta aleatória
      lancamentos.push({
        id: generateId(),
        casalId: CASAL_ID,
        tipo: 'receita',
        categoriaId: categoria.id,
        contaId: conta.id,
          valor: item.valor,
          descricao: item.descricao,
          data: getDateInMonth(monthsAgo, item.dia),
          pago: true, // Receitas sempre pagas
      });
    }
  });
  };

  // Criar lançamentos para cada mês
  criarDespesas(despesasMesAtual, 0); // Mês atual
  criarDespesas(despesasMesAnterior, 1); // Mês anterior
  criarDespesas(despesas2MesesAtras, 2); // 2 meses atrás
  criarDespesas(despesas3MesesAtras, 3); // 3 meses atrás

  criarReceitas(receitasMesAtual, 0); // Mês atual
  criarReceitas(receitasMesAnterior, 1); // Mês anterior
  criarReceitas(receitas2MesesAtras, 2); // 2 meses atrás
  criarReceitas(receitas3MesesAtras, 3); // 3 meses atrás

  return lancamentos;
}

// Função para popular banco de dados inicial (apenas lançamentos)
export function seedDatabase(): void {
  try {
    // Verificar se já existe dados
    const hasLancamentos = localStorage.getItem('fincouples_lancamentos');
    if (hasLancamentos) {
        return; // Já tem dados, não popula
      }

    // Carregar contas e categorias existentes
    const contasData = localStorage.getItem('fincouples_contas');
    const categoriasData = localStorage.getItem('fincouples_categorias');

    if (!contasData || !categoriasData) {
      console.warn('Não é possível gerar dados mock sem contas e categorias');
      return;
    }

    const contas: Conta[] = JSON.parse(contasData);
    const categorias: Categoria[] = JSON.parse(categoriasData);

    if (contas.length === 0 || categorias.length === 0) {
      console.warn('Contas ou categorias vazias, não é possível gerar dados mock');
      return;
    }

    // Gerar lançamentos mock
    const lancamentos = generateMockLancamentos(contas, categorias);

    // Garantir que todas as datas sejam objetos Date válidos antes de salvar
    const lancamentosToSave = lancamentos.map(l => ({
      ...l,
      data: l.data instanceof Date ? l.data : new Date(l.data),
    }));

    // Salvar no localStorage
    localStorage.setItem('fincouples_lancamentos', JSON.stringify(lancamentosToSave));
    console.log(`✅ Dados mock criados: ${lancamentosToSave.length} lançamentos`);
  } catch (error) {
    console.error('Erro ao popular dados mock:', error);
  }
}

// Função para popular TODOS os dados mock (contas + categorias + lançamentos)
export async function seedAllData(): Promise<void> {
  try {
    console.log('🌱 Iniciando seed de dados mock...');

    // 1. Garantir que categorias existam (cria padrões se não existirem)
    let categorias: Categoria[] = [];
    try {
      categorias = await getCategorias();
      console.log(`✅ Categorias carregadas: ${categorias.length} categorias`);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      return;
    }

    // 2. Verificar se contas existem, se não, criar contas mock
    const contasData = localStorage.getItem('fincouples_contas');
    let contas: Conta[] = [];

    if (!contasData) {
      console.log('📝 Criando contas mock...');
      contas = generateMockContas();
      localStorage.setItem('fincouples_contas', JSON.stringify(contas));
      console.log(`✅ Contas mock criadas: ${contas.length} contas`);
    } else {
      contas = JSON.parse(contasData);
      if (contas.length === 0) {
        console.log('📝 Criando contas mock (lista vazia)...');
        contas = generateMockContas();
        localStorage.setItem('fincouples_contas', JSON.stringify(contas));
        console.log(`✅ Contas mock criadas: ${contas.length} contas`);
      } else {
        console.log(`✅ Contas já existem: ${contas.length} contas`);
      }
    }

    // 3. Verificar se lançamentos existem, se não, criar lançamentos mock
    const hasLancamentos = localStorage.getItem('fincouples_lancamentos');
    if (!hasLancamentos) {
      if (contas.length === 0 || categorias.length === 0) {
        console.warn('⚠️ Não é possível gerar lançamentos mock sem contas e categorias');
        return;
      }

      console.log('📝 Criando lançamentos mock...');
      const lancamentos = generateMockLancamentos(contas, categorias);
      
      // Garantir que todas as datas sejam objetos Date válidos antes de salvar
      const lancamentosToSave = lancamentos.map(l => ({
        ...l,
        data: l.data instanceof Date ? l.data : new Date(l.data),
      }));
      
      localStorage.setItem('fincouples_lancamentos', JSON.stringify(lancamentosToSave));
      console.log(`✅ Lançamentos mock criados: ${lancamentosToSave.length} lançamentos`);
      
      // Debug: mostrar distribuição por mês
      const lancamentosPorMes = new Map<string, number>();
      lancamentosToSave.forEach(l => {
        const dataDate = l.data instanceof Date ? l.data : new Date(l.data);
        const year = dataDate.getFullYear();
        const month = String(dataDate.getMonth() + 1).padStart(2, '0');
        const mesKey = `${year}-${month}`;
        lancamentosPorMes.set(mesKey, (lancamentosPorMes.get(mesKey) || 0) + 1);
      });
      console.log('📊 Distribuição de lançamentos por mês:', Object.fromEntries(lancamentosPorMes));
      
      // Debug: verificar mês atual
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      console.log('🗓️ Mês atual:', currentMonth);
      console.log('📈 Lançamentos no mês atual:', lancamentosPorMes.get(currentMonth) || 0);
    } else {
      console.log('✅ Lançamentos já existem');
    }

    console.log('🎉 Seed de dados mock concluído!');
  } catch (error) {
    console.error('❌ Erro ao popular dados mock:', error);
  }
}

// Função para limpar todos os dados (útil para reset)
export function clearAllData(): void {
  try {
    localStorage.removeItem('fincouples_contas');
    localStorage.removeItem('fincouples_categorias');
    localStorage.removeItem('fincouples_lancamentos');
    console.log('✅ Todos os dados foram limpos');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
}

// Função para verificar se deve popular dados
export function shouldSeed(): boolean {
  const hasLancamentos = localStorage.getItem('fincouples_lancamentos');
  return !hasLancamentos;
}
