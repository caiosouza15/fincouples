import type { MetaFinanceira } from '@/types';
import { getDataSource } from '@/data/config';

const ds = () => getDataSource().metas;

export async function getMetas(): Promise<MetaFinanceira[]> {
  return ds().getMetas();
}
export async function createMeta(meta: Omit<MetaFinanceira, 'id'>): Promise<MetaFinanceira> {
  return ds().createMeta(meta);
}
export async function updateMeta(id: string, meta: Partial<MetaFinanceira>): Promise<MetaFinanceira> {
  return ds().updateMeta(id, meta);
}
export async function deleteMeta(id: string): Promise<void> {
  return ds().deleteMeta(id);
}
