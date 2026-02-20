import { AlertCircle, Clock, Calendar } from 'lucide-react';
import { Card } from '@/components/Card';
import type { AlertaVencimento } from '@/hooks/useAlertasVencimento';
import { formatCurrency } from '@/utils';

interface AlertasCardProps {
  alertas: AlertaVencimento[];
  onVerFatura: (faturaId: string) => void;
}

export function AlertasCard({ alertas, onVerFatura }: AlertasCardProps) {
  if (alertas.length === 0) {
    return null;
  }

  const getTipoConfig = (tipo: AlertaVencimento['tipo']) => {
    switch (tipo) {
      case 'vencido':
        return {
          icon: AlertCircle,
          color: 'text-negative',
          bgColor: 'bg-negative/10',
          label: 'Vencido',
        };
      case 'vencendo_hoje':
        return {
          icon: Clock,
          color: 'text-negative',
          bgColor: 'bg-negative/10',
          label: 'Vence hoje',
        };
      case 'vencendo_em_3_dias':
        return {
          icon: Clock,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Vence em 3 dias',
        };
      case 'vencendo_em_7_dias':
        return {
          icon: Calendar,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Vence em 7 dias',
        };
    }
  };

  const formatDataVencimento = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const alertasCriticos = alertas.filter(a => a.tipo === 'vencido' || a.tipo === 'vencendo_hoje').length;

  return (
    <Card
      title="Alertas de Vencimento"
      actions={
        alertasCriticos > 0 ? (
          <span className="px-sm py-xs bg-negative text-white text-xs font-semibold rounded-full">
            {alertasCriticos} {alertasCriticos === 1 ? 'crítico' : 'críticos'}
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
              key={alerta.faturaId}
              className={`flex items-center gap-md p-md bg-surface border border-border rounded-md transition-all duration-200 hover:border-positive hover:shadow-sm cursor-pointer ${config.bgColor}`}
              onClick={() => onVerFatura(alerta.faturaId)}
            >
              <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-md ${config.bgColor}`}>
                <IconComponent size={20} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium text-text-primary mb-xs">
                  {alerta.cartaoNome}
                </div>
                <div className="text-sm text-text-secondary">
                  Vencimento: {formatDataVencimento(alerta.dataVencimento)}
                  {alerta.diasRestantes < 0 && (
                    <span className="text-negative ml-sm">
                      ({Math.abs(alerta.diasRestantes)} {Math.abs(alerta.diasRestantes) === 1 ? 'dia' : 'dias'} atrasado)
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-text-primary mt-xs">
                  {formatCurrency(alerta.valorRestante)} restante
                </div>
              </div>
              <div className={`text-sm font-semibold shrink-0 ${config.color}`}>
                {config.label}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
