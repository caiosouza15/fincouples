import type { Categoria } from "@/types";
import { getDataSource } from "@/data/config";

const ds = () => getDataSource().categorias;

export async function getCategorias(): Promise<Categoria[]> {
  return ds().getCategorias();
}

export async function createCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
  return ds().createCategoria(categoria);
}
export async function updateCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
  return ds().updateCategoria(id, categoria);
}
export async function deleteCategoria(id: string): Promise<void> {
  return ds().deleteCategoria(id);
}
