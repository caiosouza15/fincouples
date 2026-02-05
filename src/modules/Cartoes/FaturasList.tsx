import type { FaturaCartao } from '@/types';
import { FaturaItem } from './FaturaItem';

interface FaturasListProps {
  faturas: FaturaCartao[];
  onMarcarComoPaga: (faturaId: string, valorPago?: number) => void;
}

export function FaturasList({ faturas, onMarcarComoPaga }: FaturasListProps) {
  if (faturas.length === 0) {
    return null;
  }

  // Ordenar por mês (mais recente primeiro)
  const faturasOrdenadas = [...faturas].sort((a, b) => {
    return b.mesReferencia.localeCompare(a.mesReferencia);
  });

  return (
    <div className="flex flex-col gap-sm">
      {faturasOrdenadas.map((fatura) => (
        <FaturaItem
          key={fatura.id}
          fatura={fatura}
          onMarcarComoPaga={onMarcarComoPaga}
        />
      ))}
    </div>
  );
}
