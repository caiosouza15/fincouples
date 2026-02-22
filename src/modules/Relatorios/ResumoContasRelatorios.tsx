import { useContas } from '@/hooks/useContas';
import { formatCurrency } from '@/utils';

export function ResumoContasRelatorios() {
  const { contas, getSaldoGeral } = useContas();
  const ativas = contas.filter((c) => c.ativa);

  if (ativas.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-text-secondary">
        Nenhuma conta ativa.
      </div>
    );
  }

  const saldoGeral = getSaldoGeral();

  return (
    <div className="flex flex-col gap-3 sm:gap-md min-w-0">
      <div className="flex justify-between items-center gap-2 p-3 sm:p-md bg-surface rounded-lg border border-border min-w-0">
        <span className="text-xs sm:text-sm font-medium text-text-secondary shrink-0">Saldo total</span>
        <span className={`text-base sm:text-lg font-semibold truncate ${saldoGeral >= 0 ? 'text-positive' : 'text-negative'}`}>
          {formatCurrency(saldoGeral)}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-md">
        {ativas.map((conta) => (
          <div
            key={conta.id}
            className="p-3 sm:p-md rounded-lg border border-border bg-surface flex justify-between items-center gap-2 min-w-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-text-primary truncate">{conta.nome}</p>
              {conta.proprietarioId && (
                <p className="text-xs text-text-secondary truncate">{conta.nomeProprietario ?? conta.proprietarioId}</p>
              )}
            </div>
            <span className={`text-sm sm:text-base font-semibold shrink-0 ${conta.saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(conta.saldo)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
