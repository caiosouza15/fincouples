import { useMemo } from 'react';
import { getMesAnterior } from '@/utils/relatoriosUtils';
import type { Categoria } from '@/types';

export interface ItemEconomia {
  nomeCategoria: string;
  valorAnterior: number;
  valorAtual: number;
}

type ItemGasto = { categoriaId: string; categoria: Categoria; valor: number };

export function useEconomiaPorCategoria(
  selectedMonth: string,
  categorias: Categoria[],
  getMaioresGastos: (categorias: Categoria[], limit?: number, mes?: string) => ItemGasto[]
): { items: ItemEconomia[]; hasData: boolean } {
  return useMemo(() => {
    const mesAnterior = getMesAnterior(selectedMonth);
    const gastosAnterior = getMaioresGastos(categorias, 30, mesAnterior);
    const gastosAtual = getMaioresGastos(categorias, 30, selectedMonth);

    const byIdAnterior = new Map(gastosAnterior.map((g) => [g.categoriaId, g.valor]));
    const byIdAtual = new Map(gastosAtual.map((g) => [g.categoriaId, g.valor]));
    const allIds = new Set([...byIdAnterior.keys(), ...byIdAtual.keys()]);

    const items: ItemEconomia[] = [];
    allIds.forEach((categoriaId) => {
      const valorAnterior = byIdAnterior.get(categoriaId) ?? 0;
      const valorAtual = byIdAtual.get(categoriaId) ?? 0;
      if (valorAnterior === 0 && valorAtual === 0) return;
      const cat = categorias.find((c) => c.id === categoriaId) ?? {
        id: categoriaId,
        nome: 'Desconhecida',
        tipo: 'despesa' as const,
      };
      items.push({
        nomeCategoria: cat.nome,
        valorAnterior,
        valorAtual,
      });
    });

    items.sort((a, b) => b.valorAnterior + b.valorAtual - (a.valorAnterior + a.valorAtual));
    const top = items.slice(0, 15);

    return { items: top, hasData: top.length > 0 };
  }, [selectedMonth, categorias, getMaioresGastos]);
}
