import { describe, expect, it } from 'vitest';
import { validateEmail, validateName, validatePhone } from '../utils/validation';

describe('validateName', () => {
  it('rejects empty', () => expect(validateName('')).toBeTruthy());
  it('rejects single char', () => expect(validateName('A')).toBeTruthy());
  it('accepts valid name', () => expect(validateName('Aarav')).toBeNull());
});

describe('validatePhone', () => {
  it('accepts 10-digit', () => expect(validatePhone('9876543210')).toBeNull());
  it('accepts E.164', () => expect(validatePhone('+919876543210')).toBeNull());
  it('rejects short number', () => expect(validatePhone('123')).toBeTruthy());
  it('rejects non-numeric', () => expect(validatePhone('abc')).toBeTruthy());
});

describe('validateEmail', () => {
  it('accepts valid email', () => expect(validateEmail('a@b.co')).toBeNull());
  it('rejects missing @', () => expect(validateEmail('abc')).toBeTruthy());
});