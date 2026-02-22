/**
 * Dado um mês no formato YYYY-MM, retorna um array com os 12 meses anteriores
 * (incluindo o próprio mês), em ordem cronológica (mais antigo primeiro).
 * Ex: getUltimos12Meses("2025-02") => ["2024-03", "2024-04", ..., "2025-02"]
 */
export function getUltimos12Meses(selectedMonth: string): string[] {
  const [year, month] = selectedMonth.split('-').map(Number);
  const result: string[] = [];
  for (let i = 11; i >= 0; i--) {
    let y = year;
    let m = month - i;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    result.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return result;
}

/**
 * Formata um mês YYYY-MM para label curto (ex: "Mar/24", "Abr/24").
 */
const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const anoCurto = String(y).slice(-2);
  return `${MESES_ABREV[m - 1]}/${anoCurto}`;
}

/**
 * Retorna o mês anterior no formato YYYY-MM.
 */
export function getMesAnterior(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`;
}
