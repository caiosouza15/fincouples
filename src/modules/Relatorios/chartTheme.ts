import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/contexts/ThemeContext';

// Paleta validada com a skill dataviz (scripts/validate_palette.js) contra as
// superfícies reais do glass (card claro ≈ #FCFBFA, card escuro ≈ #1D2B41 —
// a mistura de --glass sobre --bg). Ver o plano de redesign para o
// detalhamento de cada checagem (banda de luminosidade, separação CVD,
// contraste). Não trocar hex sem revalidar.

const CATEGORICA_CLARO = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const CATEGORICA_ESCURO = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

interface CoresRelatorios {
  /** Identidade de categoria (gastos/receitas por categoria) — 8 tons, cicla além disso. */
  categorica: string[];
  /** Polaridade financeira: [positivo/atual, negativo]. */
  polaridade: [string, string];
  /** Identidade de pessoa — mesmas cores usadas no resto do app (--p1/--p2). */
  pessoa: [string, string];
  /** Progresso de meta: [bom (>=100%), atenção (>=50%), baixo]. */
  statusMeta: [string, string, string];
  /** Cinza neutro para série "anterior"/histórica em comparações temporais. */
  neutro: string;
}

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  const cores: CoresRelatorios = useMemo(
    () => ({
      categorica: dark ? CATEGORICA_ESCURO : CATEGORICA_CLARO,
      polaridade: dark ? ['#3987e5', '#e66767'] : ['#2a78d6', '#DC2626'],
      pessoa: ['#F97316', '#17BEBB'],
      statusMeta: dark ? ['#199e70', '#c98500', '#3987e5'] : ['#0E7C5A', '#eda100', '#2a78d6'],
      neutro: dark ? '#7A8699' : '#8E94A4',
    }),
    [dark]
  );

  const apexBase: ApexOptions = useMemo(
    () => ({
      theme: { mode: dark ? 'dark' : 'light' },
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        foreColor: dark ? '#A7B2C6' : '#5B6070',
        fontFamily: 'inherit',
      },
      grid: { borderColor: dark ? 'rgba(255,255,255,.09)' : 'rgba(20,20,30,.07)' },
      tooltip: { theme: dark ? 'dark' : 'light' },
      dataLabels: { enabled: false },
    }),
    [dark]
  );

  const categoriaCor = (idx: number): string => cores.categorica[idx % cores.categorica.length];

  return { cores, apexBase, categoriaCor, dark };
}
