import type { Conta } from '@/types';
import { ContaItem } from './ContaItem';

interface ContasListProps {
  contas: Conta[];
  hideSaldo?: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (conta: Conta) => void;
}

export function ContasList({
  contas,
  hideSaldo = false,
  onEdit,
  onDelete,
  onDuplicate,
}: ContasListProps) {
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
            <div key={conta.id} id={`conta-${conta.id}`}>
              <ContaItem
                conta={conta}
                hideSaldo={hideSaldo}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            </div>
          ))}
        </div>
      )}

      {contasInativas.length > 0 && (
        <div className="flex flex-col gap-sm">
          <div className="text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">Contas Inativas</div>
          {contasInativas.map((conta) => (
            <div key={conta.id} id={`conta-${conta.id}`}>
              <ContaItem
                conta={conta}
                hideSaldo={hideSaldo}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}