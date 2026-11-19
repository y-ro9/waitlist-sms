import { useEffect, useState } from 'react';
import type { ClassInfo, SmsLog } from './types';
import {
  addToWaitlist,
  getClasses,
  getSmsLogs,
  getWaitlist,
  notifyWaitlistEntry,
  ValidationError,
  type WaitlistEntryView,
} from './services/api';
import { trackEvent } from './utils/analytics';
import { Spinner } from './components/Spinner';
import { EmptyState } from './components/EmptyState';
import { WaitlistTable } from './components/WaitlistTable';
import { AddStudentForm } from './components/AddStudentForm';
import { SmsLogPanel } from './components/SmsLogPanel';
import { NotifyDialog } from './components/NotifyDialog';

export default function App() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [entries, setEntries] = useState<WaitlistEntryView[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notifyEntry, setNotifyEntry] = useState<WaitlistEntryView | null>(null);
  const [error, setError] = useState('');

  // Load classes
  useEffect(() => {
    let cancelled = false;
    setClassesLoading(true);
    getClasses()
      .then((cs) => {
        if (cancelled) return;
        setClasses(cs);
        if (cs.length > 0) setSelectedClassId(cs[0].id);
      })
      .catch(() => !cancelled && setError('Failed to load classes.'))
      .finally(() => !cancelled && setClassesLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Load entries + logs when class changes
  useEffect(() => {
    if (!selectedClassId) {
      setEntries([]);
      setLogs([]);
      return;
    }
    let cancelled = false;
    setEntriesLoading(true);
    Promise.all([getWaitlist(selectedClassId), getSmsLogs(selectedClassId)])
      .then(([es, ls]) => {
        if (cancelled) return;
        setEntries(es);
        setLogs(ls);
      })
      .catch(() => !cancelled && setError('Failed to load waitlist.'))
      .finally(() => !cancelled && setEntriesLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;
  const query = search.trim().toLowerCase();
  const filteredEntries = query
    ? entries.filter(
        (e) =>
          e.student.name.toLowerCase().includes(query) ||
          e.student.phone.toLowerCase().includes(query),
      )
    : entries;

  async function handleAdd(input: { name: string; phone: string; email: string }) {
    if (!selectedClassId) return;
    try {
      const entry = await addToWaitlist(selectedClassId, input);
      setEntries((prev) => [...prev, entry].sort((a, b) => a.position - b.position));
      setShowForm(false);
      trackEvent('Added student to waitlist');
    } catch (e) {
      if (e instanceof ValidationError) throw e;
      setError('Failed to add student. Please try again.');
    }
  }

  async function handleNotify(entry: WaitlistEntryView, message: string) {
    const log = await notifyWaitlistEntry(entry.id, message);
    setLogs((prev) => [log, ...prev]);
    const refreshed = await getWaitlist(selectedClassId);
    setEntries(refreshed);
    trackEvent('Sent SMS notification');
    setNotifyEntry(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Class Waitlist SMS Notification</h1>
          <p className="subtitle">Notify waitlisted students when a spot opens (Twilio Mock)</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            trackEvent('Opened Add Student form');
          }}
          disabled={!selectedClassId}
        >
          + Add Student
        </button>
      </header>

      {error && (
        <div role="alert" className="alert">
          {error}{' '}
          <button type="button" className="link" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      <section className="toolbar">
        <label className="field">
          <span>Class</span>
          {classesLoading ? (
            <Spinner label="Loading classes" />
          ) : (
            <select
              aria-label="Select class"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                trackEvent('Changed class selection');
              }}
              disabled={classes.length === 0}
            >
              {classes.length === 0 && <option value="">No classes available</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.enrolled}/{c.capacity})
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="field grow">
          <span>Search</span>
          <input
            type="search"
            aria-label="Search waitlist"
            placeholder="Search by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </section>

      <main className="content">
        <section className="panel">
          <h2>
            Waitlist {selectedClass && <span className="muted">— {selectedClass.name}</span>}
          </h2>
          {entriesLoading ? (
            <Spinner label="Loading waitlist" />
          ) : classes.length === 0 ? (
            <EmptyState message="No data found — no classes have been created yet." />
          ) : entries.length === 0 ? (
            <EmptyState message="No data found — the waitlist for this class is empty." />
          ) : filteredEntries.length === 0 ? (
            <EmptyState message="No data found — no entries match your search." />
          ) : (
            <WaitlistTable
              entries={filteredEntries}
              onNotify={(entry) => {
                setNotifyEntry(entry);
                trackEvent('Opened Notify dialog');
              }}
            />
          )}
        </section>

        <section className="panel">
          <h2>SMS Notification Log</h2>
          {entriesLoading ? (
            <Spinner label="Loading SMS log" />
          ) : logs.length === 0 ? (
            <EmptyState message="No data found — no SMS notifications sent yet." />
          ) : (
            <SmsLogPanel logs={logs} entries={entries} />
          )}
        </section>
      </main>

      {showForm && selectedClass && (
        <AddStudentForm onCancel={() => setShowForm(false)} onSubmit={handleAdd} />
      )}

      {notifyEntry && (
        <NotifyDialog
          entry={notifyEntry}
          onCancel={() => setNotifyEntry(null)}
          onSend={(msg) => handleNotify(notifyEntry, msg)}
        />
      )}
    </div>
  );
}