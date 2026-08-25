export type StaffRole = 
  | 'crewmember'
  | 'cashier'
  | 'supervisor'
  | 'assistant_manager'
  | 'store_manager';

export type StaffStatus = 'active' | 'on_leave' | 'inactive';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: StaffRole;
  avatarUrl?: string;
  status: StaffStatus;
  hourlyWage: number;
  hireDate: string; // YYYY-MM-DD
  maxHoursPerWeek: number;
  stationSpecialties: string[];
  emergencyContact: EmergencyContact;
  notes?: string;
}

export type PaperworkType = 
  | 'employment_contract'
  | 'tax_w4_i9'
  | 'food_safety_cert'
  | 'onboarding_training'
  | 'incident_report'
  | 'performance_review'
  | 'disciplinary_notice';

export type PaperworkStatus = 'valid' | 'expiring_soon' | 'expired' | 'pending_review' | 'archived';

export interface PaperworkRecord {
  id: string;
  staffId: string;
  type: PaperworkType;
  title: string;
  referenceNumber: string;
  issuedDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD (optional for contracts/incidents)
  status: PaperworkStatus;
  fileAttachmentName?: string;
  fileSize?: string;
  summary: string;
  signedByStaff: boolean;
  signedAt?: string;
  reviewerName?: string;
  severityLevel?: 'low' | 'medium' | 'high';
  contentDetails?: string;
}

export type ShiftStatus = 'scheduled' | 'confirmed' | 'clocked_in' | 'completed' | 'absent' | 'weekend_off' | 'annual_leave' | 'training';

export interface Shift {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  role: StaffRole;
  station: string;
  breakMinutes: number;
  status: ShiftStatus;
  notes?: string;
  actualClockIn?: string;
  actualClockOut?: string;
}

export interface ShiftPreset {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  defaultBreak: number;
  description: string;
}

export interface StoreInfo {
  name: string;
  storeNumber: string;
  location: string;
  managerName: string;
  phone: string;
  targetWeeklyHours: number;
  standardStations: string[];
  attendanceGuidelines?: string;
}
