import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INPUTS,
  parseCalculatorQuery,
  serializeCalculatorQuery,
} from '../../lib/calculator/index.js';

describe('I17–I23 URL behavior', () => {
  it('I17 rejects scientific notation for one field', () => {
    const parsed = parseCalculatorQuery('?v=1&p=1e4');
    expect(parsed.inputs).toEqual(DEFAULT_INPUTS);
    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toMatchObject({
      code: 'URL_VALUE_IGNORED',
      field: 'initialPrincipal',
    });
  });

  it('I18 normalizes URL negative zero', () => {
    const parsed = parseCalculatorQuery('?v=1&r=-0');
    expect(parsed.inputs.nominalAnnualRate).toBe(0);
    expect(Object.is(parsed.inputs.nominalAnnualRate, -0)).toBe(false);
    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings).toEqual([]);
  });

  it('I19 uses the last duplicate business value', () => {
    const parsed = parseCalculatorQuery('?v=1&m=12&m=24');
    expect(parsed.inputs).toEqual({ ...DEFAULT_INPUTS, durationMonths: 24 });
    expect(parsed.warnings).toEqual([]);
  });

  it('I20 ignores all business values for an unsupported version', () => {
    const parsed = parseCalculatorQuery('?v=2&p=500');
    expect(parsed.inputs).toEqual(DEFAULT_INPUTS);
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toMatchObject({
      code: 'UNSUPPORTED_VERSION',
    });
    expect(parsed.warnings[0]).not.toHaveProperty('field');
  });

  it('I21 uses the last duplicate version', () => {
    const parsed = parseCalculatorQuery('?v=2&v=1&p=500');
    expect(parsed.inputs).toEqual({ ...DEFAULT_INPUTS, initialPrincipal: 500 });
    expect(parsed.warnings).toEqual([]);
  });

  it.each([
    ['I22', '?unknown=x'],
    ['I23', ''],
  ])('%s ignores non-business/empty query without requiring version', (_, query) => {
    const parsed = parseCalculatorQuery(query);
    expect(parsed.inputs).toEqual(DEFAULT_INPUTS);
    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings).toEqual([]);
    expect(serializeCalculatorQuery(parsed.inputs)).toBe('');
  });
});

describe('U01–U12 strict query and serialization contract', () => {
  it('U01 restores defaults when a business key has no version', () => {
    const parsed = parseCalculatorQuery('?p=500');
    expect(parsed.inputs).toEqual(DEFAULT_INPUTS);
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toMatchObject({ code: 'MISSING_VERSION' });
    expect(parsed.warnings[0]).not.toHaveProperty('field');
  });

  it('U02 falls back only invalid fields in frozen business-key order', () => {
    const parsed = parseCalculatorQuery('?v=1&r=oops&c=oops&p=500&r=0.1');
    expect(parsed.inputs).toEqual({
      ...DEFAULT_INPUTS,
      initialPrincipal: 500,
      nominalAnnualRate: 0.1,
    });
    expect(parsed.warnings.map((issue) => issue.field)).toEqual([
      'contributionAmount',
    ]);

    const ordered = parseCalculatorQuery('?v=1&i=x&p=x&cur=x');
    expect(ordered.warnings.map((issue) => issue.field)).toEqual([
      'currency',
      'initialPrincipal',
      'inflationRate',
    ]);
  });

  it.each([
    ['U03', '?v=1&p='],
    ['U04', '?v=1&p=+1'],
    ['U05', '?v=1&p=01'],
    ['U06', '?v=1&p=1.'],
    ['U07', '?v=1&p=%20100'],
  ])('%s rejects a non-canonical numeric token', (_, query) => {
    const parsed = parseCalculatorQuery(query);
    expect(parsed.inputs.initialPrincipal).toBe(DEFAULT_INPUTS.initialPrincipal);
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toMatchObject({
      code: 'URL_VALUE_IGNORED',
      field: 'initialPrincipal',
    });
  });

  it('U08 uses exact case-sensitive enum matching', () => {
    const parsed = parseCalculatorQuery('?v=1&cur=eur');
    expect(parsed.inputs.currency).toBe(DEFAULT_INPUTS.currency);
    expect(parsed.warnings[0]).toMatchObject({
      code: 'URL_VALUE_IGNORED',
      field: 'currency',
    });
  });

  it('U09 serializes defaults to an empty query', () => {
    expect(serializeCalculatorQuery({ ...DEFAULT_INPUTS })).toBe('');
  });

  it('U10 and U11 serialize canonically and round-trip exactly', () => {
    const query = serializeCalculatorQuery({
      ...DEFAULT_INPUTS,
      currency: 'EUR',
      initialPrincipal: 500,
    });
    expect(query).toBe('?v=1&cur=EUR&p=500');
    const parsed = parseCalculatorQuery(query);
    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings).toEqual([]);
    expect(serializeCalculatorQuery(parsed.inputs)).toBe(query);
  });

  it('U12 serializes changed negative zero as ordinary zero', () => {
    expect(
      serializeCalculatorQuery({ ...DEFAULT_INPUTS, initialPrincipal: -0 }),
    ).toBe('?v=1&p=0');
  });

  it('serializes small numbers without exponent notation', () => {
    expect(
      serializeCalculatorQuery({
        ...DEFAULT_INPUTS,
        nominalAnnualFeeRate: 0.0001,
      }),
    ).toBe('?v=1&f=0.0001');
  });
});
