import { seedDatabase, seedAllData, shouldSeed, clearAllData } from '@/data/mockData';

// Função para popular dados apenas se localStorage estiver vazio (apenas lançamentos)
export function seedIfEmpty(): void {
  if (shouldSeed()) {
    seedDatabase();
  }
}

// Função para popular TODOS os dados mock (contas + categorias + lançamentos)
export async function seedAllIfEmpty(): Promise<void> {
  await seedAllData();
}

// Função para forçar seed (útil para desenvolvimento)
export function forceSeed(): void {
  seedDatabase();
}

// Função para forçar seed completo (útil para desenvolvimento)
export async function forceSeedAll(): Promise<void> {
  await seedAllData();
}

// Limpa todos os dados e repopula com o mock completo (relatórios e gráficos passam a refletir os dados)
export async function resetAndSeed(): Promise<void> {
  clearAllData();
  await seedAllData(true);
}

// Exportar funções do mockData
export { seedDatabase, seedAllData, shouldSeed, clearAllData };
