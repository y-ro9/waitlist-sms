import type { ClassInfo, Student, WaitlistEntry, SmsLog } from '../types';
import { loadDB, saveDB } from '../data/store';
import { sanitizeInput } from '../utils/sanitize';
import { validateEmail, validateName, validatePhone } from '../utils/validation';
import { sendSms } from '../utils/twilioMock';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface WaitlistEntryView extends WaitlistEntry {
  student: Student;
}

export interface AddWaitlistInput {
  name: string;
  phone: string;
  email: string;
}

export class ValidationError extends Error {
  constructor(public field: 'name' | 'phone' | 'email', message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function getClasses(): Promise<ClassInfo[]> {
  await delay(200);
  return loadDB().classes;
}

export async function getWaitlist(classId: string): Promise<WaitlistEntryView[]> {
  await delay(250);
  const db = loadDB();
  const rows: WaitlistEntryView[] = [];
  for (const w of db.waitlist.filter((x) => x.classId === classId)) {
    const student = db.students.find((s) => s.id === w.studentId);
    if (student) rows.push({ ...w, student });
  }
  return rows.sort((a, b) => a.position - b.position);
}

export async function addToWaitlist(
  classId: string,
  input: AddWaitlistInput,
): Promise<WaitlistEntryView> {
  const nameErr = validateName(input.name);
  if (nameErr) throw new ValidationError('name', nameErr);
  const phoneErr = validatePhone(input.phone);
  if (phoneErr) throw new ValidationError('phone', phoneErr);
  const emailErr = validateEmail(input.email);
  if (emailErr) throw new ValidationError('email', emailErr);

  const cleanName = sanitizeInput(input.name);
  const cleanPhone = sanitizeInput(input.phone);
  const cleanEmail = sanitizeInput(input.email);

  await delay(300);

  const db = loadDB();
  const studentId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const student: Student = {
    id: studentId,
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
  };
  db.students.push(student);

  const positions = db.waitlist.filter((w) => w.classId === classId).map((w) => w.position);
  const nextPos = positions.length ? Math.max(...positions) + 1 : 1;

  const entry: WaitlistEntry = {
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    studentId,
    classId,
    position: nextPos,
    joinedAt: new Date().toISOString(),
    status: 'waiting',
  };
  db.waitlist.push(entry);
  saveDB(db);

  return { ...entry, student };
}

export async function notifyWaitlistEntry(entryId: string, message: string): Promise<SmsLog> {
  const db = loadDB();
  const entry = db.waitlist.find((w) => w.id === entryId);
  if (!entry) throw new Error('Waitlist entry not found');
  const student = db.students.find((s) => s.id === entry.studentId);
  if (!student) throw new Error('Student not found');

  const cleanMessage = sanitizeInput(message);
  const result = await sendSms(student.phone, cleanMessage);

  const log: SmsLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    waitlistEntryId: entryId,
    phone: student.phone,
    message: cleanMessage,
    status: result.status,
    sentAt: result.sentAt,
  };
  db.smsLog.push(log);

  if (result.status === 'sent') {
    const target = db.waitlist.find((w) => w.id === entryId);
    if (target) {
      target.status = 'notified';
      target.notifiedAt = result.sentAt;
    }
  }
  saveDB(db);
  return log;
}

export async function getSmsLogs(classId: string): Promise<SmsLog[]> {
  await delay(150);
  const db = loadDB();
  const entryIds = new Set(db.waitlist.filter((w) => w.classId === classId).map((w) => w.id));
  return db.smsLog
    .filter((l) => entryIds.has(l.waitlistEntryId))
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}