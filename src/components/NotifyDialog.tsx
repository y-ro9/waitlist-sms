import { useState } from 'react';
import type { WaitlistEntryView } from '../services/api';

interface Props {
  entry: WaitlistEntryView;
  onCancel: () => void;
  onSend: (message: string) => Promise<void>;
}

export function NotifyDialog({ entry, onCancel, onSend }: Props) {
  const [message, setMessage] = useState(
    `Hi ${entry.student.name}, a spot has opened in your waitlisted class. Reply YES within 24 hours to confirm.`,
  );
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSend() {
    if (!message.trim()) {
      setErr('Message cannot be empty');
      return;
    }
    setSending(true);
    setErr(null);
    try {
      await onSend(message);
    } catch {
      setErr('Failed to send SMS. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notify-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !sending) onCancel();
      }}
    >
      <div className="dialog">
        <h2 id="notify-title">Send SMS notification</h2>
        <p className="muted">
          To: {entry.student.name} · {entry.student.phone}
        </p>
        <label className="field">
          <span>Message</span>
          <textarea
            value={message}
            rows={5}
            disabled={sending}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        {err && (
          <div role="alert" className="error-text">
            {err}
          </div>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={sending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending}
            aria-busy={sending}
          >
            {sending ? 'Sending…' : 'Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}