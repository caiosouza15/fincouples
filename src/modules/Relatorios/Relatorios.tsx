import type { ReactNode } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  Tag,
  Banknote,
  ListOrdered,
  Scale,
  LineChart,
  CreditCard,
  Users,
  CalendarClock,
  UserRound,
} from 'lucide-react';
import { IconBarChart, IconTarget, IconWallet } from '@/components/GlassIcons';
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
import styles from './Relatorios.module.css';

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
    <div className={styles.page}>
      <div className={styles.grid}>
        <SectionCard icon={<IconBarChart />} title="Visão geral do mês" subtitle="Receitas, despesas, saldo e economia" span="full">
          <VisaoGeralRelatorios selectedMonth={selectedMonth} />
        </SectionCard>

        <SectionCard icon={<ArrowLeftRight size={17} />} title="Receitas × Despesas" subtitle="Comparação do mês selecionado">
          <ChartReceitasDespesas receita={receita} despesa={despesa} selectedMonth={selectedMonth} />
        </SectionCard>

        <SectionCard icon={<TrendingUp size={17} />} iconVariant="p2" title="Evolução (12 meses)" subtitle="Receitas e despesas mês a mês" span="full">
          <ChartEvolucaoMensal
            selectedMonth={selectedMonth}
            getReceitaMensal={getReceitaMensal}
            getDespesaMensal={getDespesaMensal}
          />
        </SectionCard>

        <SectionCard icon={<Tag size={17} />} title="Gastos por categoria" subtitle="Despesas do mês agrupadas">
          <ChartGastosPorCategoria itens={gastosPorCategoria} selectedMonth={selectedMonth} />
        </SectionCard>

        <SectionCard icon={<Banknote size={17} />} iconVariant="p2" title="Receitas por categoria" subtitle="Receitas do mês agrupadas">
          <ChartReceitasPorCategoria itens={receitasPorCategoria} />
        </SectionCard>

        <SectionCard icon={<ListOrdered size={17} />} iconVariant="grad" title="Maiores gastos do mês" subtitle="Top 5 despesas por valor">
          <ListaMaioresGastos lancamentos={maioresDespesas} categorias={categorias} />
        </SectionCard>

        <SectionCard icon={<Scale size={17} />} title="Economia por categoria" subtitle="Mês anterior × este mês" span="full">
          <ChartEconomiaGroupedBar
            selectedMonth={selectedMonth}
            categorias={categorias}
            getMaioresGastos={getMaioresGastos}
          />
        </SectionCard>

        <SectionCard icon={<LineChart size={17} />} iconVariant="p2" title="Saldo acumulado (12 meses)" subtitle="Resultado acumulado mês a mês" span="full">
          <ChartSaldoAcumulado selectedMonth={selectedMonth} getResultadoMensal={getResultadoMensal} />
        </SectionCard>

        <SectionCard icon={<CreditCard size={17} />} title="Forma de pagamento" subtitle="Débito, crédito e outros">
          <ChartFormaPagamento dados={formaPagamento} />
        </SectionCard>

        <SectionCard icon={<CreditCard size={17} />} iconVariant="p2" title="Uso de cartões" subtitle="Limite usado × disponível">
          <ChartUsoCartoes cartoes={cartoes} />
        </SectionCard>

        <SectionCard icon={<IconWallet />} iconVariant="grad" title="Contas – saldo" subtitle="Saldo atual de cada conta">
          <ResumoContasRelatorios />
        </SectionCard>

        <SectionCard icon={<Users size={17} />} title="Evolução por pessoa (12 meses)" subtitle="Gastos de cada um, mês a mês" span="full">
          <ChartEvolucaoPorPessoa />
        </SectionCard>

        <SectionCard icon={<CalendarClock size={17} />} iconVariant="p2" title="Previsões e vencimentos" subtitle="Despesas e faturas por dia" span="full">
          <ChartPrevisoesBarras />
        </SectionCard>

        <SectionCard icon={<IconTarget />} iconVariant="grad" title="Metas" subtitle="Acompanhamento das metas financeiras" span="full">
          <ChartMetas />
        </SectionCard>

        <SectionCard icon={<UserRound size={17} />} title="Por pessoa" subtitle="Relatórios filtrados por pessoa do casal" span="full">
          <RelatoriosPorPessoa />
        </SectionCard>
      </div>
    </div>
  );
};

interface SectionCardProps {
  icon: ReactNode;
  iconVariant?: 'p1' | 'p2' | 'grad';
  title: string;
  subtitle: string;
  span?: 'full' | 'auto';
  children: ReactNode;
}

function SectionCard({ icon, iconVariant = 'p1', title, subtitle, span = 'auto', children }: SectionCardProps) {
  const iconClass = iconVariant === 'p2' ? styles.iconP2 : iconVariant === 'grad' ? styles.iconGrad : '';
  return (
    <section className={`${styles.card} ${span === 'full' ? styles.spanFull : ''}`}>
      <div className={styles.cardHeader}>
        <div className={`${styles.cardIcon} ${iconClass}`}>{icon}</div>
        <div className={styles.cardHeaderText}>
          <div className={styles.cardTitle}>{title}</div>
          <div className={styles.cardSubtitle}>{subtitle}</div>
        </div>
      </div>
      {children}
    </section>
  );
}

export default Relatorios;
