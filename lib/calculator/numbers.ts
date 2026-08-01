export function normalizeNegativeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

export function expandExponential(value: number): string {
  const source = String(normalizeNegativeZero(value));
  if (!/[eE]/.test(source)) {
    return source;
  }

  const match = /^(-?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(source);
  if (!match) {
    return source;
  }

  const [, sign = '', integer = '', fraction = '', exponentText = '0'] = match;
  const digits = `${integer}${fraction}`;
  const decimalIndex = integer.length + Number(exponentText);

  if (decimalIndex <= 0) {
    return `${sign}0.${'0'.repeat(-decimalIndex)}${digits}`;
  }
  if (decimalIndex >= digits.length) {
    return `${sign}${digits}${'0'.repeat(decimalIndex - digits.length)}`;
  }
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

export function decimalPlaces(value: number): number {
  const plain = expandExponential(value);
  const point = plain.indexOf('.');
  return point === -1 ? 0 : plain.length - point - 1;
}

export function canonicalNumber(value: number): string {
  const plain = expandExponential(normalizeNegativeZero(value));
  if (!plain.includes('.')) {
    return plain;
  }
  const trimmed = plain.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  return trimmed === '-0' ? '0' : trimmed;
}
