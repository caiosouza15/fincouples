import { AlertCircle, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '@/components/Card';
import type { AlertaSaldo, TipoAlertaSaldo } from '@/hooks/useAlertasSaldo';
import { formatCurrency } from '@/utils';

interface AlertasSaldoCardProps {
  alertas: AlertaSaldo[];
  hideSaldo?: boolean;
}

function getTipoConfig(tipo: TipoAlertaSaldo) {
  switch (tipo) {
    case 'negativo':
      return {
        icon: AlertCircle,
        color: 'text-negative',
        bgColor: 'bg-negative/10',
      };
    case 'saldo_baixo':
      return {
        icon: TrendingDown,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
      };
  }
}

export function AlertasSaldoCard({ alertas, hideSaldo = false }: AlertasSaldoCardProps) {
  if (alertas.length === 0) {
    return null;
  }

  const criticos = alertas.filter(a => a.tipo === 'negativo').length;

  return (
    <Card
      title="Alertas de Saldo"
      actions={
        criticos > 0 ? (
          <span className="px-sm py-xs bg-negative text-white text-xs font-semibold rounded-full">
            {criticos} {criticos === 1 ? 'conta negativa' : 'contas negativas'}
          </span>
        ) : null
      }
    >
      <div className="flex flex-col gap-sm">
        {alertas.map((alerta) => {
          const config = getTipoConfig(alerta.tipo);
          const IconComponent = config.icon;

          return (
            <div
              key={alerta.contaId}
              className={`flex items-center gap-md p-md bg-surface border border-border rounded-md transition-all duration-200 ${config.bgColor}`}
            >
              <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-background`}>
                <IconComponent size={20} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium text-text-primary mb-xs">
                  {alerta.contaNome}
                </div>
                <div className="text-sm text-text-secondary">
                  {alerta.mensagem}
                </div>
                <div className={`text-sm font-semibold mt-xs ${alerta.saldo < 0 ? 'text-negative' : 'text-warning'}`}>
                  {hideSaldo ? (
                    <span className="blur-value">{formatCurrency(alerta.saldo)}</span>
                  ) : (
                    formatCurrency(alerta.saldo)
                  )}
                </div>
              </div>
              <Wallet size={18} className="text-text-secondary shrink-0" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
