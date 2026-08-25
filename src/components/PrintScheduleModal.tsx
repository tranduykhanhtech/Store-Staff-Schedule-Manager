import React, { useState } from 'react';
import { X, Printer, Calendar, Store, Download, Loader2 } from 'lucide-react';
import { Shift, StaffMember, StoreInfo } from '../types';
import { getWeekDates, getWeekRangeDisplay } from '../utils/dateUtils';
import { ROLE_LABELS, calculateShiftDurationHours, formatTime12H } from '../utils/staffHelpers';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface PrintScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  shifts: Shift[];
  staffList: StaffMember[];
  storeInfo: StoreInfo;
}

export const PrintScheduleModal: React.FC<PrintScheduleModalProps> = ({
  isOpen,
  onClose,
  weekStart,
  shifts,
  staffList,
  storeInfo,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const days = getWeekDates(weekStart);
  const weekRange = getWeekRangeDisplay(weekStart);

  const handleExportPDF = async () => {
    const element = document.getElementById('printable-area');
    if (!element) return;
    
    try {
      setIsExporting(true);
      const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const maxPdfWidth = pdf.internal.pageSize.getWidth();
      const maxPdfHeight = pdf.internal.pageSize.getHeight();
      
      let pdfWidth = maxPdfWidth;
      let pdfHeight = (img.height * maxPdfWidth) / img.width;
      
      // Scale down to fit height if necessary
      if (pdfHeight > maxPdfHeight) {
        pdfHeight = maxPdfHeight;
        pdfWidth = (img.width * maxPdfHeight) / img.height;
      }
      
      const xOffset = (maxPdfWidth - pdfWidth) / 2;
      const yOffset = (maxPdfHeight - pdfHeight) / 2;
      
      pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight);
      pdf.save(`Schedule_${weekRange.replace(/\s+/g, '_')}.pdf`);
    } catch (e: any) {
      console.error(e);
      alert(`Failed to export PDF. Error: ${e?.message || JSON.stringify(e) || e}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Group staff by role for structured roster
  const rolesOrder = ['store_manager', 'assistant_manager', 'supervisor', 'cashier', 'crewmember'] as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-300 overflow-hidden print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-400">
              <Download className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-extrabold">Export Weekly Schedule</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer hover:bg-slate-800 transition disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Wrapper (Scrollable on small screens) */}
        <div className="max-h-[85vh] overflow-auto bg-slate-100">
          {/* Printable Paper Area - Fixed min width to prevent cutoff on mobile exports */}
          <div id="printable-area" className="p-6 sm:p-8 bg-white min-w-[950px] mx-auto print:p-0">
            {/* Header on Paper */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-black text-xl tracking-tight">
                <Store className="h-6 w-6 text-slate-800" />
                <span>{storeInfo.name}</span>
                <span className="text-xs px-2 py-0.5 border border-slate-300 font-mono font-bold rounded-lg bg-slate-50">
                  Store #{storeInfo.storeNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {storeInfo.location} • Phone: {storeInfo.phone} • Store Manager: {storeInfo.managerName}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Schedule Roster</div>
              <div className="text-base font-extrabold text-indigo-950">{weekRange}</div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                  <th className="py-2.5 px-3 font-bold border-r border-slate-200 w-44">
                    Staff Member & Role
                  </th>
                  {days.map((d) => (
                    <th key={d.dateString} className="py-2.5 px-2 font-bold text-center border-r border-slate-200 last:border-r-0">
                      <div className="font-extrabold">{d.dayShort}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-normal">{d.monthDay}</div>
                    </th>
                  ))}
                  <th className="py-2.5 px-2 font-bold text-center w-16">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rolesOrder.map((roleKey) => {
                  const roleStaff = staffList.filter((s) => s.role === roleKey && s.status === 'active');
                  if (roleStaff.length === 0) return null;

                  return (
                    <React.Fragment key={roleKey}>
                      <tr className="bg-slate-50/80 font-bold text-slate-700">
                        <td colSpan={9} className="py-1.5 px-3 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100/70 border-b border-slate-200 text-slate-600">
                          {ROLE_LABELS[roleKey]}
                        </td>
                      </tr>
                      {roleStaff.map((staff) => {
                        let totalHours = 0;

                        return (
                          <tr key={staff.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                              <div className="font-bold text-slate-900">{staff.fullName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{staff.phone}</div>
                            </td>

                            {days.map((day) => {
                              const dayShifts = shifts.filter(
                                (s) => s.staffId === staff.id && s.date === day.dateString
                              );

                              return (
                                <td
                                  key={day.dateString}
                                  className="py-1.5 px-1.5 border-r border-slate-200 last:border-r-0 text-center align-middle"
                                >
                                  {dayShifts.map((shift) => {
                                    const isTimeOff = shift.status === 'weekend_off' || shift.status === 'annual_leave' || shift.status === 'training';
                                    const hours = isTimeOff ? 0 : calculateShiftDurationHours(
                                      shift.startTime,
                                      shift.endTime,
                                      shift.breakMinutes
                                    );
                                    totalHours += hours;

                                    if (isTimeOff) {
                                      return (
                                        <div
                                          key={shift.id}
                                          className={`border rounded-lg p-1 text-[9px] font-bold uppercase tracking-wider mb-1 shadow-2xs ${
                                            shift.status === 'weekend_off' ? 'bg-slate-100 border-slate-300 text-slate-500'
                                            : shift.status === 'annual_leave' ? 'bg-teal-50 border-teal-200 text-teal-700'
                                            : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700'
                                          }`}
                                        >
                                          {shift.status === 'weekend_off' ? 'Weekend Off' : shift.status === 'annual_leave' ? 'Annual Leave' : 'Training'}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div
                                        key={shift.id}
                                        className="bg-indigo-50/70 border border-indigo-200/80 rounded-lg p-1 text-[11px] mb-1 leading-tight text-slate-800 shadow-2xs"
                                      >
                                        <div className="font-extrabold text-indigo-950 font-mono text-[10px]">
                                          {formatTime12H(shift.startTime)} - {formatTime12H(shift.endTime)}
                                        </div>
                                        <div className="text-[9px] text-slate-600 truncate max-w-[90px] mx-auto font-medium">
                                          {shift.station}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {dayShifts.length === 0 && (
                                    <span className="text-slate-300 font-mono text-[10px]">OFF</span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="py-2 px-2 text-center font-extrabold font-mono text-slate-800 bg-slate-50/50">
                              {totalHours.toFixed(1)}h
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Schedule Policy Sign-off Footer for Bulletin */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[11px] text-slate-600 gap-4">
            <div className="space-y-0.5 whitespace-pre-wrap max-w-lg">
              <p className="font-bold text-slate-800">Store Attendance Guidelines:</p>
              <p>{storeInfo.attendanceGuidelines || "• Arrive 10 minutes prior to scheduled start time in full store uniform & name badge.\n• Shift trades require 24-hour supervisor approval and mutual sign-off in the log book."}</p>
            </div>
            <div className="flex gap-6 items-end shrink-0">
              <div>
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 font-medium">Store Manager Approval</span>
              </div>
              <div>
                <div className="w-28 border-b border-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 font-medium">Date Posted</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
