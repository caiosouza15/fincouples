import { useContas } from '@/hooks/useContas';
import { formatCurrency } from '@/utils';
import styles from './Relatorios.module.css';

export function ResumoContasRelatorios() {
  const { contas, getSaldoGeral } = useContas();
  const ativas = contas.filter((c) => c.ativa);

  if (ativas.length === 0) {
    return <div className={styles.chartEmpty}>Nenhuma conta ativa.</div>;
  }

  const saldoGeral = getSaldoGeral();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className={styles.contaRow}>
        <span className={styles.contaNome}>Saldo total</span>
        <span className={`${styles.contaValue} ${saldoGeral >= 0 ? styles.statValuePositive : styles.statValueNegative}`}>
          {formatCurrency(saldoGeral)}
        </span>
      </div>
      {ativas.map((conta) => (
        <div key={conta.id} className={styles.contaRow}>
          <div style={{ minWidth: 0 }}>
            <div className={styles.contaNome}>{conta.nome}</div>
            {conta.proprietarioId && (
              <div className={styles.contaOwner}>{conta.nomeProprietario ?? conta.proprietarioId}</div>
            )}
          </div>
          <span className={`${styles.contaValue} ${conta.saldo >= 0 ? styles.statValuePositive : styles.statValueNegative}`}>
            {formatCurrency(conta.saldo)}
          </span>
        </div>
      ))}
    </div>
  );
}
