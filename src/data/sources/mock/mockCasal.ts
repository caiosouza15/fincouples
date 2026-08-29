import type { Casal } from '@/types';
import type { CasalDataSource } from '@/data/contracts';

const CASAL_ID = 'casal-1';

export const mockCasal: CasalDataSource = {
  async getCasal(): Promise<Casal | null> {
    return {
      id: CASAL_ID,
      usuario1Id: 'usuario-1',
      usuario2Id: 'usuario-2',
      createdAt: new Date(),
    };
  },
};
