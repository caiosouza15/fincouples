import type { FaturaCartao, Lancamento, CartaoCredito } from '@/types';
import { FaturaItem } from './FaturaItem';

interface FaturasListProps {
  faturas: FaturaCartao[];
  cartoes: CartaoCredito[];
  lancamentos: Lancamento[];
  categorias: Array<{ id: string; nome: string; icone?: string }>;
  onMarcarComoPaga: (faturaId: string, valorPago?: number) => void;
}

export function FaturasList({ faturas, cartoes, lancamentos, categorias, onMarcarComoPaga }: FaturasListProps) {
  if (faturas.length === 0) {
    return null;
  }

  // Ordenar por mês (mais recente primeiro)
  const faturasOrdenadas = [...faturas].sort((a, b) => {
    return b.mesReferencia.localeCompare(a.mesReferencia);
  });

  return (
    <div className="flex flex-col gap-sm">
      {faturasOrdenadas
        .map((fatura) => {
          const cartao = cartoes.find(c => c.id === fatura.cartaoId);
          if (!cartao) return null;
          
          return (
            <FaturaItem
              key={fatura.id}
              fatura={fatura}
              cartao={cartao}
              lancamentos={lancamentos}
              categorias={categorias}
              onMarcarComoPaga={onMarcarComoPaga}
            />
          );
        })
        .filter(Boolean)}
    </div>
  );
}
