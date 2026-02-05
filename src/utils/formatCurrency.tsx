import type React from 'react';

/**
 * Formata um número como moeda brasileira (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata um número como moeda sem o símbolo R$
 * @param value - Valor numérico a ser formatado
 * @returns String formatada (ex: "1.234,56")
 */
export function formatCurrencyWithoutSymbol(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata um número como moeda com suporte a privacidade (blur)
 * @param value - Valor numérico a ser formatado
 * @param hidden - Se true, aplica efeito de blur no valor
 * @returns ReactNode com o valor formatado, com blur se hidden for true
 */
export function formatCurrencyWithPrivacy(value: number, hidden: boolean): React.ReactNode {
  const formatted = formatCurrency(value);
  
  if (hidden) {
    return <span className="blur-value">{formatted}</span>;
  }
  
  return formatted;
}
