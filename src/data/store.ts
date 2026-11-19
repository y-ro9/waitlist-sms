import type { ClassInfo, Student, WaitlistEntry, SmsLog } from '../types';
import { seedClasses, seedStudents, seedWaitlist, seedSmsLog } from './seed';

const STORAGE_KEY = 'waitlist_sms_db_v1';

export interface DB {
  classes: ClassInfo[];
  students: Student[];
  waitlist: WaitlistEntry[];
  smsLog: SmsLog[];
}

function seedDB(): DB {
  return {
    classes: [...seedClasses],
    students: [...seedStudents],
    waitlist: [...seedWaitlist],
    smsLog: [...seedSmsLog],
  };
}

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const db = seedDB();
      saveDB(db);
      return db;
    }
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.classes || !parsed.students || !parsed.waitlist || !parsed.smsLog) {
      throw new Error('corrupt db');
    }
    return parsed;
  } catch {
    const db = seedDB();
    saveDB(db);
    return db;
  }
}

export function saveDB(db: DB): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

export function resetDB(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}