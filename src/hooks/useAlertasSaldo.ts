import { useMemo } from 'react';
import { useContas } from '@/hooks/useContas';

/** Valor mínimo (R$) abaixo do qual consideramos "saldo baixo" */
const SALDO_BAIXO_MINIMO = 100;

export type TipoAlertaSaldo = 'negativo' | 'saldo_baixo';

export interface AlertaSaldo {
  contaId: string;
  contaNome: string;
  saldo: number;
  tipo: TipoAlertaSaldo;
  mensagem: string;
}

export interface UseAlertasSaldoReturn {
  alertas: AlertaSaldo[];
}

export function useAlertasSaldo(): UseAlertasSaldoReturn {
  const { contas } = useContas();

  const alertas = useMemo(() => {
    const ativas = contas.filter(c => c.ativa);

    const lista: AlertaSaldo[] = [];

    for (const conta of ativas) {
      if (conta.saldo < 0) {
        lista.push({
          contaId: conta.id,
          contaNome: conta.nome,
          saldo: conta.saldo,
          tipo: 'negativo',
          mensagem: 'Saldo negativo',
        });
      } else if (conta.saldo < SALDO_BAIXO_MINIMO && conta.saldo >= 0) {
        lista.push({
          contaId: conta.id,
          contaNome: conta.nome,
          saldo: conta.saldo,
          tipo: 'saldo_baixo',
          mensagem: `Saldo abaixo de R$ ${SALDO_BAIXO_MINIMO.toFixed(0)}`,
        });
      }
    }

    return lista.sort((a, b) => a.saldo - b.saldo); // Mais negativo primeiro
  }, [contas]);

  return { alertas };
}
