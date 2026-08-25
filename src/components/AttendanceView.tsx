import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  UserCheck, 
  Coffee, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Phone,
  Store,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Shift, StaffMember, StoreInfo } from '../types';
import { ROLE_LABELS, ROLE_COLORS, STATIONS, formatTime12H, calculateShiftDurationHours } from '../utils/staffHelpers';

interface AttendanceViewProps {
  shifts: Shift[];
  staffList: StaffMember[];
  storeInfo: StoreInfo;
  onUpdateShiftStatus: (shiftId: string, status: Shift['status']) => void;
  onOpenAddShift: (defaultDate?: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  shifts,
  staffList,
  storeInfo,
  onUpdateShiftStatus,
  onOpenAddShift,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const handleDateShift = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const todayShifts = useMemo(() => {
    return shifts.filter((s) => {
      const isTimeOff = s.status === 'weekend_off' || s.status === 'annual_leave' || s.status === 'training';
      return s.date === selectedDate && !isTimeOff;
    });
  }, [shifts, selectedDate]);

  // Group by station coverage
  const stationCoverage = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    STATIONS.forEach((st) => {
      map[st] = [];
    });

    todayShifts.forEach((s) => {
      if (map[s.station]) {
        map[s.station].push(s);
      } else {
        map[s.station] = [s];
      }
    });

    return map;
  }, [todayShifts]);

  // Staff currently working vs upcoming vs done
  const attendanceGroups = useMemo(() => {
    const scheduled = todayShifts.filter((s) => s.status === 'scheduled');
    const confirmed = todayShifts.filter((s) => s.status === 'confirmed');
    const clockedIn = todayShifts.filter((s) => s.status === 'clocked_in');
    const completed = todayShifts.filter((s) => s.status === 'completed');
    const absent = todayShifts.filter((s) => s.status === 'absent');

    return { scheduled, confirmed, clockedIn, completed, absent };
  }, [todayShifts]);

  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="space-y-5">
      {/* Date Header & Quick Summary */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
              <span className="text-xs font-extrabold text-slate-700 hidden md:inline">
                {formattedSelectedDate}
              </span>
            </div>

            <button
              onClick={() => handleDateShift(1)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-xl transition cursor-pointer"
            >
              Today
            </button>
          </div>

          <button
            onClick={() => onOpenAddShift(selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shift for {selectedDate}</span>
          </button>
        </div>

        {/* Daily Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Scheduled Today</div>
            <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
              {todayShifts.length} Staff Shifts
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Clocked-In / Active</div>
            <div className="text-base font-black text-emerald-600 mt-0.5 font-mono">
              {attendanceGroups.clockedIn.length + attendanceGroups.confirmed.length} On Duty
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Completed Shifts</div>
            <div className="text-base font-black text-indigo-600 mt-0.5 font-mono">
              {attendanceGroups.completed.length} Finished
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Call-outs / Absent</div>
            <div className="text-base font-black text-rose-600 mt-0.5 font-mono">
              {attendanceGroups.absent.length} Call-outs
            </div>
          </div>
        </div>
      </div>

      {/* Main Roster List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Shift Floor Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Floor Staffing Roster for {formattedSelectedDate}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {todayShifts.length} shifts scheduled
              </span>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {todayShifts.map((shift) => {
                const staff = staffList.find((s) => s.id === shift.staffId);
                const roleConfig = ROLE_COLORS[shift.role] || ROLE_COLORS.crewmember;
                const hours = calculateShiftDurationHours(shift.startTime, shift.endTime, shift.breakMinutes);

                return (
                  <div
                    key={shift.id}
                    className="p-3 hover:bg-slate-50/80 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-800 shrink-0">
                        {staff?.fullName.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{staff?.fullName || 'Unassigned'}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border uppercase tracking-wider ${roleConfig.badge}`}>
                            {ROLE_LABELS[shift.role]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                          <span className="font-bold text-slate-900">
                            {formatTime12H(shift.startTime)} – {formatTime12H(shift.endTime)} ({hours}h)
                          </span>
                          <span>•</span>
                          <span className="text-slate-600 font-sans flex items-center gap-1 font-medium">
                            <MapPin className="h-3 w-3 text-slate-400" /> {shift.station}
                          </span>
                        </div>
                        {shift.notes && (
                          <div className="text-[11px] text-slate-500 mt-1 italic">
                            Note: {shift.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Toggle buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <select
                        value={shift.status}
                        onChange={(e) => onUpdateShiftStatus(shift.id, e.target.value as Shift['status'])}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border bg-white cursor-pointer ${
                          shift.status === 'clocked_in'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : shift.status === 'confirmed'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : shift.status === 'completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : shift.status === 'absent'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="clocked_in">🟢 Clocked In</option>
                        <option value="completed">✓ Completed</option>
                        <option value="absent">⚠️ Absent / Call-out</option>
                      </select>

                      {staff?.phone && (
                        <a
                          href={`tel:${staff.phone}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                          title={`Call ${staff.fullName}`}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {todayShifts.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600 text-sm">No shifts scheduled for this date</p>
                  <button
                    onClick={() => onOpenAddShift(selectedDate)}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    + Click here to add a shift
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Station Coverage Matrix */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Daily Station Coverage
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time audit of assigned floor stations for {selectedDate}
            </p>

            <div className="space-y-2.5">
              {STATIONS.map((station) => {
                const assignedShifts = stationCoverage[station] || [];
                const isCovered = assignedShifts.length > 0;

                return (
                  <div
                    key={station}
                    className={`p-2.5 rounded-xl border transition ${
                      isCovered
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{station}</span>
                      {isCovered ? (
                        <span className="font-extrabold text-emerald-700 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {assignedShifts.length} Staff
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">Unstaffed</span>
                      )}
                    </div>
                    {isCovered && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {assignedShifts.map((s) => {
                          const staff = staffList.find((st) => st.id === s.staffId);
                          return (
                            <span
                              key={s.id}
                              className="text-[10px] bg-white px-2 py-0.5 rounded-lg border border-emerald-200 text-emerald-900 font-bold"
                            >
                              {staff?.fullName.split(' ')[0]} ({formatTime12H(s.startTime)})
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
