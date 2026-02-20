import type { Conta } from '@/types';
import { ContaItem } from './ContaItem';

interface ContasListProps {
  contas: Conta[];
  hidePoupancaInvestimento: boolean;
  hideSaldo?: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
}

export function ContasList({
  contas,
  hidePoupancaInvestimento,
  hideSaldo = false,
  onEdit,
  onDelete,
}: ContasListProps) {
  // Separar contas ativas e inativas (mostrar todas; o blur do saldo é aplicado no ContaItem)
  const contasAtivas = contas.filter((c) => c.ativa);
  const contasInativas = contas.filter((c) => !c.ativa);

  if (contas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-md">
      {contasAtivas.length > 0 && (
        <div className="flex flex-col gap-sm">
          {contasAtivas.map((conta) => (
            <ContaItem
              key={conta.id}
              conta={conta}
              hideSaldo={hidePoupancaInvestimento || hideSaldo}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {contasInativas.length > 0 && (
        <div className="flex flex-col gap-sm">
          <div className="text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">Contas Inativas</div>
          {contasInativas.map((conta) => (
            <ContaItem
              key={conta.id}
              conta={conta}
              hideSaldo={hidePoupancaInvestimento || hideSaldo}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}