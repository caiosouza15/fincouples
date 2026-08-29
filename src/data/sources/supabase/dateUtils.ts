// Colunas `date` do Postgres retornam 'YYYY-MM-DD'. Fazer new Date(string)
// direto interpreta como UTC meia-noite, que em fusos negativos (Brasil,
// UTC-3) vira o dia anterior. Estas funções trabalham só com os componentes
// locais, evitando o deslocamento de dia.

export function dbDateToDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function dateToDbDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
