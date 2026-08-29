import { AlertCircle, TrendingDown } from 'lucide-react';
import type { AlertaSaldo, TipoAlertaSaldo } from '@/hooks/useAlertasSaldo';
import { formatCurrency } from '@/utils';
import styles from './AlertasSaldoCard.module.css';

interface AlertasSaldoCardProps {
  alertas: AlertaSaldo[];
  hideSaldo?: boolean;
}

function getTipoConfig(tipo: TipoAlertaSaldo) {
  switch (tipo) {
    case 'negativo':
      return { icon: AlertCircle, iconClass: styles.iconNegative, valueClass: styles.valueNegative };
    case 'saldo_baixo':
      return { icon: TrendingDown, iconClass: styles.iconWarning, valueClass: styles.valueWarning };
  }
}

export function AlertasSaldoCard({ alertas, hideSaldo = false }: AlertasSaldoCardProps) {
  if (alertas.length === 0) {
    return null;
  }

  const criticos = alertas.filter((a) => a.tipo === 'negativo').length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Alertas de Saldo</span>
        {criticos > 0 && (
          <span className={styles.countBadge}>
            {criticos} {criticos === 1 ? 'conta negativa' : 'contas negativas'}
          </span>
        )}
      </div>

      <div className={styles.list}>
        {alertas.map((alerta) => {
          const config = getTipoConfig(alerta.tipo);
          const IconComponent = config.icon;

          return (
            <div key={alerta.contaId} className={styles.row}>
              <div className={`${styles.icon} ${config.iconClass}`}>
                <IconComponent size={18} />
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{alerta.contaNome}</div>
                <div className={styles.message}>{alerta.mensagem}</div>
                <div className={`${styles.value} ${config.valueClass}`}>
                  {hideSaldo ? (
                    <span className="blur-value">{formatCurrency(alerta.saldo)}</span>
                  ) : (
                    formatCurrency(alerta.saldo)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
