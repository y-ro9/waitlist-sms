export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  schedule: string;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'enrolled' | 'expired';

export interface WaitlistEntry {
  id: string;
  studentId: string;
  classId: string;
  position: number;
  joinedAt: string;
  status: WaitlistStatus;
  notifiedAt?: string;
}

export interface SmsLog {
  id: string;
  waitlistEntryId: string;
  phone: string;
  message: string;
  status: 'sent' | 'failed';
  sentAt: string;
}