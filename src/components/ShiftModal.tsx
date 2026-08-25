import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Calendar, User, MapPin, Coffee, AlertCircle, Sparkles } from 'lucide-react';
import { Shift, StaffMember, StaffRole } from '../types';
import { ROLE_LABELS, STATIONS, calculateShiftDurationHours, formatTime12H, SHIFT_PRESETS } from '../utils/staffHelpers';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Shift) => void;
  onDelete?: (shiftId: string) => void;
  editingShift?: Shift | null;
  staffList: StaffMember[];
  allShifts: Shift[];
  defaultDate?: string;
  defaultStaffId?: string;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingShift,
  staffList,
  allShifts,
  defaultDate,
  defaultStaffId,
}) => {
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:30');
  const [role, setRole] = useState<StaffRole>('crewmember');
  const [station, setStation] = useState(STATIONS[0]);
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [status, setStatus] = useState<Shift['status']>('scheduled');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingShift) {
      setStaffId(editingShift.staffId);
      setDate(editingShift.date);
      setStartTime(editingShift.startTime);
      setEndTime(editingShift.endTime);
      setRole(editingShift.role);
      setStation(editingShift.station);
      setBreakMinutes(editingShift.breakMinutes);
      setStatus(editingShift.status);
      setNotes(editingShift.notes || '');
    } else {
      const selectedStaff = defaultStaffId 
        ? staffList.find(s => s.id === defaultStaffId) 
        : staffList[0];

      setStaffId(selectedStaff ? selectedStaff.id : (staffList[0]?.id || ''));
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime('08:00');
      setEndTime('16:30');
      setRole(selectedStaff ? selectedStaff.role : 'crewmember');
      setStation(selectedStaff?.stationSpecialties?.[0] || STATIONS[0]);
      setBreakMinutes(30);
      setStatus('scheduled');
      setNotes('');
    }
    setError('');
  }, [editingShift, isOpen, defaultDate, defaultStaffId, staffList]);

  // When staff changes, automatically update the default role and preferred station
  const handleStaffChange = (newStaffId: string) => {
    setStaffId(newStaffId);
    const member = staffList.find(s => s.id === newStaffId);
    if (member) {
      setRole(member.role);
      if (member.stationSpecialties?.length > 0) {
        setStation(member.stationSpecialties[0]);
      }
    }
  };

  const selectedStaffMember = staffList.find(s => s.id === staffId);
  const isTimeOff = status === 'weekend_off' || status === 'annual_leave' || status === 'training';
  const shiftHours = isTimeOff ? 0 : calculateShiftDurationHours(startTime, endTime, breakMinutes);

  // Calculate conflict checks
  const conflicts = useMemo(() => {
    if (!staffId || !date) return [];
    const issues: string[] = [];

    // Check if staff has another shift on the same day (excluding current editing shift)
    const existingSameDay = allShifts.filter(
      s => s.staffId === staffId && s.date === date && (!editingShift || s.id !== editingShift.id)
    );
    if (existingSameDay.length > 0) {
      issues.push(`Staff member is already scheduled for ${existingSameDay.length} other shift(s) on ${date}`);
    }

    // Check total weekly hours
    if (selectedStaffMember) {
      const weeklyShifts = allShifts.filter(
        s => s.staffId === staffId && (!editingShift || s.id !== editingShift.id)
      );
      const totalPriorHours = weeklyShifts.reduce(
        (sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime, s.breakMinutes),
        0
      );
      const newTotal = totalPriorHours + shiftHours;
      if (newTotal > selectedStaffMember.maxHoursPerWeek) {
        issues.push(`Exceeds max weekly target: Scheduled ${newTotal.toFixed(1)}h / Max ${selectedStaffMember.maxHoursPerWeek}h`);
      }
    }

    return issues;
  }, [staffId, date, startTime, endTime, breakMinutes, allShifts, editingShift, selectedStaffMember, shiftHours]);

  if (!isOpen) return null;

  const applyPreset = (preset: typeof SHIFT_PRESETS[0]) => {
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
    setBreakMinutes(preset.defaultBreak);
  };

  const addHours = (start: string, hours: number) => {
    if (!start) return;
    const [h, m] = start.split(':').map(Number);
    let newH = (h + hours) % 24;
    const formattedH = newH.toString().padStart(2, '0');
    const formattedM = m.toString().padStart(2, '0');
    setEndTime(`${formattedH}:${formattedM}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) {
      setError('Please select a staff member');
      return;
    }
    if (!date) {
      setError('Please select a shift date');
      return;
    }
    if (!startTime || !endTime) {
      setError('Please provide valid start and end times');
      return;
    }

    const newShift: Shift = {
      id: editingShift ? editingShift.id : `shift-${staffId}-${Date.now()}`,
      staffId,
      date,
      startTime,
      endTime,
      role,
      station,
      breakMinutes,
      status,
      notes: notes.trim(),
    };

    onSave(newShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {editingShift ? 'Edit Scheduled Shift' : 'Schedule New Shift'}
              </h2>
              <p className="text-xs text-slate-500">
                Assign team member, role station, and working hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Scheduling Warnings</span>
              </div>
              {conflicts.map((msg, i) => (
                <p key={i} className="text-xs text-amber-700 ml-5">• {msg}</p>
              ))}
            </div>
          )}

          {/* Quick Presets */}
          {!isTimeOff && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Quick Time Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHIFT_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-left border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-800">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {formatTime12H(preset.startTime)} - {formatTime12H(preset.endTime)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Staff Member & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Staff Member *
              </label>
              <select
                required
                value={staffId}
                onChange={(e) => handleStaffChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({ROLE_LABELS[staff.role]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shift Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Time & Break */}
          {!isTimeOff && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button type="button" onClick={() => addHours(startTime, 4)} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer">+4h</button>
                    <button type="button" onClick={() => addHours(startTime, 8)} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer">+8h</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Break (Mins)</label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    max="120"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Calculated Duration Pill */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  Net Paid Duration:
                </span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {shiftHours} hours
                  {selectedStaffMember && (
                    <span className="font-normal text-slate-500 ml-1.5">
                      (Est. ${(shiftHours * selectedStaffMember.hourlyWage).toFixed(2)})
                    </span>
                  )}
                </span>
              </div>
            </>
          )}

          {/* Role & Station */}
          {!isTimeOff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Active Role for Shift
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="crewmember">Crewmember</option>
                  <option value="cashier">Cashier</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="assistant_manager">Assistant Manager</option>
                  <option value="store_manager">Store Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Station
                </label>
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
                >
                  {STATIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Shift Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Shift['status'])}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="clocked_in">Clocked In</option>
                <option value="completed">Completed</option>
                <option value="absent">Absent / Call-out</option>
                <option value="weekend_off">Weekend Off</option>
                <option value="annual_leave">Annual Leave</option>
                <option value="training">Training</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift Instructions / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Audit register drawers, train new cashier"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            {editingShift && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this shift?')) {
                    onDelete(editingShift.id);
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Delete Shift
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                {editingShift ? 'Update Shift' : 'Add to Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
