import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Eye, 
  Edit3, 
  Trash2, 
  Download,
  AlertCircle,
  FileCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { PaperworkRecord, PaperworkType, PaperworkStatus, StaffMember } from '../types';
import { PAPERWORK_LABELS, PAPERWORK_STATUS_CONFIG, ROLE_LABELS } from '../utils/staffHelpers';

interface PaperworkViewProps {
  paperworkRecords: PaperworkRecord[];
  staffList: StaffMember[];
  onOpenAddPaperwork: (defaultStaffId?: string) => void;
  onEditPaperwork: (record: PaperworkRecord) => void;
  onDeletePaperwork: (recordId: string) => void;
  onViewPaperworkDetails: (record: PaperworkRecord) => void;
  onToggleSignature: (recordId: string) => void;
  selectedStaffIdFilter?: string;
  onClearStaffFilter?: () => void;
}

export const PaperworkView: React.FC<PaperworkViewProps> = ({
  paperworkRecords,
  staffList,
  onOpenAddPaperwork,
  onEditPaperwork,
  onDeletePaperwork,
  onViewPaperworkDetails,
  onToggleSignature,
  selectedStaffIdFilter,
  onClearStaffFilter,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count summary metrics
  const stats = useMemo(() => {
    const total = paperworkRecords.length;
    const valid = paperworkRecords.filter((r) => r.status === 'valid').length;
    const expiring = paperworkRecords.filter((r) => r.status === 'expiring_soon').length;
    const expired = paperworkRecords.filter((r) => r.status === 'expired').length;
    const pendingSign = paperworkRecords.filter((r) => !r.signedByStaff || r.status === 'pending_review').length;
    const incidents = paperworkRecords.filter((r) => r.type === 'incident_report' || r.type === 'disciplinary_notice').length;

    return { total, valid, expiring, expired, pendingSign, incidents };
  }, [paperworkRecords]);

  // Urgent attention records
  const urgentRecords = useMemo(() => {
    return paperworkRecords.filter((r) => r.status === 'expiring_soon' || r.status === 'expired');
  }, [paperworkRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return paperworkRecords.filter((record) => {
      if (selectedStaffIdFilter && record.staffId !== selectedStaffIdFilter) return false;
      if (typeFilter !== 'all' && record.type !== typeFilter) return false;
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const staff = staffList.find((s) => s.id === record.staffId);
        const matchTitle = record.title.toLowerCase().includes(q);
        const matchRef = record.referenceNumber.toLowerCase().includes(q);
        const matchStaff = staff ? staff.fullName.toLowerCase().includes(q) : false;
        const matchSummary = record.summary.toLowerCase().includes(q);
        if (!matchTitle && !matchRef && !matchStaff && !matchSummary) return false;
      }
      return true;
    });
  }, [paperworkRecords, selectedStaffIdFilter, typeFilter, statusFilter, searchQuery, staffList]);

  return (
    <div className="space-y-4">
      {/* Expiration & Compliance Alert Banner */}
      {urgentRecords.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Compliance Expiration Notice ({urgentRecords.length} Items)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Staff certifications or health permits are nearing expiry within 30 days. Renewal audits recommended.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('expiring_soon')}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition whitespace-nowrap cursor-pointer shadow-xs active:scale-95"
            >
              Filter Expiring Records
            </button>
          </div>
        </div>
      )}

      {/* Top Bento Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Documents</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across all staff members</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliant</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">{stats.valid}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Up-to-date certifications</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring / Action</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-amber-700 font-mono">{stats.expiring + stats.expired}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Under 30 days renewal</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signatures Needed</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-purple-700 font-mono">{stats.pendingSign}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pending employee sign-off</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bento Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              Employee Paperwork & Compliance Records
            </h2>
            <p className="text-xs text-slate-500">
              Employment agreements, I-9/W-4 tax files, Food Safety Manager certs, training & incident reports
            </p>
          </div>

          <button
            id="btn-add-paperwork-page"
            onClick={() => onOpenAddPaperwork()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record New Document</span>
          </button>
        </div>

        {/* Selected Staff Active Filter Banner */}
        {selectedStaffIdFilter && (
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <span>
              Showing records filtered for staff member:{' '}
              <strong>
                {staffList.find((s) => s.id === selectedStaffIdFilter)?.fullName || selectedStaffIdFilter}
              </strong>
            </span>
            {onClearStaffFilter && (
              <button
                onClick={onClearStaffFilter}
                className="font-bold underline hover:text-indigo-950 cursor-pointer"
              >
                Clear filter (Show all staff)
              </button>
            )}
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition whitespace-nowrap cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories ({paperworkRecords.length})
          </button>

          {Object.entries(PAPERWORK_LABELS).map(([key, label]) => {
            const count = paperworkRecords.filter((r) => r.type === key).length;
            const isSelected = typeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, reference #, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid / Compliant</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="pending_review">Pending Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paperwork Table Bento Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="py-3 px-4 font-bold">Document Title & Ref</th>
                <th className="py-3 px-3 font-bold">Employee</th>
                <th className="py-3 px-3 font-bold">Category</th>
                <th className="py-3 px-3 font-bold">Issued Date</th>
                <th className="py-3 px-3 font-bold">Expiry Date</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold">Acknowledgment</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const staff = staffList.find((s) => s.id === record.staffId);
                const statusConfig = PAPERWORK_STATUS_CONFIG[record.status] || {
                  label: record.status,
                  badge: 'bg-slate-100 text-slate-800 border-slate-200',
                };

                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition">
                    {/* Document Title & Reference */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="hover:text-indigo-600 cursor-pointer" onClick={() => onViewPaperworkDetails(record)}>
                          {record.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {record.referenceNumber}
                      </div>
                    </td>

                    {/* Associated Staff */}
                    <td className="py-3 px-3 font-medium text-slate-900">
                      <div>{staff?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {staff ? ROLE_LABELS[staff.role] : ''}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-medium">
                        {PAPERWORK_LABELS[record.type]}
                      </span>
                    </td>

                    {/* Issued Date */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {record.issuedDate}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-3 font-mono">
                      {record.expiryDate ? (
                        <span className={record.status === 'expiring_soon' ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                          {record.expiryDate}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">N/A (Permanent)</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${statusConfig.badge}`}>
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Signature */}
                    <td className="py-3 px-3">
                      {record.signedByStaff ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Signed
                        </span>
                      ) : (
                        <button
                          onClick={() => onToggleSignature(record.id)}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer"
                        >
                          <AlertTriangle className="h-3 w-3" /> Sign now
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewPaperworkDetails(record)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="View Full Document Record"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEditPaperwork(record)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete paperwork record: ${record.title}?`)) {
                              onDeletePaperwork(record.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No paperwork records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or searching a different term</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
