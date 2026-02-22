import { useMemo } from 'react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { ChartPorPessoa } from './ChartPorPessoa';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import { useContas } from '@/hooks/useContas';
import { useCasal } from '@/hooks/useCasal';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { formatCurrency } from '@/utils';

interface MetricasPorPessoa {
  pessoaId: 'usuario1' | 'usuario2';
  nome: string;
  totalGastos: number;
  totalReceitas: number;
  saldo: number;
  gastosPorCategoria: Record<string, number>;
  cartoes: number;
  contas: number;
  saldoContas: number;
  mediaMensal: number;
}

export function RelatoriosPorPessoa() {
  const { lancamentos } = useLancamentos();
  const { categorias } = useCategorias();
  const { cartoes } = useCartoes();
  const { contas } = useContas();
  const { usuario1Nome, usuario2Nome } = useCasal();
  const { selectedMonth } = useSelectedMonth();

  // Filtrar lançamentos do mês selecionado
  const lancamentosDoMes = useMemo(() => {
    const [ano, mes] = selectedMonth.split('-').map(Number);
    return lancamentos.filter((l) => {
      const data = l.data instanceof Date ? l.data : new Date(l.data);
      return data.getFullYear() === ano && data.getMonth() + 1 === mes;
    });
  }, [lancamentos, selectedMonth]);

  // Calcular métricas por pessoa
  const metricas = useMemo(() => {
    const metricasUsuario1: MetricasPorPessoa = {
      pessoaId: 'usuario1',
      nome: usuario1Nome,
      totalGastos: 0,
      totalReceitas: 0,
      saldo: 0,
      gastosPorCategoria: {},
      cartoes: 0,
      contas: 0,
      saldoContas: 0,
      mediaMensal: 0,
    };

    const metricasUsuario2: MetricasPorPessoa = {
      pessoaId: 'usuario2',
      nome: usuario2Nome,
      totalGastos: 0,
      totalReceitas: 0,
      saldo: 0,
      gastosPorCategoria: {},
      cartoes: 0,
      contas: 0,
      saldoContas: 0,
      mediaMensal: 0,
    };

    // Processar lançamentos
    lancamentosDoMes.forEach((lancamento) => {
      if (lancamento.tipo === 'despesa' && lancamento.pessoaId) {
        const metricas = lancamento.pessoaId === 'usuario1' ? metricasUsuario1 : metricasUsuario2;
        metricas.totalGastos += lancamento.valor;
        
        const categoria = categorias.find((c) => c.id === lancamento.categoriaId);
        const categoriaNome = categoria?.nome || 'Sem categoria';
        metricas.gastosPorCategoria[categoriaNome] = (metricas.gastosPorCategoria[categoriaNome] || 0) + lancamento.valor;
      } else if (lancamento.tipo === 'receita' && lancamento.pessoaId) {
        const metricas = lancamento.pessoaId === 'usuario1' ? metricasUsuario1 : metricasUsuario2;
        metricas.totalReceitas += lancamento.valor;
      }
    });

    // Calcular saldo
    metricasUsuario1.saldo = metricasUsuario1.totalReceitas - metricasUsuario1.totalGastos;
    metricasUsuario2.saldo = metricasUsuario2.totalReceitas - metricasUsuario2.totalGastos;

    // Contar cartões
    metricasUsuario1.cartoes = cartoes.filter((c) => c.proprietarioId === 'usuario1').length;
    metricasUsuario2.cartoes = cartoes.filter((c) => c.proprietarioId === 'usuario2').length;

    // Contas por pessoa (contagem e saldo das contas ativas)
    const contasUsuario1 = contas.filter((c) => c.ativa && c.proprietarioId === 'usuario1');
    const contasUsuario2 = contas.filter((c) => c.ativa && c.proprietarioId === 'usuario2');
    metricasUsuario1.contas = contasUsuario1.length;
    metricasUsuario2.contas = contasUsuario2.length;
    metricasUsuario1.saldoContas = contasUsuario1.reduce((s, c) => s + c.saldo, 0);
    metricasUsuario2.saldoContas = contasUsuario2.reduce((s, c) => s + c.saldo, 0);

    // Calcular média mensal (simplificado: usar apenas o mês atual)
    metricasUsuario1.mediaMensal = metricasUsuario1.totalGastos;
    metricasUsuario2.mediaMensal = metricasUsuario2.totalGastos;

    return [metricasUsuario1, metricasUsuario2];
  }, [lancamentosDoMes, categorias, cartoes, contas, usuario1Nome, usuario2Nome]);

  const totalGastos = metricas[0].totalGastos + metricas[1].totalGastos;
  const percentualUsuario1 = totalGastos > 0 ? (metricas[0].totalGastos / totalGastos) * 100 : 0;
  const percentualUsuario2 = totalGastos > 0 ? (metricas[1].totalGastos / totalGastos) * 100 : 0;

  const categoriasComGastos = useMemo(() => {
    const todasCategorias = new Set<string>();
    metricas.forEach((m) => {
      Object.keys(m.gastosPorCategoria).forEach((cat) => todasCategorias.add(cat));
    });
    return Array.from(todasCategorias);
  }, [metricas]);

  const metricasChart = metricas.map((m) => ({
    nome: m.nome,
    totalGastos: m.totalGastos,
    totalReceitas: m.totalReceitas,
    saldo: m.saldo,
  })) as [{ nome: string; totalGastos: number; totalReceitas: number; saldo: number }, { nome: string; totalGastos: number; totalReceitas: number; saldo: number }];

  return (
    <div className="flex flex-col gap-4 sm:gap-lg min-w-0">
      <ChartPorPessoa metricas={metricasChart} />
      <div className="flex flex-col gap-4 sm:gap-lg">
        {/* Resumo Geral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-md">
            {metricas.map((metrica) => (
              <div
                key={metrica.pessoaId}
                className={`p-3 sm:p-md rounded-md border-2 min-w-0 ${
                  metrica.pessoaId === 'usuario1'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-purple-50 border-purple-200'
                }`}
              >
                <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-md truncate">{metrica.nome}</h3>
                <div className="flex flex-col gap-2 sm:gap-sm">
                  <div className="flex justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-text-secondary shrink-0">Total de Gastos:</span>
                    <span className="font-semibold text-negative truncate">{formatCurrency(metrica.totalGastos)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-text-secondary shrink-0">Total de Receitas:</span>
                    <span className="font-semibold text-positive truncate">{formatCurrency(metrica.totalReceitas)}</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2 sm:pt-sm border-t border-border text-xs sm:text-sm">
                    <span className="font-medium text-text-primary shrink-0">Saldo:</span>
                    <span className={`font-bold truncate ${metrica.saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(metrica.saldo)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-text-secondary shrink-0">Cartões:</span>
                    <span className="font-medium text-text-primary">{metrica.cartoes}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-text-secondary shrink-0">Contas:</span>
                    <span className="font-medium text-text-primary">{metrica.contas}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-text-secondary shrink-0">Saldo em contas:</span>
                    <span className={`font-medium truncate ${metrica.saldoContas >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(metrica.saldoContas)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
