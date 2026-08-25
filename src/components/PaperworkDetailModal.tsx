import React from 'react';
import { X, FileText, CheckCircle, AlertTriangle, Printer, Calendar, User, ShieldCheck, Download, Edit3 } from 'lucide-react';
import { PaperworkRecord, StaffMember } from '../types';
import { PAPERWORK_LABELS, PAPERWORK_STATUS_CONFIG, ROLE_LABELS } from '../utils/staffHelpers';

interface PaperworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PaperworkRecord | null;
  staff: StaffMember | undefined;
  onEdit: (record: PaperworkRecord) => void;
  onToggleSign?: (recordId: string) => void;
}

export const PaperworkDetailModal: React.FC<PaperworkDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  staff,
  onEdit,
  onToggleSign,
}) => {
  if (!isOpen || !record) return null;

  const statusConfig = PAPERWORK_STATUS_CONFIG[record.status] || {
    label: record.status,
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all print:shadow-none print:border-none print:max-w-full">
        {/* Header bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:bg-white print:text-black print:border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold print:border">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                {PAPERWORK_LABELS[record.type]}
              </span>
              <h2 className="text-base font-extrabold text-white leading-tight print:text-black">
                {record.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => onEdit(record)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Edit record"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Print document"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body document view */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Metadata bento box */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Associated Employee</div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                <span>{staff?.fullName || 'Unknown Staff'}</span>
                {staff && (
                  <span className="text-xs font-normal text-slate-500">
                    ({ROLE_LABELS[staff.role]})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Phone: {staff?.phone || 'N/A'} • Ref: {record.referenceNumber}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={`text-xs px-2.5 py-1 rounded-xl font-bold uppercase border ${statusConfig.badge}`}>
                {statusConfig.label}
              </span>
              {record.expiryDate && (
                <span className="text-xs text-slate-500 font-mono mt-1">
                  Expires: {record.expiryDate}
                </span>
              )}
            </div>
          </div>

          {/* Core overview & summary */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Record Summary
            </h3>
            <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
              {record.summary}
            </p>
          </div>

          {/* Detailed findings / content */}
          {record.contentDetails && (
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Audit Notes & Compliance Specifics
              </h3>
              <div className="text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                {record.contentDetails}
              </div>
            </div>
          )}

          {/* Verification & Signatures section */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
              Official Signatures & Verification Trail
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Staff Signature</span>
                  {record.signedByStaff ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Pending Sign
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 font-mono font-medium">
                  {staff?.fullName}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {record.signedByStaff 
                    ? `Digitally acknowledged on ${record.signedAt || record.issuedDate}`
                    : 'Awaiting employee sign-off in portal'}
                </div>
                {onToggleSign && !record.signedByStaff && (
                  <button
                    onClick={() => onToggleSign(record.id)}
                    className="mt-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline print:hidden cursor-pointer"
                  >
                    Confirm employee sign-off now
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Management Auditor</span>
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono font-medium">
                  {record.reviewerName || 'Store Manager'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Filed to store record archive on {record.issuedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Simulated File Attachment badge */}
          {record.fileAttachmentName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{record.fileAttachmentName}</div>
                  <div className="text-[11px] text-slate-500">Secure Document Archive • {record.fileSize || '512 KB'}</div>
                </div>
              </div>
              <button
                onClick={() => alert(`Opening document archive: ${record.fileAttachmentName}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition print:hidden cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-400 font-mono">
            Document ID: {record.id}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Record</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
