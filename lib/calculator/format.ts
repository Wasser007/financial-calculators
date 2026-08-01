import { expandExponential, normalizeNegativeZero } from './numbers.js';
import type { FormatAmountOptions } from './types.js';

function halfExpandFixed2(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError('formatAmount requires a finite value.');
  }

  const normalized = normalizeNegativeZero(value);
  const plain = expandExponential(normalized);
  const negative = plain.startsWith('-');
  const unsigned = negative ? plain.slice(1) : plain;
  const [integer = '0', fraction = ''] = unsigned.split('.');
  const padded = `${fraction}000`;
  const centsBeforeRounding = BigInt(integer) * 100n + BigInt(padded.slice(0, 2));
  const roundUp = Number(padded[2]) >= 5;
  const cents = centsBeforeRounding + (roundUp ? 1n : 0n);
  const whole = cents / 100n;
  const remainder = (cents % 100n).toString().padStart(2, '0');
  const sign = negative && cents !== 0n ? '-' : '';
  return `${sign}${whole}.${remainder}`;
}

function groupEnUs(fixed: string): string {
  const negative = fixed.startsWith('-');
  const unsigned = negative ? fixed.slice(1) : fixed;
  const [integer = '0', fraction = '00'] = unsigned.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${grouped}.${fraction}`;
}

export function formatAmount(
  value: number,
  options: FormatAmountOptions,
): string {
  void options.currency;
  const fixed = halfExpandFixed2(value);
  if (options.locale === 'en-US') {
    return groupEnUs(fixed);
  }

  return new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Number(fixed));
}
