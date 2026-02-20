import type React from 'react';

/**
 * Formata um número para exibição com máscara brasileira
 * @param value - Valor numérico ou string numérica
 * @param allowDecimals - Se permite decimais (padrão: true)
 * @returns String formatada (ex: "1.234,56" ou "1.234")
 */
export function formatNumberInput(value: string | number, allowDecimals: boolean = true): string {
  if (value === '' || value === null || value === undefined) return '';
  if (value === 0) return '0';
  
  let cleanValue: string;
  
  // Se for número, converter para string
  if (typeof value === 'number') {
    cleanValue = value.toString().replace('.', ',');
  } else {
    // Remover tudo que não é número, vírgula ou ponto
    cleanValue = value.replace(/[^\d,.]/g, '');
    
    // Pontos são separadores de milhar (formato BR); remover para não virar decimal
    cleanValue = cleanValue.replace(/\./g, '');
    
    // Garantir apenas uma vírgula
    const commaIndex = cleanValue.indexOf(',');
    if (commaIndex !== -1) {
      cleanValue = cleanValue.substring(0, commaIndex + 1) + cleanValue.substring(commaIndex + 1).replace(/,/g, '');
    }
  }
  
  // Se não permitir decimais, remover vírgula
  if (!allowDecimals) {
    cleanValue = cleanValue.replace(/,/g, '');
  }
  
  // Separar parte inteira e decimal
  const parts = cleanValue.split(',');
  let integerPart = parts[0] || '0';
  const decimalPart = parts[1];
  
  // Remover zeros à esquerda da parte inteira (exceto se for apenas zero)
  integerPart = integerPart.replace(/^0+/, '') || '0';
  
  // Limitar a 2 casas decimais se permitir decimais
  let finalDecimalPart = '';
  if (allowDecimals && decimalPart !== undefined) {
    finalDecimalPart = decimalPart.substring(0, 2);
  }
  
  // Adicionar pontos como separadores de milhar na parte inteira
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Se não permitir decimais, retornar apenas a parte inteira formatada
  if (!allowDecimals) {
    return formattedInteger;
  }
  
  // Retornar com vírgula e decimais se existirem
  return finalDecimalPart ? `${formattedInteger},${finalDecimalPart}` : formattedInteger;
}

/**
 * Converte uma string formatada de volta para número
 * @param value - String formatada (ex: "1.234,56")
 * @returns Número (ex: 1234.56)
 */
export function parseNumberInput(value: string): number {
  if (!value) return 0;
  
  // Remover pontos (separadores de milhar) e substituir vírgula por ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Handler para onChange de inputs numéricos com máscara
 * @param e - Evento do input
 * @param allowDecimals - Se permite decimais (padrão: true)
 * @returns String formatada
 */
export function handleNumberInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  allowDecimals: boolean = true
): string {
  const inputValue = e.target.value;
  
  // Permitir apenas números, vírgula e ponto
  const cleanValue = inputValue.replace(/[^\d,.-]/g, '');
  
  // Formatar o valor
  return formatNumberInput(cleanValue, allowDecimals);
}
