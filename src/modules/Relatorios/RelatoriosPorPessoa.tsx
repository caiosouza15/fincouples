import { useMemo } from 'react';
import { Card } from '@/components/Card';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import { useContas } from '@/hooks/useContas';
import { useCasal } from '@/hooks/useCasal';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { formatCurrency } from '@/utils';
import type { Lancamento } from '@/types';

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
  const { usuario1Nome, usuario2Nome, getNomePessoa } = useCasal();
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

  return (
    <div className="flex flex-col gap-lg">
      <Card title="Relatórios por Pessoa">
        <div className="flex flex-col gap-lg">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {metricas.map((metrica) => (
              <div
                key={metrica.pessoaId}
                className={`p-md rounded-md border-2 ${
                  metrica.pessoaId === 'usuario1'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-purple-50 border-purple-200'
                }`}
              >
                <h3 className="text-lg font-semibold text-text-primary mb-md">{metrica.nome}</h3>
                <div className="flex flex-col gap-sm">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total de Gastos:</span>
                    <span className="text-base font-semibold text-negative">
                      {formatCurrency(metrica.totalGastos)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total de Receitas:</span>
                    <span className="text-base font-semibold text-positive">
                      {formatCurrency(metrica.totalReceitas)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-sm border-t border-border">
                    <span className="text-sm font-medium text-text-primary">Saldo:</span>
                    <span
                      className={`text-base font-bold ${
                        metrica.saldo >= 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {formatCurrency(metrica.saldo)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Cartões:</span>
                    <span className="text-sm font-medium text-text-primary">{metrica.cartoes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Contas:</span>
                    <span className="text-sm font-medium text-text-primary">{metrica.contas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Saldo em contas:</span>
                    <span className={`text-sm font-medium ${metrica.saldoContas >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(metrica.saldoContas)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Distribuição de Gastos */}
          {totalGastos > 0 && (
            <div className="p-md bg-background rounded-md border border-border">
              <h3 className="text-base font-semibold text-text-primary mb-md">Distribuição de Gastos</h3>
              <div className="flex flex-col gap-sm">
                <div className="flex items-center gap-md">
                  <div className="flex-1">
                    <div className="flex justify-between mb-xs">
                      <span className="text-sm text-text-primary">{metricas[0].nome}</span>
                      <span className="text-sm font-semibold text-text-primary">
                        {formatCurrency(metricas[0].totalGastos)} ({percentualUsuario1.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-4 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${percentualUsuario1}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="flex-1">
                    <div className="flex justify-between mb-xs">
                      <span className="text-sm text-text-primary">{metricas[1].nome}</span>
                      <span className="text-sm font-semibold text-text-primary">
                        {formatCurrency(metricas[1].totalGastos)} ({percentualUsuario2.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-4 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${percentualUsuario2}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gastos por Categoria */}
          {categoriasComGastos.length > 0 && (
            <div className="p-md bg-background rounded-md border border-border">
              <h3 className="text-base font-semibold text-text-primary mb-md">Gastos por Categoria</h3>
              <div className="flex flex-col gap-md">
                {categoriasComGastos.map((categoriaNome) => {
                  const gastoUsuario1 = metricas[0].gastosPorCategoria[categoriaNome] || 0;
                  const gastoUsuario2 = metricas[1].gastosPorCategoria[categoriaNome] || 0;
                  const totalCategoria = gastoUsuario1 + gastoUsuario2;

                  return (
                    <div key={categoriaNome} className="flex flex-col gap-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-text-primary">{categoriaNome}</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {formatCurrency(totalCategoria)}
                        </span>
                      </div>
                      <div className="flex gap-xs">
                        <div className="flex-1">
                          <div className="flex justify-between mb-xs">
                            <span className="text-xs text-text-secondary">{metricas[0].nome}</span>
                            <span className="text-xs text-text-secondary">
                              {formatCurrency(gastoUsuario1)} ({totalCategoria > 0 ? ((gastoUsuario1 / totalCategoria) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-400 transition-all duration-300"
                              style={{ width: `${totalCategoria > 0 ? (gastoUsuario1 / totalCategoria) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-xs">
                            <span className="text-xs text-text-secondary">{metricas[1].nome}</span>
                            <span className="text-xs text-text-secondary">
                              {formatCurrency(gastoUsuario2)} ({totalCategoria > 0 ? ((gastoUsuario2 / totalCategoria) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-400 transition-all duration-300"
                              style={{ width: `${totalCategoria > 0 ? (gastoUsuario2 / totalCategoria) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparativo */}
          {totalGastos > 0 && (
            <div className="p-md bg-background rounded-md border border-border">
              <h3 className="text-base font-semibold text-text-primary mb-md">Comparativo</h3>
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Diferença absoluta:</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {formatCurrency(Math.abs(metricas[0].totalGastos - metricas[1].totalGastos))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Diferença percentual:</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {totalGastos > 0
                      ? Math.abs(percentualUsuario1 - percentualUsuario2).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
