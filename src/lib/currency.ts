import { getCached } from './cache';

// Fallback default rates for emergency (if API and cache fail)
// NOT accurate, just for fallback!
const FALLBACK_RATES: Record<string, number> = {
  USD: 16000,
  EUR: 17500,
  GBP: 20500,
};

// Map locale to target currency
export const LOCALE_TO_CURRENCY: Record<string, string> = {
  id: 'IDR',
  en: 'USD',
  de: 'EUR',
};

// Map currency to locale for NumberFormat
const CURRENCY_TO_LOCALE: Record<string, string> = {
  IDR: 'id-ID',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=IDR', {
      next: { revalidate: 0 }, // Let our Redis cache handle it
    });
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data: FrankfurterResponse = await response.json();
    // Frankfurter returns rates as 1 IDR = X target, we want 1 target = X IDR
    const invertedRates: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(data.rates)) {
      invertedRates[currency] = 1 / rate;
    }
    return invertedRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

export async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    return await getCached<Record<string, number>>(
      'exchange_rates:idr',
      6 * 60 * 60, // 6 hours TTL
      fetchExchangeRates
    );
  } catch (error) {
    console.error('Using fallback exchange rates due to error');
    return FALLBACK_RATES;
  }
}

export function formatCurrency(
  amountIdr: number,
  targetCurrency: string,
  rates: Record<string, number>
): string {
  if (targetCurrency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amountIdr);
  }

  const rate = rates[targetCurrency] || FALLBACK_RATES[targetCurrency];
  if (!rate) {
    // Fallback to IDR if currency not supported
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amountIdr);
  }

  const convertedAmount = amountIdr / rate;
  const locale = CURRENCY_TO_LOCALE[targetCurrency] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}
