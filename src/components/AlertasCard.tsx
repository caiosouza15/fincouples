import { AlertCircle, Clock, Calendar } from 'lucide-react';
import type { AlertaVencimento } from '@/hooks/useAlertasVencimento';
import { formatCurrency } from '@/utils';
import styles from './AlertasCard.module.css';

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
        return { icon: AlertCircle, iconClass: styles.iconNegative, statusClass: styles.statusNegative, label: 'Vencido' };
      case 'vencendo_hoje':
        return { icon: Clock, iconClass: styles.iconNegative, statusClass: styles.statusNegative, label: 'Vence hoje' };
      case 'vencendo_em_3_dias':
        return { icon: Clock, iconClass: styles.iconWarning, statusClass: styles.statusWarning, label: 'Vence em 3 dias' };
      case 'vencendo_em_7_dias':
        return { icon: Calendar, iconClass: styles.iconWarning, statusClass: styles.statusWarning, label: 'Vence em 7 dias' };
    }
  };

  const formatDataVencimento = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const alertasCriticos = alertas.filter((a) => a.tipo === 'vencido' || a.tipo === 'vencendo_hoje').length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Alertas de Vencimento</span>
        {alertasCriticos > 0 && (
          <span className={styles.countBadge}>
            {alertasCriticos} {alertasCriticos === 1 ? 'crítico' : 'críticos'}
          </span>
        )}
      </div>

      <div className={styles.list}>
        {alertas.map((alerta) => {
          const config = getTipoConfig(alerta.tipo);
          const IconComponent = config.icon;

          return (
            <div key={alerta.faturaId} className={styles.row} onClick={() => onVerFatura(alerta.faturaId)}>
              <div className={`${styles.icon} ${config.iconClass}`}>
                <IconComponent size={18} />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{alerta.cartaoNome}</div>
                <div className={styles.message}>
                  Vencimento: {formatDataVencimento(alerta.dataVencimento)}
                  {alerta.diasRestantes < 0 && (
                    <> · {Math.abs(alerta.diasRestantes)} {Math.abs(alerta.diasRestantes) === 1 ? 'dia' : 'dias'} atrasado</>
                  )}
                </div>
                <div className={styles.value}>{formatCurrency(alerta.valorRestante)} restante</div>
              </div>
              <span className={`${styles.status} ${config.statusClass}`}>{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
