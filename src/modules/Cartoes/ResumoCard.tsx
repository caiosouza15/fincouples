import type { CartaoCredito, FaturaCartao } from '@/types';
import { formatCurrency } from '@/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './ResumoCard.module.css';

interface ResumoCardProps {
  cartoes: CartaoCredito[];
  faturas: FaturaCartao[];
  selectedMonth: string;
}

export function ResumoCard({ cartoes, faturas }: ResumoCardProps) {
  const cartoesAtivos = cartoes.filter(c => c.ativo);

  const totalLimiteDisponivel = cartoesAtivos.reduce((sum, c) => sum + c.limiteDisponivel, 0);
  const totalLimite = cartoesAtivos.reduce((sum, c) => sum + c.limite, 0);

  const faturasEmAberto = faturas.filter(f => f.status !== 'pago_total');
  const totalFaturasEmAberto = faturasEmAberto.reduce(
    (sum, f) => sum + (f.valorTotal - f.valorPago),
    0
  );

  const faturasNaoPagas = faturas.filter(f => f.status !== 'pago_total');
  const proximoVencimento = faturasNaoPagas.length > 0
    ? faturasNaoPagas.reduce((proximo, atual) => {
        const vencimentoAtual = new Date(atual.dataVencimento);
        const vencimentoProximo = proximo ? new Date(proximo.dataVencimento) : null;
        if (!vencimentoProximo || vencimentoAtual < vencimentoProximo) {
          return atual;
        }
        return proximo;
      }, null as FaturaCartao | null)
    : null;

  const formatProximoVencimento = () => {
    if (!proximoVencimento) return 'Nenhuma fatura pendente';
    const data = new Date(proximoVencimento.dataVencimento);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const porcentagemUsoTotal = totalLimite > 0
    ? Math.min((totalLimite - totalLimiteDisponivel) / totalLimite * 100, 100)
    : 0;

  const progressClass =
    porcentagemUsoTotal >= 90 ? styles.progressHigh : porcentagemUsoTotal >= 70 ? styles.progressMed : styles.progressLow;

  const calcularDiasAteFechamento = () => {
    if (!proximoVencimento) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(proximoVencimento.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const diasAteFechamento = calcularDiasAteFechamento();

  return (
    <div className={styles.grid}>
      <div className={styles.stat}>
        <div className={styles.statLabel}>Limite Disponível</div>
        <div className={styles.statValue}>{formatCurrency(totalLimiteDisponivel)}</div>
        <div className={styles.statSub}>de {formatCurrency(totalLimite)} total</div>
        <div className={styles.progressTrack}>
          <div className={`${styles.progressFill} ${progressClass}`} style={{ width: `${porcentagemUsoTotal}%` }} />
        </div>
        <div className={styles.statSub}>{porcentagemUsoTotal.toFixed(0)}% utilizado</div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statLabel}>Faturas em Aberto</div>
        <div className={`${styles.statValue} ${styles.statValueNegative}`}>{formatCurrency(totalFaturasEmAberto)}</div>
        <div className={styles.statSub}>
          {faturasEmAberto.length} {faturasEmAberto.length === 1 ? 'fatura' : 'faturas'}
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statLabel}>Próximo Vencimento</div>
        <div className={styles.statValue} style={{ fontSize: 18 }}>{formatProximoVencimento()}</div>
        {proximoVencimento && (
          <>
            <div className={styles.statSub}>
              {formatCurrency(proximoVencimento.valorTotal - proximoVencimento.valorPago)} restante
            </div>
            {diasAteFechamento !== null && (
              <div className={styles.statusRow}>
                {diasAteFechamento < 0 ? (
                  <>
                    <TrendingDown size={14} className={styles.statusNegative} />
                    <span className={styles.statusNegative}>
                      {Math.abs(diasAteFechamento)} {Math.abs(diasAteFechamento) === 1 ? 'dia' : 'dias'} atrasado
                    </span>
                  </>
                ) : diasAteFechamento <= 7 ? (
                  <>
                    <TrendingUp size={14} className={styles.statusWarning} />
                    <span className={styles.statusWarning}>
                      Em {diasAteFechamento} {diasAteFechamento === 1 ? 'dia' : 'dias'}
                    </span>
                  </>
                ) : (
                  <>
                    <Minus size={14} className={styles.statusNeutral} />
                    <span className={styles.statusNeutral}>Em {diasAteFechamento} dias</span>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
