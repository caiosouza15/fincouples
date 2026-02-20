import { useMemo } from 'react';
import { useCartoes } from '@/hooks/useCartoes';
import { useFaturas } from '@/hooks/useFaturas';

export interface AlertaVencimento {
  cartaoId: string;
  cartaoNome: string;
  faturaId: string;
  dataVencimento: Date;
  valorTotal: number;
  valorPago: number;
  valorRestante: number;
  diasRestantes: number;
  tipo: 'vencido' | 'vencendo_hoje' | 'vencendo_em_3_dias' | 'vencendo_em_7_dias';
}

export interface UseAlertasVencimentoReturn {
  alertas: AlertaVencimento[];
  alertasVencidos: AlertaVencimento[];
  alertasVencendo: AlertaVencimento[];
  totalVencido: number;
  totalVencendo: number;
}

export function useAlertasVencimento(): UseAlertasVencimentoReturn {
  const { cartoes } = useCartoes();
  const { faturas } = useFaturas();

  const alertas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar faturas não pagas totalmente
    const faturasNaoPagas = faturas.filter(f => f.status !== 'pago_total');

    const alertasCalculados: AlertaVencimento[] = faturasNaoPagas
      .map(fatura => {
        const cartao = cartoes.find(c => c.id === fatura.cartaoId);
        if (!cartao) return null;

        const dataVencimento = new Date(fatura.dataVencimento);
        dataVencimento.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        const valorRestante = fatura.valorTotal - fatura.valorPago;

        let tipo: AlertaVencimento['tipo'];
        if (diasRestantes < 0) {
          tipo = 'vencido';
        } else if (diasRestantes === 0) {
          tipo = 'vencendo_hoje';
        } else if (diasRestantes <= 3) {
          tipo = 'vencendo_em_3_dias';
        } else if (diasRestantes <= 7) {
          tipo = 'vencendo_em_7_dias';
        } else {
          // Não criar alerta para faturas que vencem em mais de 7 dias
          return null;
        }

        return {
          cartaoId: cartao.id,
          cartaoNome: cartao.nome,
          faturaId: fatura.id,
          dataVencimento,
          valorTotal: fatura.valorTotal,
          valorPago: fatura.valorPago,
          valorRestante,
          diasRestantes,
          tipo,
        };
      })
      .filter((alerta): alerta is AlertaVencimento => alerta !== null)
      .sort((a, b) => {
        // Ordenar por urgência: vencido primeiro, depois por dias restantes
        if (a.diasRestantes !== b.diasRestantes) {
          return a.diasRestantes - b.diasRestantes;
        }
        return b.valorRestante - a.valorRestante; // Maior valor primeiro
      });

    return alertasCalculados;
  }, [cartoes, faturas]);

  const alertasVencidos = useMemo(
    () => alertas.filter(a => a.tipo === 'vencido'),
    [alertas]
  );

  const alertasVencendo = useMemo(
    () => alertas.filter(a => a.tipo !== 'vencido'),
    [alertas]
  );

  const totalVencido = useMemo(
    () => alertasVencidos.reduce((sum, a) => sum + a.valorRestante, 0),
    [alertasVencidos]
  );

  const totalVencendo = useMemo(
    () => alertasVencendo.reduce((sum, a) => sum + a.valorRestante, 0),
    [alertasVencendo]
  );

  return {
    alertas,
    alertasVencidos,
    alertasVencendo,
    totalVencido,
    totalVencendo,
  };
}
