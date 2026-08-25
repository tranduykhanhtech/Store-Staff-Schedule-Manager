import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Copy, 
  Filter, 
  Layers, 
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Shift, StaffMember, StaffRole, StoreInfo } from '../types';
import { getWeekDates, getWeekRangeDisplay, formatDateToISO } from '../utils/dateUtils';
import { 
  ROLE_LABELS, 
  ROLE_COLORS, 
  calculateShiftDurationHours, 
  formatTime12H, 
  formatCurrency,
  STATIONS 
} from '../utils/staffHelpers';

interface ScheduleViewProps {
  currentWeekStart: Date;
  onChangeWeek: (offset: number) => void;
  onGoToCurrentWeek: () => void;
  shifts: Shift[];
  staffList: StaffMember[];
  storeInfo: StoreInfo;
  onOpenAddShift: (defaultDate?: string, defaultStaffId?: string) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onCopyPreviousWeek: () => void;
  onClearWeekShifts: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  currentWeekStart,
  onChangeWeek,
  onGoToCurrentWeek,
  shifts,
  staffList,
  storeInfo,
  onOpenAddShift,
  onEditShift,
  onDeleteShift,
  onCopyPreviousWeek,
  onClearWeekShifts,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'staff' | 'station'>('staff');

  const days = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);
  const weekRange = useMemo(() => getWeekRangeDisplay(currentWeekStart), [currentWeekStart]);

  // Filter staff based on role & search
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      if (staff.status !== 'active') return false;
      if (selectedRoleFilter !== 'all' && staff.role !== selectedRoleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = staff.fullName.toLowerCase().includes(q);
        const matchesPhone = staff.phone.includes(q);
        const matchesRole = ROLE_LABELS[staff.role].toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesRole) return false;
      }
      return true;
    });
  }, [staffList, selectedRoleFilter, searchQuery]);

  // Compute shifts within current week
  const weekDateStrings = useMemo(() => new Set(days.map((d) => d.dateString)), [days]);

  const currentWeekShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (!weekDateStrings.has(s.date)) return false;
      if (selectedStationFilter !== 'all' && s.station !== selectedStationFilter) return false;
      return true;
    });
  }, [shifts, weekDateStrings, selectedStationFilter]);

  // Metrics for current week
  const metrics = useMemo(() => {
    let totalHours = 0;
    let timeOffCount = 0;
    const staffHoursMap: Record<string, number> = {};

    currentWeekShifts.forEach((shift) => {
      const isTimeOff = shift.status === 'weekend_off' || shift.status === 'annual_leave' || shift.status === 'training';
      if (isTimeOff) timeOffCount++;
      const hours = isTimeOff ? 0 : calculateShiftDurationHours(shift.startTime, shift.endTime, shift.breakMinutes);
      totalHours += hours;

      staffHoursMap[shift.staffId] = (staffHoursMap[shift.staffId] || 0) + hours;
    });

    // Count overtime warnings (>40h)
    let overtimeCount = 0;
    Object.entries(staffHoursMap).forEach(([sId, hrs]) => {
      const staff = staffList.find((s) => s.id === sId);
      const max = staff ? staff.maxHoursPerWeek : 40;
      if (hrs > max) overtimeCount++;
    });

    return {
      totalShifts: currentWeekShifts.length,
      activeStaffCount: Object.keys(staffHoursMap).filter(id => staffHoursMap[id] > 0).length,
      totalHours: Number(totalHours.toFixed(1)),
      timeOffCount,
      overtimeCount,
      targetHours: storeInfo.targetWeeklyHours,
      varianceHours: Number((totalHours - storeInfo.targetWeeklyHours).toFixed(1)),
    };
  }, [currentWeekShifts, staffList, storeInfo]);

  // Map shifts by staffId & date for rapid cell lookup
  const shiftsByStaffAndDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    currentWeekShifts.forEach((s) => {
      const key = `${s.staffId}_${s.date}`;
      const existing = map.get(key) || [];
      existing.push(s);
      map.set(key, existing);
    });
    return map;
  }, [currentWeekShifts]);

  return (
    <div className="space-y-4">
      {/* Top Bento Row: Hero Spotlight & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Spotlight Hero Bento Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-indigo-900 rounded-2xl shadow-sm p-5 text-white flex flex-col justify-between relative overflow-hidden border border-indigo-800">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Labor & Budget Overview
              </span>
              <span className="px-2 py-0.5 bg-indigo-800/80 border border-indigo-700 rounded-md text-[10px] font-mono text-indigo-200">
                {weekRange}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight font-mono">
                {metrics.totalHours} <span className="text-sm font-normal text-indigo-300 font-sans">/ {metrics.targetHours}h Target</span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Time-Off & Leaves: <strong className="text-white font-mono">{metrics.timeOffCount} shifts</strong>
              </p>
            </div>

            {/* Progress Bar towards target weekly hours */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-indigo-300 mb-1">
                <span>Weekly Schedule Capacity</span>
                <span className="font-mono font-bold text-white">
                  {Math.round((metrics.totalHours / (metrics.targetHours || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-indigo-950/70 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.totalHours > metrics.targetHours ? 'bg-amber-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((metrics.totalHours / (metrics.targetHours || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-800/80 flex items-center justify-between text-xs text-indigo-200 relative z-10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>{filteredStaff.length} Staff on Roster</span>
            </div>
            <button
              onClick={() => onOpenAddShift()}
              className="px-3 py-1 bg-white text-indigo-950 font-bold rounded-lg text-xs hover:bg-indigo-50 transition active:scale-95 cursor-pointer shadow-xs"
            >
              + Quick Shift
            </button>
          </div>
        </div>

        {/* 4 Bento Metric Cards Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Shifts</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{metrics.totalShifts}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across 7 days roster</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{metrics.activeStaffCount} <span className="text-sm font-medium text-slate-400">/ {staffList.length}</span></div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Staff members scheduled
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Store Target</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{storeInfo.targetWeeklyHours}h</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {metrics.varianceHours > 0 ? `+${metrics.varianceHours}h over` : `${Math.abs(metrics.varianceHours)}h remaining`}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overtime / Alerts</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${metrics.overtimeCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-extrabold font-mono ${metrics.overtimeCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {metrics.overtimeCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {metrics.overtimeCount > 0 ? 'Staff exceeding max hours' : 'Zero overtime conflicts'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Controls & Filters Bento Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Week Navigation */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <button
                id="btn-prev-week"
                onClick={() => onChangeWeek(-1)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer shrink-0"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="px-2 sm:px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center flex-1 sm:min-w-[200px]">
                <div className="text-xs font-bold text-slate-900 whitespace-nowrap">{weekRange}</div>
              </div>

              <button
                id="btn-next-week"
                onClick={() => onChangeWeek(1)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer shrink-0"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              id="btn-today-week"
              onClick={onGoToCurrentWeek}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
            >
              This Week
            </button>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search staff name / phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-52"
            />

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="all">All Roles (5)</option>
              <option value="store_manager">Store Manager</option>
              <option value="assistant_manager">Assistant Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="cashier">Cashier</option>
              <option value="crewmember">Crewmember</option>
            </select>

            <select
              value={selectedStationFilter}
              onChange={(e) => setSelectedStationFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Stations</option>
              {STATIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              onClick={() => onOpenAddShift()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Weekly Scheduling Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="py-3 px-4 font-bold w-60 sticky left-0 z-20 bg-slate-900 border-r border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Staff Member & Role</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {filteredStaff.length} active
                    </span>
                  </div>
                </th>
                {days.map((day) => (
                  <th
                    key={day.dateString}
                    className={`py-3 px-2 font-bold text-center border-r border-slate-800 last:border-r-0 ${
                      day.isToday ? 'bg-indigo-950 text-indigo-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{day.dayShort}</span>
                      {day.isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">
                      {day.monthDay}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 font-bold text-center w-24 bg-slate-900">
                  Weekly Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const roleConfig = ROLE_COLORS[staff.role];
                
                // Calculate staff's total hours for this week
                const staffWeeklyShifts = currentWeekShifts.filter((s) => s.staffId === staff.id);
                const staffHoursTotal = staffWeeklyShifts.reduce(
                  (sum, s) => {
                    const isTimeOff = s.status === 'weekend_off' || s.status === 'annual_leave' || s.status === 'training';
                    return sum + (isTimeOff ? 0 : calculateShiftDurationHours(s.startTime, s.endTime, s.breakMinutes));
                  },
                  0
                );
                const isOverLimit = staffHoursTotal > staff.maxHoursPerWeek;

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition group">
                    {/* Left Sticky Staff Column */}
                    <td className="py-3 px-4 border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${roleConfig.initialBg} ${roleConfig.initialText} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                            {staff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="text-xs">{staff.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${roleConfig.badge}`}>
                                {ROLE_LABELS[staff.role]}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {staff.phone}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenAddShift(undefined, staff.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Schedule shift for this staff"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* 7 Days Columns */}
                    {days.map((day) => {
                      const dayShifts = shiftsByStaffAndDate.get(`${staff.id}_${day.dateString}`) || [];

                      return (
                        <td
                          key={day.dateString}
                          className={`py-2 px-1.5 border-r border-slate-100 last:border-r-0 align-top min-w-[110px] ${
                            day.isToday ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <div className="min-h-[56px] flex flex-col justify-center gap-1.5">
                            {dayShifts.map((shift) => {
                              const isTimeOff = shift.status === 'weekend_off' || shift.status === 'annual_leave' || shift.status === 'training';
                              const shiftDuration = isTimeOff ? 0 : calculateShiftDurationHours(
                                shift.startTime,
                                shift.endTime,
                                shift.breakMinutes
                              );
                              
                              if (isTimeOff) {
                                return (
                                  <div
                                    key={shift.id}
                                    onClick={() => onEditShift(shift)}
                                    className={`p-2 rounded-xl border text-center cursor-pointer transition shadow-2xs hover:shadow-md hover:scale-[1.02] ${
                                      shift.status === 'weekend_off' ? 'bg-slate-100 border-slate-300 text-slate-500 border-l-4 border-l-slate-400' 
                                      : shift.status === 'annual_leave' ? 'bg-teal-50 border-teal-200 text-teal-700 border-l-4 border-l-teal-500'
                                      : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 border-l-4 border-l-fuchsia-500'
                                    }`}
                                  >
                                    <div className="font-bold text-[10px] uppercase tracking-wider">
                                      {shift.status === 'weekend_off' ? 'Weekend Off' : shift.status === 'annual_leave' ? 'Annual Leave' : 'Training'}
                                    </div>
                                  </div>
                                );
                              }

                              const shiftRoleConfig = ROLE_COLORS[shift.role] || roleConfig;

                              return (
                                <div
                                  key={shift.id}
                                  onClick={() => onEditShift(shift)}
                                  className={`p-2 rounded-xl border text-left cursor-pointer transition shadow-2xs hover:shadow-md hover:scale-[1.02] ${shiftRoleConfig.bg} ${shiftRoleConfig.border} ${shiftRoleConfig.leftBorder}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[11px] text-slate-900 font-mono">
                                      {formatTime12H(shift.startTime)}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {shiftDuration}h
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-600">
                                    to {formatTime12H(shift.endTime)}
                                  </div>
                                  <div className="text-[9px] font-medium text-slate-700 truncate mt-0.5" title={shift.station}>
                                    {shift.station}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Empty Slot Action */}
                            {dayShifts.length === 0 && (
                              <button
                                onClick={() => onOpenAddShift(day.dateString, staff.id)}
                                className="w-full h-12 border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-xl text-slate-300 hover:text-indigo-600 transition flex items-center justify-center group/btn cursor-pointer"
                                title={`Add shift for ${staff.fullName} on ${day.monthDay}`}
                              >
                                <Plus className="h-3.5 w-3.5 opacity-0 group-hover/btn:opacity-100 transition" />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Hours Column */}
                    <td className="py-3 px-3 text-center align-middle bg-slate-50/50">
                      <div className={`font-bold font-mono text-xs ${isOverLimit ? 'text-rose-600' : 'text-slate-900'}`}>
                        {staffHoursTotal.toFixed(1)}h
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        max {staff.maxHoursPerWeek}h
                      </div>
                      {isOverLimit && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded">
                          OVERTIME
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No active staff members match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Schedule Bottom Toolbar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Role Color Legend:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Store Manager
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Asst. Manager
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Supervisor
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Cashier
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Crewmember
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCopyPreviousWeek}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
              title="Duplicate previous week's shift pattern into this week"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Prev Week</span>
            </button>

            <button
              onClick={onClearWeekShifts}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear This Week</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
