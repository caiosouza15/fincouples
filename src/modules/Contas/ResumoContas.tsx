import type { Conta } from '@/types';
import { formatCurrency, formatCurrencyWithPrivacy } from '@/utils';
import { useCasal } from '@/hooks/useCasal';
import { Wallet, Landmark, PiggyBank, TrendingUp, User } from 'lucide-react';
import styles from './ResumoContas.module.css';

interface ResumoContasProps {
  contas: Conta[];
  hideSaldo?: boolean;
}

const tipoLabels: Record<Conta['tipo'], string> = {
  corrente: 'Conta Corrente',
  poupanca: 'Poupança',
  investimento: 'Investimento',
};

export function ResumoContas({ contas, hideSaldo = false }: ResumoContasProps) {
  const { usuario1Nome, usuario2Nome } = useCasal();
  const ativas = contas.filter((c) => c.ativa);
  const inativas = contas.filter((c) => !c.ativa);
  const saldoTotal = ativas.reduce((s, c) => s + c.saldo, 0);

  const porPessoa = {
    usuario1: ativas.filter((c) => c.proprietarioId === 'usuario1').reduce((s, c) => s + c.saldo, 0),
    usuario2: ativas.filter((c) => c.proprietarioId === 'usuario2').reduce((s, c) => s + c.saldo, 0),
  };
  const temProprietario = ativas.some((c) => c.proprietarioId != null);

  const porTipo = {
    corrente: ativas.filter((c) => c.tipo === 'corrente').reduce((s, c) => s + c.saldo, 0),
    poupanca: ativas.filter((c) => c.tipo === 'poupanca').reduce((s, c) => s + c.saldo, 0),
    investimento: ativas.filter((c) => c.tipo === 'investimento').reduce((s, c) => s + c.saldo, 0),
  };
  const tiposComSaldo = (['corrente', 'poupanca', 'investimento'] as const).filter(
    (t) => porTipo[t] !== 0 || ativas.some((c) => c.tipo === t)
  );

  return (
    <div className={styles.grid}>
      <div className={styles.stat}>
        <div className={styles.statLabel}><Wallet size={14} /> Saldo total</div>
        <div className={styles.statValue}>
          {hideSaldo ? formatCurrencyWithPrivacy(saldoTotal, true) : formatCurrency(saldoTotal)}
        </div>
        <div className={styles.statSub}>
          {ativas.length} {ativas.length === 1 ? 'conta ativa' : 'contas ativas'}
        </div>
      </div>

      {tiposComSaldo.length > 0 && (
        <div className={styles.stat}>
          <div className={styles.statLabel}>Por tipo</div>
          <div className={styles.rows}>
            {tiposComSaldo.map((tipo) => (
              <div key={tipo} className={styles.rowItem}>
                <span className={styles.rowLabel}>
                  {tipo === 'corrente' && <Landmark size={13} />}
                  {tipo === 'poupanca' && <PiggyBank size={13} />}
                  {tipo === 'investimento' && <TrendingUp size={13} />}
                  {tipoLabels[tipo]}
                </span>
                <span className={styles.rowValue}>
                  {hideSaldo ? formatCurrencyWithPrivacy(porTipo[tipo], true) : formatCurrency(porTipo[tipo])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {temProprietario && (
        <div className={styles.stat}>
          <div className={styles.statLabel}><User size={13} /> Por pessoa</div>
          <div className={styles.rows}>
            <div className={styles.rowItem}>
              <span className={styles.rowLabel}>{usuario1Nome}</span>
              <span className={styles.rowValue}>
                {hideSaldo ? formatCurrencyWithPrivacy(porPessoa.usuario1, true) : formatCurrency(porPessoa.usuario1)}
              </span>
            </div>
            <div className={styles.rowItem}>
              <span className={styles.rowLabel}>{usuario2Nome}</span>
              <span className={styles.rowValue}>
                {hideSaldo ? formatCurrencyWithPrivacy(porPessoa.usuario2, true) : formatCurrency(porPessoa.usuario2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.stat}>
        <div className={styles.statLabel}>Contagem</div>
        <div className={styles.statValue} style={{ fontSize: 20 }}>
          {ativas.length} ativas
        </div>
        {inativas.length > 0 && <div className={styles.statSub}>{inativas.length} inativas</div>}
      </div>
    </div>
  );
}
