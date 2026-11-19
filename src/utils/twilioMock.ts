export interface SendSmsResult {
  sid: string;
  status: 'sent' | 'failed';
  to: string;
  body: string;
  sentAt: string;
}

/**
 * Mock Twilio SMS sender.
 * - Simulates 600ms network latency
 * - Deterministically fails for phone numbers ending in 0000 (test hook)
 */
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const digits = to.replace(/\D/g, '');
  const success = !digits.endsWith('0000');
  return {
    sid: `SM${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    status: success ? 'sent' : 'failed',
    to,
    body,
    sentAt: new Date().toISOString(),
  };
}