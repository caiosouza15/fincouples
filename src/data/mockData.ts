import type { Lancamento, Conta, Categoria, CartaoCredito } from '@/types';
import { getCategorias } from '@/services/categoriasService';
import { gerarFaturaAutomatica } from '@/services/faturasService';

const CASAL_ID = 'casal-1';

// Função para gerar data em um mês específico (monthsAgo: 0 = atual, 1 = anterior, -1 = próximo mês, etc.)
function getDateInMonth(monthsAgo: number, dayOfMonth: number = 15): Date {
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth() - monthsAgo;
  // Ajustar se o mês for negativo (ano anterior) ou >= 12 (ano seguinte)
  while (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }
  while (targetMonth > 11) {
    targetMonth -= 12;
    targetYear += 1;
  }
  const date = new Date(targetYear, targetMonth, Math.min(dayOfMonth, 28), 12, 0, 0, 0);
  return date;
}

// Função para gerar ID único
function generateId(): string {
  return crypto.randomUUID();
}

// IDs fixos para referência nos lançamentos
const ID_CONTA_U1_CORRENTE = 'conta-u1-corrente';
const ID_CONTA_U1_POUPANCA = 'conta-u1-poupanca';
const ID_CONTA_U2_CORRENTE = 'conta-u2-corrente';
const ID_CONTA_U2_POUPANCA = 'conta-u2-poupanca';
const ID_CONTA_INV = 'conta-inv';

// Gerar contas mock (dois usuários + compartilhada)
export function generateMockContas(): Conta[] {
  return [
    { id: ID_CONTA_U1_CORRENTE, casalId: CASAL_ID, nome: 'Conta Corrente - Nubank', tipo: 'corrente', saldo: 5200, ativa: true, icone: 'bank', proprietarioId: 'usuario1' },
    { id: ID_CONTA_U1_POUPANCA, casalId: CASAL_ID, nome: 'Poupança - Caixa', tipo: 'poupanca', saldo: 12000, ativa: true, icone: 'bank', proprietarioId: 'usuario1' },
    { id: ID_CONTA_U2_CORRENTE, casalId: CASAL_ID, nome: 'Conta Corrente - Itaú', tipo: 'corrente', saldo: 3800, ativa: true, icone: 'bank', proprietarioId: 'usuario2' },
    { id: ID_CONTA_U2_POUPANCA, casalId: CASAL_ID, nome: 'Poupança - Santander', tipo: 'poupanca', saldo: 8000, ativa: true, icone: 'bank', proprietarioId: 'usuario2' },
    { id: ID_CONTA_INV, casalId: CASAL_ID, nome: 'Investimentos - XP', tipo: 'investimento', saldo: 25000, ativa: true, icone: 'bank' },
  ];
}

// IDs fixos dos cartões para referência nos lançamentos
const ID_CARTAO_U1_NUBANK = 'cartao-u1-nubank';
const ID_CARTAO_U1_ITAU = 'cartao-u1-itau';
const ID_CARTAO_U2_C6 = 'cartao-u2-c6';
const ID_CARTAO_U2_SANTANDER = 'cartao-u2-santander';

// Gerar cartões de crédito mock (dois por usuário)
export function generateMockCartoes(): CartaoCredito[] {
  return [
    { id: ID_CARTAO_U1_NUBANK, casalId: CASAL_ID, nome: 'Nubank', limite: 8000, limiteDisponivel: 5200, faturaAtual: 2800, fechamento: 10, vencimento: 17, ativo: true, proprietarioId: 'usuario1' },
    { id: ID_CARTAO_U1_ITAU, casalId: CASAL_ID, nome: 'Itaú Visa', limite: 5000, limiteDisponivel: 3500, faturaAtual: 1500, fechamento: 5, vencimento: 12, ativo: true, proprietarioId: 'usuario1' },
    { id: ID_CARTAO_U2_C6, casalId: CASAL_ID, nome: 'C6 Bank', limite: 6000, limiteDisponivel: 4200, faturaAtual: 1800, fechamento: 15, vencimento: 22, ativo: true, proprietarioId: 'usuario2' },
    { id: ID_CARTAO_U2_SANTANDER, casalId: CASAL_ID, nome: 'Santander', limite: 4000, limiteDisponivel: 3100, faturaAtual: 900, fechamento: 8, vencimento: 15, ativo: true, proprietarioId: 'usuario2' },
  ];
}

