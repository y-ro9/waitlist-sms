export function trackEvent(action: string): void {
  // eslint-disable-next-line no-console
  console.log(
    `[Analytics] User interacted with Class Waitlist SMS Notification Job (Twilio Mock) — ${action}`,
  );
}