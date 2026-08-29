import type { CartaoCredito } from "@/types";
import { getDataSource } from "@/data/config";

const ds = () => getDataSource().cartoes;

export async function getCartoes(): Promise<CartaoCredito[]> {
  return ds().getCartoes();
}
export async function createCartao(cartao: Omit<CartaoCredito, 'id'>): Promise<CartaoCredito> {
  return ds().createCartao(cartao);
}
export async function updateCartao(id: string, cartao: Partial<CartaoCredito>): Promise<CartaoCredito> {
  return ds().updateCartao(id, cartao);
}
export async function deleteCartao(id: string): Promise<void> {
  return ds().deleteCartao(id);
}
