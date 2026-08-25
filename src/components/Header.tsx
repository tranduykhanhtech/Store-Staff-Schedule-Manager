import React from 'react';
import { 
  Users, 
  CalendarDays, 
  FileText, 
  Clock, 
  Plus, 
  Store, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer
} from 'lucide-react';
import { StoreInfo, PaperworkRecord } from '../types';

interface HeaderProps {
  storeInfo: StoreInfo;
  activeTab: 'schedule' | 'staff' | 'paperwork' | 'attendance';
  setActiveTab: (tab: 'schedule' | 'staff' | 'paperwork' | 'attendance') => void;
  onOpenAddStaff: () => void;
  onOpenAddShift: () => void;
  onOpenAddPaperwork: () => void;
  onOpenPrint: () => void;
  onResetData: () => void;
  onOpenStoreSettings: () => void;
  paperworkRecords: PaperworkRecord[];
  totalStaffCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  storeInfo,
  activeTab,
  setActiveTab,
  onOpenAddStaff,
  onOpenAddShift,
  onOpenAddPaperwork,
  onOpenPrint,
  onResetData,
  onOpenStoreSettings,
  paperworkRecords,
  totalStaffCount,
}) => {
  // Count compliance alerts
  const urgentPaperwork = paperworkRecords.filter(
    r => r.status === 'expiring_soon' || r.status === 'expired' || r.status === 'pending_review'
  );

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Store Information & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>{storeInfo.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 font-mono">
                    Store #{storeInfo.storeNumber}
                  </span>
                  <button 
                    onClick={onOpenStoreSettings}
                    className="ml-1 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    title="Edit Store Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                </h1>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                <span>Manager: <strong className="text-slate-700 font-medium">{storeInfo.managerName}</strong></span>
                <span>•</span>
                <span>{storeInfo.phone}</span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">{totalStaffCount} Staff Members</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-print-roster"
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl border border-slate-200 transition active:scale-95 cursor-pointer"
              title="Export current weekly schedule roster to PDF"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>

            <button
              id="btn-reset-demo"
              onClick={onResetData}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Hot reload data from Google Sheets"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reload</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block mx-0.5" />

            <button
              id="btn-quick-add-shift"
              onClick={onOpenAddShift}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Shift</span>
            </button>

            <button
              id="btn-quick-add-staff"
              onClick={onOpenAddStaff}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between pt-1.5 pb-2 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1.5 py-0.5" aria-label="Tabs">
            <button
              id="tab-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Weekly Shifts</span>
            </button>

            <button
              id="tab-staff"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Staff & Roles</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-mono ${
                activeTab === 'staff' ? 'bg-indigo-700/80 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalStaffCount}
              </span>
            </button>

            <button
              id="tab-paperwork"
              onClick={() => setActiveTab('paperwork')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'paperwork'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Paperwork & Records</span>
              {urgentPaperwork.length > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                  activeTab === 'paperwork' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {urgentPaperwork.length}
                </span>
              )}
            </button>

            <button
              id="tab-attendance"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Daily Live Roster</span>
            </button>
          </nav>

          {urgentPaperwork.length > 0 && activeTab !== 'paperwork' && (
            <button
              onClick={() => setActiveTab('paperwork')}
              className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{urgentPaperwork.length} paperwork item(s) need attention</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
