// Módulo: Relatórios
// Análise gráfica e comparativa de dados

import { Card } from '@/components/Card';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { useCartoes } from '@/hooks/useCartoes';
import { VisaoGeralRelatorios } from './VisaoGeralRelatorios';
import { ChartReceitasDespesas } from './ChartReceitasDespesas';
import { ChartEvolucaoMensal } from './ChartEvolucaoMensal';
import { ChartGastosPorCategoria } from './ChartGastosPorCategoria';
import { ChartReceitasPorCategoria } from './ChartReceitasPorCategoria';
import { ListaMaioresGastos } from './ListaMaioresGastos';
import { ChartEconomiaGroupedBar } from './ChartEconomiaGroupedBar';
import { ChartSaldoAcumulado } from './ChartSaldoAcumulado';
import { ChartFormaPagamento } from './ChartFormaPagamento';
import { ChartUsoCartoes } from './ChartUsoCartoes';
import { ResumoContasRelatorios } from './ResumoContasRelatorios';
import { ChartEvolucaoPorPessoa } from './ChartEvolucaoPorPessoa';
import { ChartPrevisoesBarras } from './ChartPrevisoesBarras';
import { ChartMetas } from './ChartMetas';
import { RelatoriosPorPessoa } from './RelatoriosPorPessoa';

const Relatorios = () => {
  const { selectedMonth } = useSelectedMonth();
  const {
    getReceitaMensal,
    getDespesaMensal,
    getResultadoMensal,
    getMaioresGastos,
    getReceitasPorCategoria,
    getMaioresDespesasPorValor,
    getDespesasPorFormaPagamento,
  } = useLancamentos();
  const { categorias } = useCategorias();
  const { cartoes } = useCartoes();

  const receita = getReceitaMensal(selectedMonth);
  const despesa = getDespesaMensal(selectedMonth);
  const gastosPorCategoria = getMaioresGastos(categorias, 15, selectedMonth);
  const receitasPorCategoria = getReceitasPorCategoria(categorias, 15, selectedMonth);
  const maioresDespesas = getMaioresDespesasPorValor(selectedMonth, 5);
  const formaPagamento = getDespesasPorFormaPagamento(selectedMonth);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-md md:px-lg pb-xl min-w-0 overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-lg">Relatórios</h1>

      <div className="flex flex-col gap-md">
        <Card
          title="Visão geral do mês"
          description="Resumo do mês: receitas, despesas, saldo, comparativo com o mês anterior e taxa de economia."
        >
          <VisaoGeralRelatorios selectedMonth={selectedMonth} />
        </Card>

        <Card
          title="Receitas x Despesas"
          description="Comparação entre o total de receitas e o total de despesas no mês selecionado."
        >
          <ChartReceitasDespesas receita={receita} despesa={despesa} selectedMonth={selectedMonth} />
        </Card>

        <Card
          title="Evolução (12 meses)"
          description="Receitas e despesas mês a mês nos últimos 12 meses."
        >
          <ChartEvolucaoMensal
            selectedMonth={selectedMonth}
            getReceitaMensal={getReceitaMensal}
            getDespesaMensal={getDespesaMensal}
          />
        </Card>

        <Card
          title="Gastos por categoria"
          description="Total de despesas do mês agrupadas por categoria (alimentação, transporte, etc.)."
        >
          <ChartGastosPorCategoria itens={gastosPorCategoria} selectedMonth={selectedMonth} />
        </Card>

        <Card
          title="Receitas por categoria"
          description="Total de receitas do mês agrupadas por categoria."
        >
          <ChartReceitasPorCategoria itens={receitasPorCategoria} />
        </Card>

        <Card
          title="Maiores gastos do mês"
          description="As 5 despesas de maior valor no mês."
        >
          <ListaMaioresGastos lancamentos={maioresDespesas} categorias={categorias} />
        </Card>

        <Card
          title="Economia por categoria (mês passado vs este mês)"
          description="Comparação do gasto por categoria: mês anterior x mês selecionado (barras lado a lado)."
        >
          <ChartEconomiaGroupedBar
            selectedMonth={selectedMonth}
            categorias={categorias}
            getMaioresGastos={getMaioresGastos}
          />
        </Card>

        <Card
          title="Evolução do saldo acumulado (12 meses)"
          description="Soma acumulada do resultado (receitas − despesas) mês a mês nos últimos 12 meses. Mostra a evolução do superávit ou déficit dos lançamentos, não o saldo da conta bancária."
        >
          <ChartSaldoAcumulado selectedMonth={selectedMonth} getResultadoMensal={getResultadoMensal} />
        </Card>

        <Card
          title="Despesas por forma de pagamento"
          description="Quanto das despesas do mês foi pago em débito (conta), em crédito (cartão) ou em outros meios."
        >
          <ChartFormaPagamento dados={formaPagamento} />
        </Card>

        <Card
          title="Uso de cartões"
          description="Quanto do limite de cada cartão está usado e quanto ainda está disponível."
        >
          <ChartUsoCartoes cartoes={cartoes} />
        </Card>

        <Card
          title="Contas – saldo"
          description="Saldo atual de cada conta (corrente, poupança, investimento)."
        >
          <ResumoContasRelatorios />
        </Card>

        <Card
          title="Evolução por pessoa (12 meses)"
          description="Quanto cada pessoa do casal gastou em despesas, mês a mês, nos últimos 12 meses."
        >
          <ChartEvolucaoPorPessoa />
        </Card>

        <Card
          title="Previsões e vencimentos"
          description="Despesas por dia do mês e vencimentos de faturas de cartão (barras por dia)."
        >
          <ChartPrevisoesBarras />
        </Card>

        <Card
          title="Metas"
          description="Acompanhamento das metas financeiras."
        >
          <ChartMetas />
        </Card>

        <Card
          title="Por pessoa"
          description="Relatórios e visões filtradas por pessoa do casal."
        >
          <RelatoriosPorPessoa />
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
