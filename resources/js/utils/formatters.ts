import { Currency } from '@/pages/Admin/Currencies/_components/types';

/**
 * Formata um valor monetário de acordo com a moeda especificada
 *
 * @param amount O valor a ser formatado
 * @param currency Objeto da moeda ou undefined para usar a moeda padrão
 * @param includeSymbol Se deve incluir o símbolo da moeda
 * @returns O valor formatado
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency?: Currency,
  includeSymbol = true
): string {
  if (amount === null || amount === undefined) return 'N/A';

  // Se não tiver uma moeda específica, usar a formatação padrão do browser
  if (!currency) {
    return new Intl.NumberFormat('pt-PT', {
      style: includeSymbol ? 'currency' : 'decimal',
      currency: 'MZN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Usando as configurações da moeda específica
  const formattedValue = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: currency.decimal_places,
    maximumFractionDigits: currency.decimal_places,
  }).format(amount)
    .replace(/\./g, '#')
    .replace(/,/g, '$')
    .replace(/#/g, currency.thousand_separator)
    .replace(/\$/g, currency.decimal_separator);

  return includeSymbol ? `${currency.symbol} ${formattedValue}` : formattedValue;
}

/**
 * Converte um valor de uma moeda para outra usando a taxa de câmbio
 *
 * @param amount O valor a ser convertido
 * @param fromCurrency A moeda de origem
 * @param toCurrency A moeda de destino
 * @returns O valor convertido
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  // Primeiro convertemos para a moeda base (dividindo pela taxa de origem)
  const valueInBaseCurrency = amount / fromCurrency.exchange_rate;

  // Depois convertemos da moeda base para a moeda de destino (multiplicando pela taxa de destino)
  return valueInBaseCurrency * toCurrency.exchange_rate;
}

/**
 * Formata uma data no formato localizado
 *
 * @param date A data a ser formatada
 * @param includeTime Se deve incluir a hora
 * @returns A data formatada
 */
export function formatDate(
  date: Date | string | null | undefined,
  includeTime = false
): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('pt-PT', {
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  });
}