// Buscar categoria por id (ex: padrao-alimentacao) ou por slug no nome
function findCategoria(categorias: Categoria[], slug: string, tipo: 'receita' | 'despesa'): Categoria | undefined {
  const padraoId = 'padrao-' + slug.replace(/\s/g, '-').toLowerCase();
  const byId = categorias.find(c => c.tipo === tipo && (c.id === padraoId || c.id.includes(slug)));
  if (byId) return byId;
  return categorias.find(c => c.tipo === tipo && c.nome.toLowerCase().includes(slug));
}

// Resolver IDs reais a partir dos arrays (compatível com contas/cartões antigos ou novos)
function getContaIdByPessoa(contas: Conta[], pessoa: 'usuario1' | 'usuario2', tipo: 'corrente' | 'poupanca'): string | undefined {
  const c = contas.find(x => x.proprietarioId === pessoa && x.tipo === tipo)
    ?? contas.find(x => x.id === (pessoa === 'usuario1' ? ID_CONTA_U1_CORRENTE : ID_CONTA_U2_CORRENTE))
    ?? contas.find(x => x.tipo === tipo);
  return c?.id;
}

function getCartaoIdsOrdenados(cartoes: CartaoCredito[]): string[] {
  if (cartoes.length === 0) return [];
  const u1 = cartoes.filter(c => c.proprietarioId === 'usuario1');
  const u2 = cartoes.filter(c => c.proprietarioId === 'usuario2');
  const ids: string[] = [];
  if (u1[0]) ids.push(u1[0].id);
  if (u1[1]) ids.push(u1[1].id);
  if (u2[0]) ids.push(u2[0].id);
  if (u2[1]) ids.push(u2[1].id);
  while (ids.length < 4 && cartoes.length > ids.length) ids.push(cartoes[ids.length].id);
  return ids;
}

