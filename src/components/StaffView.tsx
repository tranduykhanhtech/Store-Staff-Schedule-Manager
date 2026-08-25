import React, { useState, useMemo } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  HeartPulse, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { StaffMember, StaffRole, PaperworkRecord, Shift } from '../types';
import { ROLE_LABELS, ROLE_COLORS, formatCurrency, calculateShiftDurationHours } from '../utils/staffHelpers';

interface StaffViewProps {
  staffList: StaffMember[];
  paperworkRecords: PaperworkRecord[];
  allShifts: Shift[];
  onOpenAddStaff: () => void;
  onEditStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onOpenAddShiftForStaff: (staffId: string) => void;
  onViewPaperworkForStaff: (staffId: string) => void;
  onAddPaperworkForStaff: (staffId: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staffList,
  paperworkRecords,
  allShifts,
  onOpenAddStaff,
  onEditStaff,
  onDeleteStaff,
  onOpenAddShiftForStaff,
  onViewPaperworkForStaff,
  onAddPaperworkForStaff,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      if (roleFilter !== 'all' && staff.role !== roleFilter) return false;
      if (statusFilter !== 'all' && staff.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = staff.fullName.toLowerCase().includes(q);
        const matchPhone = staff.phone.includes(q);
        const matchEmail = staff.email.toLowerCase().includes(q);
        const matchRole = ROLE_LABELS[staff.role].toLowerCase().includes(q);
        const matchSpecialty = staff.stationSpecialties.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchEmail && !matchRole && !matchSpecialty) return false;
      }
      return true;
    });
  }, [staffList, roleFilter, statusFilter, searchQuery]);

  // Roles distribution counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: staffList.length };
    staffList.forEach((s) => {
      counts[s.role] = (counts[s.role] || 0) + 1;
    });
    return counts;
  }, [staffList]);

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Header Bento Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Store Staff & Role Directory
            </h2>
            <p className="text-xs text-slate-500">
              Manage store personnel, contact numbers, hourly rates, and compliance files
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              id="btn-add-staff-page"
              onClick={onOpenAddStaff}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* Role Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { key: 'all', label: 'All Roles' },
            { key: 'store_manager', label: 'Store Manager' },
            { key: 'assistant_manager', label: 'Assistant Manager' },
            { key: 'supervisor', label: 'Supervisor' },
            { key: 'cashier', label: 'Cashier' },
            { key: 'crewmember', label: 'Crewmember' },
          ].map((item) => {
            const isSelected = roleFilter === item.key;
            const count = roleCounts[item.key] || 0;
            return (
              <button
                key={item.key}
                onClick={() => setRoleFilter(item.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
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

        {/* Search & Status Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone number, email..."
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
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const roleConfig = ROLE_COLORS[staff.role] || ROLE_COLORS['crewmember'];
            const staffDocs = paperworkRecords.filter((r) => r.staffId === staff.id);
            const urgentDocs = staffDocs.filter((r) => r.status === 'expiring_soon' || r.status === 'expired');

            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Name & Role Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${roleConfig.initialBg} ${roleConfig.initialText} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                        {staff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{staff.fullName}</h3>
                        <div className="mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${roleConfig.badge}`}>
                            {ROLE_LABELS[staff.role] || staff.role || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditStaff(staff)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Edit Staff Information"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${staff.fullName} from store staff?`)) {
                            onDeleteStaff(staff.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove Staff"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${staff.phone.replace(/[^\d+]/g, '')}`}
                        className="text-indigo-600 hover:underline font-mono font-medium"
                      >
                        {staff.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600 font-mono text-[11px]">{staff.email}</span>
                    </div>
                  </div>

                  {/* Wage & Work Hours Limit */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Rate</div>
                      <div className="font-bold text-slate-900 font-mono">{formatCurrency(staff.hourlyWage)}/hr</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Weekly</div>
                      <div className="font-bold text-slate-900 font-mono">{staff.maxHoursPerWeek} hrs/wk</div>
                    </div>
                  </div>

                  {/* Station Specialties */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Trained Stations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {staff.stationSpecialties.map((st) => (
                        <span
                          key={st}
                          className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {staff.emergencyContact?.name && (
                    <div className="text-[11px] text-slate-500 bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                      <span className="font-semibold text-rose-800">Emergency: </span>
                      {staff.emergencyContact.name} ({staff.emergencyContact.relationship}) •{' '}
                      <span className="font-mono">{staff.emergencyContact.phone}</span>
                    </div>
                  )}

                  {/* Paperwork Status Indicator */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      {staffDocs.length} Paperwork File(s)
                    </span>
                    {urgentDocs.length > 0 ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                        {urgentDocs.length} Alert
                      </span>
                    ) : staffDocs.length > 0 ? (
                      <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Compliant
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No records</span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewPaperworkForStaff(staff.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    View Records
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAddPaperworkForStaff(staff.id)}
                      className="text-xs font-semibold text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
                      title="Attach paperwork for this employee"
                    >
                      + File
                    </button>
                    <button
                      onClick={() => onOpenAddShiftForStaff(staff.id)}
                      className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl transition shadow-2xs active:scale-95 cursor-pointer"
                    >
                      + Shift
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="py-3 px-4 font-bold">Staff Member</th>
                  <th className="py-3 px-3 font-bold">Role</th>
                  <th className="py-3 px-3 font-bold">Contact Phone</th>
                  <th className="py-3 px-3 font-bold">Hourly Wage</th>
                  <th className="py-3 px-3 font-bold">Weekly Cap</th>
                  <th className="py-3 px-3 font-bold">Emergency Contact</th>
                  <th className="py-3 px-3 font-bold">Paperwork Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => {
                  const roleConfig = ROLE_COLORS[staff.role] || ROLE_COLORS['crewmember'];
                  const staffDocs = paperworkRecords.filter((r) => r.staffId === staff.id);
                  const urgentDocs = staffDocs.filter((r) => r.status === 'expiring_soon' || r.status === 'expired');

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${roleConfig.initialBg} ${roleConfig.initialText} flex items-center justify-center font-bold text-xs`}>
                            {staff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div>{staff.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${roleConfig.badge}`}>
                          {ROLE_LABELS[staff.role] || staff.role || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        <a href={`tel:${staff.phone}`} className="hover:text-indigo-600 hover:underline">
                          {staff.phone}
                        </a>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {formatCurrency(staff.hourlyWage)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {staff.maxHoursPerWeek} hrs/wk
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {staff.emergencyContact?.name} ({staff.emergencyContact?.phone})
                      </td>
                      <td className="py-3 px-3">
                        {urgentDocs.length > 0 ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {urgentDocs.length} Alert
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {staffDocs.length} Records (OK)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAddShiftForStaff(staff.id)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-[11px] cursor-pointer"
                          >
                            + Shift
                          </button>
                          <button
                            onClick={() => onEditStaff(staff)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
          <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No staff members found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your role or search filters</p>
        </div>
      )}
    </div>
  );
};
