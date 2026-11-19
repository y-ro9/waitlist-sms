/**
 * Sanitize free-text input against XSS.
 * Escapes < and > and trims whitespace.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}