import {describe, it, expect} from 'vitest';
import {viDictionary} from '~/locales/vi';
import {enDictionary} from '~/locales/en';

describe('i18n Dictionaries & Contract Integrity', () => {
  const viKeys = Object.keys(viDictionary).sort();
  const enKeys = Object.keys(enDictionary).sort();

  it('should have identical keys in both Vietnamese and English dictionaries (Liskov Substitution)', () => {
    expect(viKeys).toEqual(enKeys);
    expect(viKeys.length).toBeGreaterThan(100);
  });

  it('should have non-empty string values for all keys in Vietnamese dictionary', () => {
    for (const [key, value] of Object.entries(viDictionary)) {
      expect(typeof value, `Key ${key} in viDictionary should be string`).toBe('string');
      expect(value.trim().length, `Key ${key} in viDictionary should not be empty`).toBeGreaterThan(0);
    }
  });

  it('should have non-empty string values for all keys in English dictionary', () => {
    for (const [key, value] of Object.entries(enDictionary)) {
      expect(typeof value, `Key ${key} in enDictionary should be string`).toBe('string');
      expect(value.trim().length, `Key ${key} in enDictionary should not be empty`).toBeGreaterThan(0);
    }
  });

  it('should strictly enforce ALL CAPS standard across Vietnamese dictionary', () => {
    for (const [key, value] of Object.entries(viDictionary)) {
      // Exclude special symbols/numbers/placeholders
      const upper = value.toUpperCase();
      expect(value, `Key "${key}" in viDictionary must be ALL CAPS`).toBe(upper);
    }
  });

  it('should strictly enforce ALL CAPS standard across English dictionary', () => {
    for (const [key, value] of Object.entries(enDictionary)) {
      const upper = value.toUpperCase();
      expect(value, `Key "${key}" in enDictionary must be ALL CAPS`).toBe(upper);
    }
  });
});
