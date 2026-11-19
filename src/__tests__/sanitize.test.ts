import { describe, expect, it } from 'vitest';
import { sanitizeInput } from '../utils/sanitize';

describe('sanitizeInput', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(42)).toBe('');
  });

  it('escapes angle brackets to prevent XSS', () => {
    const out = sanitizeInput('<script>alert(1)</script>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('trims leading/trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('preserves safe text unchanged', () => {
    expect(sanitizeInput('Aarav Mehta')).toBe('Aarav Mehta');
  });
});