import type { Conta } from "@/types";
import { getDataSource } from "@/data/config";

const ds = () => getDataSource().contas;

export async function getContas(): Promise<Conta[]> {
  return ds().getContas();
}
export async function createConta(conta: Omit<Conta, 'id'>): Promise<Conta> {
  return ds().createConta(conta);
}
export async function updateConta(id: string, conta: Partial<Conta>): Promise<Conta> {
  return ds().updateConta(id, conta);
}
export async function deleteConta(id: string): Promise<void> {
  return ds().deleteConta(id);
}