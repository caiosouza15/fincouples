import type { Conta } from '@/types';
import { ContaItem } from './ContaItem';

interface ContasListProps {
  contas: Conta[];
  hidePoupancaInvestimento: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onToggleAtiva: (id: string) => void;
}

export function ContasList({
  contas,
  hidePoupancaInvestimento,
  onEdit,
  onDelete,
  onToggleAtiva,
}: ContasListProps) {
  // Filtrar contas baseado na opção de ocultar
  const contasFiltradas = hidePoupancaInvestimento
    ? contas.filter((c) => c.tipo === 'corrente' || !c.ativa)
    : contas;

  // Separar contas ativas e inativas
  const contasAtivas = contasFiltradas.filter((c) => c.ativa);
  const contasInativas = contasFiltradas.filter((c) => !c.ativa);

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
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAtiva={onToggleAtiva}
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
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAtiva={onToggleAtiva}
            />
          ))}
        </div>
      )}
    </div>
  );
}