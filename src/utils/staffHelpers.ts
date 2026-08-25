import { StaffRole, PaperworkType, PaperworkStatus, ShiftPreset } from '../types';

export const SHIFT_PRESETS: ShiftPreset[] = [
  {
    id: 'open',
    name: 'Morning Opening',
    startTime: '06:30',
    endTime: '15:00',
    defaultBreak: 30,
    description: 'Store opening, cash drawers setup, morning deliveries check',
  },
  {
    id: 'mid',
    name: 'Mid-Day Peak',
    startTime: '10:30',
    endTime: '19:00',
    defaultBreak: 30,
    description: 'Rush hour coverage, restocking, lunch & afternoon customer peak',
  },
  {
    id: 'close',
    name: 'Evening Closing',
    startTime: '14:30',
    endTime: '23:00',
    defaultBreak: 30,
    description: 'Evening floor recovery, register count, end of day cleanup & lockup',
  },
  {
    id: 'short',
    name: 'Part-Time Shift',
    startTime: '16:00',
    endTime: '21:00',
    defaultBreak: 15,
    description: 'Peak 5-hour evening support shift',
  },
];

export const ROLE_LABELS: Record<StaffRole, string> = {
  store_manager: 'Store Manager',
  assistant_manager: 'Assistant Manager',
  supervisor: 'Supervisor',
  cashier: 'Cashier',
  crewmember: 'Crewmember',
};

export const ROLE_COLORS: Record<StaffRole, { bg: string; text: string; border: string; badge: string; dot: string; leftBorder: string; initialBg: string; initialText: string }> = {
  store_manager: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    dot: 'bg-purple-600',
    leftBorder: 'border-l-4 border-purple-500',
    initialBg: 'bg-purple-100',
    initialText: 'text-purple-700',
  },
  assistant_manager: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-600',
    leftBorder: 'border-l-4 border-blue-500',
    initialBg: 'bg-blue-100',
    initialText: 'text-blue-700',
  },
  supervisor: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
    leftBorder: 'border-l-4 border-emerald-500',
    initialBg: 'bg-emerald-100',
    initialText: 'text-emerald-700',
  },
  cashier: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-600',
    leftBorder: 'border-l-4 border-amber-400',
    initialBg: 'bg-amber-100',
    initialText: 'text-amber-700',
  },
  crewmember: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-600',
    leftBorder: 'border-l-4 border-slate-400',
    initialBg: 'bg-slate-100',
    initialText: 'text-slate-700',
  },
};

export const PAPERWORK_LABELS: Record<PaperworkType, string> = {
  employment_contract: 'Employment Agreement',
  tax_w4_i9: 'I-9 / W-4 Tax Form',
  food_safety_cert: 'Food Safety & ServSafe',
  onboarding_training: 'Training & Checklist',
  incident_report: 'Incident / Hazard Report',
  performance_review: 'Performance Review',
  disciplinary_notice: 'Policy / Disciplinary Notice',
};

export const PAPERWORK_STATUS_CONFIG: Record<PaperworkStatus, { label: string; badge: string }> = {
  valid: {
    label: 'COMPLETED',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  expiring_soon: {
    label: 'URGENT',
    badge: 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse',
  },
  expired: {
    label: 'EXPIRED',
    badge: 'bg-rose-100 text-rose-700 border-rose-300',
  },
  pending_review: {
    label: 'PENDING',
    badge: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  archived: {
    label: 'ARCHIVED',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

export const STATIONS = [
  'Storefront',
  'Kitchen',
  'Janitorial',
];

export function calculateShiftDurationHours(startTime: string, endTime: string, breakMinutes: number = 0): number {
  if (!startTime || !endTime) return 0;
  
  let [startH, startM] = startTime.split(':').map(Number);
  let [endH, endM] = endTime.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return 0;
  }
  
  const validBreak = isNaN(breakMinutes) ? 0 : breakMinutes;

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  // Handles overnight shift
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const totalWorkedMinutes = Math.max(0, endMinutes - startMinutes - validBreak);
  return Number((totalWorkedMinutes / 60).toFixed(2));
}

export function formatTime12H(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minsStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minsStr} ${ampm}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
