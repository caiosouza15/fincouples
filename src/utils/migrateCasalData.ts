import type { CartaoCredito, Conta, Lancamento } from '@/types';

const CARTÕES_STORAGE_KEY = 'fincouples_cartoes';
const CONTAS_STORAGE_KEY = 'fincouples_contas';
const LANCAMENTOS_STORAGE_KEY = 'fincouples_lancamentos';
const MIGRATION_FLAG_KEY = 'fincouples_casal_migration_v1';

function loadCartoesFromStorage(): CartaoCredito[] {
  try {
    const data = localStorage.getItem(CARTÕES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCartoesToStorage(cartoes: CartaoCredito[]): void {
  try {
    localStorage.setItem(CARTÕES_STORAGE_KEY, JSON.stringify(cartoes));
  } catch (error) {
    console.error('Erro ao salvar cartões:', error);
  }
}

function loadLancamentosFromStorage(): Lancamento[] {
  try {
    const data = localStorage.getItem(LANCAMENTOS_STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    // Converter datas de string para Date
    return parsed.map((lancamento: any) => {
      let dataDate: Date;
      if (lancamento.data instanceof Date) {
        dataDate = lancamento.data;
      } else if (typeof lancamento.data === 'string') {
        dataDate = new Date(lancamento.data);
      } else if (typeof lancamento.data === 'number') {
        dataDate = new Date(lancamento.data);
      } else {
        dataDate = new Date(lancamento.data);
      }
      
      return {
        ...lancamento,
        data: dataDate,
      };
    });
  } catch {
    return [];
  }
}

function saveLancamentosToStorage(lancamentos: Lancamento[]): void {
  try {
    localStorage.setItem(LANCAMENTOS_STORAGE_KEY, JSON.stringify(lancamentos));
  } catch (error) {
    console.error('Erro ao salvar lançamentos:', error);
  }
}

export function migrateCartoesToCasal(): { migrated: number; total: number } {
  const cartoes = loadCartoesFromStorage();
  let migrated = 0;

  const cartoesAtualizados = cartoes.map((cartao) => {
    // Só migrar se não tiver os campos novos
    if (!cartao.proprietarioId || !cartao.tipo) {
      migrated++;
      return {
        ...cartao,
        proprietarioId: 'usuario1' as const,
        tipo: 'principal' as const,
        nomeProprietario: 'Usuario 1',
      };
    }
    return cartao;
  });

  if (migrated > 0) {
    saveCartoesToStorage(cartoesAtualizados);
    console.log(`✅ [Migração] ${migrated} cartões migrados para sistema de casal`);
  }

  return { migrated, total: cartoes.length };
}

function loadContasFromStorage(): Conta[] {
  try {
    const data = localStorage.getItem(CONTAS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveContasToStorage(contas: Conta[]): void {
  try {
    localStorage.setItem(CONTAS_STORAGE_KEY, JSON.stringify(contas));
  } catch (error) {
    console.error('Erro ao salvar contas:', error);
  }
}

export function migrateContasToCasal(): { migrated: number; total: number } {
  const contas = loadContasFromStorage();
  let migrated = 0;

  const contasAtualizados = contas.map((conta) => {
    if (conta.proprietarioId == null) {
      migrated++;
      return {
        ...conta,
        proprietarioId: 'usuario1' as const,
        nomeProprietario: 'Usuario 1',
      };
    }
    return conta;
  });

  if (migrated > 0) {
    saveContasToStorage(contasAtualizados);
    console.log(`✅ [Migração] ${migrated} contas migradas para sistema de casal`);
  }

  return { migrated, total: contas.length };
}

export function migrateLancamentosToCasal(): { migrated: number; total: number } {
  const lancamentos = loadLancamentosFromStorage();
  let migrated = 0;

  const lancamentosAtualizados = lancamentos.map((lancamento) => {
    // Só migrar se não tiver pessoaId e for despesa (receitas podem ser compartilhadas)
    if (!lancamento.pessoaId && lancamento.tipo === 'despesa') {
      migrated++;
      return {
        ...lancamento,
        pessoaId: 'usuario1' as const,
        nomePessoa: 'Usuario 1',
      };
    }
    return lancamento;
  });

  if (migrated > 0) {
    saveLancamentosToStorage(lancamentosAtualizados);
    console.log(`✅ [Migração] ${migrated} lançamentos migrados para sistema de casal`);
  }

  return { migrated, total: lancamentos.length };
}

export function migrateAllCasalData(): {
  cartoes: { migrated: number; total: number };
  contas: { migrated: number; total: number };
  lancamentos: { migrated: number; total: number };
} {
  const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG_KEY);
  if (alreadyMigrated === 'true') {
    console.log('ℹ️ [Migração] Dados já foram migrados anteriormente');
    return {
      cartoes: { migrated: 0, total: 0 },
      contas: { migrated: 0, total: 0 },
      lancamentos: { migrated: 0, total: 0 },
    };
  }

  const cartoesResult = migrateCartoesToCasal();
  const contasResult = migrateContasToCasal();
  const lancamentosResult = migrateLancamentosToCasal();

  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

  console.log(`✅ [Migração] Migração completa: ${cartoesResult.migrated} cartões, ${contasResult.migrated} contas, ${lancamentosResult.migrated} lançamentos`);

  return {
    cartoes: cartoesResult,
    contas: contasResult,
    lancamentos: lancamentosResult,
  };
}
