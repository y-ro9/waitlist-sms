import type { SmsLog } from '../types';
import type { WaitlistEntryView } from '../services/api';

export function SmsLogPanel({
  logs,
  entries,
}: {
  logs: SmsLog[];
  entries: WaitlistEntryView[];
}) {
  const byEntry = new Map(entries.map((e) => [e.id, e]));
  return (
    <ul className="log-list">
      {logs.map((l) => {
        const e = byEntry.get(l.waitlistEntryId);
        return (
          <li key={l.id} className="log-item">
            <div className="log-head">
              <span className={`badge badge-${l.status}`}>{l.status}</span>
              <span className="log-meta">
                {e ? e.student.name : 'Unknown'} · {l.phone}
              </span>
              <span className="log-time">{new Date(l.sentAt).toLocaleString()}</span>
            </div>
            <p className="log-body">{l.message}</p>
          </li>
        );
      })}
    </ul>
  );
}