import { beforeEach, describe, expect, it } from 'vitest';
import {
  addToWaitlist,
  getWaitlist,
  notifyWaitlistEntry,
  ValidationError,
} from '../services/api';
import { resetDB } from '../data/store';

beforeEach(() => {
  localStorage.clear();
  resetDB();
});

describe('addToWaitlist', () => {
  it('stores sanitized name (XSS stripped)', async () => {
    const view = await addToWaitlist('c1', {
      name: '<b>Aarav</b>',
      phone: '+919876543210',
      email: 'a@b.co',
    });
    expect(view.student.name).not.toContain('<');
    expect(view.student.name).not.toContain('>');
  });

  it('assigns the next available position', async () => {
    const before = await getWaitlist('c1');
    const maxPos = before.length ? Math.max(...before.map((e) => e.position)) : 0;
    const view = await addToWaitlist('c1', {
      name: 'New Person',
      phone: '+919876543211',
      email: 'n@b.co',
    });
    expect(view.position).toBe(maxPos + 1);
  });

  it('throws ValidationError for invalid phone', async () => {
    await expect(
      addToWaitlist('c1', { name: 'X Y', phone: 'bad', email: 'a@b.co' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError for invalid email', async () => {
    await expect(
      addToWaitlist('c1', { name: 'X Y', phone: '9876543210', email: 'bad' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('notifyWaitlistEntry', () => {
  it('sends SMS successfully and marks entry as notified', async () => {
    const entry = await addToWaitlist('c1', {
      name: 'Test User',
      phone: '+919876543210',
      email: 't@b.co',
    });
    const log = await notifyWaitlistEntry(entry.id, 'Hello!');
    expect(log.status).toBe('sent');

    const after = await getWaitlist('c1');
    const updated = after.find((e) => e.id === entry.id);
    expect(updated?.status).toBe('notified');
  });

  it('returns failed status for numbers ending in 0000 (test hook)', async () => {
    const entry = await addToWaitlist('c1', {
      name: 'Fail User',
      phone: '+919876540000',
      email: 'f@b.co',
    });
    const log = await notifyWaitlistEntry(entry.id, 'Hello!');
    expect(log.status).toBe('failed');
  });
});

describe('getWaitlist', () => {
  it('returns empty array for unknown class', async () => {
    const rows = await getWaitlist('nonexistent');
    expect(rows).toEqual([]);
  });

  it('returns entries sorted by position ascending', async () => {
    const rows = await getWaitlist('c1');
    const positions = rows.map((r) => r.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});