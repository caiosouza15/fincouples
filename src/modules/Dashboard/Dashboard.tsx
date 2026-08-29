import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { IconTarget, IconWallet, IconLink, IconList, IconBarChart, IconChevronRight } from '@/components/GlassIcons';
import { ConvitePendente } from './ConvitePendente';
import { useContas } from '@/hooks/useContas';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import { useFaturas } from '@/hooks/useFaturas';
import { useMetas } from '@/hooks/useMetas';
import { useCasal } from '@/hooks/useCasal';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { formatCurrency } from '@/utils';
import type { Lancamento } from '@/types';

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseMonthKey(mes: string): { ano: number; mesIndex: number } {
  const [ano, mesStr] = mes.split('-');
  return { ano: Number(ano), mesIndex: Number(mesStr) - 1 };
}

function shiftMonth(mes: string, delta: number): string {
  const { ano, mesIndex } = parseMonthKey(mes);
  const d = new Date(ano, mesIndex + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(mes: string): string {
  return MESES_ABREV[parseMonthKey(mes).mesIndex];
}

function toDate(data: Date | string): Date {
  return data instanceof Date ? data : new Date(data);
}

function formatQuando(data: Date | string): string {
  const d = toDate(data);
  const agora = new Date();
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (d.toDateString() === agora.toDateString()) return `Hoje ${hora}`;

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (d.toDateString() === ontem.toDateString()) return 'Ontem';

  const diffDias = Math.round((agora.getTime() - d.getTime()) / 86_400_000);
  if (diffDias >= 0 && diffDias < 7) return `${DIAS_SEMANA[d.getDay()]} ${hora}`;

  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const CHART_X0 = 20;
const CHART_X1 = 470;
const CHART_Y_TOP = 25;
const CHART_Y_BOTTOM = 130;

const GAUGE_R = 66;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_R;

// Dashboard ligado aos contexts reais (ContasContext, LancamentosContext etc.).
// A versão anterior, com o mesmo cálculo de negócio num layout mais simples,
// ficou em src/modules/Dashboard/legacy como referência.
export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<'casal' | 'p1' | 'p2'>('casal');
  const [animated, setAnimated] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const { getSaldoGeral } = useContas();
  const { getLancamentosPorMes, getSaldoDisponivelMes } = useLancamentos();
  const { categorias } = useCategorias();
  const { cartoes, getLimiteDisponivel } = useCartoes();
  const { faturas, getFaturaAtual, fetchFaturas } = useFaturas();
  const { metas } = useMetas();
  const { usuario1Nome, usuario2Nome, getNomePessoa } = useCasal();
  const { selectedMonth, setSelectedMonth, getCurrentMonth } = useSelectedMonth();

  useEffect(() => {
    if (animated) return;
    let timeoutId: number;
    const rafId = requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => setAnimated(true), 80);
    });
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [animated]);

  // Gera a fatura do mês selecionado para cada cartão ativo (portado do
  // Dashboard legado — é lógica de negócio, não de layout).
  useEffect(() => {
    if (cartoes.length === 0) return;
    let ativo = true;
    const gerarFaturas = async () => {
      const cartoesAtivos = cartoes.filter((c) => c.ativo);
      for (const cartao of cartoesAtivos) {
        try {
          await getFaturaAtual(cartao.id, selectedMonth);
        } catch (error) {
          console.error(`Erro ao gerar fatura para cartão ${cartao.id}:`, error);
        }
      }
      if (ativo) await fetchFaturas();
    };
    gerarFaturas();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, cartoes.length]);

  const pessoaFiltroId = activeFilter === 'p1' ? 'usuario1' : activeFilter === 'p2' ? 'usuario2' : undefined;

  const lancamentosDoMes = useMemo(
    () => getLancamentosPorMes(selectedMonth),
    [getLancamentosPorMes, selectedMonth]
  );

  const lancamentosFiltrados = useMemo(
    () => (pessoaFiltroId ? lancamentosDoMes.filter((l) => l.pessoaId === pessoaFiltroId) : lancamentosDoMes),
    [lancamentosDoMes, pessoaFiltroId]
  );

  // Divisão de despesa/receita por pessoa no mês — usada tanto no card
  // "Acerto do mês" quanto como aproximação de contribuição na Meta ativa
  // (o modelo de dados não vincula lançamentos a uma meta específica).
  const gastosPessoa = useMemo(() => {
    const porTipoPessoa = (tipo: Lancamento['tipo'], pessoaId: 'usuario1' | 'usuario2') =>
      lancamentosDoMes
        .filter((l) => l.tipo === tipo && l.pessoaId === pessoaId)
        .reduce((soma, l) => soma + l.valor, 0);
    return {
      g1: porTipoPessoa('despesa', 'usuario1'),
      g2: porTipoPessoa('despesa', 'usuario2'),
      r1: porTipoPessoa('receita', 'usuario1'),
      r2: porTipoPessoa('receita', 'usuario2'),
    };
  }, [lancamentosDoMes]);

  const filterHint =
    activeFilter === 'casal'
      ? 'Mostrando dados combinados do casal'
      : `Mostrando dados de ${activeFilter === 'p1' ? usuario1Nome : usuario2Nome}`;

  // ---------- Saldo do casal ----------

  const saldoAtualContas = getSaldoGeral();
  const saldoMes = getSaldoDisponivelMes(saldoAtualContas, selectedMonth);
  const saldoMesAnterior = getSaldoDisponivelMes(saldoAtualContas, shiftMonth(selectedMonth, -1));
  const variacaoPct =
    saldoMesAnterior !== 0 ? ((saldoMes - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100 : null;

  const chipMonths = useMemo(() => {
    const anchor = getCurrentMonth();
    return Array.from({ length: 6 }, (_, i) => shiftMonth(anchor, i - 5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saldoSerie = useMemo(
    () => chipMonths.map((mes) => ({ mes, saldo: getSaldoDisponivelMes(saldoAtualContas, mes) })),
    [chipMonths, getSaldoDisponivelMes, saldoAtualContas]
  );

  const { linePath, areaPath, pontoAtivo } = useMemo(() => {
    const valores = saldoSerie.map((p) => p.saldo);
    const minV = Math.min(...valores);
    const maxV = Math.max(...valores);
    const range = maxV - minV || 1;

    const pontos = saldoSerie.map((p, i) => ({
      ...p,
      x: CHART_X0 + (i * (CHART_X1 - CHART_X0)) / (saldoSerie.length - 1),
      y: CHART_Y_BOTTOM - ((p.saldo - minV) / range) * (CHART_Y_BOTTOM - CHART_Y_TOP),
    }));

    const line = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${pontos[pontos.length - 1].x.toFixed(1)},170 L${pontos[0].x.toFixed(1)},170 Z`;

    const indiceAtivo = pontos.findIndex((p) => p.mes === selectedMonth);
    const ativo = pontos[indiceAtivo >= 0 ? indiceAtivo : pontos.length - 1];

    return { linePath: line, areaPath: area, pontoAtivo: ativo };
  }, [saldoSerie, selectedMonth]);

  const tooltipLeft = (pontoAtivo.x / 520) * 100;
  const tooltipTop = (pontoAtivo.y / 170) * 100;

  // ---------- Meta ativa ----------

  const metaAtiva = useMemo(() => {
    const abertas = metas.filter((m) => !m.concluida);
    const doMes = abertas.find((m) => m.mesReferencia === selectedMonth);
    if (doMes) return doMes;
    const comPrazo = [...abertas.filter((m) => m.prazo)].sort(
      (a, b) => toDate(a.prazo!).getTime() - toDate(b.prazo!).getTime()
    );
    return comPrazo[0] ?? abertas[0] ?? null;
  }, [metas, selectedMonth]);

  const metaPct = metaAtiva && metaAtiva.valorObjetivo > 0
    ? Math.min(100, Math.round((metaAtiva.valorAtual / metaAtiva.valorObjetivo) * 100))
    : 0;
  const gaugeOffset = animated
    ? GAUGE_CIRCUMFERENCE * (1 - metaPct / 100)
    : GAUGE_CIRCUMFERENCE;

  const totalGastoProxy = gastosPessoa.g1 + gastosPessoa.g2;
  const metaContribP1Pct = totalGastoProxy > 0 ? Math.round((gastosPessoa.g1 / totalGastoProxy) * 100) : 0;
  const metaContribP2Pct = totalGastoProxy > 0 ? Math.round((gastosPessoa.g2 / totalGastoProxy) * 100) : 0;

  // ---------- Cartão ----------

  const cartaoDestaque = cartoes.find((c) => c.ativo) ?? cartoes[0] ?? null;
  const faturaDestaque = cartaoDestaque
    ? faturas.find((f) => f.cartaoId === cartaoDestaque.id && f.mesReferencia === selectedMonth)
    : null;
  const limiteDisponivel = cartaoDestaque ? getLimiteDisponivel(cartaoDestaque.id) : 0;

  // ---------- Acerto do mês / resumo por pessoa ----------

  const diferencaGastos = Math.abs(gastosPessoa.g1 - gastosPessoa.g2);
  const equilibrado =
    totalGastoProxy === 0 || diferencaGastos / Math.max(gastosPessoa.g1, gastosPessoa.g2, 1) < 0.1;
  const quemGastouMais = gastosPessoa.g1 >= gastosPessoa.g2 ? usuario1Nome : usuario2Nome;

  const nomePessoaFiltro = activeFilter === 'p1' ? usuario1Nome : usuario2Nome;
  const gastoPessoaFiltro = activeFilter === 'p1' ? gastosPessoa.g1 : gastosPessoa.g2;
  const receitaPessoaFiltro = activeFilter === 'p1' ? gastosPessoa.r1 : gastosPessoa.r2;

  // ---------- Últimos lançamentos ----------

  const totalDespesaFiltrado = lancamentosFiltrados
    .filter((l) => l.tipo === 'despesa')
    .reduce((s, l) => s + l.valor, 0);
  const totalReceitaFiltrado = lancamentosFiltrados
    .filter((l) => l.tipo === 'receita')
    .reduce((s, l) => s + l.valor, 0);

  const ultimosLancamentos = useMemo(
    () => [...lancamentosFiltrados].sort((a, b) => toDate(b.data).getTime() - toDate(a.data).getTime()).slice(0, 5),
    [lancamentosFiltrados]
  );

  function proporcao(l: Lancamento): number {
    const total = l.tipo === 'despesa' ? totalDespesaFiltrado : totalReceitaFiltrado;
    return total > 0 ? Math.round((l.valor / total) * 100) : 0;
  }

  // ---------- Por categoria ----------

  const categoriasDespesa = useMemo(() => {
    const porCategoria = new Map<string, number>();
    lancamentosFiltrados
      .filter((l) => l.tipo === 'despesa')
      .forEach((l) => porCategoria.set(l.categoriaId, (porCategoria.get(l.categoriaId) ?? 0) + l.valor));

    return Array.from(porCategoria.entries())
      .map(([categoriaId, valor]) => ({
        categoriaId,
        nome: categorias.find((c) => c.id === categoriaId)?.nome ?? 'Outros',
        valor,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [lancamentosFiltrados, categorias]);

  const maiorCategoriaValor = categoriasDespesa[0]?.valor ?? 0;

  return (
    <>
      <ConvitePendente />

      <div className={styles.filterRow}>
        <div className={styles.segmented} role="group" aria-label="Filtrar por pessoa">
          <button
            type="button"
            className={`${styles.segBtn} ${activeFilter === 'casal' ? styles.segBtnActive : ''}`}
            onClick={() => setActiveFilter('casal')}
            aria-pressed={activeFilter === 'casal'}
          >
            Casal
          </button>
          <button
            type="button"
            className={`${styles.segBtn} ${activeFilter === 'p1' ? styles.segBtnActive : ''}`}
            onClick={() => setActiveFilter('p1')}
            aria-pressed={activeFilter === 'p1'}
          >
            <span className={`${styles.segDot} ${styles.segDotP1}`} />
            {usuario1Nome}
          </button>
          <button
            type="button"
            className={`${styles.segBtn} ${activeFilter === 'p2' ? styles.segBtnActive : ''}`}
            onClick={() => setActiveFilter('p2')}
            aria-pressed={activeFilter === 'p2'}
          >
            <span className={`${styles.segDot} ${styles.segDotP2}`} />
            {usuario2Nome}
          </button>
        </div>
        <span className={styles.filterHint}>{filterHint}</span>
      </div>

      <div className={styles.bento}>
        {/* SALDO */}
        <section className={`${styles.card} ${styles.glass} ${styles.spanSaldo}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconP1}`}>
              <IconWallet />
            </div>
            <div className={styles.cardHeaderText}>
              <div className={styles.cardTitle}>Saldo do casal</div>
              <div className={styles.cardSubtitle}>Visão geral</div>
            </div>
          </div>

          {variacaoPct !== null && (
            <span className={styles.saldoBadge}>
              {variacaoPct >= 0 ? '+' : ''}
              {variacaoPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% este mês
            </span>
          )}

          <div className={styles.saldoLabel}>Saldo disponível</div>
          <div className={styles.saldoValueRow}>
            <span className={styles.saldoValue}>{formatCurrency(Math.trunc(saldoMes))}</span>
          </div>

          <div className={styles.saldoChartWrap}>
            <svg
              viewBox="0 0 520 170"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Gráfico de evolução do saldo nos últimos 6 meses, com saldo atual de ${formatCurrency(saldoMes)}`}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFB020" />
                  <stop offset="60%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#17BEBB" />
                </linearGradient>
              </defs>

              <path d={areaPath} fill="url(#areaGrad)" stroke="none" />
              <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
              <line
                x1={pontoAtivo.x}
                y1={pontoAtivo.y}
                x2={pontoAtivo.x}
                y2="170"
                stroke="var(--ink-3)"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                opacity="0.28"
              />
              <circle cx={pontoAtivo.x} cy={pontoAtivo.y} r="12" fill="var(--p1)" opacity="0.18" />
              <circle cx={pontoAtivo.x} cy={pontoAtivo.y} r="7" fill="var(--p1)" />
            </svg>

            <div className={styles.tooltip} style={{ left: `${tooltipLeft}%`, top: `${tooltipTop}%` }}>
              <div className={styles.tooltipValue}>{formatCurrency(pontoAtivo.saldo)}</div>
              <div className={styles.tooltipDate}>
                {monthLabel(pontoAtivo.mes)} {parseMonthKey(pontoAtivo.mes).ano}
              </div>
            </div>
          </div>

          <div className={styles.saldoChips}>
            {chipMonths.map((mes) => (
              <button
                key={mes}
                type="button"
                className={`${styles.chip} ${selectedMonth === mes ? styles.chipActive : ''}`}
                onClick={() => setSelectedMonth(mes)}
                aria-pressed={selectedMonth === mes}
              >
                {monthLabel(mes)}
              </button>
            ))}
          </div>
        </section>

        {/* META */}
        <section className={`${styles.card} ${styles.glass} ${styles.spanMeta}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconP1}`}>
              <IconTarget />
            </div>
            <div className={styles.cardHeaderText}>
              <div className={styles.cardTitle}>Meta ativa</div>
              <div className={styles.cardSubtitle}>{metaAtiva ? metaAtiva.titulo : 'Nenhuma meta em aberto'}</div>
            </div>
          </div>

          {metaAtiva ? (
            <>
              <div className={styles.gaugeWrap}>
                <svg width="172" height="172" viewBox="0 0 172 172" role="img" aria-label={`Progresso da meta: ${metaPct}% concluído`}>
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFB020" />
                      <stop offset="55%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#17BEBB" />
                    </linearGradient>
                  </defs>
                  <circle cx="86" cy="86" r={GAUGE_R} fill="none" stroke="var(--track)" strokeWidth="14" />
                  <circle
                    className={styles.gaugeArc}
                    cx="86"
                    cy="86"
                    r={GAUGE_R}
                    fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={GAUGE_CIRCUMFERENCE.toFixed(1)}
                    strokeDashoffset={gaugeOffset.toFixed(1)}
                    transform="rotate(-90 86 86)"
                  />
                </svg>
                <div className={styles.gaugeCenter}>
                  <span className={styles.gaugeValue}>{metaPct}%</span>
                  <span className={styles.gaugeLegend}>da meta</span>
                </div>
              </div>

              <ContribRow name={usuario1Nome} pct={animated ? metaContribP1Pct : 0} value={formatCurrency(gastosPessoa.g1)} variant="p1" />
              <ContribRow name={usuario2Nome} pct={animated ? metaContribP2Pct : 0} value={formatCurrency(gastosPessoa.g2)} variant="p2" />

              <Link to="/metas" className={styles.metaFooter}>
                <div className={`${styles.metaFooterIcon} ${styles.iconP1}`}>
                  <IconTarget size={15} />
                </div>
                <div className={styles.metaFooterText}>
                  <div className={styles.metaFooterTitle}>Ver detalhes da meta</div>
                  <div className={styles.metaFooterSub}>
                    Faltam {formatCurrency(Math.max(0, metaAtiva.valorObjetivo - metaAtiva.valorAtual))}
                  </div>
                </div>
                <span className={styles.metaFooterChevron}>
                  <IconChevronRight />
                </span>
              </Link>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span>Vocês ainda não têm nenhuma meta em aberto.</span>
              <Link to="/metas" className={styles.emptyStateAction}>Criar meta</Link>
            </div>
          )}
        </section>

        {/* CARTÃO */}
        <section className={`${styles.card} ${cartaoDestaque ? styles.cartaoCard : `${styles.glass}`} ${styles.spanOne}`}>
          {cartaoDestaque ? (
            <>
              <div className={styles.cartaoGlow} />
              <span className={styles.cartaoLabel}>{cartaoDestaque.nome}</span>
              <div className={styles.cartaoValue}>{formatCurrency(faturaDestaque?.valorTotal ?? 0)}</div>
              <div className={styles.cartaoFooter}>
                <span>Fecha dia {cartaoDestaque.fechamento}</span>
                <span>Limite disp.: {formatCurrency(limiteDisponivel)}</span>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span>Nenhum cartão cadastrado.</span>
              <Link to="/cartoes" className={styles.emptyStateAction}>Adicionar cartão</Link>
            </div>
          )}
        </section>

        {/* ACERTO / RESUMO */}
        <section className={`${styles.card} ${styles.glass} ${styles.spanOne}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconGrad}`}>
              <IconLink />
            </div>
            <div className={styles.cardHeaderText}>
              <div className={styles.cardTitle}>{activeFilter === 'casal' ? 'Acerto do mês' : 'Resumo do mês'}</div>
              <div className={styles.cardSubtitle}>{activeFilter === 'casal' ? 'Quem gastou o quê' : nomePessoaFiltro}</div>
            </div>
          </div>

          {activeFilter === 'casal' ? (
            <>
              <ContribRow name={usuario1Nome} pct={animated ? metaContribP1Pct : 0} value={formatCurrency(gastosPessoa.g1)} variant="p1" />
              <ContribRow name={usuario2Nome} pct={animated ? metaContribP2Pct : 0} value={formatCurrency(gastosPessoa.g2)} variant="p2" />

              <div className={styles.acertoBlock}>
                <div className={styles.acertoPhrase}>
                  {equilibrado ? 'Vocês estão equilibrados' : `${quemGastouMais} gastou mais este mês`}
                </div>
                <div className={styles.acertoExplain}>Diferença de {formatCurrency(diferencaGastos)} este mês</div>
              </div>
            </>
          ) : (
            <div className={styles.acertoBlock}>
              <div className={styles.acertoPhrase}>{formatCurrency(gastoPessoaFiltro)}</div>
              <div className={styles.acertoExplain}>
                Gasto no mês · Receita de {formatCurrency(receitaPessoaFiltro)}
              </div>
            </div>
          )}
        </section>

        {/* LISTA */}
        <section className={`${styles.card} ${styles.glass} ${styles.spanTwo}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconP2}`}>
              <IconList />
            </div>
            <div className={styles.cardHeaderText}>
              <div className={styles.cardTitle}>Últimos lançamentos</div>
              <div className={styles.cardSubtitle}>Este mês</div>
            </div>
            <Link to="/lancamentos" className={styles.cardMetaInfo}>Ver tudo</Link>
          </div>

          {ultimosLancamentos.length === 0 ? (
            <div className={styles.emptyState}>Nenhum lançamento neste mês.</div>
          ) : (
            ultimosLancamentos.map((item) => {
              const nomePessoa = getNomePessoa(item.pessoaId);
              const categoria = categorias.find((c) => c.id === item.categoriaId)?.nome ?? 'Sem categoria';
              return (
                <div className={styles.listaRow} key={item.id}>
                  <div className={`${styles.listaAvatar} ${item.pessoaId === 'usuario2' ? styles.avatarP2 : styles.avatarP1}`}>
                    {nomePessoa[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className={styles.listaText}>
                    <div className={styles.listaTitle}>{item.descricao || categoria}</div>
                    <div className={styles.listaSub}>{categoria} · {formatQuando(item.data)}</div>
                  </div>
                  <span className={styles.listaTag}>{proporcao(item)}%</span>
                  <span className={styles.listaValue}>{formatCurrency(item.valor)}</span>
                </div>
              );
            })
          )}
        </section>

        {/* BARRAS */}
        <section className={`${styles.card} ${styles.glass} ${styles.spanTwo}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconP2}`}>
              <IconBarChart />
            </div>
            <div className={styles.cardHeaderText}>
              <div className={styles.cardTitle}>Por categoria</div>
              <div className={styles.cardSubtitle}>Top 5 do mês</div>
            </div>
            <span className={styles.cardMetaInfo}>{formatCurrency(totalDespesaFiltrado)}</span>
          </div>

          {categoriasDespesa.length === 0 ? (
            <div className={styles.emptyState}>Nenhuma despesa neste mês.</div>
          ) : (
            <>
              <div className={styles.barrasChart}>
                {categoriasDespesa.map((c, i) => (
                  <div className={styles.barItem} key={c.categoriaId}>
                    <div
                      className={`${styles.barCol} ${i === 0 ? styles.barColActive : ''}`}
                      style={{ height: animated ? `${(c.valor / maiorCategoriaValor) * 100}%` : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.barLabels}>
                {categoriasDespesa.map((c, i) => (
                  <div className={styles.barLabelItem} key={c.categoriaId}>
                    <div className={`${styles.barName} ${i === 0 ? styles.barNameActive : ''}`}>{c.nome}</div>
                    <div className={styles.barValue}>{formatCurrency(c.valor)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

interface ContribRowProps {
  name: string;
  pct: number;
  value: string;
  variant: 'p1' | 'p2';
}

function ContribRow({ name, pct, value, variant }: ContribRowProps) {
  return (
    <div className={styles.contribRow}>
      <span className={styles.contribName}>{name}</span>
      <div className={styles.contribBarTrack}>
        <div
          className={`${styles.contribBarFill} ${variant === 'p1' ? styles.contribBarFillP1 : styles.contribBarFillP2}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.contribValue}>{value}</span>
    </div>
  );
}