// Gerar lançamentos mock: 12 meses passados + atual + 2 meses futuros; débito/crédito; pessoaId; parcelas
export function generateMockLancamentos(
  contas: Conta[],
  categorias: Categoria[],
  cartoes: CartaoCredito[]
): Lancamento[] {
  if (contas.length === 0 || categorias.length === 0) {
    return [];
  }

  const lancamentos: Lancamento[] = [];
  const contaU1 = getContaIdByPessoa(contas, 'usuario1', 'corrente') ?? contas[0].id;
  const contaU2 = getContaIdByPessoa(contas, 'usuario2', 'corrente') ?? (contas[1]?.id ?? contas[0].id);
  const cartoesIds = getCartaoIdsOrdenados(cartoes);
  const cartaoU1 = cartoesIds[0] ?? ID_CARTAO_U1_NUBANK;
  const cartaoU2 = cartoesIds[2] ?? ID_CARTAO_U2_C6;

  type ItemDespesa = { valor: number; cat: string; desc: string; dia: number; conta?: boolean; pessoa?: 'usuario1' | 'usuario2' };
  type ItemReceita = { valor: number; cat: string; desc: string; dia: number; pessoa: 'usuario1' | 'usuario2' };

  const despesasBase: ItemDespesa[] = [
    { valor: 85.5, cat: 'alimentacao', desc: 'Supermercado', dia: 2, conta: true, pessoa: 'usuario1' },
    { valor: 45, cat: 'transporte', desc: 'Uber', dia: 5, conta: false, pessoa: 'usuario2' },
    { valor: 1200, cat: 'moradia', desc: 'Aluguel', dia: 7, conta: true, pessoa: 'usuario1' },
    { valor: 150, cat: 'saude', desc: 'Consulta', dia: 8, conta: true, pessoa: 'usuario2' },
    { valor: 320, cat: 'educacao', desc: 'Curso online', dia: 10, conta: false, pessoa: 'usuario1' },
    { valor: 65, cat: 'alimentacao', desc: 'Restaurante', dia: 12, conta: false, pessoa: 'usuario2' },
    { valor: 180, cat: 'compras', desc: 'Roupas', dia: 15, conta: false, pessoa: 'usuario1' },
    { valor: 95, cat: 'transporte', desc: 'Combustível', dia: 18, conta: true, pessoa: 'usuario2' },
    { valor: 250, cat: 'lazer', desc: 'Cinema', dia: 20, conta: false, pessoa: 'usuario1' },
    { valor: 45, cat: 'assinaturas', desc: 'Netflix', dia: 22, conta: false, pessoa: 'usuario2' },
    { valor: 110, cat: 'alimentacao', desc: 'Mercado', dia: 25, conta: true, pessoa: 'usuario1' },
    { valor: 75, cat: 'contas', desc: 'Conta de luz', dia: 28, conta: true, pessoa: 'usuario2' },
  ];

  const receitasBase: ItemReceita[] = [
    { valor: 6500, cat: 'salario', desc: 'Salário', dia: 5, pessoa: 'usuario1' },
    { valor: 5200, cat: 'salario', desc: 'Salário', dia: 5, pessoa: 'usuario2' },
    { valor: 800, cat: 'outras-receitas', desc: 'Freelance', dia: 15, pessoa: 'usuario1' },
    { valor: 300, cat: 'rendimentos', desc: 'Rendimento', dia: 20, pessoa: 'usuario2' },
  ];

  // Meses: 0=atual, 1..11=passado, -1,-2=futuro
  const mesesPassadosEAtual = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const mesesFuturos = [-1, -2];

  for (const monthsAgo of [...mesesPassadosEAtual, ...mesesFuturos]) {
    const isFuture = monthsAgo < 0;

    for (const item of receitasBase) {
      const cat = findCategoria(categorias, item.cat, 'receita');
      if (!cat) continue;
      const contaId = item.pessoa === 'usuario1' ? contaU1 : contaU2;
      lancamentos.push({
        id: generateId(),
        casalId: CASAL_ID,
        tipo: 'receita',
        categoriaId: cat.id,
        contaId,
        valor: item.valor,
        descricao: item.desc,
        data: getDateInMonth(monthsAgo, item.dia),
        pago: !isFuture,
        pessoaId: item.pessoa,
      });
    }

    for (let i = 0; i < despesasBase.length; i++) {
      const item = despesasBase[i];
      const cat = findCategoria(categorias, item.cat, 'despesa');
      if (!cat) continue;
      const pessoa = item.pessoa ?? (i % 2 === 0 ? 'usuario1' : 'usuario2');
      if (item.conta) {
        const contaId = pessoa === 'usuario1' ? contaU1 : contaU2;
        lancamentos.push({
          id: generateId(),
          casalId: CASAL_ID,
          tipo: 'despesa',
          categoriaId: cat.id,
          contaId,
          valor: item.valor,
          descricao: item.desc,
          data: getDateInMonth(monthsAgo, item.dia),
          pago: monthsAgo > 0 || (monthsAgo === 0 && item.dia <= 15),
          pessoaId: pessoa,
        });
      } else if (cartoesIds.length > 0) {
        const cartaoId = cartoesIds[(monthsAgo + i) % cartoesIds.length];
        lancamentos.push({
          id: generateId(),
          casalId: CASAL_ID,
          tipo: 'despesa',
          categoriaId: cat.id,
          cartaoId,
          valor: item.valor,
          descricao: item.desc,
          data: getDateInMonth(monthsAgo, item.dia),
          pago: monthsAgo > 0 || (monthsAgo === 0 && item.dia <= 15),
          pessoaId: pessoa,
        });
      }
    }
  }

  // Parcelas no cartão (apenas se houver cartões)
  if (cartoes.length > 0) {
    const catCompras = findCategoria(categorias, 'compras', 'despesa');
    if (catCompras) {
      const lancamentoPai3Id = generateId();
      const valorParcela3 = 433.33;
      for (let p = 0; p < 3; p++) {
        const monthsAgo = p;
        lancamentos.push({
          id: p === 0 ? lancamentoPai3Id : generateId(),
          casalId: CASAL_ID,
          tipo: 'despesa',
          categoriaId: catCompras.id,
          cartaoId: cartaoU1,
          valor: p === 2 ? 433.34 : valorParcela3,
          descricao: `Celular (3x) parcela ${p + 1}/3`,
          data: getDateInMonth(monthsAgo, 10),
          pago: monthsAgo > 0,
          parcelado: true,
          totalParcelas: 3,
          parcelaAtual: p + 1,
          lancamentoPaiId: lancamentoPai3Id,
          pessoaId: 'usuario1',
        });
      }

      const valorParcela6 = 350;
      const lancamentoPai6Id = generateId();
      for (let p = 0; p < 6; p++) {
        const monthsAgo = 1 + p;
        lancamentos.push({
          id: p === 0 ? lancamentoPai6Id : generateId(),
          casalId: CASAL_ID,
          tipo: 'despesa',
          categoriaId: catCompras.id,
          cartaoId: cartaoU2,
          valor: valorParcela6,
          descricao: `Móveis (6x) parcela ${p + 1}/6`,
          data: getDateInMonth(monthsAgo, 20),
          pago: monthsAgo > 1,
          parcelado: true,
          totalParcelas: 6,
          parcelaAtual: p + 1,
          lancamentoPaiId: lancamentoPai6Id,
          pessoaId: 'usuario2',
        });
      }
    }
  }

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

    const cartoesData = localStorage.getItem('fincouples_cartoes');
    const cartoes: CartaoCredito[] = cartoesData ? JSON.parse(cartoesData) : [];
    const lancamentos = generateMockLancamentos(contas, categorias, cartoes);

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

const FORCE_SEED_KEY = 'fincouples_force_seed';

// Verifica se deve forçar recriação (sessionStorage: use no console: sessionStorage.setItem('fincouples_force_seed','1'); location.reload() )
export function shouldForceSeed(): boolean {
  try {
    return sessionStorage.getItem(FORCE_SEED_KEY) === '1';
  } catch {
    return false;
  }
}

// Detecta se os dados existentes estão no formato antigo (sem pessoaId, sem cartão, ou sem cartões no app)
function isOldMockFormat(): boolean {
  try {
    const raw = localStorage.getItem('fincouples_lancamentos');
    const cartoesData = localStorage.getItem('fincouples_cartoes');
    const hasCartoes = cartoesData && JSON.parse(cartoesData).length > 0;
    // Tinha lançamentos mas não tinha cartões = mock antigo
    if (raw && !hasCartoes) return true;
    if (!raw) return false;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return false;
    const first = arr[0];
    // Formato antigo: sem pessoaId e sem cartaoId; ou poucos itens (mock antigo tinha ~50)
    if (!first.pessoaId && !first.cartaoId) return true;
    if (arr.length < 200) return true; // novo mock tem centenas de lançamentos (14 meses x muitos itens)
    return false;
  } catch {
    return false;
  }
}

// Função para popular TODOS os dados mock (contas + categorias + lançamentos)
// forceReplace = true: limpa contas, cartões, lançamentos e faturas e recria tudo (útil para ver o novo mock)
export async function seedAllData(forceReplace?: boolean): Promise<void> {
  try {
    console.log('🌱 Iniciando seed de dados mock...');

    const force = forceReplace || shouldForceSeed() || isOldMockFormat();
    if (force) {
      console.log('🔄 Substituindo dados antigos pelo novo mock...');
      localStorage.removeItem('fincouples_contas');
      localStorage.removeItem('fincouples_cartoes');
      localStorage.removeItem('fincouples_lancamentos');
      localStorage.removeItem('fincouples_faturas');
      try {
        sessionStorage.removeItem(FORCE_SEED_KEY);
      } catch {
        /* ignore */
      }
    }

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

    // 3. Verificar se cartões existem, se não, criar cartões mock
    const cartoesData = localStorage.getItem('fincouples_cartoes');
    let cartoes: CartaoCredito[] = [];
    if (!cartoesData) {
      console.log('📝 Criando cartões mock...');
      cartoes = generateMockCartoes();
      localStorage.setItem('fincouples_cartoes', JSON.stringify(cartoes));
      console.log(`✅ Cartões mock criados: ${cartoes.length} cartões`);
    } else {
      cartoes = JSON.parse(cartoesData);
      if (cartoes.length === 0) {
        console.log('📝 Criando cartões mock (lista vazia)...');
        cartoes = generateMockCartoes();
        localStorage.setItem('fincouples_cartoes', JSON.stringify(cartoes));
        console.log(`✅ Cartões mock criados: ${cartoes.length} cartões`);
      } else {
        console.log(`✅ Cartões já existem: ${cartoes.length} cartões`);
      }
    }

    // 4. Verificar se lançamentos existem, se não, criar lançamentos mock
    const hasLancamentos = localStorage.getItem('fincouples_lancamentos');
    if (!hasLancamentos) {
      if (contas.length === 0 || categorias.length === 0) {
        console.warn('⚠️ Não é possível gerar lançamentos mock sem contas e categorias');
        return;
      }

      console.log('📝 Criando lançamentos mock...');
      const lancamentos = generateMockLancamentos(contas, categorias, cartoes);

      const lancamentosToSave = lancamentos.map(l => {
        const data = l.data instanceof Date ? l.data : new Date(l.data);
        return { ...l, data: data.toISOString() };
      });

      localStorage.setItem('fincouples_lancamentos', JSON.stringify(lancamentosToSave));
      console.log(`✅ Lançamentos mock criados: ${lancamentosToSave.length} lançamentos`);

      const lancamentosPorMes = new Map<string, number>();
      lancamentosToSave.forEach(l => {
        const dataDate = typeof l.data === 'string' ? new Date(l.data) : new Date(l.data);
        const year = dataDate.getFullYear();
        const month = String(dataDate.getMonth() + 1).padStart(2, '0');
        const mesKey = `${year}-${month}`;
        lancamentosPorMes.set(mesKey, (lancamentosPorMes.get(mesKey) || 0) + 1);
      });
      console.log('📊 Distribuição de lançamentos por mês:', Object.fromEntries(lancamentosPorMes));

      // 5. Gerar faturas para cada cartão nos últimos 3 meses (mês atual + 2 anteriores)
      const currentDate = new Date();
      const ano = currentDate.getFullYear();
      const mesAtual = currentDate.getMonth() + 1;
      const mesesParaFaturas: string[] = [];
      for (let m = 0; m < 3; m++) {
        let mes = mesAtual - m;
        let a = ano;
        if (mes < 1) {
          mes += 12;
          a -= 1;
        }
        mesesParaFaturas.push(`${a}-${String(mes).padStart(2, '0')}`);
      }
      try {
        for (const cartao of cartoes) {
          for (const mesRef of mesesParaFaturas) {
            await gerarFaturaAutomatica(cartao.id, mesRef);
          }
        }
        console.log('✅ Faturas geradas para cartões');
      } catch (err) {
        console.warn('⚠️ Algumas faturas podem não ter sido geradas:', err);
      }
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
    localStorage.removeItem('fincouples_cartoes');
    localStorage.removeItem('fincouples_faturas');
    localStorage.removeItem('fincouples_metas');
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
