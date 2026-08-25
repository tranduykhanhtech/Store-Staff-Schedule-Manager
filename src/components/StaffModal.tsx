import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, DollarSign, Calendar, ShieldCheck, HeartPulse, FileText } from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '../types';
import { ROLE_LABELS, STATIONS } from '../utils/staffHelpers';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
  editingStaff?: StaffMember | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStaff,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('crewmember');
  const [status, setStatus] = useState<StaffStatus>('active');
  const [hourlyWage, setHourlyWage] = useState('16.00');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState('35');
  const [stationSpecialties, setStationSpecialties] = useState<string[]>([]);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingStaff) {
      setFullName(editingStaff.fullName);
      setPhone(editingStaff.phone);
      setEmail(editingStaff.email);
      setRole(editingStaff.role);
      setStatus(editingStaff.status);
      setHourlyWage(editingStaff.hourlyWage.toString());
      setHireDate(editingStaff.hireDate);
      setMaxHoursPerWeek(editingStaff.maxHoursPerWeek.toString());
      setStationSpecialties(editingStaff.stationSpecialties || []);
      setEmergencyName(editingStaff.emergencyContact?.name || '');
      setEmergencyPhone(editingStaff.emergencyContact?.phone || '');
      setEmergencyRelation(editingStaff.emergencyContact?.relationship || '');
      setNotes(editingStaff.notes || '');
    } else {
      // Default reset
      setFullName('');
      setPhone('');
      setEmail('');
      setRole('crewmember');
      setStatus('active');
      setHourlyWage('16.00');
      setHireDate(new Date().toISOString().split('T')[0]);
      setMaxHoursPerWeek('48');
      setStationSpecialties(['Storefront']);
      setEmergencyName('');
      setEmergencyPhone('');
      setEmergencyRelation('');
      setNotes('');
    }
    setError('');
  }, [editingStaff, isOpen]);

  if (!isOpen) return null;

  const toggleStation = (station: string) => {
    if (stationSpecialties.includes(station)) {
      setStationSpecialties(stationSpecialties.filter(s => s !== station));
    } else {
      setStationSpecialties([...stationSpecialties, station]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Staff member full name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Contact phone number is required');
      return;
    }

    const wage = parseFloat(hourlyWage);
    const maxHours = parseInt(maxHoursPerWeek, 10);

    const staffData: StaffMember = {
      id: editingStaff ? editingStaff.id : `staff-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@store104.com`,
      role,
      status,
      hourlyWage: isNaN(wage) ? 16.0 : wage,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      maxHoursPerWeek: isNaN(maxHours) ? 35 : maxHours,
      stationSpecialties: stationSpecialties.length > 0 ? stationSpecialties : [STATIONS[0]],
      emergencyContact: {
        name: emergencyName.trim() || 'Not specified',
        phone: emergencyPhone.trim() || phone.trim(),
        relationship: emergencyRelation.trim() || 'Family',
      },
      notes: notes.trim(),
    };

    onSave(staffData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure role, contact details, station specialties and hourly rates
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Basic Identity & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Taylor"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Role & Title *
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
                Employment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                <option value="active">Active (On Schedule)</option>
                <option value="on_leave">On Leave / Seasonal</option>
                <option value="inactive">Inactive / Past</option>
              </select>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-indigo-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@store104.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payroll & Work Hours */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              Compensation & Scheduling Limits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hourly Wage ($)</label>
                <input
                  type="number"
                  step="0.25"
                  min="10"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hire Date</label>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Max Weekly Hours</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={maxHoursPerWeek}
                  onChange={(e) => setMaxHoursPerWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Station Specialties */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              Trained Station Specialties
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATIONS.map((station) => {
                const isSelected = stationSpecialties.includes(station);
                return (
                  <button
                    type="button"
                    key={station}
                    onClick={() => toggleStation(station)}
                    className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{station}</span>
                    {isSelected && <span className="text-indigo-600 font-bold ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Emergency Contact */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              Emergency Contact Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse)"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Notes */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Internal Manager Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keyholder status, scheduling preferences, availability constraints..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Modal Footer */}
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
              {editingStaff ? 'Save Changes' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
