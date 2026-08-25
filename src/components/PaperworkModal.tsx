import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, ShieldAlert, CheckCircle2, Paperclip, AlertTriangle } from 'lucide-react';
import { PaperworkRecord, PaperworkType, PaperworkStatus, StaffMember } from '../types';
import { PAPERWORK_LABELS } from '../utils/staffHelpers';

interface PaperworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: PaperworkRecord) => void;
  editingRecord?: PaperworkRecord | null;
  staffList: StaffMember[];
  defaultStaffId?: string;
}

export const PaperworkModal: React.FC<PaperworkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  staffList,
  defaultStaffId,
}) => {
  const [staffId, setStaffId] = useState('');
  const [type, setType] = useState<PaperworkType>('food_safety_cert');
  const [title, setTitle] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<PaperworkStatus>('valid');
  const [summary, setSummary] = useState('');
  const [contentDetails, setContentDetails] = useState('');
  const [signedByStaff, setSignedByStaff] = useState(true);
  const [reviewerName, setReviewerName] = useState('');
  const [severityLevel, setSeverityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [fileAttachmentName, setFileAttachmentName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setStaffId(editingRecord.staffId);
      setType(editingRecord.type);
      setTitle(editingRecord.title);
      setReferenceNumber(editingRecord.referenceNumber);
      setIssuedDate(editingRecord.issuedDate);
      setExpiryDate(editingRecord.expiryDate || '');
      setStatus(editingRecord.status);
      setSummary(editingRecord.summary);
      setContentDetails(editingRecord.contentDetails || '');
      setSignedByStaff(editingRecord.signedByStaff);
      setReviewerName(editingRecord.reviewerName || '');
      setSeverityLevel(editingRecord.severityLevel || 'low');
      setFileAttachmentName(editingRecord.fileAttachmentName || '');
    } else {
      const selected = defaultStaffId || staffList[0]?.id || '';
      setStaffId(selected);
      setType('food_safety_cert');
      setTitle('State Food Safety Certification');
      setReferenceNumber(`DOC-${Date.now().toString().slice(-6)}`);
      setIssuedDate(new Date().toISOString().split('T')[0]);
      
      // Auto set 3-year expiry default for certs
      const future = new Date();
      future.setFullYear(future.getFullYear() + 3);
      setExpiryDate(future.toISOString().split('T')[0]);
      
      setStatus('valid');
      setSummary('Compliant credential verification on file.');
      setContentDetails('');
      setSignedByStaff(true);
      setReviewerName('Store Management');
      setSeverityLevel('low');
      setFileAttachmentName('');
    }
    setError('');
  }, [editingRecord, isOpen, defaultStaffId, staffList]);

  // Adjust default titles based on type selection
  const handleTypeChange = (newType: PaperworkType) => {
    setType(newType);
    if (!editingRecord) {
      switch (newType) {
        case 'employment_contract':
          setTitle('Store Employment Agreement');
          setSummary('Standard store hourly position terms and code of conduct acknowledgment.');
          setExpiryDate('');
          break;
        case 'tax_w4_i9':
          setTitle('Form I-9 & W-4 Tax Authorization');
          setSummary('Form I-9 Employment Eligibility & State/Federal W-4 Withholding verified.');
          setExpiryDate('');
          break;
        case 'food_safety_cert':
          setTitle('Food Safety Handler Certification');
          setSummary('Food handler safety credential valid for store kitchen & deli preparation.');
          const future = new Date();
          future.setFullYear(future.getFullYear() + 3);
          setExpiryDate(future.toISOString().split('T')[0]);
          break;
        case 'onboarding_training':
          setTitle('Store Onboarding & Cashier Training Checklist');
          setSummary('30-day comprehensive training curriculum and register audit complete.');
          setExpiryDate('');
          break;
        case 'incident_report':
          setTitle('Store Incident & Safety Review');
          setSummary('Formal investigation documentation regarding store safety / cash drawer.');
          setExpiryDate('');
          break;
        case 'performance_review':
          setTitle('Store Staff Performance Evaluation');
          setSummary('Quarterly review of customer service, reliability, and work quality.');
          setExpiryDate('');
          break;
        case 'disciplinary_notice':
          setTitle('Policy Counseling & Written Notice');
          setSummary('Formal written warning regarding store policy compliance.');
          setExpiryDate('');
          break;
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) {
      setError('Please select a staff member');
      return;
    }
    if (!title.trim()) {
      setError('Document title is required');
      return;
    }

    const member = staffList.find(s => s.id === staffId);
    const resolvedAttachment = fileAttachmentName.trim() || 
      `${member ? member.fullName.replace(/\s+/g, '_') : 'Doc'}_${type.toUpperCase()}.pdf`;

    const record: PaperworkRecord = {
      id: editingRecord ? editingRecord.id : `doc-${Date.now()}`,
      staffId,
      type,
      title: title.trim(),
      referenceNumber: referenceNumber.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      issuedDate,
      expiryDate: expiryDate ? expiryDate : undefined,
      status,
      fileAttachmentName: resolvedAttachment,
      fileSize: editingRecord?.fileSize || '640 KB',
      summary: summary.trim(),
      contentDetails: contentDetails.trim() || summary.trim(),
      signedByStaff,
      signedAt: signedByStaff ? (editingRecord?.signedAt || issuedDate) : undefined,
      reviewerName: reviewerName.trim() || 'Elena Vance (Store Manager)',
      severityLevel: (type === 'incident_report' || type === 'disciplinary_notice') ? severityLevel : undefined,
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {editingRecord ? 'Edit Paperwork Record' : 'Add Employee Paperwork Record'}
              </h2>
              <p className="text-xs text-slate-500">
                Manage contracts, certifications, I-9 tax records, training & incidents
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

          {/* Staff Member & Record Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Associated Staff Member *
              </label>
              <select
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Paperwork Category *
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as PaperworkType)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                {Object.entries(PAPERWORK_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Reference Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document / Form Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ServSafe Food Handler Card"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reference / Reg #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. SERV-102938"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Issued / Filed Date
              </label>
              <input
                type="date"
                required
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Expiration Date <span className="text-slate-400 font-normal">(if applicable)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Compliance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaperworkStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                <option value="valid">Valid / Compliant</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="pending_review">Pending Review / Sign</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Severity for Incidents / Notices */}
          {(type === 'incident_report' || type === 'disciplinary_notice') && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Severity Rating
              </label>
              <div className="flex gap-4">
                {(['low', 'medium', 'high'] as const).map((sev) => (
                  <label key={sev} className="flex items-center gap-1.5 text-xs capitalize text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value={sev}
                      checked={severityLevel === sev}
                      onChange={() => setSeverityLevel(sev)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{sev} Priority</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Executive Summary / Overview *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 1-sentence synopsis of this record..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Detailed Content / Audit Log */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Notes, Observations & Compliance Findings
            </label>
            <textarea
              rows={3}
              value={contentDetails}
              onChange={(e) => setContentDetails(e.target.value)}
              placeholder="Provide full transcript, test scores, inspection findings, resolution plans..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Reviewer & Digital Signatures */}
          <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Audited / Reviewed By
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Elena Vance (Store Manager)"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full">
                <input
                  type="checkbox"
                  checked={signedByStaff}
                  onChange={(e) => setSignedByStaff(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Staff Digital Acknowledgment on File
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
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
              {editingRecord ? 'Save Changes' : 'Record Paperwork'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
