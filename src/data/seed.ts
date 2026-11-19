import type { ClassInfo, Student, WaitlistEntry, SmsLog } from '../types';

export const seedClasses: ClassInfo[] = [
  { id: 'c1', name: 'Vinyasa Yoga — Beginner', capacity: 20, enrolled: 20, schedule: 'Mon/Wed 6:00 PM' },
  { id: 'c2', name: 'Strength Foundations', capacity: 15, enrolled: 15, schedule: 'Tue/Thu 7:00 AM' },
  { id: 'c3', name: 'Pilates Core', capacity: 12, enrolled: 10, schedule: 'Sat 9:00 AM' },
];

export const seedStudents: Student[] = [
  { id: 's1', name: 'Aarav Mehta', phone: '+919876543210', email: 'aarav@example.com' },
  { id: 's2', name: 'Priya Sharma', phone: '+919812345678', email: 'priya@example.com' },
];

export const seedWaitlist: WaitlistEntry[] = [
  { id: 'w1', studentId: 's1', classId: 'c1', position: 1, joinedAt: '2026-11-01T10:00:00Z', status: 'waiting' },
  { id: 'w2', studentId: 's2', classId: 'c1', position: 2, joinedAt: '2026-11-02T10:00:00Z', status: 'waiting' },
];

export const seedSmsLog: SmsLog[] = [];